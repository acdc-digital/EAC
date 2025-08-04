import Anthropic from "@anthropic-ai/sdk";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo } from "react";
import { api } from "../../convex/_generated/api";
import {
    calculateCost,
    checkConversationLimits,
    ConversationTokens,
    countMessageTokens,
    DEFAULT_CONVERSATION_LIMITS,
    estimateTokenCount,
    formatCost,
    formatTokenCount,
    getConversationTokenStatus,
    truncateConversationHistory
} from "../tokenUtils";

// Type for our internal message format that's more flexible
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Hook for managing chat session tokens
 */
export function useTokenManagement(sessionId: string, userId?: string) {
  // Convex queries and mutations
  const sessionUsage = useQuery(api.tokenActions.getSessionTokenUsage, { sessionId });
  const canAcceptTokens = useQuery(api.tokenActions.canSessionAcceptTokens, { 
    sessionId, 
    estimatedTokens: 1000 // Default estimation for checking
  });
  const upsertSession = useMutation(api.tokenActions.upsertChatSession);
  const updateTokens = useMutation(api.tokenActions.updateSessionTokens);
  const closeSession = useMutation(api.tokenActions.closeSession);

  // Create Anthropic client for token counting (optional, for accurate counting)
  const anthropicClient = useMemo(() => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
      return apiKey ? new Anthropic({ apiKey }) : null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Initialize or ensure session exists
   */
  const initializeSession = useCallback(async (options?: {
    maxTokensAllowed?: number;
    title?: string;
    preview?: string;
  }) => {
    try {
      await upsertSession({
        sessionId,
        userId,
        maxTokensAllowed: options?.maxTokensAllowed || DEFAULT_CONVERSATION_LIMITS.maxTokensPerSession,
        title: options?.title,
        preview: options?.preview,
      });
    } catch (error) {
      console.error("Failed to initialize session:", error);
      throw error;
    }
  }, [sessionId, userId, upsertSession]);

  /**
   * Count tokens for a message or conversation
   */
  const countTokens = useCallback(async (
    input: string | ChatMessage[]
  ) => {
    try {
      if (typeof input === 'string') {
        const messages: Anthropic.MessageParam[] = [{ role: 'user', content: input }];
        if (anthropicClient) {
          const result = await countMessageTokens(messages, undefined, anthropicClient);
          return result.inputTokens;
        } else {
          const result = estimateTokenCount(messages);
          return result.inputTokens;
        }
      }
      
      // Convert our chat messages to Anthropic format
      const messages: Anthropic.MessageParam[] = input
        .filter(msg => msg.role !== 'system') // Remove system messages for token counting
        .map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }));
        
      if (anthropicClient) {
        const result = await countMessageTokens(messages, undefined, anthropicClient);
        return result.inputTokens;
      } else {
        const result = estimateTokenCount(messages);
        return result.inputTokens;
      }
    } catch (error) {
      console.error("Failed to count tokens:", error);
      // Fallback to rough estimation
      const text = typeof input === 'string' ? input : input.map(m => m.content).join(' ');
      return Math.ceil(text.length / 4); // ~4 chars per token
    }
  }, [anthropicClient]);

  /**
   * Track token usage for a chat completion
   */
  const trackTokenUsage = useCallback(async (options: {
    inputTokens: number;
    outputTokens: number;
    model?: string;
  }) => {
    try {
      const cost = calculateCost(options.inputTokens, options.outputTokens);

      const result = await updateTokens({
        sessionId,
        inputTokens: options.inputTokens,
        outputTokens: options.outputTokens,
        estimatedCost: cost,
      });

      return result;
    } catch (error) {
      console.error("Failed to track token usage:", error);
      throw error;
    }
  }, [sessionId, updateTokens]);

  /**
   * Check if session can handle additional tokens
   */
  const checkTokenLimit = useCallback((estimatedTokens: number) => {
    if (!sessionUsage) return { canAccept: true, reason: "Session not loaded" };
    
    return checkConversationLimits(
      sessionUsage.totalTokens,
      estimatedTokens
    );
  }, [sessionUsage]);

  /**
   * Get conversation trimmed to fit within token limits
   */
  const trimConversationToLimit = useCallback(async (
    messages: ChatMessage[],
    maxTokens?: number
  ) => {
    try {
      const limit = maxTokens || sessionUsage?.maxTokensAllowed || DEFAULT_CONVERSATION_LIMITS.maxTokensPerSession;
      
      // Convert to Anthropic format for processing
      const anthropicMessages: Anthropic.MessageParam[] = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }));
      
      const trimmed = await truncateConversationHistory(anthropicMessages, limit);
      
      // Convert back to our format
      return trimmed.map(msg => ({
        role: msg.role,
        content: msg.content
      })) as ChatMessage[];
    } catch (error) {
      console.error("Failed to trim conversation:", error);
      // Return original messages as fallback
      return messages;
    }
  }, [sessionUsage?.maxTokensAllowed]);

  /**
   * Close the current session
   */
  const endSession = useCallback(async () => {
    try {
      await closeSession({ sessionId });
    } catch (error) {
      console.error("Failed to close session:", error);
      throw error;
    }
  }, [sessionId, closeSession]);

  // Computed values
  const tokenUsage = useMemo(() => {
    if (!sessionUsage) return null;

    // Create a ConversationTokens object for status calculation
    const conversationTokens: ConversationTokens = {
      sessionId: sessionUsage.sessionId,
      totalTokens: sessionUsage.totalTokens,
      totalInputTokens: sessionUsage.totalInputTokens,
      totalOutputTokens: sessionUsage.totalOutputTokens,
      totalCost: sessionUsage.totalCost,
      messageCount: sessionUsage.messageCount,
      maxTokensAllowed: sessionUsage.maxTokensAllowed,
      isNearLimit: sessionUsage.isNearLimit,
      limitStatus: sessionUsage.totalTokens >= sessionUsage.maxTokensAllowed ? 'exceeded' :
                   sessionUsage.totalTokens >= DEFAULT_CONVERSATION_LIMITS.criticalThreshold ? 'critical' :
                   sessionUsage.totalTokens >= DEFAULT_CONVERSATION_LIMITS.warningThreshold ? 'warning' : 'safe'
    };

    const status = getConversationTokenStatus(conversationTokens);

    return {
      totalTokens: sessionUsage.totalTokens,
      inputTokens: sessionUsage.totalInputTokens,
      outputTokens: sessionUsage.totalOutputTokens,
      maxTokens: sessionUsage.maxTokensAllowed,
      remainingTokens: sessionUsage.remainingTokens,
      percentUsed: sessionUsage.percentUsed,
      cost: sessionUsage.totalCost,
      messageCount: sessionUsage.messageCount,
      isNearLimit: sessionUsage.isNearLimit,
      isAtLimit: sessionUsage.isAtLimit,
      canContinue: !sessionUsage.isAtLimit,
      status,
      formattedTokens: formatTokenCount(sessionUsage.totalTokens),
      formattedCost: formatCost(sessionUsage.totalCost),
    };
  }, [sessionUsage]);

  const limits = useMemo(() => {
    if (!canAcceptTokens) return null;

    return {
      canAcceptMore: canAcceptTokens.canAccept,
      currentTokens: canAcceptTokens.currentTokens || 0,
      maxTokens: canAcceptTokens.maxTokens || DEFAULT_CONVERSATION_LIMITS.maxTokensPerSession,
      remainingTokens: canAcceptTokens.remainingTokens || 0,
      reason: canAcceptTokens.reason,
    };
  }, [canAcceptTokens]);

  return {
    // Token usage information
    tokenUsage,
    limits,
    
    // Actions
    initializeSession,
    countTokens,
    trackTokenUsage,
    checkTokenLimit,
    trimConversationToLimit,
    endSession,
    
    // Loading states
    isLoading: sessionUsage === undefined,
    
    // Utilities
    hasAnthropicClient: !!anthropicClient,
  };
}

/**
 * Hook for getting overall token usage statistics
 */
export function useTokenStats(userId?: string) {
  const stats = useQuery(api.tokenActions.getTokenUsageStats, { userId });
  const activeSessions = useQuery(api.tokenActions.getUserActiveSessions, { userId });

  return {
    stats,
    activeSessions: activeSessions || [],
    isLoading: stats === undefined,
  };
}

/**
 * Hook for token estimation before making API calls
 */
export function useTokenEstimation() {
  const estimateTokens = useCallback(async (
    input: string | ChatMessage[]
  ) => {
    try {
      if (typeof input === 'string') {
        const messages: Anthropic.MessageParam[] = [{ role: 'user', content: input }];
        const result = estimateTokenCount(messages);
        return result.inputTokens;
      }
      
      const messages: Anthropic.MessageParam[] = input
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }));
        
      const result = estimateTokenCount(messages);
      return result.inputTokens;
    } catch (error) {
      console.error("Failed to estimate tokens:", error);
      // Fallback estimation
      const text = typeof input === 'string' ? input : input.map(m => m.content).join(' ');
      return Math.ceil(text.length / 4);
    }
  }, []);

  const estimateCost = useCallback((
    inputTokens: number,
    outputTokens: number
  ) => {
    return calculateCost(inputTokens, outputTokens);
  }, []);

  return {
    estimateTokens,
    estimateCost,
  };
}
