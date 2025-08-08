// Reddit OAuth Callback Handler
// /Users/matthewsimon/Projects/eac/eac/app/api/auth/reddit/callback/route.ts

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    console.error('Reddit OAuth error:', error);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // Handle missing authorization code
  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(
      new URL('/?error=no_code', request.url)
    );
  }

  try {
    // Parse state to get connection ID (we'll encode this when starting OAuth)
    const connectionId = state;
    if (!connectionId) {
      throw new Error('Missing connection ID in state parameter');
    }

  // Exchange authorization code for access token
  // Build redirect URI dynamically to exactly match what was used in the authorize step
  const redirectUri = `${request.nextUrl.origin}/api/auth/reddit/callback`;
    
    console.log('🔗 OAuth callback using redirect URI:', redirectUri);
    
    // Call the Reddit authentication action
    const result = await convex.action(api.redditApi.authenticateReddit, {
      connectionId: connectionId as Id<"socialConnections">,
      authCode: code,
      redirectUri: redirectUri,
    });

    // Check if authentication was successful
    if (result.success) {
      // Redirect back to dashboard with success
      return NextResponse.redirect(
        new URL('/?auth=success', request.url)
      );
    } else {
      // Authentication failed
      console.error('Reddit authentication failed:', result.error);
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(result.error || 'oauth_failed')}`, request.url)
      );
    }

  } catch (error) {
    console.error('Reddit OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent('oauth_failed')}`, request.url)
    );
  }
}
