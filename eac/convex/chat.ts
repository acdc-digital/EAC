import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./utils";

// Query to get chat messages for a session (user-specific)
export const getChatMessages = query({
  args: {
    sessionId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const user = await getCurrentUserOrThrow(ctx);
    
    if (args.sessionId) {
      const messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_user_session", (q) =>
          q.eq("userId", user._id).eq("sessionId", args.sessionId)
        )
        .order("asc")
        .take(args.limit ?? 50);
      return messages;
    } else {
      // Get all messages for this user if no session specified
      const messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("asc")
        .take(args.limit ?? 50);
      return messages;
    }
  },
});

// Mutation to store a chat message (user-specific)
export const storeChatMessage = mutation({
  args: {
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const user = await getCurrentUserOrThrow(ctx);
    
    const messageId = await ctx.db.insert("chatMessages", {
      role: args.role,
      content: args.content,
      sessionId: args.sessionId,
      userId: user._id,
      createdAt: Date.now(),
    });
    
    return await ctx.db.get(messageId);
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
