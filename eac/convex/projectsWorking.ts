// Minimal working projects functions
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const test = query({
  args: {},
  handler: async () => {
    return "Projects test works!";
  },
});

export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("projects").collect();
  },
});

export const createProject = mutation({
  args: {
    name: v.string(),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("on-hold"))),
    description: v.optional(v.string()),
    projectNo: v.optional(v.string()),
    budget: v.optional(v.number()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      status: args.status || "active",
      description: args.description,
      projectNo: args.projectNo,
      budget: args.budget,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(projectId);
  },
});

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

export const generateProjectNumber = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    return projects.length + 1;
  },
});
