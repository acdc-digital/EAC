import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get post by fileName
export const getPostByFileName = query({
  args: { fileName: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("socialPosts")
      .withIndex("by_fileName", (q) => q.eq("fileName", args.fileName))
      .first();
    
    return post;
  },
});

// Get all posts by status
export const getPostsByStatus = query({
  args: { status: v.union(
    v.literal('draft'),
    v.literal('scheduled'),
    v.literal('posting'),
    v.literal('posted'),
    v.literal('failed')
  ) },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("socialPosts")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
    
    return posts;
  },
});

// Get all posts by file type
export const getPostsByFileType = query({
  args: { fileType: v.union(v.literal('reddit'), v.literal('twitter')) },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("socialPosts")
      .withIndex("by_fileType", (q) => q.eq("fileType", args.fileType))
      .collect();
    
    return posts;
  },
});

// Create or update post
export const upsertPost = mutation({
  args: {
    fileName: v.string(),
    fileType: v.union(v.literal('reddit'), v.literal('twitter')),
    content: v.string(),
    title: v.optional(v.string()),
    platformData: v.optional(v.string()), // JSON string
    status: v.optional(v.union(
      v.literal('draft'),
      v.literal('scheduled'),
      v.literal('posting'),
      v.literal('posted'),
      v.literal('failed')
    )),
    scheduledFor: v.optional(v.number()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingPost = await ctx.db
      .query("socialPosts")
      .withIndex("by_fileName", (q) => q.eq("fileName", args.fileName))
      .first();
    
    const now = Date.now();
    const postData = {
      fileName: args.fileName,
      fileType: args.fileType,
      content: args.content,
      title: args.title,
      platformData: args.platformData,
      status: args.status || 'draft',
      scheduledFor: args.scheduledFor,
      userId: args.userId,
      updatedAt: now,
    };
    
    if (existingPost) {
      // Update existing post
      await ctx.db.patch(existingPost._id, postData);
      return await ctx.db.get(existingPost._id);
    } else {
      // Create new post
      const id = await ctx.db.insert("socialPosts", {
        ...postData,
        createdAt: now,
      });
      
      return await ctx.db.get(id);
    }
  },
});

// Update post status after submission
export const updatePostStatus = mutation({
  args: {
    fileName: v.string(),
    status: v.union(
      v.literal('draft'),
      v.literal('scheduled'),
      v.literal('posting'),
      v.literal('posted'),
      v.literal('failed')
    ),
    postId: v.optional(v.string()),
    postUrl: v.optional(v.string()),
    postedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("socialPosts")
      .withIndex("by_fileName", (q) => q.eq("fileName", args.fileName))
      .first();
    
    if (!post) {
      throw new Error(`Post not found for fileName: ${args.fileName}`);
    }
    
    await ctx.db.patch(post._id, {
      status: args.status,
      postId: args.postId,
      postUrl: args.postUrl,
      postedAt: args.postedAt,
      errorMessage: args.errorMessage,
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(post._id);
  },
});

// Delete post
export const deletePost = mutation({
  args: { fileName: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("socialPosts")
      .withIndex("by_fileName", (q) => q.eq("fileName", args.fileName))
      .first();
    
    if (post) {
      await ctx.db.delete(post._id);
    }
  },
});

// Schedule post
export const schedulePost = mutation({
  args: {
    fileName: v.string(),
    fileType: v.union(v.literal('reddit'), v.literal('twitter')),
    content: v.string(),
    title: v.optional(v.string()),
    platformData: v.optional(v.string()),
    scheduledFor: v.number(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingPost = await ctx.db
      .query("socialPosts")
      .withIndex("by_fileName", (q) => q.eq("fileName", args.fileName))
      .first();
    
    const now = Date.now();
    const postData = {
      fileName: args.fileName,
      fileType: args.fileType,
      content: args.content,
      title: args.title,
      platformData: args.platformData,
      status: 'scheduled' as const,
      scheduledFor: args.scheduledFor,
      userId: args.userId,
      updatedAt: now,
    };
    
    if (existingPost) {
      // Update existing post
      await ctx.db.patch(existingPost._id, postData);
      return await ctx.db.get(existingPost._id);
    } else {
      // Create new scheduled post
      const id = await ctx.db.insert("socialPosts", {
        ...postData,
        createdAt: now,
      });
      
      return await ctx.db.get(id);
    }
  },
});

// Get scheduled posts that need to be published
export const getScheduledPostsToPublish = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const posts = await ctx.db
      .query("socialPosts")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .filter((q) => q.lte(q.field("scheduledFor"), now))
      .collect();
    
    return posts;
  },
});
