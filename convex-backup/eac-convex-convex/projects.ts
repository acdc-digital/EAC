import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple test query - FRESH DEPLOY
export const test = query({
  args: {},
  handler: async () => {
    return "Hello from projects - FRESH!";
  },
});

// Basic getProjects query
export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("projects").collect();
  },
});

// Basic createProject mutation
export const createProject = mutation({
  args: {
    name: v.string(),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("on-hold"))),
    projectNo: v.optional(v.union(v.string(), v.number())),
    description: v.optional(v.string()),
    budget: v.optional(v.number()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      status: args.status || "active" as const,
      projectNo: args.projectNo ? String(args.projectNo) : undefined,
      description: args.description,
      budget: args.budget,
      userId: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return await ctx.db.get(projectId);
  },
});

// Basic getProjectStats query
export const getProjectStats = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    return {
      total: projects.length,
      active: projects.filter(p => p.status === "active").length,
    };
  },
});

// Basic generateProjectNumber query
export const generateProjectNumber = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    return projects.length + 1;
  },
});
