import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserIdOptional } from "./auth";
import { getCurrentUserOrThrow } from "./utils";

// Query to get chat messages for a session (user-specific)
export const getChatMessages = query({
  args: {
    sessionId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get authenticated user - return empty if not authenticated
    const userId = await getCurrentUserIdOptional(ctx);
    if (!userId) {
      return [];
    }
    
    if (args.sessionId) {
      // Get both authenticated user messages and progress messages for this session
      const userMessages = await ctx.db
        .query("chatMessages")
        .withIndex("by_user_session", (q) =>
          q.eq("userId", userId).eq("sessionId", args.sessionId)
        )
        .order("desc")
        .take(args.limit ?? 500);
        
      // Also get progress messages for this session
      const progressMessages = await ctx.db
        .query("chatMessages")
        .withIndex("by_session", (q) =>
          q.eq("sessionId", args.sessionId)
        )
        .filter((q) => q.eq(q.field("userId"), "progress_user"))
        .order("desc")
        .take(args.limit ?? 500);
        
      // Combine and sort by creation time
      const allMessages = [...userMessages, ...progressMessages].sort((a, b) => a.createdAt - b.createdAt);
      return allMessages;
    } else {
      // Get all messages for this user if no session specified
      const messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .take(args.limit ?? 500);
      return messages.reverse(); // Reverse to get chronological order
    }
  },
});

// Mutation to store a chat message (user-specific)
export const storeChatMessage = mutation({
  args: {
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system"), v.literal("terminal"), v.literal("thinking")),
    content: v.string(),
    sessionId: v.optional(v.string()),
    operation: v.optional(v.object({
      type: v.union(
        v.literal("file_created"), 
        v.literal("project_created"), 
        v.literal("tool_executed"), 
        v.literal("error")
      ),
      details: v.optional(v.any()),
    })),
    processIndicator: v.optional(v.object({
      type: v.union(v.literal("continuing"), v.literal("waiting")),
      processType: v.string(),
      color: v.union(v.literal("blue"), v.literal("green")),
    })),
    interactiveComponent: v.optional(v.object({
      type: v.union(v.literal("project_selector"), v.literal("file_name_input"), v.literal("file_type_selector"), v.literal("file_selector"), v.literal("edit_instructions_input"), v.literal("multi_file_selector")),
      data: v.optional(v.any()),
      status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
      result: v.optional(v.any()),
    })),
  },
  handler: async (ctx, args) => {
    // Get authenticated user - only store messages if authenticated
    const userId = await getCurrentUserIdOptional(ctx);
    if (!userId) {
      console.log("⚠️ Attempted to store chat message while unauthenticated - skipping");
      return null; // Return null instead of throwing
    }
    
    const messageId = await ctx.db.insert("chatMessages", {
      role: args.role,
      content: args.content,
      sessionId: args.sessionId,
      userId: userId,
      createdAt: Date.now(),
      ...(args.operation && { operation: args.operation }),
      ...(args.processIndicator && { processIndicator: args.processIndicator }),
      ...(args.interactiveComponent && { interactiveComponent: args.interactiveComponent }),
    });
    
    return messageId;
  },
});

// Mutation to store progress messages without authentication requirement
// Used for agent progress updates when user may not be authenticated for backend operations
export const storeProgressMessage = mutation({
  args: {
    role: v.union(v.literal("thinking"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    sessionId: v.string(),
    isTemporary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // For progress messages, we'll use a generic user identifier or store without userId
    // This allows us to show progress even when backend operations aren't authenticated
    const messageId = await ctx.db.insert("chatMessages", {
      role: args.role,
      content: args.content,
      sessionId: args.sessionId,
      userId: "progress_user", // Generic identifier for progress messages
      createdAt: Date.now(),
      isTemporary: args.isTemporary ?? true,
    });
    
    return messageId;
  },
});

// Mutation to store agent progress updates (for pinned progress bar)
export const storeAgentProgress = mutation({
  args: {
    sessionId: v.string(),
    agentType: v.string(),
    percentage: v.number(),
    status: v.string(),
    isComplete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Store or update progress for this session and agent type
    const existingProgress = await ctx.db
      .query("agentProgress")
      .withIndex("by_session_agent", (q) =>
        q.eq("sessionId", args.sessionId).eq("agentType", args.agentType)
      )
      .first();

    if (existingProgress) {
      // Update existing progress
      await ctx.db.patch(existingProgress._id, {
        percentage: args.percentage,
        status: args.status,
        isComplete: args.isComplete ?? false,
        updatedAt: Date.now(),
      });
      return existingProgress._id;
    } else {
      // Create new progress entry
      const progressId = await ctx.db.insert("agentProgress", {
        sessionId: args.sessionId,
        agentType: args.agentType,
        percentage: args.percentage,
        status: args.status,
        isComplete: args.isComplete ?? false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return progressId;
    }
  },
});

// Query to get current agent progress for a session
export const getAgentProgress = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("agentProgress")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("isComplete"), false))
      .collect();
    
    return progress;
  },
});

// Mutation to clear completed agent progress
export const clearAgentProgress = mutation({
  args: {
    sessionId: v.string(),
    agentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.agentType) {
      // Clear specific agent progress
      const agentType = args.agentType; // Store in variable to satisfy TypeScript
      const progress = await ctx.db
        .query("agentProgress")
        .withIndex("by_session_agent", (q) =>
          q.eq("sessionId", args.sessionId).eq("agentType", agentType)
        )
        .first();
      
      if (progress) {
        await ctx.db.delete(progress._id);
      }
    } else {
      // Clear all progress for session
      const allProgress = await ctx.db
        .query("agentProgress")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
        .collect();
      
      for (const progress of allProgress) {
        await ctx.db.delete(progress._id);
      }
    }
  },
});

// Mutation to update interactive component status
export const updateInteractiveComponent = mutation({
  args: {
    messageId: v.id("chatMessages"),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
    result: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const userId = await getCurrentUserIdOptional(ctx);
    if (!userId) {
      console.log("⚠️ Attempted to update interactive component while unauthenticated - skipping");
      return null;
    }

    // Get the message and verify ownership
    const message = await ctx.db.get(args.messageId);
    if (!message || message.userId !== userId) {
      throw new Error("Message not found or access denied");
    }

    // Update the interactive component
    await ctx.db.patch(args.messageId, {
      interactiveComponent: {
        ...(message.interactiveComponent || {}),
        status: args.status,
        ...(args.result && { result: args.result }),
      },
    });

    return args.messageId;
  },
});

// Mutation to clear chat history for a session (user-specific)
export const clearChatHistory = mutation({
  args: {
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const user = await getCurrentUserOrThrow(ctx);
    let messages;
    
    if (args.sessionId) {
      messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_user_session", (q) =>
          q.eq("userId", user._id).eq("sessionId", args.sessionId)
        )
        .collect();
    } else {
      // Clear all messages for this user
      messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
    }
    
    // Delete all messages
    await Promise.all(
      messages.map(message => ctx.db.delete(message._id))
    );

    return { deleted: messages.length };
  },
});

// Mutation to update a chat message (for streaming updates)
export const updateChatMessage = mutation({
  args: {
    messageId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Update the message content
    await ctx.db.patch(args.messageId as any, {
      content: args.content,
    });
    
    return { success: true };
  },
});

// Query to get all unique sessions for a user
export const getUserSessions = query({
  args: {},
  handler: async (ctx) => {
    try {
      // Get authenticated user - return empty if not authenticated
      const userId = await getCurrentUserIdOptional(ctx);
      if (!userId) {
        return [];
      }
      
      // Get all deleted sessions for this user
      const deletedSessions = await ctx.db
        .query("chatSessions")
        .withIndex("by_user_not_deleted", (q) => 
          q.eq("userId", userId).eq("isDeleted", true)
        )
        .collect();
      
      const deletedSessionIds = new Set(deletedSessions.map(s => s.sessionId));
      
      // Get all active chatSessions records for this user (these have token tracking)
      const chatSessions = await ctx.db
        .query("chatSessions")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.neq(q.field("isDeleted"), true)) // Exclude deleted sessions
        .collect();
      
      // Get all messages for this user
      const messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
    
    // Create session map starting with chatSessions records (these have token data)
    const sessionMap = new Map<string, {
      sessionId: string;
      lastActivity: number;
      messageCount: number;
      preview: string;
    }>();
    
    // Helper function to safely create preview text
    const createSafePreview = (content: string): string => {
      try {
        if (!content || typeof content !== 'string') {
          return 'No preview available';
        }
        
        // Remove or replace problematic characters that might break JSON parsing
        const sanitized = content
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
          .replace(/\\(?![\\"/bfnrt]|u[0-9a-fA-F]{4})/g, '') // Remove invalid escape sequences
          .replace(/\\/g, '') // Remove all backslashes to be safe
          .replace(/"/g, "'") // Replace quotes with single quotes
          .replace(/\n/g, ' ') // Replace newlines with spaces
          .replace(/\r/g, ' ') // Replace carriage returns with spaces
          .replace(/\t/g, ' ') // Replace tabs with spaces
          .replace(/\s+/g, ' ') // Collapse multiple spaces
          .trim();
        
        // Additional safety: only use ASCII printable characters
        const asciiOnly = sanitized.replace(/[^\x20-\x7E]/g, '');
        
        if (!asciiOnly) {
          return 'No readable content';
        }
        
        return asciiOnly.substring(0, 50) + (asciiOnly.length > 50 ? '...' : '');
      } catch (error) {
        console.error('Error creating preview:', error);
        return 'Preview unavailable';
      }
    };

    // First, add sessions from chatSessions table (these have proper token tracking)
    chatSessions.forEach(session => {
      if (!deletedSessionIds.has(session.sessionId)) {
        const safePreview = session.preview ? createSafePreview(session.preview) : 
                           session.title ? createSafePreview(session.title) : 
                           'No messages yet';
        
        sessionMap.set(session.sessionId, {
          sessionId: session.sessionId,
          lastActivity: session.lastActivity,
          messageCount: session.messageCount,
          preview: safePreview,
        });
      }
    });
    
    // Then, update with message data and add message-only sessions (for backwards compatibility)
    messages.forEach(message => {
      try {
        if (message.sessionId && !deletedSessionIds.has(message.sessionId)) {
          const existing = sessionMap.get(message.sessionId);
          if (!existing) {
            // This is a session with messages but no chatSessions record (legacy data)
            sessionMap.set(message.sessionId, {
              sessionId: message.sessionId,
              lastActivity: message.createdAt,
              messageCount: 1,
              preview: createSafePreview(message.content || ''),
            });
          } else {
            // Update existing session with latest message data
            if (message.createdAt > existing.lastActivity) {
              existing.lastActivity = message.createdAt;
              existing.preview = createSafePreview(message.content || '');
            }
          }
        }
      } catch (messageError) {
        console.error('Error processing message for session:', message.sessionId, messageError);
        // Skip this message but continue processing others
      }
    });
    
    // Convert to array and sort by last activity
    return Array.from(sessionMap.values())
      .sort((a, b) => b.lastActivity - a.lastActivity);
      
    } catch (error) {
      console.error('Error in getUserSessions:', error);
      // Return empty array if there's any error to prevent crashes
      return [];
    }
  },
});

// Mutation to soft delete a chat session (user-specific)
export const deleteSession = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const userId = await getCurrentUserIdOptional(ctx);
    if (!userId) {
      throw new Error("Authentication required to delete session");
    }

    // Find existing chatSessions record for this sessionId and user
    const existingSession = await ctx.db
      .query("chatSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existingSession) {
      // Update existing session record
      await ctx.db.patch(existingSession._id, {
        isDeleted: true,
        lastActivity: Date.now(), // Update timestamp for audit trail
      });
    } else {
      // Create a new session record marked as deleted
      // This handles cases where session was derived from messages but no session record exists
      await ctx.db.insert("chatSessions", {
        sessionId: args.sessionId,
        userId: userId,
        totalTokens: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCost: 0,
        messageCount: 0,
        isActive: false,
        isDeleted: true,
        maxTokensAllowed: 180000,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        title: "Deleted Session",
        preview: "This session has been deleted",
      });
    }

    // Note: We keep the chat messages in the database for data integrity,
    // but they won't be shown in the UI since the session is marked as deleted
    
    return { success: true, deletedSessionId: args.sessionId };
  },
});
