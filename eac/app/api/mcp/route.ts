// MCP Server API Route
// /Users/matthewsimon/Projects/eac/eac/app/api/mcp/route.ts

import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

interface MCPResponse {
  success: boolean;
  content: Array<{ type: string; text: string }>;
  toolCalls?: MCPToolCall[];
  error?: string;
}

class MCPServerConnection extends EventEmitter {
  private process: ChildProcess | null = null;
  private isConnected = false;
  private messageId = 0;
  private pendingRequests = new Map<number, { resolve: Function; reject: Function }>();

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Path to the built MCP server
        const serverPath = path.join(process.cwd(), '..', 'mcp-server', 'dist', 'index.js');
        
        this.process = spawn('node', [serverPath], {
          stdio: ['pipe', 'pipe', 'pipe'],
          cwd: path.dirname(serverPath)
        });

        this.process.stdout?.on('data', (data) => {
          try {
            const lines = data.toString().split('\n').filter((line: string) => line.trim());
            for (const line of lines) {
              const message = JSON.parse(line);
              this.handleMessage(message);
            }
          } catch (error) {
            console.error('Failed to parse MCP message:', error);
          }
        });

        this.process.stderr?.on('data', (data) => {
          console.error('MCP Server Error:', data.toString());
        });

        this.process.on('close', (code) => {
          console.log('MCP Server closed with code:', code);
          this.isConnected = false;
          this.emit('disconnect');
        });

        this.process.on('error', (error) => {
          console.error('MCP Server spawn error:', error);
          reject(error);
        });

        // Send initialization message
        this.sendMessage({
          jsonrpc: '2.0',
          id: this.getNextId(),
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            clientInfo: {
              name: 'EAC Terminal Chat',
              version: '1.0.0'
            }
          }
        });

        this.isConnected = true;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private sendMessage(message: any): void {
    if (this.process?.stdin) {
      this.process.stdin.write(JSON.stringify(message) + '\n');
    }
  }

  private handleMessage(message: any): void {
    if (message.id && this.pendingRequests.has(message.id)) {
      const request = this.pendingRequests.get(message.id);
      this.pendingRequests.delete(message.id);
      
      if (message.error) {
        request?.reject(new Error(message.error.message || 'Unknown error'));
      } else {
        request?.resolve(message.result);
      }
    }
  }

  private getNextId(): number {
    return ++this.messageId;
  }

  async callTool(name: string, arguments_: Record<string, any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.getNextId();
      this.pendingRequests.set(id, { resolve, reject });
      
      this.sendMessage({
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: {
          name,
          arguments: arguments_
        }
      });
    });
  }

  async listTools(): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.getNextId();
      this.pendingRequests.set(id, { resolve, reject });
      
      this.sendMessage({
        jsonrpc: '2.0',
        id,
        method: 'tools/list',
        params: {}
      });
    });
  }

  disconnect(): void {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    this.isConnected = false;
  }

  getStatus(): { connected: boolean; tools: number } {
    return {
      connected: this.isConnected,
      tools: 8 // We know we have 8 tools available
    };
  }
}

// Global MCP connection instance
let mcpConnection: MCPServerConnection | null = null;

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    // Initialize connection if needed
    if (!mcpConnection) {
      mcpConnection = new MCPServerConnection();
      await mcpConnection.connect();
    }

    switch (action) {
      case 'status':
        return NextResponse.json({
          success: true,
          status: mcpConnection.getStatus()
        });

      case 'list-tools':
        try {
          const tools = await mcpConnection.listTools();
          return NextResponse.json({
            success: true,
            tools
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to list tools'
          });
        }

      case 'call-tool':
        try {
          const { name, arguments: args } = data;
          const result = await mcpConnection.callTool(name, args);
          return NextResponse.json({
            success: true,
            result
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Tool call failed'
          });
        }

      case 'process-natural-language':
        try {
          const { query } = data;
          
          // Enhanced NLP to tool mapping using actual tool names
          let toolName = '';
          let toolArgs = {};
          
          if (query.toLowerCase().includes('reddit') && query.toLowerCase().includes('analyz')) {
            toolName = 'eac_reddit_analyzer';
            toolArgs = { analysisType: 'all', includeMetrics: true };
          } else if (query.toLowerCase().includes('reddit') && query.toLowerCase().includes('generat')) {
            toolName = 'eac_reddit_post_generator';
            toolArgs = { type: 'post', topic: query };
          } else if (query.toLowerCase().includes('workflow') && query.toLowerCase().includes('optim')) {
            toolName = 'eac_social_workflow_optimizer';
            toolArgs = { platform: 'reddit', focus: 'automation' };
          } else if (query.toLowerCase().includes('project') && query.toLowerCase().includes('analyz')) {
            toolName = 'eac_project_analyze';
            toolArgs = { includePatterns: true, includeRecommendations: true };
          } else if (query.toLowerCase().includes('component')) {
            toolName = 'eac_component_finder';
            toolArgs = { includeProps: true, includeHooks: true };
          } else if (query.toLowerCase().includes('store') || query.toLowerCase().includes('zustand')) {
            toolName = 'eac_store_inspector';
            toolArgs = { includeUsage: true, includePatterns: true };
          } else if (query.toLowerCase().includes('convex') || query.toLowerCase().includes('database')) {
            toolName = 'eac_convex_analyzer';
            toolArgs = { includeSchema: true, includeFunctions: true, includePatterns: true };
          } else {
            // Default to project analysis for general queries
            toolName = 'eac_project_analyze';
            toolArgs = { includePatterns: true, includeRecommendations: true };
          }

          const result = await mcpConnection.callTool(toolName, toolArgs);
          
          return NextResponse.json({
            success: true,
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            toolCalls: [{ name: toolName, arguments: toolArgs }]
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Natural language processing failed',
            content: []
          });
        }

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('MCP API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Initialize connection if needed
    if (!mcpConnection) {
      mcpConnection = new MCPServerConnection();
      try {
        await mcpConnection.connect();
      } catch (error) {
        console.error('Failed to connect to MCP server:', error);
        return NextResponse.json({
          success: true,
          status: { connected: false, tools: 0 }
        });
      }
    }
    
    // Return MCP server status
    const status = mcpConnection.getStatus();
    
    return NextResponse.json({
      success: true,
      status
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get status'
    });
  }
}
