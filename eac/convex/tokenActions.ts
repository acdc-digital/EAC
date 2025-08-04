import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create or update a chat session with token tracking
 */
export const upsertChatSession = mutation({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()),
    maxTokensAllowed: v.optional(v.number()),
    title: v.optional(v.string()),
    preview: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingSession = await ctx.db
      .query("chatSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    const now = Date.now();

    if (existingSession) {
      // Update existing session
      await ctx.db.patch(existingSession._id, {
        lastActivity: now,
        isActive: true,
        ...(args.title && { title: args.title }),
        ...(args.preview && { preview: args.preview }),
      });
      return existingSession._id;
    } else {
      // Create new session
      const sessionId = await ctx.db.insert("chatSessions", {
        sessionId: args.sessionId,
        userId: args.userId,
        totalTokens: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCost: 0,
        messageCount: 0,
        isActive: true,
        maxTokensAllowed: args.maxTokensAllowed || 180000, // Default 180K tokens
        createdAt: now,
        lastActivity: now,
        title: args.title,
        preview: args.preview,
      });
      return sessionId;
    }
  },
});

/**
 * Update token usage for a chat session
 */
export const updateSessionTokens = mutation({
  args: {
    sessionId: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    estimatedCost: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("chatSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error(`Session ${args.sessionId} not found`);
    }

    const totalTokens = args.inputTokens + args.outputTokens;

    await ctx.db.patch(session._id, {
      totalTokens: session.totalTokens + totalTokens,
      totalInputTokens: session.totalInputTokens + args.inputTokens,
      totalOutputTokens: session.totalOutputTokens + args.outputTokens,
      totalCost: session.totalCost + args.estimatedCost,
      messageCount: session.messageCount + 1,
      lastActivity: Date.now(),
    });

    return {
      newTotalTokens: session.totalTokens + totalTokens,
      maxTokensAllowed: session.maxTokensAllowed,
      remainingTokens: session.maxTokensAllowed - (session.totalTokens + totalTokens),
      isNearLimit: (session.totalTokens + totalTokens) > (session.maxTokensAllowed * 0.9), // 90% threshold
    };
  },
});

/**
 * Get current session token usage
 */
export const getSessionTokenUsage = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("chatSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      return null;
    }

    return {
      sessionId: session.sessionId,
      totalTokens: session.totalTokens,
      totalInputTokens: session.totalInputTokens,
      totalOutputTokens: session.totalOutputTokens,
      totalCost: session.totalCost,
      messageCount: session.messageCount,
      maxTokensAllowed: session.maxTokensAllowed,
      remainingTokens: session.maxTokensAllowed - session.totalTokens,
      isNearLimit: session.totalTokens > (session.maxTokensAllowed * 0.9),
      isAtLimit: session.totalTokens >= session.maxTokensAllowed,
      percentUsed: Math.round((session.totalTokens / session.maxTokensAllowed) * 100),
      isActive: session.isActive,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
    };
  },
});

/**
 * Check if a session can accept more tokens
 */
export const canSessionAcceptTokens = query({
  args: {
    sessionId: v.string(),
    estimatedTokens: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("chatSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      return { canAccept: true, reason: "New session" };
    }

    const wouldExceedLimit = (session.totalTokens + args.estimatedTokens) > session.maxTokensAllowed;

    return {
      canAccept: !wouldExceedLimit,
      currentTokens: session.totalTokens,
      maxTokens: session.maxTokensAllowed,
      estimatedTokens: args.estimatedTokens,
      remainingTokens: session.maxTokensAllowed - session.totalTokens,
      reason: wouldExceedLimit ? "Would exceed token limit" : "Within limits",
    };
  },
});

/**
 * Get all active sessions for a user
 */
export const getUserActiveSessions = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }

    const sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .order("desc")
      .take(50); // Limit to 50 most recent active sessions

    return sessions.map(session => ({
      sessionId: session.sessionId,
      totalTokens: session.totalTokens,
      maxTokensAllowed: session.maxTokensAllowed,
      remainingTokens: session.maxTokensAllowed - session.totalTokens,
      percentUsed: Math.round((session.totalTokens / session.maxTokensAllowed) * 100),
      messageCount: session.messageCount,
      totalCost: session.totalCost,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      title: session.title,
      preview: session.preview,
    }));
  },
});

/**
 * Close/deactivate a session when it's no longer needed
 */
export const closeSession = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("chatSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        isActive: false,
        lastActivity: Date.now(),
      });
    }
  },
});

/**
 * Get token usage statistics across all sessions
 */
export const getTokenUsageStats = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessions = args.userId 
      ? await ctx.db
          .query("chatSessions")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .collect()
      : await ctx.db.query("chatSessions").collect();

    const stats = sessions.reduce(
      (acc, session) => ({
        totalSessions: acc.totalSessions + 1,
        activeSessions: acc.activeSessions + (session.isActive ? 1 : 0),
        totalTokensUsed: acc.totalTokensUsed + session.totalTokens,
        totalInputTokens: acc.totalInputTokens + session.totalInputTokens,
        totalOutputTokens: acc.totalOutputTokens + session.totalOutputTokens,
        totalCost: acc.totalCost + session.totalCost,
        totalMessages: acc.totalMessages + session.messageCount,
      }),
      {
        totalSessions: 0,
        activeSessions: 0,
        totalTokensUsed: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCost: 0,
        totalMessages: 0,
      }
    );

    return {
      ...stats,
      averageTokensPerSession: stats.totalSessions > 0 ? Math.round(stats.totalTokensUsed / stats.totalSessions) : 0,
      averageCostPerSession: stats.totalSessions > 0 ? stats.totalCost / stats.totalSessions : 0,
      averageMessagesPerSession: stats.totalSessions > 0 ? Math.round(stats.totalMessages / stats.totalSessions) : 0,
    };
  },
});
