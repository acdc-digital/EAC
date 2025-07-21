import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Example table for testing
  messages: defineTable({
    text: v.string(),
    author: v.string(),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),
  
  // Chat messages for AI assistant
  chatMessages: defineTable({
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    sessionId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"])
    .index("by_session", ["sessionId", "createdAt"]),
  
  // Add more tables as needed for your EAC dashboard
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("on-hold")),
    budget: v.optional(v.number()),
    projectNo: v.optional(v.string()), // Added to match existing data
    userId: v.optional(v.string()), // Added to match existing data
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_created_at", ["createdAt"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_project_no", ["projectNo"]),

  // Files table to track all files created within projects
  files: defineTable({
    name: v.string(), // File name (e.g., "post-1.md", "campaign-brief.txt")
    type: v.union(
      v.literal("post"), 
      v.literal("campaign"), 
      v.literal("note"), 
      v.literal("document"), 
      v.literal("image"), 
      v.literal("video"),
      v.literal("other")
    ),
    extension: v.optional(v.string()), // File extension (e.g., "md", "txt", "jpg")
    content: v.optional(v.string()), // File content for text files
    size: v.optional(v.number()), // File size in bytes
    projectId: v.id("projects"), // Reference to the parent project
    userId: v.optional(v.string()), // User who created the file
    path: v.optional(v.string()), // Relative path within project (e.g., "/posts/social/")
    mimeType: v.optional(v.string()), // MIME type for proper handling
    isDeleted: v.optional(v.boolean()), // Soft delete flag
    lastModified: v.number(), // Last modification timestamp
    createdAt: v.number(),
    updatedAt: v.number(),
    // Social media specific fields
    platform: v.optional(v.union(
      v.literal("facebook"),
      v.literal("instagram"), 
      v.literal("twitter"),
      v.literal("linkedin"),
      v.literal("reddit"),
      v.literal("youtube")
    )),
    postStatus: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("archived")
    )),
    scheduledAt: v.optional(v.number()), // For scheduled posts
  })
    .index("by_project", ["projectId", "createdAt"])
    .index("by_user", ["userId", "createdAt"])
    .index("by_type", ["type", "createdAt"])
    .index("by_platform", ["platform", "createdAt"])
    .index("by_project_type", ["projectId", "type"])
    .index("by_name", ["name"])
    .index("by_last_modified", ["lastModified"])
    .index("by_not_deleted", ["isDeleted", "createdAt"]),

  // Make all user fields optional to match existing data
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    authId: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  // Social media connections for API credentials
  socialConnections: defineTable({
    userId: v.string(),
    platform: v.union(
      v.literal("facebook"),
      v.literal("instagram"),
      v.literal("twitter"),
      v.literal("reddit")
    ),
    username: v.string(),
    
    // Reddit-specific fields
    clientId: v.optional(v.string()),
    clientSecret: v.optional(v.string()), // Encrypted
    accessToken: v.optional(v.string()), // Encrypted
    refreshToken: v.optional(v.string()), // Encrypted
    userAgent: v.optional(v.string()),
    
    // Generic OAuth fields for other platforms
    apiKey: v.optional(v.string()), // Encrypted
    apiSecret: v.optional(v.string()), // Encrypted
    
    isActive: v.boolean(),
    lastSync: v.optional(v.number()),
    tokenExpiry: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId", "platform"])
    .index("by_platform", ["platform", "isActive"])
    .index("by_active", ["isActive", "userId"]),

  // Reddit posts with all necessary fields for API posting
  redditPosts: defineTable({
    userId: v.string(),
    connectionId: v.id("socialConnections"),
    fileId: v.optional(v.id("files")), // Link to file if created from editor
    
    // Required Reddit API fields
    subreddit: v.string(),
    title: v.string(),
    kind: v.union(v.literal("self"), v.literal("link"), v.literal("image"), v.literal("video")),
    
    // Content fields (conditional based on kind)
    text: v.optional(v.string()), // For self posts
    url: v.optional(v.string()), // For link posts
    
    // Optional Reddit API fields
    nsfw: v.boolean(),
    spoiler: v.boolean(),
    flairId: v.optional(v.string()),
    flairText: v.optional(v.string()),
    sendReplies: v.boolean(),
    
    // Scheduling and status
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("publishing"),
      v.literal("published"),
      v.literal("failed")
    ),
    publishAt: v.optional(v.number()), // Unix timestamp for scheduling
    scheduledFunctionId: v.optional(v.id("_scheduled_functions")), // ID of scheduled function for cancellation
    publishedAt: v.optional(v.number()),
    publishedUrl: v.optional(v.string()), // Reddit URL after successful post
    redditId: v.optional(v.string()), // Reddit post ID (t3_xxx)
    
    // Error handling
    error: v.optional(v.string()), // Error message if failed
    retryCount: v.optional(v.number()),
    lastRetryAt: v.optional(v.number()),
    
    // Analytics data from Reddit API
    score: v.optional(v.number()), // Net upvotes (upvotes - downvotes)
    upvotes: v.optional(v.number()), // Total upvotes
    downvotes: v.optional(v.number()), // Total downvotes
    upvoteRatio: v.optional(v.number()), // Ratio of upvotes to total votes (0.0-1.0)
    totalAwardsReceived: v.optional(v.number()), // Number of awards
    numComments: v.optional(v.number()), // Number of comments
    numCrossposts: v.optional(v.number()), // Number of crossposts
    viewCount: v.optional(v.number()), // Views (if available)
    lastAnalyticsUpdate: v.optional(v.number()), // When analytics were last fetched
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId", "createdAt"])
    .index("by_connection", ["connectionId", "createdAt"])
    .index("by_status", ["status", "publishAt"])
    .index("by_subreddit", ["subreddit", "createdAt"])
    .index("by_file", ["fileId"]),
});
