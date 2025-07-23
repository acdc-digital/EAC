# Twitter/X API Setup Guide

## Current Configuration Status

Your EAC Dashboard is configured to use **OAuth 2.0 Authorization Code with PKCE** for Twitter/X integration, which is the correct and most secure method for your social media dashboard.

## Required Credentials

### 🔑 OAuth 2.0 Credentials (Primary)
You need to get these from the Twitter Developer Portal:

1. **X_CLIENT_ID** - Your OAuth 2.0 Client ID
2. **X_CLIENT_SECRET** - Your OAuth 2.0 Client Secret

### 📋 Steps to Get OAuth 2.0 Credentials

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Select your app: `E1947446144470306816SimonSmatty`
3. Navigate to **App Settings** → **Authentication Settings**
4. Ensure **OAuth 2.0** is enabled
5. Set App Type to **Web App** (confidential client)
6. In **Callback URLs**, add: `http://localhost:3000/api/auth/twitter/callback`
7. Go to **Keys and Tokens** section
8. Copy your **Client ID** and **Client Secret**

### 🎯 Scopes Configured

Your dashboard requests these permissions:
- `tweet.read` - View tweets and timelines
- `tweet.write` - Post and delete tweets
- `users.read` - Access user profiles
- `like.write` - Like and unlike tweets
- `offline.access` - Maintain connection with refresh tokens

## What Works with OAuth 2.0

Based on the X API v2 authentication mapping:

✅ **Supported Features:**
- Post tweets (`POST /2/tweets`)
- Delete tweets (`DELETE /2/tweets/:id`)
- Like/unlike tweets (`POST/DELETE /2/users/:id/likes`)
- Follow/unfollow users (`POST/DELETE /2/users/:id/following`)
- View user timelines (`GET /2/users/:id/tweets`)
- Search recent tweets (`GET /2/tweets/search/recent`)
- Manage bookmarks (`POST/DELETE /2/users/:id/bookmarks`)

❌ **OAuth 1.0a Only:**
- Full archive search (Academic Research only)
- Streaming endpoints (filtered/sample streams)

## Environment Variables

Update your `.env.local` with:

```bash
# OAuth 2.0 Credentials (Required)
X_CLIENT_ID=your_actual_client_id_here
X_CLIENT_SECRET=your_actual_client_secret_here

# App Configuration
X_APP_NAME=E1947446144470306816SimonSmatty
X_WEBHOOK_URL=http://localhost:3000/api/webhooks/x
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## OAuth 1.0a vs OAuth 2.0

Your current credentials (`X_API_KEY`, `X_API_SECRET`, etc.) are OAuth 1.0a format:
- ❌ Cannot post tweets with X API v2
- ❌ Limited functionality for user actions
- ❌ Lower rate limits (300 vs 900 requests/15min)

OAuth 2.0 provides:
- ✅ Full X API v2 functionality
- ✅ Better rate limits
- ✅ More granular permissions
- ✅ Refresh token support

## Testing the Integration

Once you update the credentials:
1. Restart your dev server
2. Navigate to Social Connectors in your dashboard
3. Click "Connect X/Twitter"
4. You should see OAuth consent screen with requested scopes
5. After authorization, you can post tweets from the dashboard

## Rate Limits

With OAuth 2.0 Authorization Code + PKCE:
- Tweet lookup: 900 requests per 15 minutes
- User lookup: 900 requests per 15 minutes
- Most other endpoints: Standard limits apply

## Security Notes

- Access tokens expire in 2 hours by default
- `offline.access` scope provides refresh tokens
- PKCE prevents code interception attacks
- Client Secret must be kept secure (server-side only)

## Next Steps

1. ✅ Get OAuth 2.0 Client ID and Secret from Twitter Developer Portal
2. ✅ Add callback URL: `http://localhost:3000/api/auth/twitter/callback`
3. ✅ Update environment variables
4. ✅ Test the OAuth flow
5. ✅ Verify tweet posting functionality
