import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserIdOptional } from "./auth";
import { getCurrentUserOrThrow } from "./utils";

// Query to get chat messages for a session (user-specific)
export const getChatMessages = query({
  args: {
    sessionId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get authenticated user - return empty if not authenticated
    const userId = await getCurrentUserIdOptional(ctx);
    if (!userId) {
      return [];
    }
    
    if (args.sessionId) {
      const messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_user_session", (q) =>
          q.eq("userId", userId).eq("sessionId", args.sessionId)
        )
        .order("desc")
        .take(args.limit ?? 500);
      return messages.reverse(); // Reverse to get chronological order
    } else {
      // Get all messages for this user if no session specified
      const messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .take(args.limit ?? 500);
      return messages.reverse(); // Reverse to get chronological order
    }
  },
});

// Mutation to store a chat message (user-specific)
export const storeChatMessage = mutation({
  args: {
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system"), v.literal("terminal"), v.literal("thinking")),
    content: v.string(),
    sessionId: v.optional(v.string()),
    operation: v.optional(v.object({
      type: v.union(
        v.literal("file_created"), 
        v.literal("project_created"), 
        v.literal("tool_executed"), 
        v.literal("error")
      ),
      details: v.optional(v.any()),
    })),
  },
  handler: async (ctx, args) => {
    // Get authenticated user - only store messages if authenticated
    const userId = await getCurrentUserIdOptional(ctx);
    if (!userId) {
      console.log("⚠️ Attempted to store chat message while unauthenticated - skipping");
      return null; // Return null instead of throwing
    }
    
    const messageId = await ctx.db.insert("chatMessages", {
      role: args.role,
      content: args.content,
      sessionId: args.sessionId,
      userId: userId,
      createdAt: Date.now(),
      ...(args.operation && { operation: args.operation }),
    });
    
    return messageId;
  },
});

// Mutation to clear chat history for a session (user-specific)
export const clearChatHistory = mutation({
  args: {
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const user = await getCurrentUserOrThrow(ctx);
    let messages;
    
    if (args.sessionId) {
      messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_user_session", (q) =>
          q.eq("userId", user._id).eq("sessionId", args.sessionId)
        )
        .collect();
    } else {
      // Clear all messages for this user
      messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
    }
    
    // Delete all messages
    await Promise.all(
      messages.map(message => ctx.db.delete(message._id))
    );

    return { deleted: messages.length };
  },
});

// Mutation to update a chat message (for streaming updates)
export const updateChatMessage = mutation({
  args: {
    messageId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Update the message content
    await ctx.db.patch(args.messageId as any, {
      content: args.content,
    });
    
    return { success: true };
  },
});

// Query to get all unique sessions for a user
export const getUserSessions = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user - return empty if not authenticated
    const userId = await getCurrentUserIdOptional(ctx);
    if (!userId) {
      return [];
    }
    
    // Get all messages for this user
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    // Extract unique sessions with metadata
    const sessionMap = new Map<string, {
      sessionId: string;
      lastActivity: number;
      messageCount: number;
      preview: string;
    }>();
    
    messages.forEach(message => {
      if (message.sessionId) {
        const existing = sessionMap.get(message.sessionId);
        if (!existing) {
          sessionMap.set(message.sessionId, {
            sessionId: message.sessionId,
            lastActivity: message.createdAt,
            messageCount: 1,
            preview: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
          });
        } else {
          existing.messageCount++;
          if (message.createdAt > existing.lastActivity) {
            existing.lastActivity = message.createdAt;
            existing.preview = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
          }
        }
      }
    });
    
    // Convert to array and sort by last activity
    return Array.from(sessionMap.values())
      .sort((a, b) => b.lastActivity - a.lastActivity);
  },
});
