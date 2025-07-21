// Reddit API Service Functions
// convex/redditApi.ts

import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";

interface RedditAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

interface RedditSubmitResponse {
  json?: {
    errors?: string[][];
    data?: {
      url?: string;
      id?: string;
      name?: string;
    };
  };
  // Reddit API sometimes returns different structures
  [key: string]: any;
}

// OAuth2 flow for Reddit authentication
export const authenticateReddit = action({
  args: {
    connectionId: v.id("socialConnections"),
    authCode: v.string(),
    redirectUri: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log('🔍 Starting Reddit authentication for connection:', args.connectionId);
      
      // Get connection details directly by ID
      const redditConnection = await ctx.runQuery(api.reddit.getConnectionById, {
        connectionId: args.connectionId,
      });
      
      console.log('📝 Connection found:', {
        id: redditConnection?._id,
        hasClientId: !!redditConnection?.clientId,
        hasClientSecret: !!redditConnection?.clientSecret,
        platform: redditConnection?.platform
      });
      
      if (!redditConnection || !redditConnection.clientId || !redditConnection.clientSecret) {
        throw new Error("Reddit connection not found or missing credentials");
      }
      
      // Exchange auth code for access token
      console.log('🔗 Token exchange request details:', {
        authCode: args.authCode.substring(0, 10) + '...',
        redirectUri: args.redirectUri,
        clientId: redditConnection.clientId,
        userAgent: redditConnection.userAgent || "EACDashboard/1.0",
        clientSecretLength: redditConnection.clientSecret.length
      });
      
      // Encode client credentials for Basic Auth
      const credentials = btoa(`${redditConnection.clientId}:${redditConnection.clientSecret}`);
      console.log('🔐 Basic Auth credentials length:', credentials.length);
      console.log('🔐 Client ID length:', redditConnection.clientId.length);
      console.log('🔐 Client Secret length:', redditConnection.clientSecret.length);
      
      const requestBody = new URLSearchParams({
        grant_type: "authorization_code",
        code: args.authCode,
        redirect_uri: args.redirectUri,
      });
      
      console.log('📝 Request body:', requestBody.toString());
      
      // Try with explicit headers that Reddit expects
      const tokenResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": redditConnection.userAgent || "EACDashboard/1.0",
          "Accept": "application/json",
        },
        body: requestBody,
      });
      
      console.log('📡 Reddit token response status:', tokenResponse.status);
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.log('❌ Reddit token error response:', errorText);
        throw new Error(`Reddit OAuth failed: ${errorText}`);
      }
      
      const tokenData: RedditAuthResponse = await tokenResponse.json();
      
      console.log('🔑 Token exchange successful:', {
        hasAccessToken: !!tokenData.access_token,
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope
      });
      
      // Update connection with tokens
      await ctx.runMutation(api.reddit.updateConnectionTokens, {
        connectionId: args.connectionId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiry: Date.now() + (tokenData.expires_in * 1000),
      });
      
      console.log('✅ Connection updated with tokens');
      
      return {
        success: true,
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope,
      };
      
    } catch (error) {
      console.error("Reddit authentication failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    }
  },
});

// Refresh Reddit access token
export const refreshRedditToken = action({
  args: {
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args) => {
    try {
      // Get connection details (this would need to be updated to get single connection)
      // For now, this is a placeholder implementation
      
      // TODO: Implement refresh token logic
      // 1. Get connection with refresh token
      // 2. Call Reddit refresh endpoint
      // 3. Update connection with new tokens
      
      return {
        success: true,
      };
      
    } catch (error) {
      console.error("Reddit token refresh failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Token refresh failed",
      };
    }
  },
});

// Submit a post to Reddit
export const submitRedditPost = action({
  args: {
    postId: v.id("redditPosts"),
  },
  handler: async (ctx, args) => {
    return await submitRedditPostHandler(ctx, args.postId);
  },
});

// Process scheduled Reddit posts (called by cron job)
export const processScheduledRedditPosts = action({
  args: {},
  handler: async (ctx): Promise<{ processed: number; results: any[] }> => {
    try {
      const scheduledPosts: any[] = await ctx.runQuery(api.reddit.getScheduledRedditPosts, {});
      
      const results: any[] = [];
      
      for (const post of scheduledPosts) {
        try {
          // Call submitRedditPost handler directly since we can't call actions from actions
          const result = await submitRedditPostHandler(ctx, post._id);
          results.push({
            postId: post._id,
            success: result.success,
            error: result.error,
          });
        } catch (error) {
          console.error(`Failed to process scheduled post ${post._id}:`, error);
          results.push({
            postId: post._id,
            success: false,
            error: error instanceof Error ? error.message : "Processing failed",
          });
        }
      }
      
      return {
        processed: results.length,
        results,
      };
      
    } catch (error) {
      console.error("Failed to process scheduled posts:", error);
      throw error;
    }
  },
});

// Helper function for submitting Reddit posts (shared between action and scheduled processing)
async function submitRedditPostHandler(ctx: any, postId: Id<"redditPosts">) {
  try {
    // Update post status to publishing
    await ctx.runMutation(api.reddit.updatePostStatus, {
      postId: postId,
      status: "publishing",
    });
    
    // Get post and connection details
    const postData = await ctx.runQuery(api.reddit.getRedditPostWithConnection, {
      postId: postId,
    });
    
    if (!postData) {
      throw new Error("Post or connection not found");
    }
    
    const { post, connection } = postData;
    
    if (!connection.accessToken) {
      throw new Error("Reddit access token not found. Please re-authenticate.");
    }
    
    // Prepare post data for Reddit API
    const formData = new URLSearchParams();
    formData.append("sr", post.subreddit);
    formData.append("title", post.title);
    formData.append("kind", post.kind);
    
    if (post.kind === "self" && post.text) {
      formData.append("text", post.text);
    } else if (post.kind === "link" && post.url) {
      formData.append("url", post.url);
    }
    
    formData.append("nsfw", post.nsfw.toString());
    formData.append("spoiler", post.spoiler.toString());
    formData.append("sendreplies", post.sendReplies.toString());
    
    if (post.flairId) {
      formData.append("flair_id", post.flairId);
    }
    if (post.flairText) {
      formData.append("flair_text", post.flairText);
    }
    
    // Submit to Reddit
    const response = await fetch("https://oauth.reddit.com/api/submit", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${connection.accessToken}`,
        "User-Agent": connection.userAgent || "EACDashboard/1.0",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Reddit API error: ${response.status} ${errorText}`);
    }
    
    const result: RedditSubmitResponse = await response.json();
    
    console.log('📡 Reddit API response:', JSON.stringify(result, null, 2));
    
    // Check for Reddit API errors - handle different response formats
    if (result.json && result.json.errors && result.json.errors.length > 0) {
      const errorMessages = result.json.errors.map(err => err.join(": ")).join(", ");
      throw new Error(`Reddit submission error: ${errorMessages}`);
    }
    
    // Reddit often returns jQuery-style responses, extract URL from jQuery commands
    let extractedUrl = "unknown";
    let extractedId = "unknown";
    
    // Try to extract URL from jQuery response format
    if (result.jquery && Array.isArray(result.jquery)) {
      for (const command of result.jquery) {
        if (Array.isArray(command) && command[2] === "call" && Array.isArray(command[3])) {
          const arg = command[3][0];
          if (typeof arg === "string" && arg.includes("reddit.com/r/")) {
            extractedUrl = arg;
            // Extract post ID from URL like: /r/subreddit/comments/POST_ID/title/
            const idMatch = arg.match(/\/comments\/([a-zA-Z0-9]+)\//);
            if (idMatch) {
              extractedId = idMatch[1];
            }
            console.log('🔗 Extracted from jQuery response:', { url: extractedUrl, id: extractedId });
            break;
          }
        }
      }
    }
    
    // Handle standard JSON response format (if it exists)
    if (result.json && result.json.data) {
      if (result.json.data.url) extractedUrl = result.json.data.url;
      if (result.json.data.id) extractedId = result.json.data.id;
      console.log('🔗 Extracted from JSON response:', { url: extractedUrl, id: extractedId });
    }
    
    // Check if we have a success indicator
    const isSuccess = result.success === true || response.ok;
    
    if (!isSuccess) {
      throw new Error(`Reddit submission failed: ${JSON.stringify(result)}`);
    }
    
    // Update post with success data
    await ctx.runMutation(api.reddit.updatePostStatus, {
      postId: postId,
      status: "published",
      publishedAt: Date.now(),
      publishedUrl: extractedUrl,
      redditId: extractedId,
    });
    
    return {
      success: true,
      url: extractedUrl,
      redditId: extractedId,
    };
    
  } catch (error) {
    console.error("Reddit post submission failed:", error);
    
    // Update post with error
    await ctx.runMutation(api.reddit.incrementRetryCount, {
      postId: postId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Submission failed",
    };
  }
}

// Test Reddit connection
export const testRedditConnection = action({
  args: {
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args) => {
    try {
      // Get connection details (placeholder - needs proper implementation)
      // TODO: Get connection by ID and test with Reddit API
      
      // Make a simple API call to test the connection
      // For example, get user info: GET /api/v1/me
      
      return {
        success: true,
        message: "Connection test successful",
      };
      
    } catch (error) {
      console.error("Reddit connection test failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Connection test failed",
      };
    }
  },
});

// Validate subreddit exists and user can post
export const validateSubreddit = action({
  args: {
    connectionId: v.id("socialConnections"),
    subreddit: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // TODO: Implement subreddit validation
      // 1. Get connection details
      // 2. Call Reddit API to check if subreddit exists
      // 3. Check if user can post to subreddit
      
      const cleanSubreddit = args.subreddit.replace(/^r\//, "");
      
      // For now, return success with basic validation
      return {
        success: true,
        subreddit: cleanSubreddit,
        canPost: true,
        rules: [], // Could fetch subreddit rules
      };
      
    } catch (error) {
      console.error("Subreddit validation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Validation failed",
      };
    }
  },
});

// Get Reddit user info
export const getRedditUserInfo = action({
  args: {
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args) => {
    try {
      // TODO: Implement user info retrieval
      // 1. Get connection with access token
      // 2. Call /api/v1/me endpoint
      // 3. Return user data
      
      return {
        success: true,
        user: {
          name: "placeholder",
          id: "placeholder",
        },
      };
      
    } catch (error) {
      console.error("Failed to get Reddit user info:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get user info",
      };
    }
  },
});
