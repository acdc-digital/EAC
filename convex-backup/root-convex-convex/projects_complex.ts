import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple test function
export const test = query({
  args: {},
  handler: async (ctx) => {
    return "Hello from projects!";
  },
});

// Project interface matching the schema
// Updated to match function signatures - Force redeploy v2
export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: "active" | "completed" | "on-hold";
  createdAt: number;
  updatedAt: number;
  projectNo?: string;
  budget?: number;
  userId?: string;
}

// Generate a unique project number
export const generateProjectNumber = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    // Find highest existing project number
    const maxNumber = projects.reduce((max, project) => {
      if (project.projectNo) {
        const num = parseInt(project.projectNo.replace(/\D/g, ''), 10);
        return Math.max(max, isNaN(num) ? 0 : num);
      }
      return max;
    }, 0);
    return maxNumber + 1;
  },
});

// Create a new project
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    budget: v.optional(v.number()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get next project number
    const projects = await ctx.db.query("projects").collect();
    const maxNumber = projects.reduce((max, project) => {
      if (project.projectNo) {
        const num = parseInt(project.projectNo.replace(/\D/g, ''), 10);
        return Math.max(max, isNaN(num) ? 0 : num);
      }
      return max;
    }, 0);
    const nextNumber = maxNumber + 1;
    const projectNo = `PRJ-${String(nextNumber).padStart(3, '0')}`;

    // Create the project
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      budget: args.budget,
      userId: args.userId,
      status: "active" as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      projectNo,
    });

    return projectId;
  },
});

// Get all projects
export const getProjects = query({
  args: {
    userId: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let projects;
    
    if (args.userId) {
      // Filter by user if provided
      projects = await ctx.db.query("projects")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .collect();
    } else {
      // Get all projects
      projects = await ctx.db.query("projects")
        .order("desc")
        .collect();
    }
    
    // Filter by status if provided
    if (args.status && args.status !== "all") {
      projects = projects.filter(p => p.status === args.status);
    }
    
    return projects;
  },
});

// Get project statistics
export const getProjectStats = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let projects;
    
    if (args.userId) {
      // Filter by user if provided
      projects = await ctx.db.query("projects")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
    } else {
      // Get all projects
      projects = await ctx.db.query("projects").collect();
    }
    
    const total = projects.length;
    const active = projects.filter(p => p.status === "active").length;
    const completed = projects.filter(p => p.status === "completed").length;
    const onHold = projects.filter(p => p.status === "on-hold").length;
    
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

    return {
      total,
      active,
      completed,
      onHold,
      totalBudget,
    };
  },
});

// Update a project
export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("on-hold"))),
    budget: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete a project (soft delete - moves to trash)
export const deleteProject = mutation({
  args: {
    id: v.id("projects"),
    deletedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the project data before deletion
    const project = await ctx.db.get(args.id);
    if (!project) {
      throw new Error("Project not found");
    }

    // Get associated files for this project
    const projectFiles = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("projectId"), args.id))
      .collect();

    // Move to trash (soft delete)
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
      associatedFiles: projectFiles.map(file => ({
        fileId: file._id,
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    });

    // Delete the original project
    await ctx.db.delete(args.id);

    // Delete associated files and move them to trash as well
    for (const file of projectFiles) {
      await ctx.db.insert("deletedFiles", {
        originalId: file._id,
        name: file.name,
        type: file.type,
        extension: file.extension,
        content: file.content,
        size: file.size,
        projectId: args.id,
        userId: file.userId,
        path: file.path,
        mimeType: file.mimeType,
        originalCreatedAt: file.createdAt,
        originalUpdatedAt: file.updatedAt,
        originalLastModified: file.lastModified || file.updatedAt,
        platform: file.platform,
        postStatus: file.postStatus,
        scheduledAt: file.scheduledAt,
        deletedAt: Date.now(),
        deletedBy: args.deletedBy,
        parentProjectName: project.name,
      });
      
      await ctx.db.delete(file._id);
    }

    return {
      deletedProjectId,
      deletedFilesCount: projectFiles.length,
      message: `Project "${project.name}" moved to trash with ${projectFiles.length} associated files`,
    };
  },
});

// Get a single project by ID
export const getProject = query({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
