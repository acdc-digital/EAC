// Chat Messages Component with Convex and MCP Integration
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/chatMessages.tsx

"use client";

import { chatCommands } from "@/lib/chatCommands";
import { useChat } from "@/lib/hooks/useChat";
import { useInstructionContext, useInstructions } from "@/lib/hooks/useInstructions";
import { useMCP } from "@/lib/hooks/useMCP";
import { useAgentStore } from "@/store";
import { useChatStore } from "@/store/terminal/chat";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useRef, useState } from "react";
import { ToolsToggle } from "./toolsToggle";

export function ChatMessages() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [showCommandHints, setShowCommandHints] = useState(false);
  const [showMCPTools, setShowMCPTools] = useState(false);
  const [selectedToolIndex, setSelectedToolIndex] = useState(-1);
  const [toolsMode, setToolsMode] = useState<'mcp' | 'agents'>('agents');
  
  const { user, isLoaded } = useUser();
  const { initializeUserSession } = useChatStore();
  const { messages, isLoading: chatLoading, sendMessage, sessionId, storeChatMessage } = useChat();
  const {
    isConnected: mcpConnected,
    isLoading: mcpLoading,
    error: mcpError,
    processNaturalLanguage,
    availableTools
  } = useMCP();

  const { agents, activeAgentId, executeAgentTool } = useAgentStore();
  const { createInstruction, ensureInstructionsProject } = useInstructions();
  const instructionContext = useInstructionContext();

  const isLoading = chatLoading || mcpLoading;

  // Initialize user-specific session when user is loaded
  useEffect(() => {
    if (isLoaded && user?.id) {
      initializeUserSession(user.id);
    }
  }, [isLoaded, user?.id, initializeUserSession]);

  // Helper function to strip markdown formatting and convert to plain text
  const stripMarkdown = (text: string): string => {
    return text
      .replace(/^#{1,6}\s+/gm, '') // Remove # headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1') // Remove *italic*
      .replace(/`([^`]+)`/g, '$1') // Remove `code`
      .replace(/^\s*[-*+]\s+/gm, '• ') // Convert markdown lists to bullet points
      .replace(/^\s*\d+\.\s+/gm, '• ') // Convert numbered lists to bullet points
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Reduce multiple blank lines to double
      .split('\n') // Split into lines for processing
      .map(line => {
        // Add spacing after section headers (lines that don't start with bullet points)
        if (line.trim() && !line.startsWith('•') && !line.startsWith(' ') && line.length > 0) {
          return line + '\n'; // Add extra newline after headers
        }
        return line;
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n') // Clean up excessive newlines
      .trim();
  };

  // Show command hints when user types '/'
  useEffect(() => {
    setShowCommandHints(message.startsWith('/') && message.length > 1);
  }, [message]);

  // Filter commands based on input
  const filteredCommands = chatCommands.filter(cmd => 
    message.length > 1 && cmd.command.toLowerCase().includes(message.toLowerCase())
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-focus input on mount and after messages
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading, messages]);

  // Helper function to detect MCP-related queries (excluding direct tool commands)
  const isMCPQuery = (input: string): boolean => {
    // Don't treat direct tool commands as NLP queries
    if (input.startsWith('/') && input.includes('eac_')) {
      return false;
    }
    
    // Skip simple greetings and short messages
    const msg = input.toLowerCase().trim();
    if (msg.length < 10 || 
        ['hi', 'hello', 'hey', 'thanks', 'thank you', 'ok', 'okay', 'yes', 'no'].includes(msg) ||
        msg.match(/^(hi|hello|hey|thanks?|ok|okay|yes|no)[!.?]*$/)) {
      return false;
    }

    // Only trigger on very specific, explicit requests
    const explicitMCPPatterns = [
      /analyze.+(reddit|project|workflow|integration)/,
      /generate.+(post|content|component)/,
      /optimize.+(workflow|process)/,
      /show.+(reddit|project|component|architecture)/,
      /create.+(project|component).+/,
      /reddit.+(analyze|post|integration)/
    ];
    
    const lowerInput = input.toLowerCase();
    
    return explicitMCPPatterns.some(pattern => pattern.test(lowerInput)) ||
           input.startsWith('/reddit') ||
           input.startsWith('/mcp') ||
           input.startsWith('/workflow');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      const messageContent = message.trim();
      setMessage("");
      setShowMCPTools(false);
      setSelectedToolIndex(-1);
      
      // Check for agent tool commands (e.g., /instructions)
      if (messageContent.startsWith('/') && activeAgentId) {
        const activeAgent = agents.find(a => a.id === activeAgentId);
        const command = messageContent.split(' ')[0];
        const agentTool = activeAgent?.tools.find(t => t.command === command);
        
        if (agentTool) {
          try {
            // Create Convex mutations object for database operations
            const convexMutations = {
              ensureInstructionsProject,
              createInstructionFile: createInstruction,
            };
            
            const result = await executeAgentTool(activeAgentId, agentTool.id, messageContent, convexMutations);
            
            // Store agent result directly to chat without sending to Claude (to avoid MCP intent detection)
            await storeChatMessage({
              role: "assistant",
              content: `🤖 Agent Result:\n\n${result}`,
              sessionId,
            });
            return;
          } catch (error) {
            console.error('Agent tool error:', error);
            await storeChatMessage({
              role: "assistant", 
              content: `❌ Agent tool failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              sessionId,
            });
            return;
          }
        }
      }
      
      // Check if message starts with MCP tool command (e.g., /eac_project_analyze)
      if (mcpConnected && messageContent.startsWith('/') && messageContent.includes('eac_')) {
        try {
          // Extract tool name and arguments from the command
          const parts = messageContent.slice(1).split(' ');
          const toolName = parts[0];
          const query = parts.slice(1).join(' ') || `Execute ${toolName} with default parameters`;
          
          // Create a direct tool call request instead of using natural language processing
          const response = await fetch('/api/mcp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'call-tool',
              data: {
                name: toolName,
                arguments: {
                  query: query,
                  includePatterns: true,
                  includeRecommendations: true,
                  includeProps: true,
                  includeHooks: true,
                  includeUsage: true,
                  includeSchema: true,
                  includeFunctions: true
                }
              }
            })
          });
          
          const mcpResponse = await response.json();
          
          if (mcpResponse.success && mcpResponse.result) {
            // Extract text content from the direct tool result
            let textContent = '';
            if (mcpResponse.result.content && Array.isArray(mcpResponse.result.content)) {
              textContent = mcpResponse.result.content
                .filter((item: { type: string; text?: string }) => item.type === 'text')
                .map((item: { type: string; text?: string }) => item.text || '')
                .join('\n');
            } else if (typeof mcpResponse.result === 'string') {
              textContent = mcpResponse.result;
            } else {
              textContent = JSON.stringify(mcpResponse.result, null, 2);
            }
            
            // Strip markdown formatting and convert to plain text
            const plainText = stripMarkdown(textContent);
            
            await sendMessage(`🔧 ${toolName} Results:\n\n${plainText}`);
          } else {
            await sendMessage(`❌ Failed to execute ${toolName}: ${mcpResponse.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('MCP Tool Error:', error);
          await sendMessage(`❌ Error executing MCP tool: ${error}`);
        }
      } else if (mcpConnected && isMCPQuery(messageContent)) {
        // Check if this looks like a natural language MCP query
        try {
          const mcpResponse = await processNaturalLanguage(messageContent);
          
          if (mcpResponse.success && mcpResponse.content && mcpResponse.content.length > 0) {
            // Extract the actual text content from the MCP response
            const textContent = mcpResponse.content[0].text;
            
            // Strip markdown formatting and convert to plain text
            const plainText = stripMarkdown(textContent);
            
            // Send the MCP response with clean text content
            await sendMessage(`🤖 MCP Analysis:\n\n${plainText}`);
          } else {
            await sendMessage(messageContent);
          }
        } catch (error) {
          console.error('MCP Error:', error);
          // Fall back to regular chat
          await sendMessage(messageContent);
        }
      } else {
        // Regular chat message - add instruction context if available
        let contextualMessage = messageContent;
        if (instructionContext) {
          contextualMessage = `${instructionContext}\n\n---\n\n${messageContent}`;
        }
        
        // Use the useChat hook which will call the sendChatMessage action
        // We need to modify the useChat hook to support passing the original message
        await sendMessage(contextualMessage, messageContent);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMCPTools && filteredTools.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedToolIndex(prev =>
          prev < filteredTools.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedToolIndex(prev =>
          prev > 0 ? prev - 1 : filteredTools.length - 1
        );
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (selectedToolIndex >= 0 && selectedToolIndex < filteredTools.length) {
          const selectedTool = filteredTools[selectedToolIndex];
          const commandToUse = 'command' in selectedTool ? selectedTool.command : `/${selectedTool.name}`;
          setMessage(`${commandToUse} `);
          setShowMCPTools(false);
          setSelectedToolIndex(-1);
          inputRef.current?.focus();
        }
      } else if (e.key === 'Escape') {
        setShowMCPTools(false);
        setSelectedToolIndex(-1);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Show tools menu when message starts with '/' and is just one character or when typing tool name
    if (value === '/' || (value.startsWith('/') && !value.includes(' '))) {
      setShowMCPTools(true);
      setShowCommandHints(false);
      // Auto-select first matching tool if typing
      if (value.length > 1) {
        const searchTerm = value.slice(1).toLowerCase();
        const currentFiltered = filteredTools.filter(tool => {
          const toolName = 'command' in tool && tool.command ? tool.command.slice(1) : tool.name;
          return toolName.toLowerCase().includes(searchTerm);
        });
        setSelectedToolIndex(currentFiltered.length > 0 ? 0 : -1);
      } else {
        setSelectedToolIndex(0);
      }
    } else if (value.startsWith('/') && value.includes(' ')) {
      // Hide menu once user has selected a tool and added space
      setShowMCPTools(false);
      setSelectedToolIndex(-1);
    } else if (!value.startsWith('/')) {
      setShowMCPTools(false);
      setSelectedToolIndex(-1);
      // Show regular command hints for other commands (keep existing logic)
      setShowCommandHints(value.startsWith('/') && value.length > 1);
    }
  };

  // Helper function to get available tools based on current mode
  const getAvailableTools = () => {
    if (toolsMode === 'agents') {
      if (activeAgentId) {
        const activeAgent = agents.find(a => a.id === activeAgentId);
        return activeAgent?.tools.map(tool => ({
          name: tool.command.slice(1), // Remove the '/' prefix
          description: tool.description,
          command: tool.command
        })) || [];
      } else {
        // Return empty array when in agent mode but no agent is selected
        return [];
      }
    } else {
      // MCP mode - return MCP tools
      return availableTools || [];
    }
  };

  const currentTools = getAvailableTools();

  const handleToolSelect = (tool: { name: string; description: string; command?: string }) => {
    const commandToUse = tool.command || `/${tool.name}`;
    setMessage(`${commandToUse} `);
    setShowMCPTools(false);
    setSelectedToolIndex(-1);
    inputRef.current?.focus();
  };

  // Filter tools based on input and current mode
  const filteredTools = currentTools.filter(tool => {
    if (!message.startsWith('/') || message.length === 1) return true;
    const searchTerm = message.slice(1).split(' ')[0].toLowerCase();
    const toolName = 'command' in tool && tool.command ? tool.command.slice(1) : tool.name;
    return toolName.toLowerCase().includes(searchTerm);
  });

  return (
    <div 
      ref={scrollRef} 
      className="flex-1 overflow-y-auto bg-[#0e0e0e] p-2 min-h-0 scrollbar-hidden"
    >
      <div className="font-mono text-xs space-y-2 min-h-full">
        {/* Terminal Welcome Text */}
        <div className="text-[#cccccc] space-y-1 mb-4">
          <div>EAC Financial Dashboard - AI Assistant</div>
          <div className="text-[#4ec9b0]">▲ Next.js 15.0.0 + Convex Backend</div>
          <div>- Anthropic Claude 3.5 Sonnet Integration</div>
          <div className={`text-xs ${mcpConnected ? 'text-[#4ec9b0]' : 'text-[#f48771]'}`}>
            🔌 MCP Server: {mcpConnected ? 'Connected' : 'Disconnected'}
            {mcpConnected && ` (${availableTools.length} tools)`}
          </div>
          <div className={`text-xs ${activeAgentId ? 'text-[#4ec9b0]' : 'text-[#858585]'}`}>
            🤖 Agents: {activeAgentId ? `Active (${agents.find(a => a.id === activeAgentId)?.name})` : 'None selected'}
            {activeAgentId && ` (${agents.find(a => a.id === activeAgentId)?.tools.length || 0} tools)`}
          </div>
          {mcpError && (
            <div className="text-[#f48771] text-xs">MCP Error: {mcpError}</div>
          )}
          <div className="text-[#858585] mt-2">AI Assistant ready for EAC project questions.</div>
          <div className="text-[#858585] text-xs">Session: {sessionId.slice(-8)}</div>
          <div className="text-[#858585] border-t border-[#333] pt-2 mt-3">
            Type your questions about projects, financials, Reddit integration, or development below.
            {mcpConnected && <div className="text-xs text-[#4ec9b0] mt-1">Enhanced: Try &ldquo;analyze my reddit integration&rdquo; or &ldquo;optimize my workflow&rdquo;</div>}
            {activeAgentId && <div className="text-xs text-[#4ec9b0] mt-1">Agent Active: Type &ldquo;/&rdquo; to see available agent tools</div>}
          </div>
        </div>

        {/* Chat Messages */}
        {messages?.map((msg) => (
          <div key={msg._id} className="space-y-1">
            {msg.role === 'user' && (
              <div className="text-[#cccccc]">
                <span className="text-[#007acc]">$ user:</span> {msg.content}
              </div>
            )}
            
            {msg.role === 'assistant' && (
              <div className="text-[#cccccc]">
                <span className="text-[#4ec9b0]">$ system:</span> <span className="whitespace-pre-wrap">{msg.content}</span>
              </div>
            )}
            
            {msg.role === 'system' && (
              <div className="text-[#f48771]">
                <span className="text-[#f48771]">$ error:</span> {msg.content}
              </div>
            )}
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="text-[#cccccc]">
            <span className="text-[#4ec9b0]">$ system:</span> <span className="text-[#858585] animate-pulse">thinking...</span>
          </div>
        )}

        {/* Inline Input */}
        <div className="flex flex-col pt-2">
          {/* Tools Menu */}
          {showMCPTools && currentTools && currentTools.length > 0 && (
            <div className="mb-2 bg-[#1a1a1a] border border-[#333] rounded text-xs max-h-48 overflow-y-auto">
              {/* Tools Toggle */}
              <div className="flex items-center justify-between p-2 border-b border-[#333]">
                <div className="text-[#4ec9b0] text-xs font-medium">
                  {toolsMode === 'mcp' ? 'MCP Tools' : 'Agent Tools'} ({filteredTools.length} of {currentTools.length} available)
                </div>
                <ToolsToggle
                  mode={toolsMode}
                  onModeChange={setToolsMode}
                  className="scale-90"
                />
              </div>
              
              {/* Tools List */}
              <div className="p-2 space-y-1">
                {filteredTools.length > 0 ? (
                  filteredTools.map((tool, index) => {
                    const displayName = 'command' in tool && tool.command ? tool.command : `/${tool.name}`;
                    return (
                      <div
                        key={tool.name}
                        className={`text-[#cccccc] py-1 px-2 rounded cursor-pointer hover:bg-[#2a2a2a] ${
                          selectedToolIndex === index ? 'bg-[#0e639c] text-white' : ''
                        }`}
                        onClick={() => handleToolSelect(tool)}
                      >
                        <div className="font-semibold">{displayName}</div>
                        <div className="text-[#858585] text-xs mt-0.5">{tool.description}</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-[#858585] py-2 text-center">
                    {toolsMode === 'agents' && !activeAgentId
                      ? 'No agent selected. Select an agent from the Agents panel.'
                      : `No ${toolsMode === 'mcp' ? 'MCP' : 'agent'} tools available.`
                    }
                  </div>
                )}
              </div>
              
              <div className="text-[#858585] text-xs p-2 border-t border-[#333]">
                ↑↓ navigate • Enter/Tab select • Esc cancel
              </div>
            </div>
          )}

          {/* Command Hints */}
          {showCommandHints && filteredCommands.length > 0 && (
            <div className="mb-2 p-2 bg-[#1a1a1a] border border-[#333] rounded text-xs">
              <div className="text-[#4ec9b0] mb-1">Available Commands:</div>
              {filteredCommands.slice(0, 5).map((cmd) => (
                <div key={cmd.command} className="text-[#858585] py-0.5">
                  <span className="text-[#cccccc]">{cmd.command}</span> - {cmd.description}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center">
            <span className="text-[#007acc]">$ user:</span>
            <form onSubmit={handleSubmit} className="flex-1 ml-1">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={isLoading ? "AI is thinking..." : "Type / for MCP tools or ask about your EAC project..."}
                disabled={isLoading}
                className="w-full bg-transparent text-[#cccccc] border-none outline-none placeholder:text-[#858585] disabled:opacity-50 disabled:cursor-not-allowed caret-[#cccccc]"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
