/**
 * MCP Client Integration for Terminal Chat
 * Connects the EAC terminal chat to the enhanced MCP server
 */

import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';

export interface MCPToolCall {
  tool: string;
  args: Record<string, any>;
}

export interface MCPResponse {
  success: boolean;
  content: any[];
  error?: string;
}

export class MCPClient extends EventEmitter {
  private process: ChildProcess | null = null;
  private isConnected = false;
  private messageId = 0;
  private pendingRequests = new Map<number, { resolve: Function; reject: Function }>();

  constructor(private serverPath: string) {
    super();
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    return new Promise((resolve, reject) => {
      try {
        // Start the MCP server process
        this.process = spawn('node', [this.serverPath], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: {
            ...process.env,
            EAC_PROJECT_ROOT: process.env.EAC_PROJECT_ROOT || process.cwd()
          }
        });

        this.process.stdout?.on('data', (data) => {
          this.handleServerMessage(data.toString());
        });

        this.process.stderr?.on('data', (data) => {
          console.error('MCP Server Error:', data.toString());
        });

        this.process.on('close', (code) => {
          console.log('MCP Server closed with code:', code);
          this.isConnected = false;
        });

        this.process.on('error', (error) => {
          console.error('MCP Server Process Error:', error);
          reject(error);
        });

        // Initialize connection
        setTimeout(() => {
          this.isConnected = true;
          resolve();
        }, 1000);

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleServerMessage(data: string) {
    try {
      const lines = data.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        if (line.startsWith('{') || line.startsWith('[')) {
          const message = JSON.parse(line);
          this.processServerResponse(message);
        }
      }
    } catch (error) {
      console.warn('Error parsing MCP server message:', error);
    }
  }

  private processServerResponse(message: any) {
    const { id, result, error } = message;
    
    if (id && this.pendingRequests.has(id)) {
      const { resolve, reject } = this.pendingRequests.get(id)!;
      this.pendingRequests.delete(id);
      
      if (error) {
        reject(new Error(error.message || 'MCP call failed'));
      } else {
        resolve(result);
      }
    }
  }

  async callTool(toolName: string, args: Record<string, any> = {}): Promise<MCPResponse> {
    if (!this.isConnected) {
      await this.connect();
    }

    const id = ++this.messageId;
    
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      const request = {
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      };

      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('MCP call timeout'));
        }
      }, 30000);

      if (this.process?.stdin) {
        this.process.stdin.write(JSON.stringify(request) + '\n');
      }
    });
  }

  async listTools(): Promise<string[]> {
    const response = await this.callTool('tools/list', {});
    return response.content || [];
  }

  disconnect() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    this.isConnected = false;
    this.pendingRequests.clear();
  }
}

// Natural Language to MCP Tool Translation
export class NLPToMCPTranslator {
  private mcpClient: MCPClient;

  constructor(mcpServerPath: string) {
    this.mcpClient = new MCPClient(mcpServerPath);
  }

  async initialize() {
    await this.mcpClient.connect();
  }

  async processNaturalLanguage(input: string): Promise<MCPResponse> {
    const normalizedInput = input.toLowerCase().trim();
    
    // Reddit Analysis Commands
    if (this.isRedditAnalysisQuery(normalizedInput)) {
      return this.handleRedditAnalysis(normalizedInput);
    }
    
    // Reddit Post Generation Commands  
    if (this.isRedditPostQuery(normalizedInput)) {
      return this.handleRedditPostGeneration(normalizedInput);
    }
    
    // Workflow Optimization Commands
    if (this.isWorkflowQuery(normalizedInput)) {
      return this.handleWorkflowOptimization(normalizedInput);
    }
    
    // Project Analysis Commands
    if (this.isProjectAnalysisQuery(normalizedInput)) {
      return this.handleProjectAnalysis(normalizedInput);
    }
    
    // Component Analysis Commands
    if (this.isComponentQuery(normalizedInput)) {
      return this.handleComponentAnalysis(normalizedInput);
    }

    // Default fallback
    return {
      success: false,
      content: [{
        type: 'text',
        text: `I understand you want to: "${input}"\n\nAvailable capabilities:\n• Reddit integration analysis\n• Reddit post generation\n• Social workflow optimization\n• Project architecture analysis\n• Component discovery\n\nTry asking: "analyze my reddit integration" or "generate a reddit post about financial dashboards"`
      }],
      error: 'Command not recognized'
    };
  }

  private isRedditAnalysisQuery(input: string): boolean {
    const patterns = [
      /reddit.*analyz/,
      /analyz.*reddit/,
      /reddit.*integration/,
      /reddit.*performance/,
      /reddit.*metrics/,
      /how.*reddit.*work/,
      /reddit.*status/
    ];
    return patterns.some(pattern => pattern.test(input));
  }

  private async handleRedditAnalysis(input: string): Promise<MCPResponse> {
    try {
      let analysisType = 'all';
      
      if (input.includes('performance')) analysisType = 'performance';
      else if (input.includes('integration')) analysisType = 'integration';
      else if (input.includes('recommendation')) analysisType = 'recommendations';
      
      const result = await this.mcpClient.callTool('eac_reddit_analyzer', {
        analysisType,
        includeMetrics: true
      });
      
      return {
        success: true,
        content: result.content || []
      };
    } catch (error) {
      return {
        success: false,
        content: [{
          type: 'text',
          text: `Error analyzing Reddit integration: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private isRedditPostQuery(input: string): boolean {
    const patterns = [
      /generate.*reddit.*post/,
      /create.*reddit.*post/,
      /reddit.*post.*for/,
      /write.*reddit.*post/,
      /reddit.*content/
    ];
    return patterns.some(pattern => pattern.test(input));
  }

  private async handleRedditPostGeneration(input: string): Promise<MCPResponse> {
    try {
      // Extract topic and subreddit from natural language
      const topic = this.extractTopic(input);
      const subreddit = this.extractSubreddit(input);
      const type = input.includes('template') ? 'template' : 'post';
      
      const result = await this.mcpClient.callTool('eac_reddit_post_generator', {
        type,
        topic,
        subreddit,
        tone: 'professional',
        length: 'medium',
        includeCall2Action: true
      });
      
      return {
        success: true,
        content: result.content || []
      };
    } catch (error) {
      return {
        success: false,
        content: [{
          type: 'text',
          text: `Error generating Reddit post: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private isWorkflowQuery(input: string): boolean {
    const patterns = [
      /optimi[sz]e.*workflow/,
      /workflow.*optimi[sz]/,
      /social.*workflow/,
      /automat.*process/,
      /improve.*workflow/,
      /time.*saving/
    ];
    return patterns.some(pattern => pattern.test(input));
  }

  private async handleWorkflowOptimization(input: string): Promise<MCPResponse> {
    try {
      let platform = 'reddit';
      let focus = 'automation';
      
      if (input.includes('twitter')) platform = 'twitter';
      if (input.includes('time')) focus = 'time';
      if (input.includes('quality')) focus = 'quality';
      if (input.includes('engagement')) focus = 'engagement';
      
      const result = await this.mcpClient.callTool('eac_social_workflow_optimizer', {
        platform,
        focus
      });
      
      return {
        success: true,
        content: result.content || []
      };
    } catch (error) {
      return {
        success: false,
        content: [{
          type: 'text',
          text: `Error optimizing workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private isProjectAnalysisQuery(input: string): boolean {
    const patterns = [
      /analyz.*project/,
      /project.*structure/,
      /architecture/,
      /codebase.*analys/,
      /project.*pattern/
    ];
    return patterns.some(pattern => pattern.test(input));
  }

  private async handleProjectAnalysis(input: string): Promise<MCPResponse> {
    try {
      const result = await this.mcpClient.callTool('eac_project_analyze', {
        includePatterns: true,
        includeRecommendations: true
      });
      
      return {
        success: true,
        content: result.content || []
      };
    } catch (error) {
      return {
        success: false,
        content: [{
          type: 'text',
          text: `Error analyzing project: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private isComponentQuery(input: string): boolean {
    const patterns = [
      /find.*component/,
      /component.*analys/,
      /what.*component/,
      /list.*component/,
      /component.*pattern/
    ];
    return patterns.some(pattern => pattern.test(input));
  }

  private async handleComponentAnalysis(input: string): Promise<MCPResponse> {
    try {
      const componentName = this.extractComponentName(input);
      
      const result = await this.mcpClient.callTool('eac_component_finder', {
        componentName,
        includeProps: true,
        includeHooks: true
      });
      
      return {
        success: true,
        content: result.content || []
      };
    } catch (error) {
      return {
        success: false,
        content: [{
          type: 'text',
          text: `Error analyzing components: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private extractTopic(input: string): string {
    // Extract topic from phrases like "generate a reddit post about financial dashboards"
    const aboutMatch = input.match(/about\s+([^.!?]+)/i);
    if (aboutMatch) return aboutMatch[1].trim();
    
    const forMatch = input.match(/for\s+([^.!?]+)/i);
    if (forMatch) return forMatch[1].trim();
    
    return 'financial dashboard';
  }

  private extractSubreddit(input: string): string | undefined {
    // Extract subreddit from phrases like "post to r/programming" or "in programming"
    const rMatch = input.match(/r\/(\w+)/i);
    if (rMatch) return rMatch[1];
    
    const inMatch = input.match(/in\s+(\w+)/i);
    if (inMatch && ['programming', 'webdev', 'react', 'javascript', 'nextjs'].includes(inMatch[1].toLowerCase())) {
      return inMatch[1];
    }
    
    return undefined;
  }

  private extractComponentName(input: string): string | undefined {
    // Extract component name from phrases like "find Button component"
    const componentMatch = input.match(/find\s+(\w+)\s+component/i);
    if (componentMatch) return componentMatch[1];
    
    const nameMatch = input.match(/component\s+(\w+)/i);
    if (nameMatch) return nameMatch[1];
    
    return undefined;
  }

  disconnect() {
    this.mcpClient.disconnect();
  }
}
