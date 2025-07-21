# Calendar Integration with Scheduled Posts

## Overview

This integration connects your social media post scheduling with the calendar component in the activity bar, allowing you to visualize and manage all scheduled posts in one place.

## Components Added

### 1. Calendar Store (`/store/calendar/`)

- **Types**: `ScheduledPost`, `CalendarStoreState`
- **Store**: Zustand store for managing scheduled posts
- **Selectors**: Optimized hooks for calendar data

### 2. Calendar Sync Utilities (`/lib/hooks/useCalendarSync.ts`)

- `useCalendarSync()`: React hook for syncing posts to calendar
- `syncPostToCalendar()`: Add scheduled post to calendar
- `updatePostStatusInCalendar()`: Update post status (published, failed, etc.)
- `removePostFromCalendar()`: Remove post from calendar

### 3. Enhanced Calendar Component (`/app/_components/calendar/page.tsx`)

- Displays scheduled posts as colored indicators on calendar days
- Shows detailed post information when dates are selected
- Platform-specific color coding (Reddit: orange, Facebook: blue, etc.)
- Real-time sync with scheduled posts

## Integration Points

### Social Media Editors

The Reddit Post Editor (`/app/_components/dashboard/socialPlatforms/redditPostEditor.tsx`) now includes:

```typescript
// When a post is scheduled
await syncPostToCalendar({
  platform: "reddit",
  title: formData.title,
  content: formData.text,
  scheduledAt: formData.publishAt,
  postId: postId,
  fileId: fileRecord?._id,
  userId: "current-user",
});

// When a post is published
await updatePostStatusInCalendar(postId, "published");
```

## Usage

### 1. Accessing the Calendar

- Click the Calendar icon in the activity bar
- The calendar opens in the main editor area

### 2. Viewing Scheduled Posts

- Colored bars appear on days with scheduled posts
- Colors indicate platform:
  - 🟠 Reddit
  - 🔵 Facebook
  - 🟣 Instagram
  - 🔷 Twitter/X

### 3. Scheduling Posts

- Use any social media editor to schedule posts
- Posts automatically appear in the calendar
- Click dates to see detailed post information

### 4. Demo Functionality

- Click "Schedule Post" in the calendar to create a sample post
- This demonstrates the integration working end-to-end

## Data Flow

```
Social Media Editor → Schedule Post → Calendar Store → Calendar Component
     ↓
Post Status Updates → Calendar Store → Calendar Component
```

## Next Steps

1. **Convex Integration**: Connect to actual Convex backend for persistence
2. **User Authentication**: Replace temp user IDs with real authentication
3. **Bulk Operations**: Add batch scheduling and management
4. **Post Editing**: Allow editing scheduled posts from calendar
5. **Additional Platforms**: Extend to Facebook, Instagram, Twitter editors

## Files Modified/Added

### New Files:

- `/store/calendar/types.ts`
- `/store/calendar/index.ts`
- `/lib/hooks/useCalendarSync.ts`

### Modified Files:

- `/store/index.ts` (added calendar exports)
- `/app/_components/calendar/page.tsx` (enhanced with scheduled posts)
- `/app/_components/dashboard/socialPlatforms/redditPostEditor.tsx` (added calendar sync)

## Testing

1. Open the calendar from the activity bar
2. Click "Schedule Post" to create a demo post
3. Navigate to tomorrow's date to see the scheduled post
4. Create actual posts in Reddit editor to see them sync to calendar

This integration provides a centralized view of all scheduled social media content, making content planning and management much more efficient.
