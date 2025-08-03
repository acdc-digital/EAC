// Social Connections - Copy of essential functions from root convex folder
// /Users/matthewsimon/Projects/eac/eac/convex/socialConnections.ts

import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server";

export const getSocialConnections = query({
  args: {
    userId: v.string(),
    platform: v.optional(v.union(
      v.literal("facebook"),
      v.literal("instagram"),
      v.literal("twitter"),
      v.literal("reddit")
    )),
  },
  handler: async (ctx, args) => {
    if (args.platform) {
      // Use the compound index when platform is specified
      return await ctx.db
        .query("socialConnections")
        .withIndex("by_user", (q) =>
          q.eq("userId", args.userId).eq("platform", args.platform!)
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    } else {
      // Use the by_active index when no platform is specified
      return await ctx.db
        .query("socialConnections")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }
  },
});

export const getConnectionById = internalQuery({
  args: {
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.connectionId);
  },
});
