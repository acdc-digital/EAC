// X (Twitter) Integration for EAC Dashboard
// convex/x.ts

import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

// X-specific Social Connections Management
export const createXConnection = mutation({
  args: {
    userId: v.string(),
    username: v.string(),
    clientId: v.string(),
    clientSecret: v.string(),
    apiTier: v.optional(v.union(v.literal("free"), v.literal("basic"), v.literal("pro"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if X connection already exists
    const existing = await ctx.db
      .query("socialConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId).eq("platform", "twitter"))
      .first();
    
    if (existing) {
      // Update existing connection
      await ctx.db.patch(existing._id, {
        username: args.username,
        twitterClientId: args.clientId,
        twitterClientSecret: args.clientSecret, // TODO: Encrypt in production
        apiTier: args.apiTier || "free",
        monthlyTweetLimit: args.apiTier === "basic" ? 3000 : 1500, // Basic tier vs Free tier
        tweetsThisMonth: 0,
        isActive: true,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new connection
      return await ctx.db.insert("socialConnections", {
        userId: args.userId,
        platform: "twitter",
        username: args.username,
        twitterClientId: args.clientId,
        twitterClientSecret: args.clientSecret, // TODO: Encrypt in production
        apiTier: args.apiTier || "free",
        monthlyTweetLimit: args.apiTier === "basic" ? 3000 : 1500,
        tweetsThisMonth: 0,
        isActive: true,
        lastSync: undefined,
        tokenExpiry: undefined,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const getXConnections = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("socialConnections")
      .withIndex("by_user", (q) =>
        q.eq("userId", args.userId).eq("platform", "twitter")
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getXConnectionById = query({
  args: {
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.connectionId);
  },
});

// Internal mutation to update X connection tokens after OAuth
export const updateXConnectionTokens = internalMutation({
  args: {
    connectionId: v.id("socialConnections"),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),
    userInfo: v.optional(v.object({
      twitterUserId: v.string(),
      twitterScreenName: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      twitterAccessToken: args.accessToken, // TODO: Encrypt in production
      lastSync: Date.now(),
      updatedAt: Date.now(),
    };

    if (args.refreshToken) {
      updates.twitterRefreshToken = args.refreshToken; // TODO: Encrypt in production
    }

    if (args.tokenExpiry) {
      updates.tokenExpiry = args.tokenExpiry;
    }

    if (args.userInfo) {
      updates.twitterUserId = args.userInfo.twitterUserId;
      updates.twitterScreenName = args.userInfo.twitterScreenName;
    }

    await ctx.db.patch(args.connectionId, updates);
  },
});

export const deleteXConnection = mutation({
  args: {
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args) => {
    // Soft delete by marking as inactive
    await ctx.db.patch(args.connectionId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

// X Posts Management
export const createXPost = mutation({
  args: {
    userId: v.string(),
    connectionId: v.id("socialConnections"),
    text: v.string(),
    mediaIds: v.optional(v.array(v.string())),
    mediaUrls: v.optional(v.array(v.string())),
    mediaTypes: v.optional(v.array(v.union(v.literal("image"), v.literal("video"), v.literal("gif")))),
    replyToId: v.optional(v.string()),
    isThread: v.optional(v.boolean()),
    threadPosition: v.optional(v.number()),
    replySettings: v.optional(v.union(v.literal("everyone"), v.literal("mentionedUsers"), v.literal("followers"))),
    fileName: v.optional(v.string()),
    fileId: v.optional(v.id("files")),
    publishAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const characterCount = args.text.length;
    const isOverLimit = characterCount > 280;
    
    return await ctx.db.insert("xPosts", {
      userId: args.userId,
      connectionId: args.connectionId,
      fileId: args.fileId,
      
      // Content
      text: args.text,
      mediaIds: args.mediaIds,
      mediaUrls: args.mediaUrls,
      mediaTypes: args.mediaTypes,
      
      // Reply/Thread
      replyToId: args.replyToId,
      isThread: args.isThread || false,
      threadPosition: args.threadPosition,
      
      // Settings
      replySettings: args.replySettings || "everyone",
      
      // Status
      status: args.publishAt ? "scheduled" : "draft",
      publishAt: args.publishAt,
      
      // Character tracking
      characterCount,
      isOverLimit,
      
      // Error handling
      retryCount: 0,
      contributesToMonthlyLimit: false, // Will be set to true when published
      
      // File association
      fileName: args.fileName,
      
      // Metadata
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getXPosts = query({
  args: {
    userId: v.string(),
    connectionId: v.optional(v.id("socialConnections")),
    status: v.optional(v.union(v.literal("draft"), v.literal("scheduled"), v.literal("published"), v.literal("failed"))),
  },
  handler: async (ctx, args) => {
    if (args.connectionId) {
      let query = ctx.db
        .query("xPosts")
        .withIndex("by_connection", (q) => q.eq("connectionId", args.connectionId!));
      
      if (args.status) {
        return query.filter((q) => q.eq(q.field("status"), args.status)).collect();
      }
      return query.collect();
    } else {
      let query = ctx.db
        .query("xPosts")
        .withIndex("by_user", (q) => q.eq("userId", args.userId));

      if (args.status) {
        return query.filter((q) => q.eq(q.field("status"), args.status)).collect();
      }
      return query.collect();
    }
  },
});

export const getXPostByFileName = query({
  args: {
    userId: v.string(),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("xPosts")
      .withIndex("by_file_name", (q) => q.eq("fileName", args.fileName))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
  },
});

export const updateXPost = mutation({
  args: {
    postId: v.id("xPosts"),
    text: v.optional(v.string()),
    mediaIds: v.optional(v.array(v.string())),
    mediaUrls: v.optional(v.array(v.string())),
    mediaTypes: v.optional(v.array(v.union(v.literal("image"), v.literal("video"), v.literal("gif")))),
    replySettings: v.optional(v.union(v.literal("everyone"), v.literal("mentionedUsers"), v.literal("followers"))),
    publishAt: v.optional(v.number()),
    status: v.optional(v.union(v.literal("draft"), v.literal("scheduled"), v.literal("published"), v.literal("failed"))),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.text !== undefined) {
      updates.text = args.text;
      updates.characterCount = args.text.length;
      updates.isOverLimit = args.text.length > 280;
    }

    if (args.mediaIds !== undefined) updates.mediaIds = args.mediaIds;
    if (args.mediaUrls !== undefined) updates.mediaUrls = args.mediaUrls;
    if (args.mediaTypes !== undefined) updates.mediaTypes = args.mediaTypes;
    if (args.replySettings !== undefined) updates.replySettings = args.replySettings;
    if (args.publishAt !== undefined) updates.publishAt = args.publishAt;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.postId, updates);
  },
});

export const updateXPostStatus = mutation({
  args: {
    postId: v.id("xPosts"),
    status: v.union(v.literal("draft"), v.literal("scheduled"), v.literal("published"), v.literal("failed")),
    tweetId: v.optional(v.string()),
    tweetUrl: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.tweetId) updates.tweetId = args.tweetId;
    if (args.tweetUrl) updates.tweetUrl = args.tweetUrl;
    if (args.publishedAt) updates.publishedAt = args.publishedAt;
    if (args.error) updates.error = args.error;
    
    // Mark as contributing to monthly limit if published
    if (args.status === "published") {
      updates.contributesToMonthlyLimit = true;
    }

    await ctx.db.patch(args.postId, updates);
  },
});

export const getScheduledXPosts = query({
  args: {},
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db
      .query("xPosts")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .filter((q) => 
        q.and(
          q.neq(q.field("publishAt"), undefined),
          q.lte(q.field("publishAt"), now)
        )
      )
      .collect();
  },
});

export const deleteXPost = mutation({
  args: {
    postId: v.id("xPosts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.postId);
  },
});

// Analytics
export const updateXPostAnalytics = mutation({
  args: {
    postId: v.id("xPosts"),
    retweetCount: v.optional(v.number()),
    likeCount: v.optional(v.number()),
    replyCount: v.optional(v.number()),
    quoteCount: v.optional(v.number()),
    impressionCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.retweetCount !== undefined) updates.retweetCount = args.retweetCount;
    if (args.likeCount !== undefined) updates.likeCount = args.likeCount;
    if (args.replyCount !== undefined) updates.replyCount = args.replyCount;
    if (args.quoteCount !== undefined) updates.quoteCount = args.quoteCount;
    if (args.impressionCount !== undefined) updates.impressionCount = args.impressionCount;

    await ctx.db.patch(args.postId, updates);
  },
});

// Monthly usage tracking
export const incrementMonthlyTweetCount = mutation({
  args: {
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (connection) {
      const currentCount = connection.tweetsThisMonth || 0;
      await ctx.db.patch(args.connectionId, {
        tweetsThisMonth: currentCount + 1,
        updatedAt: Date.now(),
      });
    }
  },
});

export const resetMonthlyTweetCount = mutation({
  args: {
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.connectionId, {
      tweetsThisMonth: 0,
      updatedAt: Date.now(),
    });
  },
});
