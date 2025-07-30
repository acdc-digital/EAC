import type { MutationCtx, QueryCtx } from "./_generated/server";

// Helper function to get current user from authentication context
export async function getCurrentUserOrThrow(ctx: QueryCtx | MutationCtx) {
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
    return user;
  }
  
  // Fallback to email lookup for legacy users
  if (identity.email) {
    const emailUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (emailUser) {
      return emailUser;
    }
  }
  
  throw new Error("User not found in database. Please contact support.");
}

// Helper function to get current user ID from authentication context
export async function getCurrentUserId(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUserOrThrow(ctx);
  return user._id;
}

// Helper function to verify project ownership
export async function verifyProjectOwnership(ctx: QueryCtx | MutationCtx, projectId: any, userId: any) {
  const project = await ctx.db.get(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  // Ensure the project belongs to the current user
  // Check if this is a projects table document
  if ('userId' in project && project.userId !== userId) {
    throw new Error("Not authorized to access this project");
  }
  return project;
}

// Helper function to verify file ownership (via project ownership)
export async function verifyFileOwnership(ctx: QueryCtx | MutationCtx, fileId: any, userId: any) {
  const file = await ctx.db.get(fileId);
  if (!file) {
    throw new Error("File not found");
  }
  
  // Verify the user owns the project this file belongs to
  // Check if this is a files table document
  if ('projectId' in file && file.projectId) {
    await verifyProjectOwnership(ctx, file.projectId, userId);
  }
  return file;
}

// Helper function to get user's projects
export async function getUserProjects(ctx: QueryCtx | MutationCtx, userId: any) {
  return await ctx.db
    .query("projects")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
}

// Helper function to get user's files across all projects
export async function getUserFiles(ctx: QueryCtx | MutationCtx, userId: any) {
  return await ctx.db
    .query("files")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.neq(q.field("isDeleted"), true))
    .collect();
}
