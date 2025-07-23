// Reddit functions - Essential functions for social connections
// /Users/matthewsimon/Projects/eac/eac/convex/reddit.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getSocialConnections = query({
  args: {
    userId: v.string(),
    platform: v.optional(v.union(
      v.literal("facebook"),
      v.literal("instagram"),
      v.literal("twitter"),
      v.literal("reddit")
    )),
  },
  handler: async (ctx, args) => {
    if (args.platform) {
      // Use the compound index when platform is specified
      return await ctx.db
        .query("socialConnections")
        .withIndex("by_user", (q) =>
          q.eq("userId", args.userId).eq("platform", args.platform!)
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    } else {
      // Use the by_user index when no platform is specified
      return await ctx.db
        .query("socialConnections")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }
  },
});

export const getConnectionById = query({
  args: {
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.connectionId);
  },
});

export const createSocialConnection = mutation({
  args: {
    userId: v.string(),
    platform: v.union(
      v.literal("facebook"),
      v.literal("instagram"),
      v.literal("twitter"),
      v.literal("reddit")
    ),
    username: v.string(),
    clientId: v.optional(v.string()),
    clientSecret: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    apiKey: v.optional(v.string()),
    apiSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if connection already exists
    const existing = await ctx.db
      .query("socialConnections")
      .withIndex("by_user", (q) =>
        q.eq("userId", args.userId).eq("platform", args.platform)
      )
      .first();

    if (existing) {
      // Update existing connection
      const updateData: any = {
        username: args.username,
        isActive: true,
        updatedAt: now,
      };

      if (args.platform === 'twitter') {
        // Map to Twitter-specific fields
        updateData.twitterClientId = args.apiKey || args.clientId;
        updateData.twitterClientSecret = args.apiSecret || args.clientSecret;
        updateData.apiTier = 'free'; // Default to free tier
      } else {
        // Use generic fields for other platforms
        updateData.clientId = args.clientId;
        updateData.clientSecret = args.clientSecret;
        updateData.userAgent = args.userAgent;
        updateData.apiKey = args.apiKey;
        updateData.apiSecret = args.apiSecret;
      }

      await ctx.db.patch(existing._id, updateData);
      return existing._id;
    } else {
      // Create new connection with platform-specific fields
      const connectionData: any = {
        userId: args.userId,
        platform: args.platform,
        username: args.username,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      if (args.platform === 'twitter') {
        // Map to Twitter-specific fields
        connectionData.twitterClientId = args.apiKey || args.clientId;
        connectionData.twitterClientSecret = args.apiSecret || args.clientSecret;
        connectionData.apiTier = 'free'; // Default to free tier
      } else {
        // Use generic fields for other platforms
        connectionData.clientId = args.clientId;
        connectionData.clientSecret = args.clientSecret;
        connectionData.userAgent = args.userAgent;
        connectionData.apiKey = args.apiKey;
        connectionData.apiSecret = args.apiSecret;
      }

      return await ctx.db.insert("socialConnections", connectionData);
    }
  },
});

// Add other essential functions that might be needed
export const updateConnectionTokens = mutation({
  args: {
    connectionId: v.id("socialConnections"),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.connectionId, {
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      lastSync: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const deleteSocialConnection = mutation({
  args: {
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.connectionId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

export const getScheduledRedditPosts = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    return await ctx.db
      .query("redditPosts")
      .withIndex("by_status", (q) =>
        q.eq("status", "scheduled").lte("publishAt", now)
      )
      .collect();
  },
});

export const updatePostStatus = mutation({
  args: {
    postId: v.id("redditPosts"),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("publishing"),
      v.literal("published"),
      v.literal("failed")
    ),
    publishedAt: v.optional(v.number()),
    publishedUrl: v.optional(v.string()),
    redditId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { postId, ...updates } = args;
    
    await ctx.db.patch(postId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const getRedditPostWithConnection = query({
  args: {
    postId: v.id("redditPosts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;

    const connection = await ctx.db.get(post.connectionId);
    return { ...post, connection };
  },
});

export const incrementRetryCount = mutation({
  args: {
    postId: v.id("redditPosts"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return;
    
    await ctx.db.patch(args.postId, {
      retryCount: (post.retryCount || 0) + 1,
      lastRetryAt: Date.now(),
      error: args.error,
      status: "failed",
      updatedAt: Date.now(),
    });
  },
});

export const updatePostAnalytics = mutation({
  args: {
    postId: v.id("redditPosts"),
    score: v.number(),
    upvotes: v.optional(v.number()),
    downvotes: v.optional(v.number()),
    upvoteRatio: v.number(),
    totalAwardsReceived: v.number(),
    numComments: v.number(),
    numCrossposts: v.number(),
    viewCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { postId, ...analyticsData } = args;
    
    await ctx.db.patch(postId, {
      ...analyticsData,
      // Calculate upvotes/downvotes if not provided
      upvotes: args.upvotes || Math.round(args.score * args.upvoteRatio + args.score),
      downvotes: args.downvotes || Math.round(args.score * (1 - args.upvoteRatio)),
      lastAnalyticsUpdate: Date.now(),
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(postId);
  },
});
