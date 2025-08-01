// Custom hook for chat functionality with Convex
// /Users/matthewsimon/Projects/eac/eac/lib/hooks/useChat.ts

import { api } from "@/convex/_generated/api";
import { useChatStore } from "@/store/terminal/chat";
import { useAction, useMutation, useQuery } from "convex/react";
import { useCallback } from "react";
import { handleCommand, isCommand, parseCommand } from "../chatCommands";

export function useChat() {
  const { sessionId, isLoading, setLoading, addTerminalFeedback } = useChatStore();
  
  // Get messages from Convex
  const messages = useQuery(api.chat.getChatMessages, {
    sessionId,
    limit: 500,
  });
  
  // Action to send messages to Claude
  const sendChatMessage = useAction(api.chatActions.sendChatMessage);
  
  // Mutation to store local messages
  const storeChatMessage = useMutation(api.chat.storeChatMessage);
  
  // Mutation to clear chat history
  const clearChatHistory = useMutation(api.chat.clearChatHistory);
  
  const sendMessage = useCallback(async (content: string, originalContent?: string) => {
    if (!content.trim() || isLoading) return;
    
    const trimmedContent = content.trim();
    const originalTrimmedContent = originalContent?.trim();
    
    // Handle specific local commands only
    const contentToCheck = originalTrimmedContent || trimmedContent;
    if (isCommand(contentToCheck)) {
      const { command } = parseCommand(contentToCheck);
      
      // Only handle /clear locally, let all other commands go to Convex
      if (command === '/clear') {
        // Store user command
        await storeChatMessage({
          role: "user",
          content: originalTrimmedContent || trimmedContent,
          sessionId,
        });
        
        await clearChatHistory({ sessionId });
        return;
      }
      
      // Check if it's a local help command (not agent command)
      if (['/help', '/project', '/tech', '/files', '/components', '/stores', '/convex'].includes(command)) {
        // Store user command
        await storeChatMessage({
          role: "user",
          content: originalTrimmedContent || trimmedContent,
          sessionId,
        });
        
        const commandResponse = handleCommand(command);
        
        if (commandResponse) {
          // Store system response for command
          await storeChatMessage({
            role: "system",
            content: commandResponse,
            sessionId,
          });
          return;
        }
      }
      
      // All other commands (like /twitter, /instructions, /) go to Convex
    }
    
    // Handle regular AI chat messages
    setLoading(true);
    
    try {
      await sendChatMessage({
        content: trimmedContent,
        originalContent: originalTrimmedContent,
        sessionId,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Error messages are already handled in the Convex action
    } finally {
      setLoading(false);
    }
  }, [sendChatMessage, storeChatMessage, clearChatHistory, sessionId, isLoading, setLoading]);

  // Check if session is approaching or at limit
  const messageCount = messages?.length ?? 0;
  const isNearSessionLimit = messageCount >= 450; // Warning at 450 messages
  const isAtSessionLimit = messageCount >= 500; // Hard limit at 500 messages

  // Function to check if new messages can be added
  const canAddMessages = () => {
    return messageCount < 500;
  };

  // Function to get session status
  const getSessionStatus = () => {
    if (isAtSessionLimit) {
      return {
        status: 'limit_reached',
        message: '🚨 Session limit reached (500 messages). Please start a new session to continue.',
        messageCount,
        limit: 500
      };
    } else if (isNearSessionLimit) {
      return {
        status: 'near_limit',
        message: `⚠️ Approaching session limit (${messageCount}/500 messages). Consider starting a new session soon.`,
        messageCount,
        limit: 500
      };
    }
    return {
      status: 'normal',
      message: null,
      messageCount,
      limit: 500
    };
  };

  // Placeholder function for starting a new session (to be implemented later)
  const startNewSession = useCallback(() => {
    console.log("🔄 Starting new session... (placeholder function)");
    // TODO: Implement session creation logic
    // This will include:
    // 1. Generate new session ID
    // 2. Clear current messages (optional)
    // 3. Update session ID in store
    // 4. Optionally archive current session
    alert("New session functionality will be implemented soon!");
  }, []);

  return {
    messages: messages ?? [],
    isLoading,
    sendMessage,
    sessionId,
    storeChatMessage,
    addTerminalFeedback,
    // Session limit functionality
    messageCount,
    isNearSessionLimit,
    isAtSessionLimit,
    canAddMessages,
    getSessionStatus,
    startNewSession,
  };
}
