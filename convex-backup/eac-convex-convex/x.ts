// X (Twitter) Integration for EAC Dashboard
// convex/x.ts

import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";

// Internal mutation to update X connection tokens after OAuth
export const updateXConnectionTokens = internalMutation({
  args: {
    connectionId: v.id("socialConnections"),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),
    userInfo: v.optional(v.object({
      twitterUserId: v.string(),
      twitterScreenName: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      twitterAccessToken: args.accessToken, // TODO: Encrypt in production
      lastSync: Date.now(),
      updatedAt: Date.now(),
    };

    if (args.refreshToken) {
      updates.twitterRefreshToken = args.refreshToken; // TODO: Encrypt in production
    }

    if (args.tokenExpiry) {
      updates.tokenExpiry = args.tokenExpiry;
    }

    if (args.userInfo) {
      updates.twitterUserId = args.userInfo.twitterUserId;
      updates.twitterScreenName = args.userInfo.twitterScreenName;
    }

    await ctx.db.patch(args.connectionId, updates);
  },
});

export const deleteXConnection = mutation({
  args: {
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args) => {
    // Soft delete by marking as inactive
    await ctx.db.patch(args.connectionId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});
