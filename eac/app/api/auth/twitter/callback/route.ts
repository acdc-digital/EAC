// X (Twitter) OAuth Callback Handler
// /Users/matthewsimon/Projects/eac/eac/app/api/auth/twitter/callback/route.ts

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

  console.log('🐦 Twitter OAuth callback received:', {
    hasCode: !!code,
    hasState: !!state,
    error: error || 'none',
    stateValue: state
  });

  // Handle OAuth errors
  if (error) {
    console.error('X OAuth error:', error);
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

  // Handle missing state parameter
  if (!state) {
    console.error('No state parameter received');
    return NextResponse.redirect(
      new URL('/?error=no_state', request.url)
    );
  }

  try {
    // Parse state to get connection ID and code verifier
    const stateData = JSON.parse(decodeURIComponent(state));
    const connectionId = stateData.connectionId;
    const codeVerifier = stateData.codeVerifier;
    
    console.log('🐦 Parsed state data:', {
      connectionId: connectionId ? 'present' : 'missing',
      codeVerifier: codeVerifier ? 'present' : 'missing'
    });
    
    if (!connectionId) {
      throw new Error('Missing connection ID in state parameter');
    }

    if (!codeVerifier) {
      throw new Error('Missing code verifier in state parameter');
    }

    // Exchange authorization code for access token
    const redirectUri = 'http://localhost:3000/api/auth/twitter/callback';
    
    console.log('🔗 X OAuth callback using redirect URI:', redirectUri);
    
    // Call the X authentication action
    const result = await convex.action(api.xApi.authenticateX, {
      connectionId: connectionId as Id<"socialConnections">,
      code: code,
      codeVerifier: codeVerifier,
    });

    console.log('🐦 Authentication result:', {
      success: result.success,
      hasError: !!result.error
    });

    // Check if authentication was successful
    if (result.success) {
      // Redirect back to dashboard with success
      return NextResponse.redirect(
        new URL('/?auth=success&platform=twitter', request.url)
      );
    } else {
      // Authentication failed
      console.error('X authentication failed:', result.error);
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(result.error || 'oauth_failed')}`, request.url)
      );
    }

  } catch (error) {
    console.error('X OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'oauth_failed';
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
