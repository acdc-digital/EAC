import { v } from "convex/values";
import { api } from "./_generated/api";
import { internalAction, mutation, query } from "./_generated/server";
import { getCurrentUserId } from "./auth";

// Get post by fileName
export const getPostByFileName = query({
  args: { fileName: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("agentPosts")
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
      .query("agentPosts")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
    
    return posts;
  },
});

// Get all social posts
export const getAllPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("agentPosts")
      .collect();
    
    return posts;
  },
});

// Get scheduled posts for calendar view
// Debug function to create a test scheduled post with current user
export const createTestScheduledPostForCurrentUser = mutation({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    console.log('🧪 Current user ID from auth:', userId);
    
    const now = Date.now();
    const tomorrow = now + (24 * 60 * 60 * 1000); // 24 hours from now
    
    const testPost = {
      fileName: `test-authenticated-post-${now}`,
      fileType: 'twitter' as const,
      content: 'This is a test scheduled post created by authenticated user! 🔐📅',
      status: 'scheduled' as const,
      scheduledFor: tomorrow,
      createdAt: now,
      updatedAt: now,
      userId: userId || 'current-user',
    };
    
    const id = await ctx.db.insert("agentPosts", testPost);
    console.log('🧪 Authenticated test post created:', { id, ...testPost });
    
    return await ctx.db.get(id);
  },
});

// Debug function to create a test scheduled post
export const createTestScheduledPost = mutation({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const tomorrow = now + (24 * 60 * 60 * 1000); // 24 hours from now
    
    const testPost = {
      fileName: `test-post-${now}`,
      fileType: 'twitter' as const,
      content: 'This is a test scheduled post for calendar testing! 🗓️',
      status: 'scheduled' as const,
      scheduledFor: tomorrow,
      createdAt: now,
      updatedAt: now,
      userId: args.userId || 'current-user',
    };
    
    const id = await ctx.db.insert("agentPosts", testPost);
    console.log('🧪 Test post created:', { id, ...testPost });
    
    return await ctx.db.get(id);
  },
});

// Debug function to list all agent posts
export const getAllAgentPosts = query({
  args: {},
  handler: async (ctx) => {
    const allPosts = await ctx.db.query("agentPosts").collect();
    
    console.log(`📊 Database Debug - Total posts in agentPosts table: ${allPosts.length}`);
    
    allPosts.forEach((post, index) => {
      console.log(`📊 Post ${index + 1}:`, {
        id: post._id,
        fileName: post.fileName,
        status: post.status,
        scheduledFor: post.scheduledFor ? new Date(post.scheduledFor).toISOString() : 'not scheduled',
        userId: post.userId,
        createdAt: new Date(post.createdAt).toISOString(),
      });
    });
    
    return allPosts;
  },
});

export const getScheduledPostsForCalendar = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log('📅 Calendar Query - Args:', {
      startDate: args.startDate ? new Date(args.startDate).toISOString() : 'undefined',
      endDate: args.endDate ? new Date(args.endDate).toISOString() : 'undefined',
      userId: args.userId || 'undefined'
    });

    let query = ctx.db
      .query("agentPosts")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"));
    
    // Get all scheduled posts first for debugging
    const allScheduledPosts = await query.collect();
    console.log('📅 All scheduled posts in DB:', allScheduledPosts.length);
    
    // Log sample posts for debugging
    if (allScheduledPosts.length > 0) {
      console.log('📅 Sample post data:', {
        fileName: allScheduledPosts[0].fileName,
        userId: allScheduledPosts[0].userId,
        scheduledFor: allScheduledPosts[0].scheduledFor ? new Date(allScheduledPosts[0].scheduledFor).toISOString() : 'undefined',
        status: allScheduledPosts[0].status
      });
    }
    
    // Apply filters
    let filteredPosts = allScheduledPosts;
    
    // Filter by user if provided (make this very lenient for debugging)
    if (args.userId) {
      const beforeUserFilter = filteredPosts.length;
      filteredPosts = filteredPosts.filter(post => {
        // Check various user ID formats - be very lenient
        const matches = !post.userId || 
                       post.userId === args.userId || 
                       post.userId === 'current-user' || 
                       post.userId === 'undefined' ||
                       (typeof post.userId === 'string' && typeof args.userId === 'string' && post.userId.includes(args.userId)) ||
                       (typeof args.userId === 'string' && typeof post.userId === 'string' && args.userId.includes(post.userId));
        console.log(`📅 User filter - Post userId: "${post.userId}", Query userId: "${args.userId}", Matches: ${matches}`);
        return matches;
      });
      console.log(`📅 User filter results: ${beforeUserFilter} -> ${filteredPosts.length} posts`);
    } else {
      console.log('📅 No user filter applied - showing all posts');
    }
    
    // Filter by date range if provided
    if (args.startDate !== undefined && args.endDate !== undefined) {
      filteredPosts = filteredPosts.filter(post => {
        if (!post.scheduledFor) return false;
        const inRange = post.scheduledFor >= args.startDate! && post.scheduledFor <= args.endDate!;
        console.log(`📅 Date filter - Post date: ${new Date(post.scheduledFor).toISOString()}, In range: ${inRange}`);
        return inRange;
      });
    }
    
    console.log(`📅 Filtered posts: ${filteredPosts.length}`);
    
    // Transform to calendar format
    const transformedPosts = filteredPosts.map(post => ({
      _id: post._id,
      platform: post.fileType, // Map fileType to platform
      title: post.title || post.fileName,
      content: post.content,
      scheduledAt: post.scheduledFor || 0,
      status: post.status,
      fileName: post.fileName,
      fileType: post.fileType,
      userId: post.userId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));
    
    console.log('📅 Returning posts for calendar:', transformedPosts.length);
    return transformedPosts;
  },
});

// Get all posts by file type
export const getPostsByFileType = query({
  args: { fileType: v.union(v.literal('reddit'), v.literal('twitter')) },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("agentPosts")
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
  },
  handler: async (ctx, args) => {
    // Get authenticated user ID instead of using temp-user-id
    const userId = await getCurrentUserId(ctx);
    
    const existingPost = await ctx.db
      .query("agentPosts")
      .withIndex("by_fileName", (q) => q.eq("fileName", args.fileName))
      .first();
    
    const now = Date.now();
    const postData = {
      fileName: args.fileName,
      fileType: args.fileType,
      content: args.content,
      title: args.title,
      platformData: args.platformData,
      // Only update status if explicitly provided
      ...(args.status !== undefined && { status: args.status }),
      scheduledFor: args.scheduledFor,
      userId: userId, // Use authenticated user ID
      updatedAt: now,
    };
    
    if (existingPost) {
      // Update existing post - preserve status if not provided
      const updateData = { ...postData };
      if (args.status === undefined) {
        delete updateData.status; // Don't update status if not provided
      }
      await ctx.db.patch(existingPost._id, updateData);
      return await ctx.db.get(existingPost._id);
    } else {
      // Create new post - always set status to draft if not provided
      const id = await ctx.db.insert("agentPosts", {
        ...postData,
        status: args.status || 'draft',
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
    console.log(`� Updating post status for ${args.fileName} to ${args.status}`);
    
    const post = await ctx.db
      .query("agentPosts")
      .withIndex("by_fileName", (q) => q.eq("fileName", args.fileName))
      .first();
    
    console.log(`📝 Found post for status update:`, post ? {
      _id: post._id,
      fileName: post.fileName,
      currentStatus: post.status,
      newStatus: args.status
    } : 'NOT FOUND');
    
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
    
    const updatedPost = await ctx.db.get(post._id);
    console.log(`✅ Status updated successfully:`, {
      _id: updatedPost?._id,
      fileName: updatedPost?.fileName,
      oldStatus: post.status,
      newStatus: updatedPost?.status
    });

    return updatedPost;
  },
});

// Delete post
export const deletePost = mutation({
  args: { fileName: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("agentPosts")
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
    console.log('📅 schedulePost called with args:', {
      fileName: args.fileName,
      fileType: args.fileType,
      scheduledFor: new Date(args.scheduledFor).toISOString(),
      userId: args.userId,
    });
    
    const currentUserId = await getCurrentUserId(ctx);
    console.log('📅 Current authenticated user ID:', currentUserId);
    
    const existingPost = await ctx.db
      .query("agentPosts")
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
      userId: args.userId || currentUserId || 'current-user', // Use auth user if available
      updatedAt: now,
    };
    
    console.log('📅 Storing post with userId:', postData.userId);
    
    if (existingPost) {
      // Update existing post
      await ctx.db.patch(existingPost._id, postData);
      console.log('📅 Updated existing post:', existingPost._id);
      return await ctx.db.get(existingPost._id);
    } else {
      // Create new scheduled post
      const id = await ctx.db.insert("agentPosts", {
        ...postData,
        createdAt: now,
      });
      
      console.log('📅 Created new scheduled post:', id);
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
      .query("agentPosts")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .filter((q) => q.lte(q.field("scheduledFor"), now))
      .collect();
    
    return posts;
  },
});

// Internal action to process scheduled posts (called by cron job)
export const processScheduledPosts = internalAction({
  args: {},
  handler: async (ctx): Promise<{ processed: number; results: Array<{ fileName: string; success: boolean; error?: string }> }> => {
    try {
      console.log('🕐 [CRON] Processing scheduled posts...');
      
      // Get posts that need to be published
      const scheduledPosts: any[] = await ctx.runQuery(api.socialPosts.getScheduledPostsToPublish);
      
      if (scheduledPosts.length === 0) {
        console.log('✅ [CRON] No scheduled posts ready for publishing');
        return { processed: 0, results: [] };
      }
      
      console.log(`📋 [CRON] Found ${scheduledPosts.length} posts ready for publishing`);
      
      const results: Array<{ fileName: string; success: boolean; error?: string }> = [];
      
      for (const post of scheduledPosts) {
        try {
          console.log(`🚀 [CRON] Publishing ${post.fileType} post: ${post.fileName}`);
          
          // Update status to posting
          await ctx.runMutation(api.socialPosts.updatePostStatus, {
            fileName: post.fileName,
            status: 'posting',
          });
          
          // Route to appropriate platform API
          if (post.fileType === 'reddit') {
            // Parse platform data to get connectionId
            const platformData = post.platformData ? JSON.parse(post.platformData) : {};
            
            if (!platformData.connectionId) {
              throw new Error('No connectionId found in platform data for scheduled Reddit post');
            }
            
            // Create Reddit post first (if it doesn't exist)
            const redditPost = await ctx.runMutation(api.reddit.createRedditPost, {
              userId: post.userId, // Use the actual user ID from the post
              connectionId: platformData.connectionId,
              subreddit: platformData.subreddit || 'test',
              title: post.title || '',
              kind: platformData.postType || 'self',
              text: post.content,
              url: platformData.linkUrl || undefined,
              nsfw: platformData.nsfw || false,
              spoiler: platformData.spoiler || false,
              sendReplies: platformData.sendReplies !== false, // Default to true
              flairId: platformData.flairId || undefined,
            });
            
            // Submit the Reddit post
            const result = await ctx.runAction(api.redditApi.submitRedditPost, {
              postId: redditPost,
            });
            
            if (result.success && result.url) {
              // Update status to posted with URL
              await ctx.runMutation(api.socialPosts.updatePostStatus, {
                fileName: post.fileName,
                status: 'posted',
                postUrl: result.url,
                postId: result.redditId,
                postedAt: Date.now(),
              });
              
              console.log(`✅ [CRON] Successfully published Reddit post: ${post.fileName}`);
              results.push({ fileName: post.fileName, success: true });
            } else {
              throw new Error(result.error || 'Failed to submit Reddit post');
            }
          } else if (post.fileType === 'twitter') {
            // TODO: Implement Twitter scheduled posting
            console.log(`⏳ [CRON] Twitter scheduled posting not yet implemented for: ${post.fileName}`);
            results.push({ fileName: post.fileName, success: false, error: 'Twitter posting not implemented' });
          } else {
            throw new Error(`Unsupported platform: ${post.fileType}`);
          }
          
        } catch (error) {
          console.error(`❌ [CRON] Failed to publish post ${post.fileName}:`, error);
          
          // Update status to failed
          await ctx.runMutation(api.socialPosts.updatePostStatus, {
            fileName: post.fileName,
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          });
          
          results.push({ 
            fileName: post.fileName, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }
      
      console.log(`🏁 [CRON] Completed processing ${results.length} scheduled posts`);
      return { processed: results.length, results };
      
    } catch (error) {
      console.error('❌ [CRON] Failed to process scheduled posts:', error);
      throw error;
    }
  },
});
