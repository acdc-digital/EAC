// Reddit API Integration for EAC Dashboard
// convex/reddit.ts

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

// Social Connections Management
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
      .withIndex("by_user", (q) => q.eq("userId", args.userId).eq("platform", args.platform))
      .first();
    
    if (existing) {
      // Update existing connection
      await ctx.db.patch(existing._id, {
        username: args.username,
        clientId: args.clientId,
        clientSecret: args.clientSecret, // TODO: Encrypt in production
        userAgent: args.userAgent,
        apiKey: args.apiKey,
        apiSecret: args.apiSecret, // TODO: Encrypt in production
        isActive: true,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new connection
      return await ctx.db.insert("socialConnections", {
        userId: args.userId,
        platform: args.platform,
        username: args.username,
        clientId: args.clientId,
        clientSecret: args.clientSecret, // TODO: Encrypt in production
        userAgent: args.userAgent,
        apiKey: args.apiKey,
        apiSecret: args.apiSecret, // TODO: Encrypt in production
        isActive: true,
        lastSync: undefined,
        tokenExpiry: undefined,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

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
    let query = ctx.db
      .query("socialConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true));
    
    if (args.platform) {
      query = query.filter((q) => q.eq(q.field("platform"), args.platform));
    }
    
    return await query.collect();
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

export const updateConnectionTokens = mutation({
  args: {
    connectionId: v.id("socialConnections"),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.connectionId, {
      accessToken: args.accessToken, // TODO: Encrypt in production
      refreshToken: args.refreshToken, // TODO: Encrypt in production
      tokenExpiry: args.tokenExpiry,
      lastSync: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const disconnectSocialAccount = mutation({
  args: {
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.connectionId, {
      isActive: false,
      accessToken: undefined,
      refreshToken: undefined,
      tokenExpiry: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const deleteSocialConnection = mutation({
  args: {
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.connectionId);
  },
});

// Reddit Posts Management
export const createRedditPost = mutation({
  args: {
    userId: v.string(),
    connectionId: v.id("socialConnections"),
    fileId: v.optional(v.id("files")),
    subreddit: v.string(),
    title: v.string(),
    kind: v.union(v.literal("self"), v.literal("link"), v.literal("image"), v.literal("video")),
    text: v.optional(v.string()),
    url: v.optional(v.string()),
    nsfw: v.boolean(),
    spoiler: v.boolean(),
    flairId: v.optional(v.string()),
    flairText: v.optional(v.string()),
    sendReplies: v.boolean(),
    publishAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Determine initial status
    const status = args.publishAt && args.publishAt > now ? "scheduled" : "draft";
    
    const postId = await ctx.db.insert("redditPosts", {
      userId: args.userId,
      connectionId: args.connectionId,
      fileId: args.fileId,
      subreddit: args.subreddit.replace(/^r\//, ""), // Remove r/ prefix if present
      title: args.title,
      kind: args.kind,
      text: args.text,
      url: args.url,
      nsfw: args.nsfw,
      spoiler: args.spoiler,
      flairId: args.flairId,
      flairText: args.flairText,
      sendReplies: args.sendReplies,
      status,
      publishAt: args.publishAt,
      retryCount: 0,
      createdAt: now,
      updatedAt: now,
    });

        // Schedule the post if publishAt is provided
    let scheduledFunctionId = undefined;
    if (args.publishAt) {
      console.log(`Scheduling post for ${new Date(args.publishAt).toLocaleString()}`);
      scheduledFunctionId = await ctx.scheduler.runAt(
        args.publishAt,
        internal.redditApi.submitScheduledRedditPost,
        { postId }
      );
      console.log(`Scheduled with function ID: ${scheduledFunctionId}`);
    }

    // Update the post with the scheduled function ID
    await ctx.db.patch(postId, {
      scheduledFunctionId,
      status: args.publishAt && args.publishAt > Date.now() ? "scheduled" : "draft"
    });

    return postId;
  },
});

export const getRedditPosts = query({
  args: {
    userId: v.string(),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("publishing"),
      v.literal("published"),
      v.literal("failed")
    )),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("redditPosts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    return await query.collect();
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

export const updateRedditPost = mutation({
  args: {
    postId: v.id("redditPosts"),
    subreddit: v.optional(v.string()),
    title: v.optional(v.string()),
    kind: v.optional(v.union(v.literal("self"), v.literal("link"), v.literal("image"), v.literal("video"))),
    text: v.optional(v.string()),
    url: v.optional(v.string()),
    nsfw: v.optional(v.boolean()),
    spoiler: v.optional(v.boolean()),
    flairId: v.optional(v.string()),
    flairText: v.optional(v.string()),
    sendReplies: v.optional(v.boolean()),
    publishAt: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("publishing"),
      v.literal("published"),
      v.literal("failed")
    )),
  },
  handler: async (ctx, args) => {
    const { postId, publishAt, ...updates } = args;
    const now = Date.now();
    
    // Get the existing post
    const existingPost = await ctx.db.get(postId);
    if (!existingPost) {
      throw new Error("Post not found");
    }
    
    // Clean subreddit name if provided
    if (updates.subreddit) {
      updates.subreddit = updates.subreddit.replace(/^r\//, "");
    }
    
    // Cancel existing scheduled function if there was one
    if (existingPost.scheduledFunctionId) {
      console.log(`Cancelling existing scheduled function: ${existingPost.scheduledFunctionId}`);
      await ctx.scheduler.cancel(existingPost.scheduledFunctionId);
    }

    // Schedule new function if publishAt is provided
    let scheduledFunctionId = undefined;
    let status = updates.status || existingPost.status;
    
    if (publishAt) {
      console.log(`Rescheduling post for ${new Date(publishAt).toLocaleString()}`);
      scheduledFunctionId = await ctx.scheduler.runAt(
        publishAt,
        internal.redditApi.submitScheduledRedditPost,
        { postId }
      );
      console.log(`Rescheduled with function ID: ${scheduledFunctionId}`);
      status = publishAt > now ? "scheduled" : "draft";
    } else if (existingPost.scheduledFunctionId && publishAt === undefined) {
      // If we had a scheduled function but publishAt is being cleared, return to draft
      status = "draft";
    }
    
    await ctx.db.patch(postId, {
      ...updates,
      publishAt,
      scheduledFunctionId,
      status,
      updatedAt: now,
    });
  },
});

export const cancelScheduledPost = mutation({
  args: {
    postId: v.id("redditPosts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Cancel the scheduled function if it exists
    if (post.scheduledFunctionId) {
      console.log(`Cancelling scheduled function: ${post.scheduledFunctionId}`);
      await ctx.scheduler.cancel(post.scheduledFunctionId);
    }

    // Update the post status
    await ctx.db.patch(args.postId, {
      status: "draft",
      scheduledFunctionId: undefined,
      publishAt: undefined,
      updatedAt: Date.now(),
    });

    return args.postId;
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

export const deleteRedditPost = mutation({
  args: {
    postId: v.id("redditPosts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.postId);
  },
});

// Utility function to get Reddit connection by user
export const getRedditConnection = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("socialConnections")
      .withIndex("by_user", (q) => 
        q.eq("userId", args.userId).eq("platform", "reddit")
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
  },
});

// Get Reddit post with connection details for API calls
export const getRedditPostWithConnection = query({
  args: {
    postId: v.id("redditPosts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;
    
    const connection = await ctx.db.get(post.connectionId);
    if (!connection) return null;
    
    return {
      post,
      connection,
    };
  },
});

// Get Reddit post by file name (for editor integration)
export const getRedditPostByFileName = query({
  args: {
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    // First, find the file by name
    const file = await ctx.db
      .query("files")
      .withIndex("by_name", (q) => q.eq("name", args.fileName))
      .first();
    
    if (!file) return null;
    
    // Then find any Reddit post linked to this file
    const post = await ctx.db
      .query("redditPosts")
      .withIndex("by_file", (q) => q.eq("fileId", file._id))
      .first();
    
    return post;
  },
});

// Get all Reddit posts with their statuses (for sidebar integration)
export const getAllRedditPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("redditPosts")
      .collect();
    
    // Return posts with their file information
    const postsWithFiles = await Promise.all(
      posts.map(async (post) => {
        if (post.fileId) {
          const file = await ctx.db.get(post.fileId);
          return {
            ...post,
            file: file,
          };
        }
        return {
          ...post,
          file: null,
        };
      })
    );
    
    return postsWithFiles;
  },
});

// Fetch analytics data for a published Reddit post
export const fetchPostAnalytics = mutation({
  args: {
    postId: v.id("redditPosts"),
  },
  handler: async (ctx, args): Promise<string> => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    
    if (post.status !== "published" || !post.redditId) {
      throw new Error("Post must be published and have a Reddit ID to fetch analytics");
    }

    // Get the social connection for API credentials
    const connection = await ctx.db.get(post.connectionId);
    if (!connection || !connection.isActive) {
      throw new Error("No active Reddit connection found");
    }

    // Call the internal action to fetch analytics
    await ctx.scheduler.runAfter(0, internal.redditApi.fetchRedditAnalytics, {
      redditId: post.redditId,
      postId: args.postId,
      connectionId: post.connectionId,
    });

    return "Analytics fetch initiated";
  },
});

// Update post analytics (called by internal action)
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
