// Custom hook for chat functionality with Convex
// /Users/matthewsimon/Projects/eac/eac/lib/hooks/useChat.ts

import { api } from "@/convex/_generated/api";
import { useChatStore } from "@/store/terminal/chat";
import { useAction, useMutation, useQuery } from "convex/react";
import { useCallback } from "react";
import { handleCommand, isCommand, parseCommand } from "../chatCommands";

export function useChat() {
  const { sessionId, isLoading, setLoading } = useChatStore();
  
  // Get messages from Convex
  const messages = useQuery(api.chat.getChatMessages, {
    sessionId,
    limit: 50,
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
    
    // Handle local commands (check original content if provided)
    const contentToCheck = originalTrimmedContent || trimmedContent;
    if (isCommand(contentToCheck)) {
      const { command } = parseCommand(contentToCheck);
      
      // Store user command (store original content if provided)
      await storeChatMessage({
        role: "user",
        content: originalTrimmedContent || trimmedContent,
        sessionId,
      });
      
      if (command === '/clear') {
        await clearChatHistory({ sessionId });
        return;
      }
      
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

  return {
    messages: messages ?? [],
    isLoading,
    sendMessage,
    sessionId,
    storeChatMessage,
  };
}
