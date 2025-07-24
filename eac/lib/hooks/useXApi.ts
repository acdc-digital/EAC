// X API Integration Hook - Uses Real Convex Social Connections
// /Users/matthewsimon/Projects/eac/eac/lib/hooks/useXApi.ts

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation } from "convex/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSocialConnectionSync } from "./useSocialConnectionSync";

interface PostTweetArgs {
  text: string;
  reply_settings?: 'following' | 'mentionedUsers' | 'subscribers' | 'verified';
  media_files?: File[];
  poll?: {
    options: string[];
    duration_minutes: number;
  };
  is_thread?: boolean;
  thread_tweets?: string[];
}

interface SchedulePostArgs extends PostTweetArgs {
  scheduledFor: string;
  fileName: string;
}

export function useXApi() {
  const [isPosting, setIsPosting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Use centralized social connection sync
  const { twitterConnection, isLoading: connectionsLoading } = useSocialConnectionSync();
  
  // Minimal debug logging to prevent performance issues
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
      console.log('🔍 useXApi connection state:', {
        hasConnection: !!twitterConnection,
        isLoading: connectionsLoading
      });
    }
  }, [twitterConnection, connectionsLoading]);

  // Convex actions for X API
  const createTweetAction = useAction(api.xApiActions.createTweet);
  const uploadMediaAction = useAction(api.xApiActions.uploadMedia);
  const deleteConnectionMutation = useMutation(api.x.deleteXConnection);

  const postTweet = useCallback(async (args: PostTweetArgs) => {
    console.log('🐦 PostTweet called with:', { hasConnection: !!twitterConnection, connectionId: twitterConnection?._id });
    
    if (!twitterConnection) {
      console.error('❌ No X connection found.');
      return {
        success: false,
        error: 'No active X connection found. Please connect your X account in Settings → Social Connections.'
      };
    }

    if (!twitterConnection.twitterAccessToken) {
      console.error('❌ X connection found but no access token:', { connectionId: twitterConnection._id, platform: twitterConnection.platform });
      return {
        success: false,
        error: 'X connection found but not properly authenticated. Please reconnect your X account.'
      };
    }

    try {
      setIsPosting(true);
      console.log('🐦 Starting tweet creation...');

      const mediaIds: string[] = [];

      // Upload media files if provided
      if (args.media_files && args.media_files.length > 0) {
        setIsUploading(true);
        
        for (const file of args.media_files) {
          try {
            // Convert file to base64 for upload
            const base64Data = await fileToBase64(file);
            
            const mediaResult = await uploadMediaAction({
              connectionId: twitterConnection._id as Id<"socialConnections">,
              mediaData: base64Data,
              mediaType: file.type,
            });

            if (mediaResult.success && mediaResult.media_id_string) {
              mediaIds.push(mediaResult.media_id_string);
            } else {
              console.warn('Failed to upload media:', mediaResult.error);
            }
          } catch (error) {
            console.error('Error uploading media file:', error);
          }
        }
        setIsUploading(false);
      }

      // Handle thread posting
      if (args.is_thread && args.thread_tweets && args.thread_tweets.length > 1) {
        // Post first tweet
        const firstTweet = await createTweetAction({
          connectionId: twitterConnection._id as Id<"socialConnections">,
          text: args.thread_tweets[0],
          mediaIds: mediaIds.length > 0 ? [mediaIds[0]] : undefined,
          replySettings: args.reply_settings,
        });

        if (!firstTweet.success) {
          throw new Error(firstTweet.error || 'Failed to post first tweet');
        }

        let previousTweetId = firstTweet.data?.id;

        // Post remaining tweets as replies
        for (let i = 1; i < args.thread_tweets.length; i++) {
          const threadTweet = await createTweetAction({
            connectionId: twitterConnection._id as Id<"socialConnections">,
            text: args.thread_tweets[i],
            replyToId: previousTweetId,
            mediaIds: mediaIds[i] ? [mediaIds[i]] : undefined,
            replySettings: args.reply_settings,
          });

          if (!threadTweet.success) {
            console.error(`Failed to post tweet ${i + 1} in thread:`, threadTweet.error);
            break;
          }

          previousTweetId = threadTweet.data?.id;
        }

        return {
          success: true,
          message: `Thread posted successfully with ${args.thread_tweets.length} tweets`,
          data: firstTweet.data
        };
      } else {
        // Single tweet
        console.log('🐦 Calling createTweetAction with:', { 
          connectionId: twitterConnection._id, 
          text: args.text, 
          textLength: args.text.length,
          mediaCount: mediaIds.length,
          replySettings: args.reply_settings 
        });
        
        // Validate tweet text
        if (!args.text || args.text.trim().length === 0) {
          console.error('❌ Tweet text is empty');
          return {
            success: false,
            error: 'Tweet text cannot be empty',
          };
        }
        
        if (args.text.length > 280) {
          console.error('❌ Tweet text too long:', args.text.length);
          return {
            success: false,
            error: `Tweet text is too long (${args.text.length} characters). Maximum is 280 characters.`,
          };
        }
        
        const result = await createTweetAction({
          connectionId: twitterConnection._id as Id<"socialConnections">,
          text: args.text,
          mediaIds: mediaIds.length > 0 ? mediaIds : undefined,
          replySettings: args.reply_settings,
        });

        console.log('🐦 CreateTweetAction result:', result);

        return {
          success: result.success,
          message: result.success ? 'Tweet posted successfully!' : result.error || 'Failed to post tweet',
          data: result.data,
          error: result.error
        };
      }

    } catch (error) {
      console.error('Error posting tweet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      setIsPosting(false);
      setIsUploading(false);
    }
  }, [twitterConnection, createTweetAction, uploadMediaAction]); // useCallback dependencies

  const schedulePost = useCallback(async (args: SchedulePostArgs) => {
    if (!twitterConnection) {
      return {
        success: false,
        error: 'No active X connection found. Please connect your X account first.'
      };
    }

    setIsScheduling(true);
    
    try {
      // For now, store scheduled posts in localStorage 
      // In production, you'd want to use Convex mutations to store in a scheduledPosts table
      const scheduledData = {
        ...args,
        connectionId: twitterConnection._id,
        
        createdAt: new Date().toISOString(),
        status: 'scheduled' as const,
        scheduledId: `sched_${Date.now()}`
      };

      // Store in localStorage for demo purposes
      const existingScheduled = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
      existingScheduled.push(scheduledData);
      localStorage.setItem('scheduledPosts', JSON.stringify(existingScheduled));

      return {
        success: true,
        message: `Post scheduled for ${new Date(args.scheduledFor).toLocaleString()}`,
        data: { 
          scheduledId: scheduledData.scheduledId, 
          scheduledFor: args.scheduledFor,
          status: 'scheduled'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule post'
      };
    } finally {
      setIsScheduling(false);
    }
  }, [twitterConnection]); // useCallback dependencies

  const uploadMediaFile = useCallback(async (file: File) => {
    if (!twitterConnection) {
      throw new Error('No active X connection');
    }

    setIsUploading(true);
    
    try {
      const base64Data = await fileToBase64(file);
      
      const result = await uploadMediaAction({
        connectionId: twitterConnection._id as Id<"socialConnections">,
        mediaData: base64Data,
        mediaType: file.type,
      });

      return result;
    } finally {
      setIsUploading(false);
    }
  }, [twitterConnection, uploadMediaAction]); // useCallback dependencies

  const disconnectAccount = useCallback(async () => {
    console.log('🔌 disconnectAccount function called - START');
    console.log('🔌 twitterConnection check:', !!twitterConnection);
    
    if (!twitterConnection) {
      console.log('❌ No X connection to disconnect');
      return {
        success: false,
        error: 'No X connection found to disconnect'
      };
    }

    try {
      console.log('🔌 About to call deleteConnectionMutation with:', { 
        connectionId: twitterConnection._id,
        connectionIdType: typeof twitterConnection._id 
      });
      
      const mutationResult = await deleteConnectionMutation({
        connectionId: twitterConnection._id as Id<"socialConnections">
      });

      console.log('🔌 deleteConnectionMutation completed:', mutationResult);
      console.log('✅ X account disconnected successfully');
      
      return {
        success: true,
        message: 'X account disconnected successfully'
      };
    } catch (error) {
      console.error('❌ Failed to disconnect X account:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack'
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to disconnect X account'
      };
    }
  }, [twitterConnection, deleteConnectionMutation]); // useCallback dependencies

  // Memoize the return values to prevent infinite re-renders
  const returnValues = useMemo(() => ({
    postTweet,
    schedulePost,
    uploadMediaFile,
    disconnectAccount,
    isPosting,
    isScheduling,
    isUploading,
    hasConnection: !!twitterConnection,
    connectionInfo: twitterConnection ? {
      username: twitterConnection.twitterScreenName || twitterConnection.username || 'Unknown',
      userId: twitterConnection.twitterUserId || 'Unknown',
      connectionId: twitterConnection._id,
    } : null,
  }), [
    postTweet, schedulePost, uploadMediaFile, disconnectAccount,
    isPosting, isScheduling, isUploading, twitterConnection
  ]);

  // Minimal return logging to prevent performance issues
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) {
    console.log('🔍 useXApi returning - hasConnection:', !!returnValues.hasConnection);
  }

  return returnValues;
}

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data:image/jpeg;base64, prefix
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}
