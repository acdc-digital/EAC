import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

// Helper function to get current user
async function getCurrentUserId(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  
  // First try to find user by clerk ID
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();
    
  if (user) {
    return user._id;
  }
  
  // Fallback to email lookup for legacy users
  if (identity.email) {
    const emailUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (emailUser) {
      return emailUser._id;
    }
  }
  
  throw new Error("User not found in database");
}

// Helper function to verify project ownership
async function verifyProjectOwnership(ctx: QueryCtx | MutationCtx, projectId: any, userId: any) {
  const project = await ctx.db.get(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  // Projects table has userId field
  if (project.userId !== userId) {
    throw new Error("Not authorized to access this project");
  }
  return project;
}

// User-scoped: Get all files for a specific project
export const getFilesByProject = query({
  args: { 
    projectId: v.id("projects"),
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    // Verify user owns the project
    await verifyProjectOwnership(ctx, args.projectId, userId);
    
    let query = ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId));

    if (!args.includeDeleted) {
      query = query.filter((q) => q.neq(q.field("isDeleted"), true));
    }

    const files = await query.order("desc").collect();
    return files;
  },
});

// User-scoped: Get files by type within a project
export const getFilesByType = query({
  args: { 
    projectId: v.id("projects"),
    type: v.union(
      v.literal("post"), 
      v.literal("campaign"), 
      v.literal("note"), 
      v.literal("document"), 
      v.literal("image"), 
      v.literal("video"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    // Verify user owns the project
    await verifyProjectOwnership(ctx, args.projectId, userId);
    
    const files = await ctx.db
      .query("files")
      .withIndex("by_project_type", (q) => 
        q.eq("projectId", args.projectId).eq("type", args.type)
      )
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .order("desc")
      .collect();

    return files;
  },
});

// Get files by platform (for social media posts)
export const getFilesByPlatform = query({
  args: { 
    projectId: v.id("projects"),
    platform: v.union(
      v.literal("facebook"),
      v.literal("instagram"), 
      v.literal("twitter"),
      v.literal("linkedin"),
      v.literal("reddit"),
      v.literal("youtube")
    ),
  },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_platform", (q) => q.eq("platform", args.platform))
      .filter((q) => 
        q.eq(q.field("projectId"), args.projectId) && 
        q.neq(q.field("isDeleted"), true)
      )
      .order("desc")
      .collect();

    return files;
  },
});

// Get a single file by ID
export const getFile = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    return file;
  },
});

// Create a new file
export const createFile = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("post"), 
      v.literal("campaign"), 
      v.literal("note"), 
      v.literal("document"), 
      v.literal("image"), 
      v.literal("video"),
      v.literal("other")
    ),
    projectId: v.id("projects"),
    content: v.optional(v.string()),
    extension: v.optional(v.string()),
    size: v.optional(v.number()),
    userId: v.optional(v.string()),
    path: v.optional(v.string()),
    mimeType: v.optional(v.string()),
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
    scheduledAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const fileData = {
      name: args.name,
      type: args.type,
      projectId: args.projectId,
      content: args.content,
      extension: args.extension,
      size: args.size,
      userId: args.userId,
      path: args.path,
      mimeType: args.mimeType,
      platform: args.platform,
      postStatus: args.postStatus || "draft",
      scheduledAt: args.scheduledAt,
      isDeleted: false,
      lastModified: now,
      createdAt: now,
      updatedAt: now,
    };

    const fileId = await ctx.db.insert("files", fileData);
    const createdFile = await ctx.db.get(fileId);
    return createdFile;
  },
});

// Update an existing file
export const updateFile = mutation({
  args: {
    fileId: v.id("files"),
    name: v.optional(v.string()),
    content: v.optional(v.string()),
    size: v.optional(v.number()),
    path: v.optional(v.string()),
    mimeType: v.optional(v.string()),
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
    scheduledAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { fileId, ...updates } = args;
    const now = Date.now();

    const updateData: any = {
      ...updates,
      lastModified: now,
      updatedAt: now,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await ctx.db.patch(fileId, updateData);
    const updatedFile = await ctx.db.get(fileId);
    return updatedFile;
  },
});

// Soft delete a file
export const deleteFile = mutation({
  args: { 
    fileId: v.id("files"),
    permanent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.permanent) {
      // Permanent deletion
      await ctx.db.delete(args.fileId);
      return { success: true, message: "File permanently deleted" };
    } else {
      // Soft delete
      const now = Date.now();
      await ctx.db.patch(args.fileId, {
        isDeleted: true,
        updatedAt: now,
        lastModified: now,
      });
      return { success: true, message: "File moved to trash" };
    }
  },
});

// Restore a soft-deleted file
export const restoreFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.fileId, {
      isDeleted: false,
      updatedAt: now,
      lastModified: now,
    });
    
    const restoredFile = await ctx.db.get(args.fileId);
    return restoredFile;
  },
});

// Get file statistics for a project
export const getProjectFileStats = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .collect();

    const stats = {
      total: files.length,
      byType: {} as Record<string, number>,
      byPlatform: {} as Record<string, number>,
      totalSize: 0,
      lastModified: 0,
    };

    files.forEach(file => {
      // Count by type
      stats.byType[file.type] = (stats.byType[file.type] || 0) + 1;
      
      // Count by platform (if applicable)
      if (file.platform) {
        stats.byPlatform[file.platform] = (stats.byPlatform[file.platform] || 0) + 1;
      }
      
      // Sum file sizes
      if (file.size) {
        stats.totalSize += file.size;
      }
      
      // Track latest modification
      if (file.lastModified > stats.lastModified) {
        stats.lastModified = file.lastModified;
      }
    });

    return stats;
  },
});

// Search files by name within a project
export const searchFiles = query({
  args: { 
    projectId: v.id("projects"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => 
        q.neq(q.field("isDeleted"), true) &&
        q.or(
          // Search in file name
          q.gte(q.field("name"), args.searchTerm),
          q.lt(q.field("name"), args.searchTerm + "\uffff")
        )
      )
      .collect();

    // Additional client-side filtering for more flexible search
    const filteredFiles = files.filter(file => 
      file.name.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
      (file.content && file.content.toLowerCase().includes(args.searchTerm.toLowerCase()))
    );

    return filteredFiles;
  },
});
