import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple test query
export const test = query({
  args: {},
  handler: async () => {
    return "Hello from projects!";
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
  },
  handler: async (ctx, args) => {
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      status: "active" as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return projectId;
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
