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
    const userId = await getCurrentUserId(ctx);
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
    const userId = await getCurrentUserId(ctx);
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
    const userId = await getCurrentUserId(ctx);
    
    const instructionsProject = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("name"), "Instructions"))
      .first();
    
    return instructionsProject;
  },
});

// User-scoped generateProjectNumber query
export const generateProjectNumber = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
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
