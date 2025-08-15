import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new extension request
export const createExtensionRequest = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    requestType: v.optional(v.union(
      v.literal("new_extension"),
      v.literal("feature_enhancement"),
      v.literal("platform_integration"),
      v.literal("agent_improvement"),
      v.literal("other")
    )),
    category: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Default to "new_extension" if no request type specified
    const requestType = args.requestType || "new_extension";
    
    // Auto-determine priority based on request type
    let priority: "low" | "medium" | "high" | "urgent" = "medium";
    if (requestType === "platform_integration") {
      priority = "high";
    } else if (requestType === "new_extension") {
      priority = "medium";
    } else {
      priority = "low";
    }
    
    const requestId = await ctx.db.insert("extensionRequests", {
      title: args.title,
      description: args.description,
      requestType,
      category: args.category,
      userId: args.userId,
      priority,
      status: "submitted",
      upvotes: 0,
      downvotes: 0,
      createdAt: now,
      updatedAt: now,
    });
    
    return await ctx.db.get(requestId);
  },
});

// Get all extension requests (for admin view)
export const getAllExtensionRequests = query({
  args: {
    status: v.optional(v.union(
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("in_development"),
      v.literal("completed"),
      v.literal("rejected")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      const requests = await ctx.db
        .query("extensionRequests")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(args.limit || 50);
      return requests;
    } else {
      const requests = await ctx.db
        .query("extensionRequests")
        .withIndex("by_upvotes")
        .order("desc")
        .take(args.limit || 50);
      return requests;
    }
  },
});

// Get extension requests by user
export const getUserExtensionRequests = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("extensionRequests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    
    return requests;
  },
});

// Upvote an extension request
export const upvoteExtensionRequest = mutation({
  args: {
    requestId: v.id("extensionRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Extension request not found");
    
    await ctx.db.patch(args.requestId, {
      upvotes: request.upvotes + 1,
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(args.requestId);
  },
});

// Downvote an extension request
export const downvoteExtensionRequest = mutation({
  args: {
    requestId: v.id("extensionRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Extension request not found");
    
    await ctx.db.patch(args.requestId, {
      downvotes: request.downvotes + 1,
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(args.requestId);
  },
});

// Update extension request status (admin only)
export const updateExtensionRequestStatus = mutation({
  args: {
    requestId: v.id("extensionRequests"),
    status: v.union(
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("in_development"),
      v.literal("completed"),
      v.literal("rejected")
    ),
    adminNotes: v.optional(v.string()),
    publicNotes: v.optional(v.string()),
    estimatedCompletion: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Extension request not found");
    
    const updateData: any = {
      status: args.status,
      updatedAt: Date.now(),
    };
    
    if (args.adminNotes) updateData.adminNotes = args.adminNotes;
    if (args.publicNotes) updateData.publicNotes = args.publicNotes;
    if (args.estimatedCompletion) updateData.estimatedCompletion = args.estimatedCompletion;
    if (args.status === "completed") updateData.actualCompletion = Date.now();
    
    await ctx.db.patch(args.requestId, updateData);
    
    return await ctx.db.get(args.requestId);
  },
});

// Get popular extension requests (by upvotes)
export const getPopularExtensionRequests = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("extensionRequests")
      .withIndex("by_upvotes")
      .order("desc")
      .take(args.limit || 20);
    
    return requests;
  },
});
