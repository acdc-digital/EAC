import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Example query function
export const getMessages = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_created_at", (q) => q)
      .order("desc")
      .take(args.limit ?? 50);
    
    return messages;
  },
});

// Example mutation function
export const sendMessage = mutation({
  args: {
    text: v.string(),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      text: args.text,
      author: args.author,
      createdAt: Date.now(),
    });
    
    return await ctx.db.get(messageId);
  },
});
