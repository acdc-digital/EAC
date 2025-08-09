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

// Create a real post example (not just test) for demonstration
export const createRealPostExample = mutation({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const tomorrow = now + (24 * 60 * 60 * 1000); // 24 hours from now
    
    const realPost = {
      fileName: `my-awesome-reddit-post-${now}.reddit`,
      fileType: 'reddit' as const,
      title: 'Check out this amazing project I\'ve been working on!',
      content: 'I\'ve been building an AI-powered content management system and wanted to share some insights about the development process. What features would you find most useful? #coding #AI #webdev',
      status: 'scheduled' as const,
      scheduledFor: tomorrow,
      platformData: JSON.stringify({
        subreddit: 'webdev',
        postType: 'text',
        nsfw: false,
        spoiler: false,
        sendReplies: true
      }),
      createdAt: now,
      updatedAt: now,
      userId: args.userId || 'current-user',
    };
    
    const id = await ctx.db.insert("agentPosts", realPost);
    console.log('✨ Real post example created:', { id, ...realPost });
    
    return await ctx.db.get(id);
  },
});

// Debug: Clear all test posts and create fresh examples
export const debugResetAndCreateExamples = mutation({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = args.userId || 'current-user';
    console.log('🔄 Debug: Resetting and creating example posts...');
    
    // Delete existing test posts
    const existingPosts = await ctx.db.query("agentPosts").collect();
    const testPosts = existingPosts.filter(post => 
      post.fileName.includes('test-') || 
      post.content.includes('test') || 
      post.content.includes('Test')
    );
    
    for (const post of testPosts) {
      await ctx.db.delete(post._id);
    }
    console.log(`🗑️ Deleted ${testPosts.length} test posts`);
    
    // Create diverse examples
    const now = Date.now();
    const examples = [
      {
        fileName: `product-launch-announcement-${now}.reddit`,
        fileType: 'reddit' as const,
        title: 'Launching our new AI-powered dashboard next week!',
        content: 'After months of development, we\'re excited to announce the launch of our new AI-powered content management dashboard. What features are you most excited about? #AI #ProductLaunch #WebDev',
        status: 'scheduled' as const,
        scheduledFor: now + (2 * 24 * 60 * 60 * 1000), // 2 days from now
        platformData: JSON.stringify({
          subreddit: 'startups',
          postType: 'text',
          nsfw: false,
          spoiler: false,
          sendReplies: true
        }),
        userId,
      },
      {
        fileName: `weekly-dev-tips-${now}.twitter`,
        fileType: 'twitter' as const,
        content: '💡 Weekly Dev Tip: Always use semantic HTML elements! They improve accessibility and SEO. Instead of <div class="header">, use <header>. Small changes, big impact! 🚀 #WebDev #Accessibility #HTML',
        status: 'scheduled' as const,
        scheduledFor: now + (3 * 24 * 60 * 60 * 1000), // 3 days from now
        userId,
      },
      {
        fileName: `community-question-${now}.reddit`,
        fileType: 'reddit' as const,
        title: 'What\'s your favorite debugging technique?',
        content: 'As developers, we all have our go-to debugging methods. Mine is rubber duck debugging - explaining the problem out loud often reveals the solution! What\'s yours? Share your best debugging stories below! 🦆🐛',
        status: 'scheduled' as const,
        scheduledFor: now + (7 * 24 * 60 * 60 * 1000), // 1 week from now
        platformData: JSON.stringify({
          subreddit: 'programming',
          postType: 'text',
          nsfw: false,
          spoiler: false,
          sendReplies: true
        }),
        userId,
      },
      {
        fileName: `published-success-story-${now}.twitter`,
        fileType: 'twitter' as const,
        content: '🎉 Just deployed our biggest feature update yet! The new calendar integration is live and our users are loving it. Sometimes the best projects come from listening to user feedback. Thanks everyone! ❤️ #ProductUpdate #UserFeedback',
        status: 'posted' as const,
        scheduledFor: now - (24 * 60 * 60 * 1000), // Yesterday (published)
        postedAt: now - (24 * 60 * 60 * 1000),
        postId: 'tweet_123456789',
        postUrl: 'https://twitter.com/example/status/123456789',
        userId,
      },
    ];
    
    const created = [];
    for (const example of examples) {
      const id = await ctx.db.insert("agentPosts", {
        ...example,
        createdAt: now,
        updatedAt: now,
      });
      created.push(id);
    }
    
    console.log(`✨ Created ${created.length} example posts for calendar`);
    return { created: created.length, postIds: created };
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

    // Get ALL posts that have a scheduledFor date (not just "scheduled" status)
    // This includes scheduled, posted, failed posts - all with dates for calendar view
    const allPostsWithDates = await ctx.db
      .query("agentPosts")
      .collect();
    
    // Filter posts that have scheduledFor dates (for calendar display)
    const postsForCalendar = allPostsWithDates.filter(post => post.scheduledFor);
    console.log('📅 All posts with dates in DB:', postsForCalendar.length);
    
    // Log sample posts for debugging
    if (postsForCalendar.length > 0) {
      console.log('📅 Sample post data:', {
        fileName: postsForCalendar[0].fileName,
        userId: postsForCalendar[0].userId,
        scheduledFor: postsForCalendar[0].scheduledFor ? new Date(postsForCalendar[0].scheduledFor).toISOString() : 'undefined',
        status: postsForCalendar[0].status
      });
    }
    
    // Apply filters
    let filteredPosts = postsForCalendar;
    
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
  args: { fileType: v.union(v.literal('reddit'), v.literal('twitter'), v.literal('linkedin'), v.literal('facebook'), v.literal('instagram')) },
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
    fileType: v.union(v.literal('reddit'), v.literal('twitter'), v.literal('linkedin'), v.literal('facebook'), v.literal('instagram')),
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
    fileType: v.union(v.literal('reddit'), v.literal('twitter'), v.literal('linkedin'), v.literal('facebook'), v.literal('instagram')),
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
