// X (Twitter) API Integration
// convex/xApi.ts

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { action, internalAction } from "./_generated/server";

// Type definitions for API responses
interface TwitterTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface TwitterUserData {
  data: {
    id: string;
    username: string;
    name?: string;
  };
  error?: {
    message: string;
  };
}

interface AuthenticationResult {
  success: boolean;
  user: {
    id: string;
    username: string;
    name?: string;
  };
  tokenExpiry?: number;
}

export const authenticateX = action({
  args: {
    code: v.string(),
    codeVerifier: v.string(),
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args): Promise<AuthenticationResult> => {
    const { code, codeVerifier, connectionId } = args;
    
    console.log("authenticateX: Starting OAuth flow", { connectionId });

    try {
      // Get the connection to retrieve client credentials
      const connection: Doc<"socialConnections"> | null = await ctx.runQuery(internal.socialConnections.getConnectionById, {
        connectionId,
      });

      if (!connection) {
        console.error("authenticateX: Connection not found", { connectionId });
        throw new Error("Connection not found");
      }

      if (!connection.twitterClientId || !connection.twitterClientSecret) {
        console.error("authenticateX: Missing client credentials", { connectionId });
        throw new Error("Missing Twitter client credentials");
      }

      console.log("authenticateX: Retrieved connection", { 
        username: connection.username,
        hasClientId: !!connection.twitterClientId,
        hasClientSecret: !!connection.twitterClientSecret 
      });

      // Exchange authorization code for access token
      const tokenEndpoint = "https://api.twitter.com/2/oauth2/token";
      
      const tokenParams = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
        code_verifier: codeVerifier,
        client_id: connection.twitterClientId,
      });

      console.log("authenticateX: Making token request to Twitter", { 
        endpoint: tokenEndpoint,
        hasCode: !!code,
        hasCodeVerifier: !!codeVerifier,
        clientId: connection.twitterClientId 
      });

      const tokenResponse: Response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${btoa(`${connection.twitterClientId}:${connection.twitterClientSecret}`)}`,
        },
        body: tokenParams.toString(),
      });

      const tokenData: TwitterTokenResponse = await tokenResponse.json();
      console.log("authenticateX: Token response", { 
        status: tokenResponse.status,
        hasAccessToken: !!tokenData.access_token,
        tokenType: tokenData.token_type,
        hasRefreshToken: !!tokenData.refresh_token,
        expiresIn: tokenData.expires_in 
      });

      if (!tokenResponse.ok) {
        console.error("authenticateX: Token request failed", { 
          status: tokenResponse.status,
          error: tokenData 
        });
        throw new Error(`Token request failed: ${tokenData.error_description || tokenData.error}`);
      }

      // Get user information
      const userResponse: Response = await fetch("https://api.twitter.com/2/users/me", {
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
        },
      });

      const userData: TwitterUserData = await userResponse.json();
      console.log("authenticateX: User data response", { 
        status: userResponse.status,
        hasUserData: !!userData.data,
        userId: userData.data?.id,
        username: userData.data?.username 
      });

      if (!userResponse.ok) {
        console.error("authenticateX: User info request failed", { 
          status: userResponse.status,
          error: userData 
        });
        throw new Error(`User info request failed: ${userData.error?.message || 'Unknown error'}`);
      }

      // Calculate token expiry
      const tokenExpiry = tokenData.expires_in 
        ? Date.now() + (tokenData.expires_in * 1000)
        : undefined;

      // Update the connection with new tokens
      await ctx.runMutation(internal.x.updateXConnectionTokens, {
        connectionId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiry,
        userInfo: {
          twitterUserId: userData.data.id,
          twitterScreenName: userData.data.username,
        },
      });

      console.log("authenticateX: Successfully updated connection tokens", { 
        connectionId,
        userId: userData.data.id,
        username: userData.data.username,
        tokenExpiry: tokenExpiry ? new Date(tokenExpiry).toISOString() : undefined 
      });

      return {
        success: true,
        user: {
          id: userData.data.id,
          username: userData.data.username,
          name: userData.data.name,
        },
        tokenExpiry,
      };

    } catch (error) {
      console.error("authenticateX: OAuth flow failed", { 
        connectionId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined 
      });
      
      throw new Error(`X authentication failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

// Refresh expired Twitter access tokens
export const refreshXToken = internalAction({
  args: {
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    console.log("🔄 refreshXToken: Starting token refresh", { connectionId: args.connectionId });
    
    try {
      // Get the connection
      const connection = await ctx.runQuery(internal.socialConnections.getConnectionById, {
        connectionId: args.connectionId,
      });

      if (!connection?.twitterRefreshToken) {
        console.error("❌ No refresh token available", { connectionId: args.connectionId });
        return {
          success: false,
          error: "No refresh token available"
        };
      }

      // Check if token is actually expired
      if (connection.tokenExpiry && Date.now() < connection.tokenExpiry) {
        console.log("✅ Token is still valid", { 
          connectionId: args.connectionId,
          expiresAt: new Date(connection.tokenExpiry).toISOString()
        });
        return { success: true };
      }

      const clientId = process.env.TWITTER_CLIENT_ID;
      const clientSecret = process.env.TWITTER_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        console.error("❌ Missing Twitter OAuth credentials");
        return {
          success: false,
          error: "Missing Twitter OAuth credentials"
        };
      }

      // Refresh the token
      const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: connection.twitterRefreshToken,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error("❌ Token refresh failed", { 
          status: tokenResponse.status,
          error: errorData 
        });
        return {
          success: false,
          error: errorData.error_description || "Token refresh failed"
        };
      }

      const tokenData: TwitterTokenResponse = await tokenResponse.json();
      console.log("✅ Token refreshed successfully", { 
        hasAccessToken: !!tokenData.access_token,
        hasNewRefreshToken: !!tokenData.refresh_token,
        expiresIn: tokenData.expires_in 
      });

      // Calculate new expiry time
      const tokenExpiry = tokenData.expires_in 
        ? Date.now() + (tokenData.expires_in * 1000)
        : undefined;

      // Update the connection with new tokens
      await ctx.runMutation(internal.x.updateXConnectionTokens, {
        connectionId: args.connectionId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || connection.twitterRefreshToken, // Keep old refresh token if new one not provided
        tokenExpiry,
      });

      return { success: true };

    } catch (error) {
      console.error("❌ refreshXToken: Error during token refresh", {
        connectionId: args.connectionId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during token refresh"
      };
    }
  },
});
