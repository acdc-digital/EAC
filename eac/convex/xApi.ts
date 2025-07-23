// X (Twitter) API Integration
// convex/xApi.ts

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

export const authenticateX = action({
  args: {
    code: v.string(),
    codeVerifier: v.string(),
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args) => {
    const { code, codeVerifier, connectionId } = args;
    
    console.log("authenticateX: Starting OAuth flow", { connectionId });

    try {
      // Get the connection to retrieve client credentials
      const connection = await ctx.runQuery(internal.socialConnections.getConnectionById, {
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

      const tokenResponse = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${btoa(`${connection.twitterClientId}:${connection.twitterClientSecret}`)}`,
        },
        body: tokenParams.toString(),
      });

      const tokenData = await tokenResponse.json();
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
      const userResponse = await fetch("https://api.twitter.com/2/users/me", {
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
        },
      });

      const userData = await userResponse.json();
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
