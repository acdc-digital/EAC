// X (Twitter) Webhook Handler
// /Users/matthewsimon/Projects/eac/eac/app/api/webhooks/x/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🐦 X Webhook received:', body);

    // Handle different types of webhook events
    if (body.event_type) {
      switch (body.event_type) {
        case 'tweet_create':
          console.log('📝 Tweet created:', body.data);
          break;
        case 'tweet_delete':
          console.log('🗑️ Tweet deleted:', body.data);
          break;
        case 'user_follow':
          console.log('👥 User followed:', body.data);
          break;
        default:
          console.log('📬 Unknown event type:', body.event_type);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });
    
  } catch (error) {
    console.error('❌ X Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle webhook verification challenge
  const searchParams = request.nextUrl.searchParams;
  const challenge = searchParams.get('crc_token');
  
  if (challenge) {
    // Twitter webhook verification
    return NextResponse.json({
      response_token: `sha256=${challenge}` // Simplified - should use proper HMAC
    });
  }
  
  return NextResponse.json({ 
    message: 'X Webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
