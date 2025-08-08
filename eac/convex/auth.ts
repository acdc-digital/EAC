// Authentication Helper for Convex
// /Users/matthewsimon/Projects/eac/eac/convex/auth.ts

import type { MutationCtx, QueryCtx } from "./_generated/server";

export interface AuthContext {
  userId: string | null;
  isAuthenticated: boolean;
  requireAuth: () => string; // Throws if not authenticated
}

/**
 * Enhanced authentication helper that gracefully handles both authenticated and unauthenticated users
 */
export async function getAuthContext(ctx: QueryCtx | MutationCtx): Promise<AuthContext> {
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    return {
      userId: null,
      isAuthenticated: false,
      requireAuth: () => {
        throw new Error("Authentication required. Please sign in to access this feature.");
      }
    };
  }

  // First try to find user by clerk ID
  let user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();
    
  if (user) {
    return {
      userId: user._id,
      isAuthenticated: true,
      requireAuth: () => user!._id
    };
  }
  
  // Fallback to email lookup for legacy users
  if (identity.email) {
    const emailUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (emailUser) {
      return {
        userId: emailUser._id,
        isAuthenticated: true,
        requireAuth: () => emailUser._id
      };
    }
  }

  // User has identity but not in database - surface a clear error and let client call users.upsertUser
  return {
    userId: null,
    isAuthenticated: true, // They have identity, just not in our DB yet
    requireAuth: () => {
      throw new Error("User profile not found. Please complete your registration.");
    }
  };
}

/**
 * Legacy function for backward compatibility
 */
export async function getCurrentUserId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const auth = await getAuthContext(ctx);
  return auth.requireAuth();
}

/**
 * Gets user ID or returns null if not authenticated (non-throwing version)
 */
export async function getCurrentUserIdOptional(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const auth = await getAuthContext(ctx);
  return auth.userId;
}
