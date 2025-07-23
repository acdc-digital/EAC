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

// Delete a project
export const deleteProject = mutation({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
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
