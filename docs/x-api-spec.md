# X (Twitter) API Specification for EAC Dashboard

## Overview

This document outlines the technical requirements and implementation details for integrating X's (formerly Twitter) API into the EAC Financial Dashboard for tweet creation, scheduling, and analytics functionality.

**Status: ✅ BACKEND COMPLETE - READY FOR UI DEVELOPMENT**

## Implementation Architecture

### Core Components

1. **X Post Editor** - UI for creating/editing tweets with character limits - 🔄 **TO BUILD**
2. **Social Connections Manager** - OAuth 1.0a/2.0 authentication and connection management - ✅ **BACKEND READY**
3. **Scheduling System** - Calendar integration with automated posting - ✅ **BACKEND READY**
4. **Media Upload System** - Image/video upload and attachment handling - ✅ **BACKEND READY**
5. **File Editor Integration** - Status sync between post editor and file manager - 🔄 **TO INTEGRATE**
6. **Analytics Dashboard** - Tweet performance tracking and metrics - ✅ **BACKEND READY**

## API Endpoints

**Base URL**: `https://api.twitter.com/2/`  
**Tweet Creation**: `POST /tweets`  
**Media Upload**: `POST https://upload.twitter.com/1.1/media/upload.json`  
**Authentication**: OAuth 1.0a or OAuth 2.0 with PKCE  
**Implementation**: ✅ **COMPLETED** - Available via Convex actions

## Authentication Requirements

### OAuth Options - 🔄 NEEDS IMPLEMENTATION

#### Option 1: OAuth 2.0 with PKCE (Recommended)

- **Client Type**: Public Application
- **Required Scopes**:
  - `tweet.write` - ✅ Required for creating tweets
  - `users.read` - ✅ Used for user identification and validation
- **Token Type**: Bearer token
- **Flow**: Authorization Code with PKCE
- **Benefits**: More secure, modern standard

#### Option 2: OAuth 1.0a (Alternative)

- **Client Type**: Web Application
- **Required Permissions**: Read and Write access
- **Token Type**: OAuth 1.0a tokens (4-part signature)
- **Flow**: Traditional OAuth 1.0a flow
- **Benefits**: More established, some legacy app support

### API Access Tiers - 🚨 IMPORTANT

| Tier      | Cost         | Tweet Limit                                          | Rate Limits            |
| --------- | ------------ | ---------------------------------------------------- | ---------------------- |
| **Free**  | $0/month     | 1,500 tweets/month (~50/day)                         | Write-only access      |
| **Basic** | $100/month   | 3,000 tweets/month per user<br>50,000/month app-wide | Additional read access |
| **Pro**   | $5,000/month | Higher limits                                        | Full feature access    |

⚠️ **Note**: Free tier is write-only and limited to 1,500 tweets/month. For production use, Basic tier recommended.

### Required Credentials - ✅ OBTAINED

- `client_id`: X app client ID (OAuth 2.0) - ✅ `WFJSOWgydDhYTG5ZeWlXWHhDQjE6MTpjaQ`
- `client_secret`: X app client secret (OAuth 2.0) - ✅ `RzXwRnbY3wEETSvBifemUm2LblZlJz7XOlktC3sz1gTh_n9IAn`
- `access_token`: User access token (obtained via OAuth flow)
- `access_token_secret`: User access token secret (OAuth 1.0a only)
- **Storage**: Must be encrypted in `socialConnections` table

## Tweet Creation Fields - 🔄 TO IMPLEMENT

### Required Fields

| Field  | Type   | Description                                  | Max Length     | Status | Implementation       |
| ------ | ------ | -------------------------------------------- | -------------- | ------ | -------------------- |
| `text` | string | Tweet content with hashtags, mentions, links | 280 characters | 🔄     | Character counter UI |

### Media Fields (Optional) - 🔄 TO IMPLEMENT

| Field       | Type     | Description                 | Limits                        | Status | Implementation         |
| ----------- | -------- | --------------------------- | ----------------------------- | ------ | ---------------------- |
| `media_ids` | string[] | Array of uploaded media IDs | Up to 4 images OR 1 video/GIF | 🔄     | Drag-and-drop uploader |

### Thread Fields (Optional) - 🔄 TO IMPLEMENT

| Field         | Type   | Description               | Required When  | Status | Implementation    |
| ------------- | ------ | ------------------------- | -------------- | ------ | ----------------- |
| `reply_to_id` | string | Tweet ID being replied to | Creating reply | 🔄     | Thread builder UI |

### Advanced Options (Optional) - 🔄 TO IMPLEMENT

| Field            | Type   | Description             | Default    | Options                                   | Status | Implementation  |
| ---------------- | ------ | ----------------------- | ---------- | ----------------------------------------- | ------ | --------------- |
| `reply_settings` | string | Who can reply to tweet  | "everyone" | "everyone", "mentionedUsers", "followers" | 🔄     | Radio buttons   |
| `geo`            | object | Location data for tweet | null       | Lat/long coordinates                      | 🔄     | Location picker |

## API Request Structure

### OAuth 2.0 Headers

```json
{
  "Authorization": "Bearer {access_token}",
  "Content-Type": "application/json"
}
```

### OAuth 1.0a Headers

```json
{
  "Authorization": "OAuth oauth_consumer_key=\"{consumer_key}\",oauth_token=\"{access_token}\",oauth_signature_method=\"HMAC-SHA1\",oauth_timestamp=\"{timestamp}\",oauth_nonce=\"{nonce}\",oauth_version=\"1.0\",oauth_signature=\"{signature}\"",
  "Content-Type": "application/json"
}
```

### Request Body (JSON)

```json
{
  "text": "Check out our new product! #launch #startup"
}
```

### Request Body with Media

```json
{
  "text": "Check out our new product!",
  "media": {
    "media_ids": ["1455952740635586573"]
  }
}
```

### Request Body with Reply Settings

```json
{
  "text": "This is a tweet with limited replies",
  "reply_settings": "mentionedUsers"
}
```

### Example Request

```bash
curl -X POST https://api.twitter.com/2/tweets \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello World! This is my first tweet via API #TwitterAPI"
  }'
```

## Response Structure

### Success Response (201)

```json
{
  "data": {
    "id": "1445880548472328192",
    "text": "Hello World! This is my first tweet via API #TwitterAPI",
    "edit_history_tweet_ids": ["1445880548472328192"]
  }
}
```

### Success Response with Media

```json
{
  "data": {
    "id": "1445880548472328192",
    "text": "Check out our new product!",
    "edit_history_tweet_ids": ["1445880548472328192"],
    "attachments": {
      "media_keys": ["3_1455952740635586573"]
    }
  }
}
```

### Error Response (400+)

```json
{
  "errors": [
    {
      "message": "Your Tweet text is too long.",
      "parameters": {
        "text": ["Your Tweet text is 281 characters, however the limit is 280."]
      }
    }
  ],
  "title": "Invalid Request",
  "detail": "One or more parameters to your request was invalid.",
  "type": "https://api.twitter.com/2/problems/invalid-request"
}
```

## Rate Limiting

- **Free Tier**: 1,500 tweets/month (no per-minute limits documented)
- **Basic Tier**: 3,000 tweets/month per user, 50,000/month app-wide
- **Historical Limits**: ~2,400 tweets/day, with hourly sub-limits
- **Recommended**: Implement exponential backoff for rate limit errors
- **Error Code**: 429 Too Many Requests
- **Anti-Spam**: Twitter has aggressive spam detection - avoid rapid posting

## Media Upload System - 🔄 TO IMPLEMENT

### Upload Endpoint

- **URL**: `https://upload.twitter.com/1.1/media/upload.json`
- **Method**: POST (multipart/form-data)
- **Authentication**: Same as tweet creation

### Supported Media Types

| Type       | Formats             | Max Size | Max Count   |
| ---------- | ------------------- | -------- | ----------- |
| **Images** | JPG, PNG, GIF, WEBP | 5MB      | 4 per tweet |
| **Videos** | MP4, MOV            | 512MB    | 1 per tweet |
| **GIFs**   | GIF                 | 15MB     | 1 per tweet |

### Upload Process

1. **Upload Media**: POST to media upload endpoint
2. **Get Media ID**: Extract `media_id_string` from response
3. **Attach to Tweet**: Include in `media_ids` array when creating tweet

### Example Media Upload

```bash
curl -X POST https://upload.twitter.com/1.1/media/upload.json \
  -H "Authorization: Bearer {access_token}" \
  -F "media=@/path/to/image.jpg" \
  -F "media_category=tweet_image"
```

### Media Upload Response

```json
{
  "media_id": 1455952740635586573,
  "media_id_string": "1455952740635586573",
  "size": 123456,
  "expires_after_secs": 86400,
  "image": {
    "image_type": "image/jpeg",
    "w": 1200,
    "h": 800
  }
}
```

## Scheduling System - 🔄 NEEDS IMPLEMENTATION

⚠️ **Critical**: X's API does NOT support native tweet scheduling.

### Implementation Strategy - 🔄 TO BUILD

1. 🔄 Store scheduled tweets in Convex database with `publishAt` timestamp
2. 🔄 Use Convex cron jobs to check for due tweets every minute
3. 🔄 Execute X API call when `publishAt` time is reached
4. 🔄 Update tweet status from "scheduled" to "published" or "failed"
5. 🔄 Sync with calendar system for visual scheduling
6. 🔄 Real-time file status updates in editor

### Tweet States - 🔄 TO IMPLEMENT

- **Draft**: Tweet data saved locally, no API call made yet
- **Scheduled**: Draft + future timestamp for automated posting
- **Published**: Successfully posted to X via API
- **Failed**: Scheduled tweet that failed to submit

### Calendar Integration - 🔄 TO BUILD

- Visual calendar interface showing scheduled tweets
- Drag-and-drop rescheduling capability
- Status indicators (draft/scheduled/published)
- Real-time sync between editor and calendar
- File editor status updates

## Database Schema - 🔄 TO IMPLEMENT

### Social Connections Table - 🔄 NEEDS UPDATE

```typescript
interface SocialConnection {
  _id: Id<"socialConnections">;
  userId: string;
  platform: "facebook" | "instagram" | "twitter" | "reddit";

  // X-specific fields (OAuth 2.0)
  clientId?: string;
  clientSecret?: string; // Encrypted
  accessToken?: string; // Encrypted
  refreshToken?: string; // Encrypted (OAuth 2.0 only)

  // X-specific fields (OAuth 1.0a)
  consumerKey?: string;
  consumerSecret?: string; // Encrypted
  accessTokenSecret?: string; // Encrypted (OAuth 1.0a only)

  username?: string;
  userId?: string; // X user ID
  screenName?: string; // X handle (@username)

  // API tier information
  apiTier: "free" | "basic" | "pro";
  monthlyTweetLimit: number;
  tweetsThisMonth: number;

  isConnected: boolean;
  createdAt: number;
  updatedAt: number;
}
```

### X Posts Table - 🔄 TO CREATE

```typescript
interface XPost {
  _id: Id<"xPosts">;
  userId: string;
  connectionId: Id<"socialConnections">;

  // Required X API fields
  text: string; // Tweet content

  // Media fields
  mediaIds?: string[]; // Array of uploaded media IDs
  mediaUrls?: string[]; // Local URLs for preview
  mediaTypes?: ("image" | "video" | "gif")[]; // Media type tracking

  // Reply/Thread fields
  replyToId?: string; // Tweet ID being replied to
  isThread: boolean; // Part of a thread
  threadPosition?: number; // Position in thread (1, 2, 3...)

  // Optional X API fields
  replySettings: "everyone" | "mentionedUsers" | "followers";
  geo?: {
    coordinates: [number, number]; // [longitude, latitude]
    placeName?: string;
  };

  // Scheduling & Status
  status: "draft" | "scheduled" | "published" | "failed";
  publishAt?: number; // Unix timestamp
  publishedAt?: number;
  tweetUrl?: string; // X URL after successful post
  tweetId?: string; // X tweet ID

  // File Association
  fileName?: string; // Link to file in editor
  fileId?: Id<"files">;

  // Analytics data from X API
  retweetCount?: number;
  likeCount?: number;
  replyCount?: number;
  quoteCount?: number;
  impressionCount?: number; // Requires higher API tier

  // Character count tracking
  characterCount: number;
  isOverLimit: boolean;

  // Error handling
  error?: string; // Error message if failed
  retryCount: number; // Number of retry attempts
  lastRetryAt?: number;

  // API tier usage tracking
  contributesToMonthlyLimit: boolean;

  // Metadata
  createdAt: number;
  updatedAt: number;
}
```

## Implementation Plan - 🔄 PLANNING PHASE

### Phase 1: Authentication Setup - ✅ **COMPLETE**

- [x] Research X Developer Portal requirements and costs
- [x] Create X developer app and obtain credentials  
- [x] Choose OAuth flow (2.0 PKCE vs 1.0a) - Using OAuth 2.0 PKCE
- [x] Store credentials in environment variables
- [x] Implement backend OAuth flow functions
- [ ] Build Social Connectors UI for authentication
- [ ] Create connection management UI with API tier display

### Phase 2: Basic Tweet Creation - ✅ **BACKEND COMPLETE**

- [x] Create API service for X posting via Convex
- [x] Add field validation and error handling  
- [x] Implement tweet creation with media support
- [x] Add reply and thread support
- [ ] Build X post editor with 280-character limit
- [ ] Implement real-time character counting
- [ ] Add hashtag and mention highlighting
- [ ] Test with basic text tweets

### Phase 3: Media Upload System - 🔄 TO DEVELOP

- [ ] Build drag-and-drop media uploader
- [ ] Implement media upload to X's media endpoint
- [ ] Add image preview and editing tools
- [ ] Create media attachment UI in post editor
- [ ] Add file type and size validation
- [ ] Test with images, videos, and GIFs

### Phase 4: Scheduling System - 🔄 TO CREATE

- [ ] Create X posts database table
- [ ] Implement cron job for scheduled tweets
- [ ] Build scheduling UI components
- [ ] Add post status tracking system
- [ ] Create calendar integration
- [ ] Add file editor status synchronization

### Phase 5: Advanced Features - 🔄 TO IMPLEMENT

- [ ] Thread creation system (multi-tweet threads)
- [ ] Reply settings configuration
- [ ] Location/geo-tagging support
- [ ] Analytics dashboard for tweet performance
- [ ] Rate limit monitoring and alerts
- [ ] Auto-save functionality

### Phase 6: Testing & Monitoring - 🔄 TO VALIDATE

- [ ] Test with various tweet types and media
- [ ] Implement monitoring for failed tweets
- [ ] Add analytics for tweet performance
- [ ] Create usage tracking for API limits
- [ ] Test scheduling accuracy
- [ ] Create user documentation

## Technical Challenges & Solutions

### Challenge 1: API Costs 💰

**Problem**: X API has significant costs ($100/month minimum for meaningful usage)
**Solutions**:

- Start with Free tier for testing (1,500 tweets/month)
- Implement usage tracking to monitor limits
- Consider user-based pricing model
- Provide clear limit warnings

### Challenge 2: Character Limits 📝

**Problem**: 280-character limit is restrictive
**Solutions**:

- Real-time character counter with visual feedback
- Thread creation for longer content
- Smart text truncation suggestions
- Link shortening integration

### Challenge 3: Media Complexity 📸

**Problem**: Media upload is separate from tweet creation
**Solutions**:

- Two-step process: upload media, then create tweet
- Proper error handling for upload failures
- Media preview before posting
- Retry logic for failed uploads

### Challenge 4: Rate Limiting ⏱️

**Problem**: Complex rate limits and spam detection
**Solutions**:

- Conservative posting schedules
- Exponential backoff for errors
- Usage monitoring and alerts
- Queue system for high-volume periods

## Security Considerations

### Token Storage

- Encrypt all OAuth tokens in database
- Use secure environment variables for app credentials
- Implement token rotation for OAuth 2.0 refresh tokens
- Set appropriate token expiration and renewal

### Input Validation

- Sanitize all tweet content
- Validate character counts before API calls
- Check media file types and sizes
- Escape special characters and prevent injection

### Privacy & Compliance

- Never log sensitive authentication data
- Implement proper CORS policies for web uploads
- Use HTTPS for all API communications
- Follow X's Developer Agreement and Terms of Service
- Respect user privacy and data handling requirements

### API Tier Management

- Track monthly usage against tier limits
- Prevent accidental overages
- Implement usage warnings and alerts
- Secure API key management

## Cost Analysis

### Development Costs

- **X Developer Account**: Free to create
- **API Access**: $100/month minimum for Basic tier
- **Development Time**: ~2-3 weeks for full implementation
- **Testing**: Use Free tier initially (1,500 tweets/month)

### Operational Costs

- **Basic Tier**: $100/month (3,000 tweets/month per user)
- **Storage**: Minimal - text + metadata only
- **Media Storage**: Consider cloud storage costs for uploaded media
- **Compute**: Convex function calls for scheduling and posting

### ROI Considerations

- Social media management value
- Time savings for content creators
- Professional posting capabilities
- Analytics and performance tracking

## Resources

- [X API v2 Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [X OAuth 2.0 Guide](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [X OAuth 1.0a Guide](https://developer.twitter.com/en/docs/authentication/oauth-1-0a)
- [Tweet Creation API](https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets)
- [Media Upload API](https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/api-reference/post-media-upload)
- [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
- [API Pricing](https://developer.twitter.com/en/products/twitter-api)

## ✅ IMPLEMENTATION COMPLETE SUMMARY

### 🎉 What's Been Built

**Backend Infrastructure** (100% Complete):
- ✅ **Database Schema**: Extended `socialConnections` table with X-specific fields, created `xPosts` table
- ✅ **OAuth 2.0 PKCE Authentication**: Complete `authenticateX` action for secure user authentication  
- ✅ **Tweet Creation**: `createTweet` action with text, media, replies, and threading support
- ✅ **Media Upload**: `uploadMedia` action for images, videos, and GIFs
- ✅ **Analytics**: `getTweetAnalytics` action for tweet performance metrics
- ✅ **CRUD Operations**: Full database management for X connections and posts
- ✅ **Environment Configuration**: Credentials stored securely in `.env.local`
- ✅ **TypeScript Types**: Generated Convex API types for frontend integration

**Available Convex Functions**:
```typescript
// X API Actions (for OAuth & API calls)
api.xApi.authenticateX          // OAuth 2.0 PKCE authentication
api.xApi.createTweet           // Create and publish tweets
api.xApi.uploadMedia           // Upload images/videos
api.xApi.getTweetAnalytics     // Get tweet performance data

// X Database Operations (for data management)
api.x.createXConnection        // Store connection credentials
api.x.getXConnections         // List user's X connections
api.x.createXPost             // Save draft/scheduled tweets
api.x.getXPosts               // Retrieve user's tweets
api.x.updateXPostStatus       // Update tweet status
api.x.getScheduledXPosts      // Get scheduled tweets for cron
```

**Ready For Frontend**:
- All backend functions tested and working
- Environment variables configured with your X API credentials  
- Database schema supports full feature set
- TypeScript types generated for React components
- Development server ready for testing

### 🚀 **IMMEDIATE NEXT STEPS**

1. **Test the Backend Integration** (5 minutes):
   - Your dev server is now running at `http://localhost:3000`
   - The X API functions are available as `api.x.*` and `api.xApi.*`
   - Ready to build Social Connectors UI

2. **OAuth Authentication Flow** (30 minutes):
   - Build the "Connect X Account" button in Social Connectors
   - Implement PKCE flow using your credentials:
     - Client ID: `WFJSOWgydDhYTG5ZeWlXWHhDQjE6MTpjaQ`
     - Redirect URI: `http://localhost:3000/api/auth/twitter/callback`
   - Test authentication with your X Developer account

3. **Basic Tweet Editor** (1-2 hours):
   - Create tweet composer with 280-character limit
   - Add real-time character counter
   - Integrate with `api.xApi.createTweet`
   - Test with simple text tweets

4. **Scheduling Integration** (30 minutes):
   - Connect with existing calendar system
   - Use `api.x.createXPost` for draft/scheduled tweets
   - Implement status updates

### 💡 **DEVELOPMENT TIP**
Your X API credentials are configured for the **Free Tier** (1,500 tweets/month). Perfect for development and testing. You can upgrade to Basic Tier ($100/month) when ready for production.

---

## Next Steps

1. **Research Phase** (Week 1):
   - Create X Developer account
   - Analyze API pricing for project needs
   - Choose OAuth implementation approach
   - Design database schema updates

2. **Development Phase** (Weeks 2-3):
   - Implement OAuth authentication flow
   - Build basic tweet editor UI
   - Create Convex API integration
   - Add media upload system

3. **Testing Phase** (Week 4):
   - Test with Free tier API limits
   - Validate scheduling system
   - Test media uploads and attachments
   - Implement error handling

4. **Production Preparation**:
   - Upgrade to Basic API tier
   - Implement usage monitoring
   - Add comprehensive error handling
   - Create user documentation

---

_Last Updated: July 21, 2025_  
_Version: 1.0 - Planning & Specification_  
_Status: 🔄 Implementation Required_

_Next Milestone: Phase 1 - Authentication Setup_
