import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Example table for testing
  messages: defineTable({
    text: v.string(),
    author: v.string(),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),
  
  // Add more tables as needed for your EAC dashboard
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // "active", "completed", "on-hold"
    budget: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Make all user fields optional to match existing data
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    authId: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  }).index("by_email", ["email"]),
});
