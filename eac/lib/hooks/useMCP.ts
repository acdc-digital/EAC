// MCP Integration Hook - Client-side HTTP API
// /Users/matthewsimon/Projects/eac/eac/lib/hooks/useMCP.ts

import { useCallback, useEffect, useState } from 'react';

interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

interface MCPResponse {
  success: boolean;
  content: Array<{ type: string; text: string }>;
  toolCalls?: Array<{ name: string; arguments: Record<string, any> }>;
  error?: string;
}

export function useMCP() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTools, setAvailableTools] = useState<MCPTool[]>([]);

  // Check MCP server status
  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/mcp');
      const data = await response.json();
      
      if (data.success && data.status) {
        setIsConnected(data.status.connected);
        setError(null);
      } else {
        setIsConnected(false);
        setError('Failed to get MCP status');
      }
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // List available tools
  const listTools = useCallback(async () => {
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list-tools' })
      });
      
      const data = await response.json();
      
      if (data.success && data.tools) {
        setAvailableTools(data.tools.tools || []);
      } else {
        setError(data.error || 'Failed to list tools');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list tools');
    }
  }, []);

  // Process natural language queries
  const processNaturalLanguage = useCallback(async (query: string): Promise<MCPResponse> => {
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process-natural-language',
          data: { query }
        })
      });
      
      const data = await response.json();
      return data;
    } catch (err) {
      return {
        success: false,
        content: [],
        error: err instanceof Error ? err.message : 'Processing failed'
      };
    }
  }, []);

  // Call a specific MCP tool
  const callTool = useCallback(async (name: string, args: Record<string, any>) => {
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'call-tool',
          data: { name, arguments: args }
        })
      });
      
      const data = await response.json();
      return data;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Tool call failed'
      };
    }
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      await checkStatus();
      
      if (isMounted && isConnected) {
        await listTools();
      }
    };
    
    initialize();
    
    return () => {
      isMounted = false;
    };
  }, [checkStatus, listTools, isConnected]);

  // Periodic status check
  useEffect(() => {
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkStatus]);

  return {
    isConnected,
    isLoading,
    error,
    availableTools,
    processNaturalLanguage,
    callTool,
    checkStatus,
    listTools
  };
}
