/**
 * X (Twitter) API Integration for EAC Dashboard
 * 
 * Handles OAuth 2.0 PKCE authentication and tweet operations
 * Following the patterns established in redditApi.ts
 */

import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { action } from "./_generated/server";

interface XApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

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

// OAuth 2.0 PKCE Authentication for X
export const authenticateX = action({
  args: {
    code: v.string(),
    codeVerifier: v.string(),
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args): Promise<XApiResponse> => {
    try {
      // Get the connection
      const connection = await ctx.runQuery(api.x.getXConnectionById, {
        connectionId: args.connectionId,
      });

      if (!connection) {
        return {
          success: false,
          message: "Connection not found",
          error: "Connection not found",
        };
      }

      // Exchange authorization code for access token using PKCE
      const tokenUrl = "https://api.twitter.com/2/oauth2/token";
      
      const tokenResponse: Response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${connection.twitterClientId}:${connection.twitterClientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: args.code,
          redirect_uri: process.env.TWITTER_REDIRECT_URI || "http://localhost:3000/api/auth/twitter/callback",
          code_verifier: args.codeVerifier,
        }),
      });

      const tokenData: any = await tokenResponse.json();

      if (!tokenResponse.ok) {
        return {
          success: false,
          message: `Token exchange failed: ${tokenData.error || "Unknown error"}`,
          error: tokenData.error_description || tokenData.error || "Token exchange failed",
        };
      }

      // Get user info
      const userResponse: Response = await fetch("https://api.twitter.com/2/users/me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const userData: any = await userResponse.json();

      if (!userResponse.ok) {
        return {
          success: false,
          message: "Failed to get user info",
          error: userData.error || "Failed to get user info",
        };
      }

      // Update connection with tokens
      await ctx.runMutation(internal.x.updateXConnectionTokens, {
        connectionId: args.connectionId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        userInfo: {
          twitterUserId: userData.data?.id,
          twitterScreenName: userData.data?.username,
        },
      });

      return {
        success: true,
        message: "Authentication successful",
        data: {
          user: userData.data,
        },
      };
    } catch (error) {
      console.error("❌ X authentication error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Authentication failed",
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    }
  },
});

// Create a tweet
export const createTweet = action({
  args: {
    connectionId: v.id("socialConnections"),
    text: v.string(),
    mediaIds: v.optional(v.array(v.string())),
    replyToId: v.optional(v.string()),
    replySettings: v.optional(v.union(
      v.literal("everyone"),
      v.literal("mentionedUsers"),
      v.literal("followers")
    )),
  },
  handler: async (ctx, args): Promise<TweetResponse> => {
    try {
      // Get the connection
      const connection = await ctx.runQuery(api.x.getXConnectionById, {
        connectionId: args.connectionId,
      });

      if (!connection?.twitterAccessToken) {
        return {
          success: false,
          error: "Connection not found or not authenticated",
        };
      }

      // Build tweet payload
      const tweetPayload: any = {
        text: args.text,
      };

      // Add media if provided
      if (args.mediaIds && args.mediaIds.length > 0) {
        tweetPayload.media = {
          media_ids: args.mediaIds,
        };
      }

      // Add reply settings
      if (args.replySettings) {
        tweetPayload.reply_settings = args.replySettings;
      }

      // Add reply to ID if this is a reply
      if (args.replyToId) {
        tweetPayload.reply = {
          in_reply_to_tweet_id: args.replyToId,
        };
      }

      console.log("🐦 Creating tweet with payload:", JSON.stringify(tweetPayload, null, 2));

      // Create tweet
      const response: Response = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${connection.twitterAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tweetPayload),
      });

      const result: any = await response.json();

      if (!response.ok) {
        console.error("❌ Tweet creation failed:", result);
        return {
          success: false,
          error: result.errors?.[0]?.message || result.error || "Tweet creation failed",
        };
      }

      console.log("✅ Tweet created successfully:", result);

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("❌ Tweet creation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Tweet creation failed",
      };
    }
  },
});

// Upload media to Twitter
export const uploadMedia = action({
  args: {
    connectionId: v.id("socialConnections"),
    mediaData: v.string(), // Base64 encoded media
    mediaType: v.string(), // MIME type
    mediaCategory: v.optional(v.string()), // tweet_image, tweet_video, etc.
  },
  handler: async (ctx, args): Promise<MediaUploadResponse> => {
    try {
      // Get the connection
      const connection = await ctx.runQuery(api.x.getXConnectionById, {
        connectionId: args.connectionId,
      });

      if (!connection?.twitterAccessToken) {
        return {
          success: false,
          error: "Connection not found or not authenticated",
        };
      }

      // Convert base64 to buffer
      const mediaBuffer = Buffer.from(args.mediaData, 'base64');

      // Create form data
      const formData = new FormData();
      formData.append('media', new Blob([mediaBuffer], { type: args.mediaType }));
      if (args.mediaCategory) {
        formData.append('media_category', args.mediaCategory);
      }

      // Upload media
      const response: Response = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${connection.twitterAccessToken}`,
        },
        body: formData,
      });

      const result: any = await response.json();

      if (!response.ok) {
        console.error("❌ Media upload failed:", result);
        return {
          success: false,
          error: result.errors?.[0]?.message || result.error || "Media upload failed",
        };
      }

      console.log("✅ Media uploaded successfully:", result);

      return {
        success: true,
        media_id_string: result.media_id_string,
      };
    } catch (error) {
      console.error("❌ Media upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Media upload failed",
      };
    }
  },
});

// Get tweet analytics (requires higher API tier)
export const getTweetAnalytics = action({
  args: {
    connectionId: v.id("socialConnections"),
    tweetId: v.string(),
  },
  handler: async (ctx, args): Promise<XApiResponse> => {
    try {
      // Get the connection
      const connection = await ctx.runQuery(api.x.getXConnectionById, {
        connectionId: args.connectionId,
      });

      if (!connection?.twitterAccessToken) {
        return {
          success: false,
          message: "Connection not found or not authenticated",
        };
      }

      const response: Response = await fetch(
        `https://api.twitter.com/2/tweets/${args.tweetId}?tweet.fields=public_metrics`,
        {
          headers: {
            Authorization: `Bearer ${connection.twitterAccessToken}`,
          },
        }
      );

      const result: any = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: "Failed to get tweet analytics",
          error: result.errors?.[0]?.message || "Analytics request failed",
        };
      }

      const metrics: any = result.data?.public_metrics || {};

      return {
        success: true,
        message: "Analytics retrieved successfully",
        data: {
          tweetId: args.tweetId,
          metrics: {
            retweetCount: metrics.retweet_count || 0,
            likeCount: metrics.like_count || 0,
            replyCount: metrics.reply_count || 0,
            quoteCount: metrics.quote_count || 0,
            impressionCount: metrics.impression_count || 0,
          },
        },
      };
    } catch (error) {
      console.error("❌ Tweet analytics error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Analytics request failed",
        error: error instanceof Error ? error.message : "Analytics request failed",
      };
    }
  },
});
