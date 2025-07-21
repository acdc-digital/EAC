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
});
