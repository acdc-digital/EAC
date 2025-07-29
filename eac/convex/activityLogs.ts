// Activity Logs Convex Functions
// /Users/matthewsimon/Projects/eac/eac/convex/activityLogs.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new activity log entry
export const createLog = mutation({
  args: {
    userId: v.optional(v.string()),
    type: v.union(v.literal('success'), v.literal('error'), v.literal('warning'), v.literal('info')),
    category: v.union(
      v.literal('social'),
      v.literal('file'),
      v.literal('project'),
      v.literal('connection'),
      v.literal('debug'),
      v.literal('system')
    ),
    action: v.string(),
    message: v.string(),
    details: v.optional(v.string()), // JSON string
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    const logId = await ctx.db.insert("activityLogs", {
      ...args,
      timestamp,
    });

    return await ctx.db.get(logId);
  },
});

// Get recent activity logs
export const getRecentLogs = query({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
    category: v.optional(v.union(
      v.literal('social'),
      v.literal('file'),
      v.literal('project'),
      v.literal('connection'),
      v.literal('debug'),
      v.literal('system')
    )),
    type: v.optional(v.union(v.literal('success'), v.literal('error'), v.literal('warning'), v.literal('info'))),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 100, category, type } = args;
    
    // Start with timestamp index for ordering
    let logs = await ctx.db
      .query("activityLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit * 3); // Get more to filter
    
    // Apply filters
    logs = logs.filter(log => {
      if (userId && log.userId !== userId) return false;
      if (category && log.category !== category) return false;
      if (type && log.type !== type) return false;
      return true;
    });
    
    // Return only the requested limit
    return logs.slice(0, limit);
  },
});

// Get activity statistics
export const getActivityStats = query({
  args: {
    userId: v.optional(v.string()),
    timeRange: v.optional(v.number()), // Hours to look back
  },
  handler: async (ctx, args) => {
    const { userId, timeRange = 24 } = args;
    const cutoffTime = Date.now() - (timeRange * 60 * 60 * 1000);
    
    let query = ctx.db.query("activityLogs")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", cutoffTime));
    
    if (userId) {
      query = query.filter((q) => q.eq(q.field("userId"), userId));
    }
    
    const logs = await query.collect();
    
    const stats = {
      total: logs.length,
      byType: {
        success: 0,
        error: 0,
        warning: 0,
        info: 0,
      },
      byCategory: {
        social: 0,
        file: 0,
        project: 0,
        connection: 0,
        debug: 0,
        system: 0,
      },
      recentActivity: logs.length,
    };
    
    logs.forEach((log) => {
      stats.byType[log.type]++;
      stats.byCategory[log.category]++;
    });
    
    return stats;
  },
});

// Cleanup old logs (keep only last 30 days)
export const cleanupOldLogs = mutation({
  args: {
    daysToKeep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { daysToKeep = 30 } = args;
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    const oldLogs = await ctx.db
      .query("activityLogs")
      .withIndex("by_timestamp", (q) => q.lt("timestamp", cutoffTime))
      .collect();
    
    for (const log of oldLogs) {
      await ctx.db.delete(log._id);
    }
    
    return { deletedCount: oldLogs.length };
  },
});

// Bulk create logs (for syncing from client)
export const createBulkLogs = mutation({
  args: {
    logs: v.array(v.object({
      userId: v.optional(v.string()),
      type: v.union(v.literal('success'), v.literal('error'), v.literal('warning'), v.literal('info')),
      category: v.union(
        v.literal('social'),
        v.literal('file'),
        v.literal('project'),
        v.literal('connection'),
        v.literal('debug'),
        v.literal('system')
      ),
      action: v.string(),
      message: v.string(),
      details: v.optional(v.string()),
      timestamp: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const results = [];
    
    for (const logData of args.logs) {
      const logId = await ctx.db.insert("activityLogs", logData);
      const log = await ctx.db.get(logId);
      results.push(log);
    }
    
    return results;
  },
});
