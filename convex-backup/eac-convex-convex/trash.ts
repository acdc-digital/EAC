// Trash Management Functions
// convex/trash.ts

import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

// Move a project to trash (soft delete)
export const deleteProject = mutation({
  args: {
    id: v.id("projects"),
    deletedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the project to delete
    const project = await ctx.db.get(args.id);
    if (!project) {
      throw new Error("Project not found");
    }

    // Get all associated files
    const associatedFiles = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    // Create snapshot in deletedProjects table
    const deletedProjectId = await ctx.db.insert("deletedProjects", {
      originalId: args.id,
      name: project.name,
      description: project.description,
      status: project.status,
      budget: project.budget,
      projectNo: project.projectNo,
      userId: project.userId,
      originalCreatedAt: project.createdAt,
      originalUpdatedAt: project.updatedAt,
      deletedAt: Date.now(),
      deletedBy: args.deletedBy,
      associatedFiles: associatedFiles.map(file => ({
        fileId: file._id,
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    });

    // Move all associated files to deletedFiles table
    for (const file of associatedFiles) {
      await ctx.db.insert("deletedFiles", {
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
        deletedBy: args.deletedBy,
        parentProjectName: project.name,
      });

      // Delete original file
      await ctx.db.delete(file._id);
    }

    // Delete the original project
    await ctx.db.delete(args.id);

    return deletedProjectId;
  },
});

// Move a single file to trash (soft delete)
export const deleteFile = mutation({
  args: {
    id: v.id("files"),
    deletedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the file to delete
    const file = await ctx.db.get(args.id);
    if (!file) {
      throw new Error("File not found");
    }

    // Get parent project name for reference
    const project = await ctx.db.get(file.projectId);
    const parentProjectName = project?.name || "Unknown Project";

    // Create snapshot in deletedFiles table
    const deletedFileId = await ctx.db.insert("deletedFiles", {
      originalId: args.id,
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
      deletedBy: args.deletedBy,
      parentProjectName: parentProjectName,
    });

    // Delete the original file
    await ctx.db.delete(args.id);

    return deletedFileId;
  },
});

// Get all deleted projects (trash view)
export const getDeletedProjects = query({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("deletedProjects").withIndex("by_deleted_at");
    
    if (args.userId) {
      query = ctx.db.query("deletedProjects").withIndex("by_user", (q) => 
        q.eq("userId", args.userId)
      );
    }

    const results = await query
      .order("desc")
      .take(args.limit || 50);

    return results;
  },
});

// Get all deleted files (trash view)
export const getDeletedFiles = query({
  args: {
    userId: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results;
    
    if (args.userId) {
      results = await ctx.db.query("deletedFiles")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .take(args.limit || 50);
    } else if (args.projectId) {
      results = await ctx.db.query("deletedFiles")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .order("desc")
        .take(args.limit || 50);
    } else {
      results = await ctx.db.query("deletedFiles")
        .withIndex("by_deleted_at")
        .order("desc")
        .take(args.limit || 50);
    }

    return results;
  },
});

// Restore a project from trash
export const restoreProject = mutation({
  args: {
    id: v.id("deletedProjects"),
  },
  handler: async (ctx, args) => {
    // Get the deleted project
    const deletedProject = await ctx.db.get(args.id);
    if (!deletedProject) {
      throw new Error("Deleted project not found");
    }

    // Recreate the original project
    const restoredProjectId = await ctx.db.insert("projects", {
      name: deletedProject.name,
      description: deletedProject.description,
      status: deletedProject.status,
      budget: deletedProject.budget,
      projectNo: deletedProject.projectNo,
      userId: deletedProject.userId,
      createdAt: deletedProject.originalCreatedAt,
      updatedAt: Date.now(), // Update timestamp to now
    });

    // Get all deleted files for this project
    const deletedFiles = await ctx.db
      .query("deletedFiles")
      .withIndex("by_project", (q) => q.eq("projectId", deletedProject.originalId))
      .collect();

    // Restore all associated files
    for (const deletedFile of deletedFiles) {
      await ctx.db.insert("files", {
        name: deletedFile.name,
        type: deletedFile.type,
        extension: deletedFile.extension,
        content: deletedFile.content,
        size: deletedFile.size,
        projectId: restoredProjectId, // Point to the new project ID
        userId: deletedFile.userId,
        path: deletedFile.path,
        mimeType: deletedFile.mimeType,
        lastModified: deletedFile.originalLastModified,
        createdAt: deletedFile.originalCreatedAt,
        updatedAt: Date.now(),
        platform: deletedFile.platform,
        postStatus: deletedFile.postStatus,
        scheduledAt: deletedFile.scheduledAt,
      });

      // Remove from deleted files
      await ctx.db.delete(deletedFile._id);
    }

    // Remove from deleted projects
    await ctx.db.delete(args.id);

    return restoredProjectId;
  },
});

// Restore a single file from trash
export const restoreFile = mutation({
  args: {
    id: v.id("deletedFiles"),
    targetProjectId: v.optional(v.id("projects")), // Allow restoring to different project
  },
  handler: async (ctx, args) => {
    // Get the deleted file
    const deletedFile = await ctx.db.get(args.id);
    if (!deletedFile) {
      throw new Error("Deleted file not found");
    }

    // Use target project or original project
    const projectId = args.targetProjectId || deletedFile.projectId;

    // Verify target project exists
    const targetProject = await ctx.db.get(projectId);
    if (!targetProject) {
      throw new Error("Target project not found");
    }

    // Recreate the original file
    const restoredFileId = await ctx.db.insert("files", {
      name: deletedFile.name,
      type: deletedFile.type,
      extension: deletedFile.extension,
      content: deletedFile.content,
      size: deletedFile.size,
      projectId: projectId,
      userId: deletedFile.userId,
      path: deletedFile.path,
      mimeType: deletedFile.mimeType,
      lastModified: deletedFile.originalLastModified,
      createdAt: deletedFile.originalCreatedAt,
      updatedAt: Date.now(),
      platform: deletedFile.platform,
      postStatus: deletedFile.postStatus,
      scheduledAt: deletedFile.scheduledAt,
    });

    // Remove from deleted files
    await ctx.db.delete(args.id);

    return restoredFileId;
  },
});

// Permanently delete a project from trash
export const permanentlyDeleteProject = mutation({
  args: {
    id: v.id("deletedProjects"),
  },
  handler: async (ctx, args) => {
    // Get the deleted project
    const deletedProject = await ctx.db.get(args.id);
    if (!deletedProject) {
      throw new Error("Deleted project not found");
    }

    // Get all associated deleted files and permanently delete them
    const deletedFiles = await ctx.db
      .query("deletedFiles")
      .withIndex("by_project", (q) => q.eq("projectId", deletedProject.originalId))
      .collect();

    for (const deletedFile of deletedFiles) {
      await ctx.db.delete(deletedFile._id);
    }

    // Permanently delete the project
    await ctx.db.delete(args.id);

    return args.id;
  },
});

// Permanently delete a single file from trash
export const permanentlyDeleteFile = mutation({
  args: {
    id: v.id("deletedFiles"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Get trash statistics
export const getTrashStats = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let deletedProjects, deletedFiles;

    if (args.userId) {
      [deletedProjects, deletedFiles] = await Promise.all([
        ctx.db.query("deletedProjects")
          .withIndex("by_user", (q) => q.eq("userId", args.userId!))
          .collect(),
        ctx.db.query("deletedFiles")
          .withIndex("by_user", (q) => q.eq("userId", args.userId!))
          .collect()
      ]);
    } else {
      [deletedProjects, deletedFiles] = await Promise.all([
        ctx.db.query("deletedProjects").collect(),
        ctx.db.query("deletedFiles").collect()
      ]);
    }

    // Calculate oldest item for cleanup notification
    const allDeletionDates = [
      ...deletedProjects.map(p => p.deletedAt),
      ...deletedFiles.map(f => f.deletedAt)
    ];
    
    const oldestDeletion = allDeletionDates.length > 0 ? Math.min(...allDeletionDates) : null;
    const daysSinceOldest = oldestDeletion ? Math.floor((Date.now() - oldestDeletion) / (1000 * 60 * 60 * 24)) : 0;

    return {
      projectCount: deletedProjects.length,
      fileCount: deletedFiles.length,
      totalSize: deletedFiles.reduce((sum, file) => sum + (file.size || 0), 0),
      oldestItemAge: daysSinceOldest,
      itemsNearExpiry: [...deletedProjects, ...deletedFiles].filter(
        item => (Date.now() - item.deletedAt) > (25 * 24 * 60 * 60 * 1000) // 25+ days old
      ).length,
    };
  },
});

// Internal function for automated cleanup (called by cron job)
export const cleanupExpiredTrash = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
    
    // Find expired deleted projects
    const expiredProjects = await ctx.db
      .query("deletedProjects")
      .withIndex("by_deleted_at")
      .filter((q) => q.lt(q.field("deletedAt"), thirtyDaysAgo))
      .collect();

    // Find expired deleted files
    const expiredFiles = await ctx.db
      .query("deletedFiles")
      .withIndex("by_deleted_at")
      .filter((q) => q.lt(q.field("deletedAt"), thirtyDaysAgo))
      .collect();

    // Permanently delete expired projects
    for (const project of expiredProjects) {
      await ctx.db.delete(project._id);
    }

    // Permanently delete expired files
    for (const file of expiredFiles) {
      await ctx.db.delete(file._id);
    }

    console.log(`🗑️ Automatic cleanup completed: ${expiredProjects.length} projects, ${expiredFiles.length} files permanently deleted`);
    
    return {
      deletedProjectsCount: expiredProjects.length,
      deletedFilesCount: expiredFiles.length,
      totalCleaned: expiredProjects.length + expiredFiles.length,
    };
  },
});
