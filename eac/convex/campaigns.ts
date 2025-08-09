import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserId } from "./auth";

// Create a new campaign
export const createCampaign = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.string(),
    endDate: v.string(),
    totalPosts: v.number(),
    platforms: v.array(v.string()),
    template: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    const campaignId = await ctx.db.insert("campaigns", {
      ...args,
      status: "planning",
      processedPosts: 0,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(campaignId);
  },
});

// Get campaign by ID
export const getCampaign = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all campaigns for a user
export const getUserCampaigns = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    
    return await ctx.db
      .query("campaigns")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Update campaign progress
export const updateCampaignProgress = mutation({
  args: {
    campaignId: v.id("campaigns"),
    processedPosts: v.number(),
    status: v.optional(v.union(v.literal("planning"), v.literal("processing"), v.literal("active"), v.literal("completed"), v.literal("paused"))),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.campaignId, {
      processedPosts: args.processedPosts,
      status: args.status,
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(args.campaignId);
  },
});

// Create batch of posts for campaign
export const createPostsBatch = mutation({
  args: {
    posts: v.array(v.object({
      fileName: v.string(),
      fileType: v.union(v.literal('reddit'), v.literal('twitter'), v.literal('linkedin'), v.literal('facebook'), v.literal('instagram')),
      content: v.string(),
      title: v.optional(v.string()),
      platformData: v.optional(v.string()),
      metadata: v.optional(v.string()),
      scheduledFor: v.optional(v.number()),
    })),
    campaignId: v.string(),
    batchId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    // Create all posts in the batch
    const postIds = await Promise.all(
      args.posts.map(post => 
        ctx.db.insert("agentPosts", {
          ...post,
          campaignId: args.campaignId,
          batchId: args.batchId || `batch_${Date.now()}`,
          status: 'scheduled',
          userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      )
    );
    
    return postIds;
  },
});

// Get posts by campaign
export const getCampaignPosts = query({
  args: { campaignId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agentPosts")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();
  },
});
