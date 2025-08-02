// Custom hook for chat functionality with Convex
// /Users/matthewsimon/Projects/eac/eac/lib/hooks/useChat.ts

import { api } from "@/convex/_generated/api";
import { useChatStore } from "@/store/terminal/chat";
import { useSessionStore } from "@/store/terminal/session";
import { useAction, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect } from "react";
import { handleCommand, isCommand, parseCommand } from "../chatCommands";

export function useChat() {
  const { sessionId, isLoading, setLoading, addTerminalFeedback, loadMessagesForSession } = useChatStore();
  const { activeSessionId, updateSession } = useSessionStore();
  
  // Use the active session ID from session store, fallback to chat store
  const currentSessionId = activeSessionId || sessionId;
  
  // Get messages from Convex for the current session
  const messages = useQuery(api.chat.getChatMessages, {
    sessionId: currentSessionId,
    limit: 500,
  });
  
  // Action to send messages to Claude
  const sendChatMessage = useAction(api.chatActions.sendChatMessage);
  
  // Mutation to store local messages
  const storeChatMessage = useMutation(api.chat.storeChatMessage);
  
  // Mutation to clear chat history
  const clearChatHistory = useMutation(api.chat.clearChatHistory);

  // Update session metadata when messages change
  useEffect(() => {
    if (messages && messages.length > 0 && currentSessionId) {
      const lastMessage = messages[messages.length - 1];
      updateSession(currentSessionId, {
        lastActivity: lastMessage._creationTime,
        messageCount: messages.length,
        preview: lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : ''),
      });
    }
  }, [messages, currentSessionId, updateSession]);
  
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
          sessionId: currentSessionId,
        });
        
        await clearChatHistory({ sessionId: currentSessionId });
        return;
      }
      
      // Check if it's a local help command (not agent command)
      if (['/help', '/project', '/tech', '/files', '/components', '/stores', '/convex'].includes(command)) {
        // Store user command
        await storeChatMessage({
          role: "user",
          content: originalTrimmedContent || trimmedContent,
          sessionId: currentSessionId,
        });
        
        const commandResponse = handleCommand(command);
        
        if (commandResponse) {
          // Store system response for command
          await storeChatMessage({
            role: "system",
            content: commandResponse,
            sessionId: currentSessionId,
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
        sessionId: currentSessionId,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Error messages are already handled in the Convex action
    } finally {
      setLoading(false);
    }
  }, [sendChatMessage, storeChatMessage, clearChatHistory, currentSessionId, isLoading, setLoading]);

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

  // Function to start a new session (integrated with session store)
  const startNewSession = useCallback(() => {
    const { createNewSession } = useSessionStore.getState();
    const newSessionId = createNewSession();
    console.log("🔄 Started new session:", newSessionId);
    return newSessionId;
  }, []);

  return {
    messages: messages ?? [],
    isLoading,
    sendMessage,
    sessionId: currentSessionId,
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
