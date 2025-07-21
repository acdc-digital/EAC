import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to get chat messages for a session
export const getChatMessages = query({
  args: {
    sessionId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.sessionId) {
      const messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_session", (q) => 
          q.eq("sessionId", args.sessionId)
        )
        .order("asc")
        .take(args.limit ?? 50);
      return messages;
    } else {
      const messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_created_at", (q) => q)
        .order("asc")
        .take(args.limit ?? 50);
      return messages;
    }
  },
});

// Mutation to store a chat message
export const storeChatMessage = mutation({
  args: {
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("chatMessages", {
      role: args.role,
      content: args.content,
      sessionId: args.sessionId,
      createdAt: Date.now(),
    });
    
    return await ctx.db.get(messageId);
  },
});

// Mutation to clear chat history for a session
export const clearChatHistory = mutation({
  args: {
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let messages;
    
    if (args.sessionId) {
      messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_session", (q) => 
          q.eq("sessionId", args.sessionId)
        )
        .collect();
    } else {
      messages = await ctx.db.query("chatMessages").collect();
    }
    
    // Delete all messages
    await Promise.all(
      messages.map(message => ctx.db.delete(message._id))
    );

    return { deleted: messages.length };
  },
});
