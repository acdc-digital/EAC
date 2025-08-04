"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TokenUsageDisplay, TokenUsageIndicator } from '@/components/ui/token-usage-display';
import { useTokenEstimation, useTokenStats } from '@/lib/hooks/useTokenManagement';
import { useState } from 'react';

export default function TokenManagementDemo() {
  const [sessionId] = useState(() => `demo-session-${Date.now()}`);
  const [estimatedTokens, setEstimatedTokens] = useState<number | null>(null);
  const { stats, activeSessions, isLoading } = useTokenStats();
  const { estimateTokens, estimateCost } = useTokenEstimation();

  const handleEstimateTokens = async () => {
    const sampleConversation = [
      { role: 'user' as const, content: 'Hello, can you help me with a complex programming task?' },
      { role: 'assistant' as const, content: 'Of course! I\'d be happy to help you with your programming task. What specific challenge are you working on?' },
      { role: 'user' as const, content: 'I need to implement a token tracking system for my chat application using TypeScript, Convex, and Anthropic\'s Claude API.' },
    ];

    const tokens = await estimateTokens(sampleConversation);
    setEstimatedTokens(tokens);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Token Management System</h1>
        <p className="text-muted-foreground">
          Comprehensive token tracking and conversation limit management for Claude API
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Usage Display */}
        <Card>
          <CardHeader>
            <CardTitle>Current Session Token Usage</CardTitle>
            <CardDescription>
              Live token tracking for session: {sessionId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TokenUsageDisplay sessionId={sessionId} />
          </CardContent>
        </Card>

        {/* Compact Indicator */}
        <Card>
          <CardHeader>
            <CardTitle>Compact Token Indicator</CardTitle>
            <CardDescription>
              Minimal display for headers and status bars
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Chat Header</span>
              <TokenUsageIndicator sessionId={sessionId} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Status Bar</span>
              <TokenUsageIndicator sessionId={sessionId} />
            </div>
          </CardContent>
        </Card>

        {/* Token Estimation */}
        <Card>
          <CardHeader>
            <CardTitle>Token Estimation</CardTitle>
            <CardDescription>
              Estimate tokens before making API calls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleEstimateTokens} variant="outline">
              Estimate Sample Conversation
            </Button>
            {estimatedTokens !== null && (
              <div className="p-3 border rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Tokens:</span>
                  <span className="font-medium">{estimatedTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Cost:</span>
                  <span className="font-medium">{estimateCost(estimatedTokens, 0)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overall Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>
              Overall token usage across all sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Loading statistics...
              </div>
            ) : stats ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Sessions</p>
                    <p className="font-medium">{stats.totalSessions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Active Sessions</p>
                    <p className="font-medium">{stats.activeSessions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Tokens</p>
                    <p className="font-medium">{stats.totalTokensUsed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Cost</p>
                    <p className="font-medium">${stats.totalCost.toFixed(4)}</p>
                  </div>
                </div>
                {stats.averageTokensPerSession > 0 && (
                  <div className="pt-3 border-t space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Avg Tokens/Session:</span>
                      <span>{stats.averageTokensPerSession.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Avg Cost/Session:</span>
                      <span>${stats.averageCostPerSession.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Avg Messages/Session:</span>
                      <span>{stats.averageMessagesPerSession}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No usage data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Currently active chat sessions with token usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div 
                  key={session.sessionId} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {session.title || `Session ${session.sessionId.slice(-8)}`}
                    </p>
                    {session.preview && (
                      <p className="text-xs text-muted-foreground">
                        {session.preview.slice(0, 60)}...
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">
                      {session.totalTokens.toLocaleString()} tokens ({session.percentUsed}%)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.messageCount} messages • ${session.totalCost.toFixed(4)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
          <CardDescription>
            How to use the token management system in your chat application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Initialize Session</h4>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`const { initializeSession, tokenUsage, trackTokenUsage } = useTokenManagement(sessionId, userId);

// Initialize session with custom limits
await initializeSession({
  maxTokensAllowed: 150000, // 150K tokens
  title: "Project Planning Chat",
  preview: "Discussion about project requirements..."
});`}
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">2. Track Token Usage</h4>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`// After receiving API response
await trackTokenUsage({
  inputTokens: response.usage.input_tokens,
  outputTokens: response.usage.output_tokens
});`}
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">3. Display Token Status</h4>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`// Full display
<TokenUsageDisplay sessionId={sessionId} userId={userId} />

// Compact indicator
<TokenUsageIndicator sessionId={sessionId} userId={userId} />`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
