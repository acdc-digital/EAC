# Token Management System

A comprehensive token tracking and conversation limit management system for AI chat applications using Claude API.

## Overview

This system provides:
- **Token Counting**: Accurate token counting using Anthropic's API with fallback estimation
- **Session Management**: Track token usage across chat sessions with configurable limits
- **Cost Calculation**: Real-time cost estimation based on Claude pricing
- **Conversation Limits**: Automatic conversation trimming when approaching token limits
- **UI Components**: Ready-to-use React components for displaying token usage

## Features

### 🔢 Token Tracking
- Real-time token counting for input and output
- Integration with Anthropic's official token counting API
- Fallback estimation when API is unavailable
- Support for conversation context trimming

### 💰 Cost Management
- Live cost calculation based on current Claude pricing ($3/MTok input, $15/MTok output)
- Session-level cost tracking
- Aggregated usage statistics

### 🎯 Session Limits
- Configurable token limits per conversation (default: 180K tokens)
- Warning thresholds at 75% and 85% usage
- Automatic conversation truncation to stay within limits
- Session management with active/inactive states

### 🎨 UI Components
- `TokenUsageDisplay`: Comprehensive token usage dashboard
- `TokenUsageIndicator`: Compact indicator for headers/status bars
- Progress bars with status-based coloring
- Warning alerts when approaching limits

## Quick Start

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk convex
```

### 2. Set Environment Variables

```env
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. Initialize in Your Chat Component

```typescript
import { useTokenManagement } from '@/lib/hooks/useTokenManagement';
import { TokenUsageDisplay } from '@/components/ui/token-usage-display';

function ChatInterface() {
  const sessionId = 'unique-session-id';
  const { initializeSession, trackTokenUsage, tokenUsage } = useTokenManagement(sessionId);

  // Initialize session
  useEffect(() => {
    initializeSession({
      maxTokensAllowed: 150000, // 150K tokens
      title: "Chat Session",
    });
  }, []);

  // Track usage after API calls
  const handleApiResponse = async (response) => {
    await trackTokenUsage({
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });
  };

  return (
    <div>
      <TokenUsageDisplay sessionId={sessionId} />
      {/* Your chat interface */}
    </div>
  );
}
```

## API Reference

### Hooks

#### `useTokenManagement(sessionId, userId?)`

Main hook for token management functionality.

**Returns:**
- `tokenUsage`: Current session token usage and limits
- `initializeSession(options?)`: Initialize or update session
- `trackTokenUsage(options)`: Track token usage from API responses
- `countTokens(input)`: Count tokens for messages
- `checkTokenLimit(estimatedTokens)`: Check if session can accept more tokens
- `trimConversationToLimit(messages, maxTokens?)`: Trim conversation to fit limits
- `endSession()`: Close the current session

#### `useTokenStats(userId?)`

Get overall usage statistics.

**Returns:**
- `stats`: Aggregated usage statistics
- `activeSessions`: List of active sessions
- `isLoading`: Loading state

#### `useTokenEstimation()`

Token estimation utilities.

**Returns:**
- `estimateTokens(input)`: Estimate tokens for text or conversation
- `estimateCost(inputTokens, outputTokens)`: Calculate cost estimation

### Components

#### `<TokenUsageDisplay>`

Comprehensive token usage dashboard.

**Props:**
- `sessionId: string` - Session identifier
- `userId?: string` - User identifier
- `className?: string` - Additional CSS classes
- `compact?: boolean` - Use compact layout
- `showActions?: boolean` - Show action buttons

#### `<TokenUsageIndicator>`

Compact token usage indicator for headers.

**Props:**
- Same as `TokenUsageDisplay` but with `compact=true` and `showActions=false`

### Utility Functions

Located in `lib/tokenUtils.ts`:

- `countMessageTokens()`: Count tokens using Anthropic API
- `calculateCost()`: Calculate cost based on token usage
- `checkConversationLimits()`: Check if usage is within limits
- `truncateConversationHistory()`: Trim conversation to fit limits
- `formatTokenCount()` / `formatCost()`: Format numbers for display

## Configuration

### Default Limits

```typescript
export const DEFAULT_CONVERSATION_LIMITS = {
  maxTokensPerSession: 180000, // 90% of 200K context window
  warningThreshold: 150000,    // 75% - show warning
  criticalThreshold: 170000,   // 85% - show critical warning
} as const;
```

### Claude Model Specifications

```typescript
export const CLAUDE_3_7_SONNET_SPECS = {
  model: 'claude-3-7-sonnet-20250219',
  contextWindow: 200000,        // 200K tokens
  maxOutput: 64000,            // 64K tokens
  inputCostPerMToken: 3,       // $3 per million input tokens
  outputCostPerMToken: 15,     // $15 per million output tokens
} as const;
```

## Database Schema

The system uses Convex with these tables:

### `chatSessions`
- Session metadata and token tracking
- Total usage, costs, and limits
- Active/inactive status

### `chatMessages`
- Individual message token counts
- Input/output token tracking per message
- Cost attribution per API call

## Demo

Visit `/token-demo` to see the token management system in action with:
- Live token usage displays
- Token estimation examples
- Usage statistics
- Integration code samples

## Best Practices

1. **Initialize Early**: Call `initializeSession()` when starting a new chat
2. **Track Consistently**: Always call `trackTokenUsage()` after API responses
3. **Check Limits**: Use `checkTokenLimit()` before making expensive API calls
4. **Handle Limits**: Implement conversation trimming when approaching limits
5. **Monitor Costs**: Display token usage to users for transparency

## Pricing (as of model date)

- **Input tokens**: $3.00 per million tokens
- **Output tokens**: $15.00 per million tokens
- **Context window**: 200,000 tokens
- **Max output**: 64,000 tokens

## License

Part of the EAC (Enhanced Agent Chat) project.
