import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { getCurrentUserId, getCurrentUserIdOptional } from "./auth";

// Helper function to get current user
async function getCurrentUserIdLegacy(ctx: QueryCtx | MutationCtx) {
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
  // Check if this is a projects table entry by checking for expected fields
  if ('name' in project && 'status' in project) {
    // This is a project - check userId
    if ((project as any).userId !== userId) {
      throw new Error("Not authorized to access this project");
    }
    return project;
  }
  throw new Error("Invalid project ID");
}

// Helper function to get Instructions project for user
async function getInstructionsProject(ctx: QueryCtx | MutationCtx, userId: any) {
  const instructionsProject = await ctx.db
    .query("projects")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("name"), "Instructions"))
    .first();
  
  if (!instructionsProject) {
    throw new Error("Instructions project not found. Please create it first.");
  }
  
  return instructionsProject;
}

// Helper function to get Content Creation project for user
async function getContentCreationProject(ctx: QueryCtx | MutationCtx, userId: any) {
  const contentCreationProject = await ctx.db
    .query("projects")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("name"), "Content Creation"))
    .first();
  
  if (!contentCreationProject) {
    throw new Error("Content Creation project not found. Please create it first.");
  }
  
  return contentCreationProject;
}

// Helper function to ensure Content Creation project exists for user
async function ensureContentCreationProjectHelper(ctx: MutationCtx, userId: any) {
  // Check if Content Creation project already exists for this user
  const existingContentCreation = await ctx.db
    .query("projects")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("name"), "Content Creation"))
    .first();
    
  if (existingContentCreation) {
    return existingContentCreation;
  }
  
  // Create Content Creation project
  const now = Date.now();
  const contentCreationProjectId = await ctx.db.insert("projects", {
    name: "Content Creation",
    status: "active" as const,
    description: "System project for content creation files and social media posts",
    userId: userId,
    createdAt: now,
    updatedAt: now,
  });
  
  return await ctx.db.get(contentCreationProjectId);
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
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    // Get the file to restore
    const file = await ctx.db.get(args.id);
    if (!file) {
      throw new Error("File not found");
    }

    // Verify the user owns this file's project
    await verifyProjectOwnership(ctx, file.projectId, userId);

    const now = Date.now();
    await ctx.db.patch(args.id, {
      isDeleted: false,
      updatedAt: now,
      lastModified: now,
    });
    
    const restoredFile = await ctx.db.get(args.id);
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

// Create instruction file in Instructions project
export const createInstructionFile = mutation({
  args: {
    name: v.string(),
    content: v.string(),
    topic: v.optional(v.string()),
    audience: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    // Get the Instructions project for this user
    const instructionsProject = await getInstructionsProject(ctx, userId);
    
    const now = Date.now();
    
    // Create the instruction file
    const fileId = await ctx.db.insert("files", {
      name: args.name,
      type: "document",
      extension: "md",
      content: args.content,
      projectId: instructionsProject._id,
      userId: userId,
      path: "/instructions/",
      mimeType: "text/markdown",
      isDeleted: false,
      lastModified: now,
      createdAt: now,
      updatedAt: now,
    });
    
    return await ctx.db.get(fileId);
  },
});

// Get all instruction files for user
export const getInstructionFiles = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserIdOptional(ctx);
    
    // Return empty array if not authenticated
    if (!userId) {
      return [];
    }
    
    // Get the Instructions project for this user
    const instructionsProject = await getInstructionsProject(ctx, userId);
    
    const files = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", instructionsProject._id))
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .order("desc")
      .collect();
    
    return files;
  },
});

// One-time migration: Rename instruction files to human-readable titles
// (Removed) migrateInstructionFilenames mutation per user request

// Soft delete a file (mark as deleted but keep in database)
export const softDeleteFile = mutation({
  args: {
    id: v.id("files"),
    deletedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    // Get the file to delete
    const file = await ctx.db.get(args.id);
    if (!file) {
      throw new Error("File not found");
    }

    // Verify the user owns this file's project
    await verifyProjectOwnership(ctx, file.projectId, userId);

    // Mark as deleted instead of actually deleting
    await ctx.db.patch(args.id, {
      isDeleted: true,
      updatedAt: Date.now(),
    });

    return { success: true, fileId: args.id };
  },
});

// Get all deleted files for trash view
export const getDeletedFiles = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOptional(ctx);
    
    // Return empty array if not authenticated
    if (!userId) {
      return [];
    }
    
    if (args.projectId) {
      // Verify user owns the project
      await verifyProjectOwnership(ctx, args.projectId, userId);
      
      const deletedFiles = await ctx.db
        .query("files")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .filter((q) => q.eq(q.field("isDeleted"), true))
        .order("desc")
        .collect();
        
      return deletedFiles;
    } else {
      // Get all deleted files for this user
      const deletedFiles = await ctx.db
        .query("files")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("isDeleted"), true))
        .order("desc")
        .collect();
        
      return deletedFiles;
    }
  },
});

// Permanently delete a file (move from files table to deletedFiles table)
export const permanentlyDeleteFile = mutation({
  args: {
    id: v.id("files"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    // Get the file to delete
    const file = await ctx.db.get(args.id);
    if (!file) {
      throw new Error("File not found");
    }

    // Verify the user owns this file's project
    await verifyProjectOwnership(ctx, file.projectId, userId);

    // Only allow permanent deletion of files that are already marked as deleted
    if (!file.isDeleted) {
      throw new Error("File must be in trash before permanent deletion");
    }

    // Get the parent project for reference
    const project = await ctx.db.get(file.projectId);
    const projectName = project?.name || "Unknown Project";

    // Move file to deletedFiles table with all original data
    const deletedFileId = await ctx.db.insert("deletedFiles", {
      originalId: file._id,
      name: file.name,
      type: file.type,
      extension: file.extension,
      content: file.content,
      size: file.size,
      projectId: file.projectId,
      userId: file.userId,
      path: file.path,
      mimeType: file.mimeType,
      originalCreatedAt: file.createdAt,
      originalUpdatedAt: file.updatedAt,
      originalLastModified: file.lastModified,
      platform: file.platform,
      postStatus: file.postStatus,
      scheduledAt: file.scheduledAt,
      deletedAt: Date.now(),
      deletedBy: userId,
      parentProjectName: projectName,
    });

    // Remove the file from the main files table
    await ctx.db.delete(args.id);

    return { 
      success: true, 
      fileId: args.id, 
      deletedFileId,
      movedToDeletedFiles: true 
    };
  },
});

// Get permanently deleted files from deletedFiles table
export const getPermanentlyDeletedFiles = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    if (args.projectId) {
      // Verify user owns the project
      await verifyProjectOwnership(ctx, args.projectId, userId);
      
      // Get deleted files for specific project
      const deletedFiles = await ctx.db
        .query("deletedFiles")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .order("desc")
        .collect();
        
      return deletedFiles;
    } else {
      // Get all deleted files for the user
      const deletedFiles = await ctx.db
        .query("deletedFiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();
        
      return deletedFiles;
    }
  },
});

// Get all content creation files for user
export const getContentCreationFiles = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserIdOptional(ctx);
    
    // Return empty array if not authenticated
    if (!userId) {
      return [];
    }
    
    // Try to get the Content Creation project for this user
    const contentCreationProject = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("name"), "Content Creation"))
      .first();
    
    // Return empty array if no Content Creation project exists yet
    if (!contentCreationProject) {
      return [];
    }
    
    const files = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", contentCreationProject._id))
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .order("desc")
      .collect();
    
    return files;
  },
});

// Create content creation file in Content Creation project
export const createContentCreationFile = mutation({
  args: {
    name: v.string(),
    content: v.string(),
    type: v.optional(v.union(
      v.literal("post"), 
      v.literal("campaign"), 
      v.literal("note"), 
      v.literal("document"),
      v.literal("other")
    )),
    platform: v.optional(v.union(
      v.literal("facebook"),
      v.literal("instagram"), 
      v.literal("twitter"),
      v.literal("linkedin"),
      v.literal("reddit"),
      v.literal("youtube")
    )),
    extension: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    // Ensure the Content Creation project exists for this user
    const contentCreationProject = await ensureContentCreationProjectHelper(ctx, userId);
    
    const now = Date.now();
    
    // Determine appropriate MIME type based on extension
    const extension = args.extension || "md";
    const mimeType = extension === "x" ? "text/plain" : "text/markdown";
    
    // Create the content creation file
    const fileId = await ctx.db.insert("files", {
      name: args.name,
      type: args.type || "post",
      extension: extension,
      content: args.content,
      projectId: contentCreationProject!._id,
      userId: userId,
      path: "/content-creation/",
      platform: args.platform,
      mimeType: mimeType,
      isDeleted: false,
      lastModified: now,
      createdAt: now,
      updatedAt: now,
    });
    
    return await ctx.db.get(fileId);
  },
});

// Get all files for the current user across all projects
export const getAllUserFiles = query({
  args: {},
  handler: async (ctx) => {
    // Be tolerant of first-run where auth identity exists but user profile isn't created yet
    const userId = await getCurrentUserIdOptional(ctx);
    if (!userId) {
      return [];
    }
    
    // Get all projects owned by the user
    const userProjects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    if (userProjects.length === 0) {
      return [];
    }
    
    // Get all files for all user projects
    const allFiles = [];
    for (const project of userProjects) {
      const projectFiles = await ctx.db
        .query("files")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .filter((q) => q.neq(q.field("isDeleted"), true))
        .collect();
      
      allFiles.push(...projectFiles);
    }
    
    return allFiles;
  },
});

// Update file content
export const updateFileContent = mutation({
  args: {
    fileId: v.id("files"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    // Get the file and verify ownership through project
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }
    
    // Verify project ownership
    await verifyProjectOwnership(ctx, file.projectId, userId);
    
    // Update the file content
    await ctx.db.patch(args.fileId, {
      content: args.content,
      size: args.content.length,
      lastModified: Date.now(),
    });
    
    return await ctx.db.get(args.fileId);
  },
});
