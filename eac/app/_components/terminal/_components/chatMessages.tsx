// Simplified Chat Messages Component - No Slash Commands
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/chatMessages.tsx

"use client";

import { api } from "@/convex/_generated/api";
import { useChat } from "@/lib/hooks/useChat";
import { useInstructionContext, useInstructions } from "@/lib/hooks/useInstructions";
import { useMCP } from "@/lib/hooks/useMCP";
import { useAgentStore, useEditorStore } from "@/store";
import { useChatStore } from "@/store/terminal/chat";
import { useSessionStore } from "@/store/terminal/session";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import React, { useEffect, useRef, useState } from "react";

export function ChatMessages() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const processedOperations = useRef<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [enableThinkingStream, setEnableThinkingStream] = useState(true); // Toggle for streaming thinking
  
  const { user, isLoaded } = useUser();
  const { initializeUserSession, addTerminalFeedback, setSessionId } = useChatStore();
  const { activeSessionId } = useSessionStore();
  const { 
    messages, 
    isLoading: chatLoading, 
    sendMessage, 
    sendMessageWithStreaming,
    sessionId, 
    storeChatMessage, 
    addTerminalFeedback: useTerminalFeedback,
    streamingThinking,
    isStreamingThinking,
    messageCount,
    isNearSessionLimit,
    isAtSessionLimit,
    canAddMessages,
    getSessionStatus,
    startNewSession
  } = useChat();
  const {
    isConnected: mcpConnected,
    isLoading: mcpLoading,
    error: mcpError,
    availableTools,
    processNaturalLanguage,
  } = useMCP();
  
  // Agent execution and mutations
  const { agents, activeAgentId, setActiveAgent, executeAgentTool } = useAgentStore();
  const createInstruction = useMutation(api.instructions.createInstructionFile);
  const ensureInstructionsProject = useMutation(api.instructions.ensureInstructionsProject);
  const upsertPost = useMutation(api.twitter.upsertPost);
  const instructionContext = useInstructionContext();
  const { isLoading: instructionsLoading } = useInstructions();
  const { createNewFile } = useEditorStore();

  const isLoading = chatLoading || mcpLoading || instructionsLoading;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize user session when component mounts and user is loaded
  useEffect(() => {
    if (isLoaded && user && !sessionId) {
      console.log("🔄 Initializing user session...", { userId: user.id });
      initializeUserSession(user.id);
    }
  }, [user, isLoaded, sessionId, initializeUserSession]);

  // Sync session ID if active session changes
  useEffect(() => {
    if (activeSessionId && activeSessionId !== sessionId) {
      console.log("🔄 Syncing to active session:", activeSessionId);
      setSessionId(activeSessionId);
    }
  }, [activeSessionId, sessionId, setSessionId]);

  // DISABLED: Process messages with operations to create UI files
  // This is now handled by useFileLoad hook which syncs from Convex to local store
  /*
  useEffect(() => {
    if (!messages) return;
    
    console.log('🔍 Processing messages for operations:', {
      totalMessages: messages.length,
      recentMessagesCount: messages.slice(-10).length,
      processedCount: processedOperations.current.size
    });
    
    // Look for messages with operations that need UI processing
    const recentMessages = messages.slice(-10); // Check last 10 messages
    
    recentMessages.forEach((message: any, index) => {
      console.log(`🔍 Message ${index}:`, {
        id: message._id,
        role: message.role,
        hasOperation: !!message.operation,
        operationType: message.operation?.type,
        operationDetails: message.operation?.details,
        contentPreview: message.content?.substring(0, 100),
        alreadyProcessed: processedOperations.current.has(message._id)
      });
      
      if (message.operation?.type === 'file_created' && message._id) {
        // Skip if already processed
        if (processedOperations.current.has(message._id)) {
          console.log(`⏭️ Skipping already processed message: ${message._id}`);
          return;
        }
        
        const { fileName, fileType, content, platformData, agentType } = message.operation.details;
        
        console.log('🔍 File creation operation found:', {
          fileName,
          fileType,
          agentType,
          hasContent: !!content,
          contentLength: content?.length || 0,
          willProcess: agentType === 'twitter' && content
        });
        
        // Only process Twitter agent files for UI creation that have content
        if (agentType === 'twitter' && content) {
          console.log('🔄 Processing social file operation:', {
            fileName,
            fileType,
            content: content,
            contentLength: content?.length || 0,
            contentType: typeof content,
            messageId: message._id,
            platformData: platformData,
            allDetails: message.operation.details
          });
          
          // Mark as processed FIRST to prevent race conditions
          processedOperations.current.add(message._id);
          
          // Parse the platform data with error handling
          let platformDataObj;
          try {
            platformDataObj = platformData ? JSON.parse(platformData) : {};
          } catch (error) {
            console.warn('⚠️ Failed to parse platform data, using defaults:', error);
            platformDataObj = {
              replySettings: 'following',
              scheduledDate: '',
              scheduledTime: '',
              isThread: false
            };
          }
          
          // Create the content for the Twitter post file in the expected format
          const postContent = `# ${fileName.replace(/\.[^/.]+$/, "")} - X (Twitter) Post
Platform: X (Twitter)
Created: ${new Date().toLocaleDateString()}

## Post Content
${content}

## Settings
- Reply Settings: ${platformDataObj.replySettings || 'following'}
- Schedule: ${platformDataObj.scheduledDate && platformDataObj.scheduledTime ? `${platformDataObj.scheduledDate} ${platformDataObj.scheduledTime}` : 'Now'}
- Thread: ${platformDataObj.isThread ? 'Multi-tweet Thread' : 'Single Tweet'}

## Media
- Images: []
- Videos: []

## Analytics
- Impressions: 0
- Engagements: 0
- Likes: 0
- Shares: 0`;

          // Get the createNewFile function from the store at execution time
          const { createNewFile, projectFolders } = useEditorStore.getState();
          
          // Find the Content Creation folder ID
          const contentCreationFolder = projectFolders.find(folder => 
            folder.name === 'Content Creation'
          );
          
          if (contentCreationFolder) {
            // Create the file in the Content Creation folder
            createNewFile(
              fileName,
              'x', // Use 'x' type for Twitter files
              'project',
              contentCreationFolder.id,
              postContent
            );
            
            console.log('✅ Created social file in UI:', fileName);
          } else {
            console.warn('⚠️ Content Creation folder not found');
            
            // Create without folder ID if folder not found
            createNewFile(
              fileName,
              'x',
              'project',
              undefined,
              postContent
            );
          }
        }
      }
    });
  }, [messages]); // Removed createNewFile from dependencies to prevent re-runs on panel switches
  */

  // Helper function to strip markdown formatting
  const stripMarkdown = (text: string): string => {
    return text
      .replace(/#{1,6}\s*/g, '') // Remove headers
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

  // Helper function to detect MCP-related queries (excluding direct tool commands)
  const isMCPQuery = (text: string): boolean => {
    // Don't treat direct tool commands as NLP queries
    if (text.startsWith('/')) return false;
    
    // Look for keywords that suggest MCP analysis would be helpful
    const mcpKeywords = [
      'analyze', 'examine', 'review', 'explain', 'understand', 'architecture',
      'structure', 'code', 'component', 'function', 'implementation', 'pattern',
      'best practice', 'issue', 'bug', 'error', 'performance', 'optimization',
      'refactor', 'improvement', 'documentation', 'overview', 'summary',
      'how does', 'what is', 'why is', 'where is', 'when is', 'which'
    ];
    
    const lowerText = text.toLowerCase();
    return mcpKeywords.some(keyword => lowerText.includes(keyword));
  };

  const handleToolSelectorClose = () => {
    setMessage("");
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check session limit before processing
    if (!canAddMessages()) {
      console.warn("Cannot send message: Session limit reached");
      // Add a terminal feedback message about the limit
      await storeChatMessage({
        role: "terminal",
        content: `[${new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        })}] 🚨 Message not sent: Session limit reached (500 messages)
Please start a new session to continue chatting.`,
        sessionId,
      });
      return;
    }
    
    if (message.trim() && !isLoading) {
      const messageContent = message.trim();
      setMessage("");
      
      // Check if this looks like a natural language MCP query
      if (mcpConnected && isMCPQuery(messageContent)) {
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
        
        // Always use streaming thinking for all messages (thinking enabled by default)
        await sendMessageWithStreaming(contextualMessage, messageContent);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto bg-[#0e0e0e] p-2 pb-8 min-h-0 scrollbar-hidden"
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
            
            {/* Session Status and Limits */}
            <div className="text-[#858585] text-xs">
              Messages: {messageCount}/500
              {isNearSessionLimit && (
                <span className="text-[#f48771] ml-2">⚠️ Approaching limit</span>
              )}
              {isAtSessionLimit && (
                <span className="text-[#f48771] ml-2">🚨 Session full</span>
              )}
            </div>
            
            {/* Thinking Stream Toggle */}
            <div className="text-xs mt-1 flex items-center gap-2">
              <button
                onClick={() => setEnableThinkingStream(!enableThinkingStream)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  enableThinkingStream 
                    ? 'bg-[#007acc] text-white hover:bg-[#005a9e]' 
                    : 'bg-[#2d2d2d] text-[#858585] hover:bg-[#3a3a3a]'
                }`}
              >
                🧠 {enableThinkingStream ? 'Thinking ON' : 'Thinking OFF'}
              </button>
              <span className="text-[#858585]">
                {enableThinkingStream ? 'See AI reasoning stream in real-time' : 'Show thinking only in final messages'}
              </span>
            </div>
          </div>

          {/* Messages */}
          {messages.map((msg, index) => (
            <div key={index} className="space-y-1">
              {msg.role === 'user' && (
                <div className="text-[#007acc]">
                  <span className="text-[#007acc]">$ user:</span>
                  <span className="ml-1 text-[#cccccc]">{msg.content}</span>
                </div>
              )}
              {msg.role === 'assistant' && (
                <div className="text-[#4ec9b0]">
                  <span className="text-[#4ec9b0]">🤖 assistant:</span>
                  <div className="ml-1 text-[#cccccc] whitespace-pre-wrap">{msg.content}</div>
                </div>
              )}
              {msg.role === 'thinking' && (
                <div className="text-[#d4d4aa]">
                  <span className="text-[#d4d4aa]">🧠 thinking:</span>
                  <div className="ml-1 text-[#cccccc] whitespace-pre-wrap text-xs font-mono italic">
                    {msg.content}
                  </div>
                </div>
              )}
              {msg.role === 'terminal' && (
                <div className="text-[#858585]">
                  <div className="text-[#585858] whitespace-pre-wrap bg-[#1a1a1a] p-1 rounded text-[10px] border-l-2 border-[#333]">
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Streaming Thinking Display */}
          {enableThinkingStream && isStreamingThinking && streamingThinking && (
            <div className="space-y-1">
              <div className="text-[#d4d4aa]">
                <span className="text-[#d4d4aa]">🧠 thinking:</span>
                <div className="ml-1 text-[#cccccc] whitespace-pre-wrap text-xs font-mono italic">
                  {streamingThinking}
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="text-[#4ec9b0]">
              <span className="text-[#4ec9b0]">🤖 assistant:</span>
              <span className="ml-1 text-[#858585]">thinking...</span>
            </div>
          )}
        </div>
      </div>

      {/* Input area - Now outside the scrollable container */}
      <div className="bg-[#0e0e0e] p-2 font-mono text-xs flex-shrink-0">
        <div className="flex items-center">
          <span className="text-[#007acc]">$ user:</span>
          <form onSubmit={handleSubmit} className="flex-1 ml-1">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isAtSessionLimit 
                  ? "Session limit reached - Start new session to continue..." 
                  : isLoading 
                    ? "AI is thinking..." 
                    : "Ask about your EAC project..."
              }
              disabled={isLoading || isAtSessionLimit}
              className={`w-full bg-transparent border-none outline-none placeholder:text-[#858585] disabled:opacity-50 disabled:cursor-not-allowed caret-[#cccccc] ${
                isAtSessionLimit ? 'text-[#f48771]' : 'text-[#cccccc]'
              }`}
            />
          </form>
        </div>
      </div>
    </div>
  );
}