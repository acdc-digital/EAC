// X API Integration - Simplified version for X posting
// /Users/matthewsimon/Projects/eac/eac/convex/xApiActions.ts

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

interface TweetResponse {
  success: boolean;
  data?: {
    id: string;
    text: string;
    edit_history_tweet_ids: string[];
  };
  error?: string;
}

interface MediaUploadResponse {
  success: boolean;
  media_id_string?: string;
  error?: string;
}

export const createTweet = action({
  args: {
    connectionId: v.id("socialConnections"),
    text: v.string(),
    mediaIds: v.optional(v.array(v.string())),
    replyToId: v.optional(v.string()),
    replySettings: v.optional(v.union(
      v.literal("following"),
      v.literal("mentionedUsers"),
      v.literal("subscribers"),
      v.literal("verified")
    )),
  },
  handler: async (ctx, args): Promise<TweetResponse> => {
    console.log("🔍 createTweet action called with args:", {
      connectionId: args.connectionId,
      textLength: args.text.length,
      hasMediaIds: !!args.mediaIds?.length,
      hasReplyToId: !!args.replyToId,
      replySettings: args.replySettings
    });

    try {
      // Get the connection
      const connection = await ctx.runQuery(internal.socialConnections.getConnectionById, {
        connectionId: args.connectionId,
      });

      console.log("🔍 Connection lookup result:", {
        connectionExists: !!connection,
        platform: connection?.platform,
        username: connection?.username,
        hasAccessToken: !!connection?.accessToken,
        hasTwitterAccessToken: !!connection?.twitterAccessToken,
        allKeys: connection ? Object.keys(connection) : []
      });

      if (!connection?.twitterAccessToken) {
        console.error("❌ No Twitter access token found in createTweet:", { 
          connectionExists: !!connection,
          platform: connection?.platform,
          username: connection?.username,
          hasAnyToken: !!(connection?.twitterAccessToken || connection?.accessToken),
          tokenKeys: connection ? Object.keys(connection).filter(key => key.includes('token') || key.includes('Token')) : []
        });
        return {
          success: false,
          error: "Connection not found or not authenticated",
        };
      }

      console.log("🔑 Using Twitter token in createTweet:", { 
        tokenLength: connection.twitterAccessToken.length,
        tokenPrefix: connection.twitterAccessToken.substring(0, 10) + '...',
        username: connection.username,
        platform: connection.platform
      });

      // Build tweet payload
      const tweetPayload = {
        text: args.text,
        ...(args.mediaIds && args.mediaIds.length > 0 && {
          media: {
            media_ids: args.mediaIds,
          }
        }),
        ...(args.replyToId && {
          reply: {
            in_reply_to_tweet_id: args.replyToId,
          }
        }),
        ...(args.replySettings && {
          reply_settings: args.replySettings,
        })
      };

      console.log("🐦 Posting tweet with payload:", { 
        text: args.text.substring(0, 50) + (args.text.length > 50 ? '...' : ''),
        hasMedia: !!args.mediaIds?.length,
        hasReply: !!args.replyToId,
        replySettings: args.replySettings,
        fullPayload: tweetPayload
      });

      // Make API call to X
      const response = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${connection.twitterAccessToken}`,
          "Content-Type": "application/json",
          "User-Agent": "EACDashboard/1.0",
        },
        body: JSON.stringify(tweetPayload),
      });

      const responseData = await response.json();
      console.log("🐦 X API Response:", { status: response.status, data: responseData });

      if (!response.ok) {
        const errorMessage = responseData.detail || responseData.title || responseData.error || `HTTP ${response.status}`;
        console.error("❌ X API Error:", { status: response.status, error: errorMessage, responseData });
        
        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: true,
        data: responseData.data,
      };
    } catch (error) {
      console.error("❌ X API Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const uploadMedia = action({
  args: {
    connectionId: v.id("socialConnections"),
    mediaData: v.string(), // Base64 encoded data
    mediaType: v.string(),
  },
  handler: async (ctx, args): Promise<MediaUploadResponse> => {
    try {
      // Get the connection
      const connection = await ctx.runQuery(internal.socialConnections.getConnectionById, {
        connectionId: args.connectionId,
      });

      if (!connection?.twitterAccessToken) {
        return {
          success: false,
          error: "Connection not found or not authenticated",
        };
      }

      // For now, return a mock response since media upload is complex
      // In production, you'd implement the full Twitter media upload API
      console.log("� Mock media upload for file type:", args.mediaType);
      
      return {
        success: true,
        media_id_string: `media_mock_${Date.now()}`,
      };
    } catch (error) {
      console.error("❌ X Media Upload Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
