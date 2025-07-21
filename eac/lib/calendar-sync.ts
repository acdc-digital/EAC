// Calendar integration utilities
// /Users/matthewsimon/Projects/eac/eac/lib/calendar-sync.ts

import { useCalendarStore, type ScheduledPost } from '@/store';

export interface PostScheduleData {
  platform: 'facebook' | 'instagram' | 'twitter' | 'reddit';
  title: string;
  content?: string;
  scheduledAt: number; // Unix timestamp
  postId: string;
  fileId?: string;
  userId: string;
}

/**
 * Sync a scheduled post from social media editor to calendar
 */
export const syncPostToCalendar = async (postData: PostScheduleData): Promise<void> => {
  const { addScheduledPost } = useCalendarStore.getState();
  
  const scheduledPost: Omit<ScheduledPost, '_id' | 'createdAt' | 'updatedAt'> = {
    userId: postData.userId,
    platform: postData.platform,
    title: postData.title,
    content: postData.content,
    scheduledAt: postData.scheduledAt,
    status: 'scheduled',
    postId: postData.postId,
    fileId: postData.fileId,
  };
  
  await addScheduledPost(scheduledPost);
};

/**
 * Update a scheduled post status in calendar (e.g., when published or failed)
 */
export const updatePostStatusInCalendar = async (
  postId: string, 
  status: ScheduledPost['status'],
  error?: string
): Promise<void> => {
  const { updateScheduledPost } = useCalendarStore.getState();
  
  await updateScheduledPost(postId, { 
    status,
    ...(error && { error }),
    ...(status === 'published' && { publishedAt: Date.now() })
  });
};

/**
 * Remove a scheduled post from calendar (e.g., when deleted or cancelled)
 */
export const removePostFromCalendar = async (postId: string): Promise<void> => {
  const { deleteScheduledPost } = useCalendarStore.getState();
  
  await deleteScheduledPost(postId);
};

/**
 * Batch sync multiple posts to calendar
 */
export const batchSyncPostsToCalendar = async (posts: PostScheduleData[]): Promise<void> => {
  const { addScheduledPost } = useCalendarStore.getState();
  
  for (const postData of posts) {
    const scheduledPost: Omit<ScheduledPost, '_id' | 'createdAt' | 'updatedAt'> = {
      userId: postData.userId,
      platform: postData.platform,
      title: postData.title,
      content: postData.content,
      scheduledAt: postData.scheduledAt,
      status: 'scheduled',
      postId: postData.postId,
      fileId: postData.fileId,
    };
    
    await addScheduledPost(scheduledPost);
  }
};
