// Token counting and management utilities for Claude API
// Implements Anthropic's token counting API and conversation limits

import Anthropic from '@anthropic-ai/sdk';

// Claude 3.7 Sonnet specifications
export const CLAUDE_3_7_SONNET_SPECS = {
  model: "claude-3-7-sonnet-20250219",
  contextWindow: 200000, // 200K tokens
  maxOutput: 64000, // 64K tokens (128K with beta header)
  pricing: {
    inputPerMToken: 3.00, // $3 per million input tokens
    outputPerMToken: 15.00, // $15 per million output tokens
  }
} as const;

// Default conversation limits
export const DEFAULT_CONVERSATION_LIMITS = {
  maxTokensPerSession: 180000, // 90% of context window for safety
  warningThreshold: 150000, // 75% of context window
  criticalThreshold: 170000, // 85% of context window
} as const;

export interface TokenCount {
  inputTokens: number;
  totalTokens?: number; // For compatibility
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface ConversationTokens {
  sessionId: string;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  messageCount: number;
  maxTokensAllowed: number;
  isNearLimit: boolean;
  limitStatus: 'safe' | 'warning' | 'critical' | 'exceeded';
}

/**
 * Count tokens in messages using Anthropic's token counting API
 */
export async function countMessageTokens(
  messages: Anthropic.MessageParam[],
  systemPrompt?: string,
  anthropic?: Anthropic
): Promise<TokenCount> {
  if (!anthropic) {
    throw new Error('Anthropic client not provided for token counting');
  }

  try {
    const response = await anthropic.messages.countTokens({
      model: CLAUDE_3_7_SONNET_SPECS.model,
      messages,
      ...(systemPrompt && { system: systemPrompt }),
      thinking: {
        type: "enabled",
        budget_tokens: 2048
      }
    });

    return {
      inputTokens: response.input_tokens,
      totalTokens: response.input_tokens
    };
  } catch (error) {
    console.error('Error counting tokens:', error);
    // Fallback to estimation if API fails
    return estimateTokenCount(messages, systemPrompt);
  }
}

/**
 * Estimate token count using rough approximation (fallback method)
 * Rough estimate: ~4 characters per token for English text
 */
export function estimateTokenCount(
  messages: Anthropic.MessageParam[],
  systemPrompt?: string
): TokenCount {
  let totalChars = 0;

  // Count system prompt
  if (systemPrompt) {
    totalChars += systemPrompt.length;
  }

  // Count messages
  for (const message of messages) {
    if (typeof message.content === 'string') {
      totalChars += message.content.length;
    } else if (Array.isArray(message.content)) {
      for (const block of message.content) {
        if (block.type === 'text') {
          totalChars += block.text.length;
        }
        // For other types (images, etc.), add estimated overhead
        else {
          totalChars += 100; // Rough estimate for non-text content
        }
      }
    }
  }

  // Rough estimation: 4 characters per token
  const estimatedTokens = Math.ceil(totalChars / 4);

  return {
    inputTokens: estimatedTokens,
    totalTokens: estimatedTokens
  };
}

/**
 * Calculate cost based on token usage
 */
export function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1000000) * CLAUDE_3_7_SONNET_SPECS.pricing.inputPerMToken;
  const outputCost = (outputTokens / 1000000) * CLAUDE_3_7_SONNET_SPECS.pricing.outputPerMToken;
  return inputCost + outputCost;
}

/**
 * Calculate token usage including costs
 */
export function calculateTokenUsage(
  inputTokens: number,
  outputTokens: number
): TokenUsage {
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    estimatedCost: calculateCost(inputTokens, outputTokens)
  };
}

/**
 * Check if conversation is approaching token limits
 */
export function checkConversationLimits(
  totalTokens: number,
  maxTokensAllowed: number = DEFAULT_CONVERSATION_LIMITS.maxTokensPerSession
): ConversationTokens['limitStatus'] {
  if (totalTokens >= maxTokensAllowed) {
    return 'exceeded';
  } else if (totalTokens >= DEFAULT_CONVERSATION_LIMITS.criticalThreshold) {
    return 'critical';
  } else if (totalTokens >= DEFAULT_CONVERSATION_LIMITS.warningThreshold) {
    return 'warning';
  }
  return 'safe';
}

/**
 * Format token count for display
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${(cost * 1000).toFixed(2)}m`; // Show in millidollars
  }
  return `$${cost.toFixed(4)}`;
}

/**
 * Get conversation token status with warnings
 */
export function getConversationTokenStatus(
  sessionTokens: ConversationTokens
): {
  status: ConversationTokens['limitStatus'];
  message: string;
  remainingTokens: number;
  canContinue: boolean;
} {
  const remainingTokens = sessionTokens.maxTokensAllowed - sessionTokens.totalTokens;
  const status = sessionTokens.limitStatus;
  
  let message = '';
  let canContinue = true;

  switch (status) {
    case 'exceeded':
      message = `Token limit exceeded (${formatTokenCount(sessionTokens.totalTokens)}/${formatTokenCount(sessionTokens.maxTokensAllowed)}). Please start a new conversation.`;
      canContinue = false;
      break;
    case 'critical':
      message = `Approaching token limit (${formatTokenCount(sessionTokens.totalTokens)}/${formatTokenCount(sessionTokens.maxTokensAllowed)}). Consider starting a new conversation soon.`;
      break;
    case 'warning':
      message = `Token usage: ${formatTokenCount(sessionTokens.totalTokens)}/${formatTokenCount(sessionTokens.maxTokensAllowed)} - conversation is getting long.`;
      break;
    case 'safe':
      message = `Token usage: ${formatTokenCount(sessionTokens.totalTokens)}/${formatTokenCount(sessionTokens.maxTokensAllowed)}`;
      break;
  }

  return {
    status,
    message,
    remainingTokens,
    canContinue
  };
}

/**
 * Truncate conversation history when approaching limits
 * Keeps the most recent messages and system messages
 */
export function truncateConversationHistory(
  messages: Anthropic.MessageParam[],
  maxTokens: number,
  estimateOnly: boolean = true
): Anthropic.MessageParam[] {
  if (messages.length <= 2) return messages; // Keep at least 2 messages

  let totalTokens = 0;
  const result: Anthropic.MessageParam[] = [];
  
  // Process messages in reverse order (newest first)
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    
    // Estimate tokens for this message
    const messageTokens = estimateOnly 
      ? estimateTokenCount([message]).inputTokens
      : 0; // Would need actual count here
    
    // Always keep the last user message
    if (i === messages.length - 1) {
      result.unshift(message);
      totalTokens += messageTokens;
    } else if (totalTokens + messageTokens <= maxTokens) {
      result.unshift(message);
      totalTokens += messageTokens;
    } else {
      // Stop adding messages if we exceed limit
      break;
    }
  }

  return result;
}
