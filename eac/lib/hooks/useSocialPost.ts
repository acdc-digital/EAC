import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo, useRef } from "react";
import { api } from "../../convex/_generated/api";

export type PostStatus = 'draft' | 'scheduled' | 'posting' | 'posted' | 'failed';

interface UseSocialPostOptions {
  fileName: string;
  fileType: 'reddit' | 'twitter';
}

export function useSocialPost({ fileName, fileType }: UseSocialPostOptions) {
  const post = useQuery(api.socialPosts.getPostByFileName, { fileName });
  const upsertPost = useMutation(api.socialPosts.upsertPost);
  const updateStatus = useMutation(api.socialPosts.updatePostStatus);
  const deletePost = useMutation(api.socialPosts.deletePost);
  const schedulePostMutation = useMutation(api.socialPosts.schedulePost);
  
  // Use ref to track if we're currently saving to prevent loops
  const isSavingRef = useRef(false);
  
  // Use ref to get current status without dependency issues
  const currentStatusRef = useRef(post?.status);
  currentStatusRef.current = post?.status;
  
  // Auto-save content with debouncing - completely stable dependencies
  const saveContent = useCallback(async (
    content: string,
    title?: string,
    platformData?: Record<string, unknown>
  ) => {
    // Prevent concurrent saves
    if (isSavingRef.current) return;
    
    try {
      isSavingRef.current = true;
      
      // Get current status from ref to avoid stale closures
      const currentStatus = currentStatusRef.current;
      
      await upsertPost({
        fileName,
        fileType,
        content,
        title,
        platformData: platformData ? JSON.stringify(platformData) : undefined,
        // Only set status to 'draft' for new posts, preserve existing status
        status: currentStatus && currentStatus !== 'draft' ? undefined : 'draft',
        userId: 'temp-user-id', // TODO: Replace with actual user ID
      });
    } catch (error) {
      console.error('Failed to save post content:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [fileName, fileType, upsertPost]);
  
  // Update post status - stable dependencies
  const updatePostStatus = useCallback(async (
    status: PostStatus,
    details?: {
      postId?: string;
      postUrl?: string;
      errorMessage?: string;
    }
  ) => {
    try {
      await updateStatus({
        fileName,
        status,
        postId: details?.postId,
        postUrl: details?.postUrl,
        postedAt: status === 'posted' ? Date.now() : undefined,
        errorMessage: details?.errorMessage,
      });
    } catch (error) {
      console.error('Failed to update post status:', error);
    }
  }, [fileName, updateStatus]);
  
  // Schedule post - stable dependencies
  const schedulePost = useCallback(async (
    scheduledFor: Date,
    content: string,
    title?: string,
    platformData?: Record<string, unknown>
  ) => {
    try {
      await schedulePostMutation({
        fileName,
        fileType,
        content,
        title,
        platformData: platformData ? JSON.stringify(platformData) : undefined,
        scheduledFor: scheduledFor.getTime(),
        userId: 'temp-user-id', // TODO: Replace with actual user ID
      });
    } catch (error) {
      console.error('Failed to schedule post:', error);
    }
  }, [fileName, fileType, schedulePostMutation]);
  
  // Memoize helper getters to prevent recreating them on every render
  const helpers = useMemo(() => {
    const status = post?.status || 'draft';
    return {
      status,
      isPosted: status === 'posted',
      isScheduled: status === 'scheduled',
      isPosting: status === 'posting',
      isFailed: status === 'failed',
      canPost: status === 'draft' || status === 'failed',
      canSchedule: status === 'draft' || status === 'failed',
    };
  }, [post?.status]);
  
  // Platform data helper - return data directly, not a function
  const platformData = useMemo(() => {
    if (!post?.platformData) return {};
    try {
      return JSON.parse(post.platformData) as Record<string, unknown>;
    } catch {
      return {};
    }
  }, [post?.platformData]);
  
  // Delete function - stable
  const deletePostCallback = useCallback(() => deletePost({ fileName }), [deletePost, fileName]);
  
  return {
    post,
    isLoading: post === undefined,
    saveContent,
    updatePostStatus,
    schedulePost,
    deletePost: deletePostCallback,
    
    // Spread the memoized helpers
    ...helpers,
    
    // Platform data helper
    platformData,
  };
}
