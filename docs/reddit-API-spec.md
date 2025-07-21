# Reddit API Specification for EAC Dashboard

## Overview

This document outlines the technical requirements and implementation details for integrating Reddit's API into the EAC Financial Dashboard for post creation and scheduling functionality.

## API Endpoint

**Base URL**: `https://oauth.reddit.com`  
**Post Creation**: `POST /api/submit`  
**Authentication**: OAuth2 with `submit` scope

## Authentication Requirements

### OAuth2 Flow

- **Client Type**: Web Application
- **Required Scopes**:
  - `submit` - Required for creating posts
  - `identity` - Optional, for user identification
- **Token Type**: Bearer token
- **Rate Limit**: 60 requests per minute per client ID (conservative limit)

### Required Credentials

- `client_id`: Reddit app client ID
- `client_secret`: Reddit app client secret
- `redirect_uri`: OAuth callback URL
- `user_agent`: Unique identifier for your application

## Post Creation Fields

### Required Fields

| Field            | Type   | Description                                 | Max Length | Required |
| ---------------- | ------ | ------------------------------------------- | ---------- | -------- |
| `sr` (subreddit) | string | Target subreddit name (without r/ prefix)   | 21 chars   | ✅       |
| `title`          | string | Post title                                  | 300 chars  | ✅       |
| `kind`           | enum   | Post type: "self", "link", "image", "video" | -          | ✅       |

### Content Fields (Conditional)

| Field             | Type   | Description                            | Required When | Max Length   |
| ----------------- | ------ | -------------------------------------- | ------------- | ------------ |
| `text` (selftext) | string | Post body content (Markdown supported) | kind = "self" | 40,000 chars |
| `url`             | string | URL for link posts                     | kind = "link" | 2,000 chars  |

### Optional Fields

| Field         | Type    | Description                        | Default | Options    |
| ------------- | ------- | ---------------------------------- | ------- | ---------- |
| `nsfw`        | boolean | Mark as Not Safe For Work          | false   | true/false |
| `spoiler`     | boolean | Mark as spoiler content            | false   | true/false |
| `flair_id`    | string  | Post flair ID (subreddit-specific) | null    | -          |
| `flair_text`  | string  | Custom flair text                  | null    | 64 chars   |
| `sendreplies` | boolean | Send inbox replies for this post   | true    | true/false |

## API Request Structure

### Headers

```json
{
  "Authorization": "Bearer {access_token}",
  "User-Agent": "{app_name}/{version} by {username}",
  "Content-Type": "application/x-www-form-urlencoded"
}
```

### Request Body (URL-encoded)

```
sr={subreddit}&title={title}&kind={kind}&text={content}&nsfw={boolean}&spoiler={boolean}
```

### Example Request

```bash
curl -X POST https://oauth.reddit.com/api/submit \
  -H "Authorization: Bearer {token}" \
  -H "User-Agent: EACDashboard/1.0 by YourUsername" \
  -d "sr=test&title=Hello World&kind=self&text=This is a test post"
```

## Response Structure

### Success Response (200)

```json
{
  "json": {
    "errors": [],
    "data": {
      "url": "https://www.reddit.com/r/test/comments/abc123/hello_world/",
      "drafts_count": 0,
      "id": "abc123",
      "name": "t3_abc123"
    }
  }
}
```

### Error Response (400+)

```json
{
  "json": {
    "errors": [["SUBREDDIT_NOEXIST", "that subreddit doesn't exist", "sr"]],
    "data": {}
  }
}
```

## Rate Limiting

- **Limit**: 60 requests per minute per OAuth client
- **Post Frequency**: Reddit limits how often users can create content (anti-spam)
- **Recommended**: Implement exponential backoff for rate limit errors
- **Error Code**: 429 Too Many Requests

## Scheduling Considerations

⚠️ **Important**: Reddit's API does NOT support native post scheduling.

### Implementation Strategy

1. Store scheduled posts in Convex database with `publishAt` timestamp
2. Use cron job or scheduled function to check for due posts
3. Execute Reddit API call when `publishAt` time is reached
4. Update post status from "scheduled" to "published" or "failed"

### Draft vs Scheduled Posts

- **Draft**: Post data saved locally, no API call made yet
- **Scheduled**: Draft + future timestamp for automated posting
- **Published**: Successfully posted to Reddit via API

## Database Schema Requirements

### Reddit Connection Settings

```typescript
interface RedditConnection {
  id: string;
  userId: string;
  clientId: string;
  clientSecret: string; // Encrypted
  accessToken: string; // Encrypted
  refreshToken: string; // Encrypted
  userAgent: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}
```

### Reddit Post Data

```typescript
interface RedditPost {
  id: string;
  userId: string;
  connectionId: string;

  // Required fields
  subreddit: string;
  title: string;
  kind: "self" | "link" | "image" | "video";

  // Content fields
  text?: string; // For self posts
  url?: string; // For link posts

  // Optional fields
  nsfw: boolean;
  spoiler: boolean;
  flairId?: string;
  flairText?: string;
  sendReplies: boolean;

  // Scheduling
  status: "draft" | "scheduled" | "published" | "failed";
  publishAt?: number; // Unix timestamp
  publishedAt?: number;
  publishedUrl?: string; // Reddit URL after successful post
  redditId?: string; // Reddit post ID (t3_xxx)

  // Metadata
  createdAt: number;
  updatedAt: number;
  error?: string; // Error message if failed
}
```

## Error Handling

### Common Error Types

1. **SUBREDDIT_NOEXIST**: Invalid subreddit name
2. **NO_TEXT**: Missing text content for self post
3. **ALREADY_SUB**: URL already submitted to subreddit
4. **RATELIMIT**: Rate limit exceeded
5. **BAD_SR_NAME**: Invalid subreddit name format
6. **TITLE_TOO_LONG**: Title exceeds 300 characters

### Implementation Strategy

- Validate all fields before API call
- Implement retry logic for transient errors
- Store error details for user feedback
- Use circuit breaker pattern for repeated failures

## Security Considerations

### Token Storage

- Encrypt access/refresh tokens in database
- Use secure environment variables for client credentials
- Implement token rotation for refresh tokens
- Set appropriate token expiration times

### Input Validation

- Sanitize all user inputs
- Validate subreddit names against Reddit's naming rules
- Check content length limits before submission
- Escape special characters in URLs

### Privacy

- Never log sensitive authentication data
- Implement proper CORS policies
- Use HTTPS for all API communications
- Follow Reddit's API Terms of Service

## Implementation Checklist

### Phase 1: Authentication Setup

- [x] Create Reddit app in Reddit preferences (user needs to do this)
- [x] Store client credentials securely (Convex database schema)
- [ ] Implement OAuth2 flow
- [x] Create connection management UI (Social Connectors component)

### Phase 2: Post Creation

- [x] Build Reddit post form with all required fields (Reddit Post Editor)
- [x] Implement field validation (client-side validation)
- [x] Create API service for Reddit posting (Convex functions)
- [x] Add error handling and user feedback (error display in UI)

### Phase 3: Scheduling System

- [x] Create scheduling database schema (redditPosts table)
- [ ] Implement cron job for scheduled posts
- [x] Build scheduling UI components (scheduling tab in editor)
- [x] Add post status tracking (status field in database)

### Phase 4: Testing & Monitoring

- [ ] Test with various post types
- [ ] Implement monitoring for failed posts
- [ ] Add analytics for post performance
- [ ] Create user documentation

## Testing Strategy

### Test Cases

1. **Authentication**: Valid/invalid credentials
2. **Post Types**: Text, link posts in various subreddits
3. **Validation**: Field length limits, required fields
4. **Rate Limits**: Handling 429 responses
5. **Error Scenarios**: Invalid subreddits, network failures
6. **Scheduling**: Past/future dates, timezone handling

### Test Subreddits

- `r/test` - General testing subreddit
- Your own private subreddit for safe testing
- Check subreddit rules before posting

## Resources

- [Reddit API Documentation](https://www.reddit.com/dev/api/)
- [Reddit OAuth2 Guide](https://github.com/reddit-archive/reddit/wiki/OAuth2)
- [Subreddit Rules](https://www.reddit.com/wiki/api#wiki_rules)
- [Rate Limiting Info](https://github.com/reddit-archive/reddit/wiki/API#wiki_rules)

---

_Last Updated: July 21, 2025_  
_Version: 1.0_
