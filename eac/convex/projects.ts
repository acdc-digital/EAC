import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthContext, getCurrentUserId, getCurrentUserIdOptional } from "./auth";

// Simple test query - FRESH DEPLOY
export const test = query({
  args: {},
  handler: async () => {
    return "Hello from projects - FRESH!";
  },
});

// User-scoped getProjects query
export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContext(ctx);
    
    // If not authenticated, return empty array instead of throwing
    if (!auth.isAuthenticated) {
      return [];
    }

    const userId = auth.requireAuth();
    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// User-scoped createProject mutation
export const createProject = mutation({
  args: {
    name: v.string(),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("on-hold"))),
    projectNo: v.optional(v.union(v.string(), v.number())),
    description: v.optional(v.string()),
    budget: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      status: args.status || "active" as const,
      projectNo: args.projectNo ? String(args.projectNo) : undefined,
      description: args.description,
      budget: args.budget,
      userId: userId, // Always use authenticated user's ID
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return await ctx.db.get(projectId);
  },
});

// User-scoped getProjectStats query
export const getProjectStats = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContext(ctx);
    
    // If not authenticated, return empty stats
    if (!auth.isAuthenticated) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        onHold: 0,
      };
    }

    const userId = auth.requireAuth();
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
      
    return {
      total: projects.length,
      active: projects.filter(p => p.status === "active").length,
      completed: projects.filter(p => p.status === "completed").length,
      onHold: projects.filter(p => p.status === "on-hold").length,
    };
  },
});

// Ensure Instructions project exists for user
export const ensureInstructionsProject = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    
    // Check if Instructions project already exists for this user
    const existingInstructions = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("name"), "Instructions"))
      .first();
    
    if (existingInstructions) {
      return existingInstructions;
    }
    
    // Create Instructions project
    const now = Date.now();
    const instructionsProjectId = await ctx.db.insert("projects", {
      name: "Instructions",
      description: "Project instruction documents and context for AI assistance",
      status: "active" as const,
      userId: userId,
      createdAt: now,
      updatedAt: now,
    });
    
    return await ctx.db.get(instructionsProjectId);
  },
});

// Get Instructions project for user
export const getInstructionsProject = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContext(ctx);
    
    // Return null if not authenticated instead of throwing
    if (!auth.isAuthenticated || !auth.userId) {
      return null;
    }
    
    const instructionsProject = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", auth.userId!))
      .filter((q) => q.eq(q.field("name"), "Instructions"))
      .first();
    
    return instructionsProject;
  },
});

// Ensure Content Creation project exists for user
export const ensureContentCreationProject = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    
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
  },
});

// Get Content Creation project for user
export const getContentCreationProject = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContext(ctx);
    
    // Return null if not authenticated instead of throwing
    if (!auth.isAuthenticated || !auth.userId) {
      return null;
    }
    
    const contentCreationProject = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", auth.userId!))
      .filter((q) => q.eq(q.field("name"), "Content Creation"))
      .first();
    
    return contentCreationProject;
  },
});

// User-scoped generateProjectNumber query
export const generateProjectNumber = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserIdOptional(ctx);
    
    // Return 1 if not authenticated (default project number)
    if (!userId) {
      return 1;
    }
    
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return projects.length + 1;
  },
});

// User-scoped updateProject mutation
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("on-hold"))),
    description: v.optional(v.string()),
    budget: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    // First verify the project belongs to the current user
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.userId !== userId) {
      throw new Error("Not authorized to update this project");
    }
    
    await ctx.db.patch(args.projectId, {
      ...(args.name && { name: args.name }),
      ...(args.status && { status: args.status }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.budget !== undefined && { budget: args.budget }),
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(args.projectId);
  },
});

// User-scoped deleteProject mutation
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    // First verify the project belongs to the current user
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.userId !== userId) {
      throw new Error("Not authorized to delete this project");
    }
    
    // Move to deleted projects table before deleting
    await ctx.db.insert("deletedProjects", {
      originalId: project._id,
      name: project.name,
      description: project.description,
      status: project.status,
      budget: project.budget,
      projectNo: project.projectNo,
      userId: project.userId,
      originalCreatedAt: project.createdAt,
      originalUpdatedAt: project.updatedAt,
      deletedAt: Date.now(),
      deletedBy: userId,
    });
    
    await ctx.db.delete(args.projectId);
    return { success: true };
  },
});

// User-scoped getProjectById query
export const getProjectById = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      return null;
    }
    
    // Ensure user can only access their own projects
    if (project.userId !== userId) {
      throw new Error("Not authorized to access this project");
    }
    
    return project;
  },
});
