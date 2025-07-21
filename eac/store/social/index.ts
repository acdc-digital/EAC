// Social Media Store (Zustand)
// /Users/matthewsimon/Projects/eac/eac/store/social/index.ts

import type { ConvexReactClient } from 'convex/react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
    CreateRedditPostArgs,
    CreateSocialConnectionArgs,
    RedditPost,
    SocialConnection,
    SocialStoreState,
    UpdateRedditPostArgs,
} from './types';

// We need to get the Convex client instance
// This will be injected when the store is used in components wrapped with ConvexProvider
let convexClient: ConvexReactClient;

export const useSocialStore = create<SocialStoreState>()(
  devtools(
    (set, get) => ({
      // Initial State
      connections: [],
      redditConnection: null,
      isLoadingConnections: false,
      redditPosts: [],
      isLoadingPosts: false,
      selectedPost: null,
      isConnecting: false,
      isPosting: false,
      error: null,

      // Connection Management Actions
      loadConnections: async (userId: string) => {
        set({ isLoadingConnections: true, error: null });
        
        try {
          // This would be called from a React component with proper Convex hooks
          // For now, we'll update this when integrating with the UI
          set({ isLoadingConnections: false });
        } catch (error) {
          set({ 
            isLoadingConnections: false, 
            error: error instanceof Error ? error.message : 'Failed to load connections'
          });
        }
      },

      createConnection: async (userId: string, data: CreateSocialConnectionArgs) => {
        set({ isConnecting: true, error: null });
        
        try {
          // This will be implemented with proper Convex mutation calls
          // For now, return a placeholder
          const connectionId = 'placeholder-id';
          
          // Update local state
          const newConnection: SocialConnection = {
            _id: connectionId,
            _creationTime: Date.now(),
            userId,
            ...data,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          set(state => ({
            connections: [...state.connections, newConnection],
            redditConnection: data.platform === 'reddit' ? newConnection : state.redditConnection,
            isConnecting: false
          }));
          
          return connectionId;
        } catch (error) {
          set({ 
            isConnecting: false, 
            error: error instanceof Error ? error.message : 'Failed to create connection'
          });
          throw error;
        }
      },

      disconnectAccount: async (connectionId: string) => {
        set({ isConnecting: true, error: null });
        
        try {
          // Remove from local state
          set(state => ({
            connections: state.connections.filter(c => c._id !== connectionId),
            redditConnection: state.redditConnection?._id === connectionId ? null : state.redditConnection,
            isConnecting: false
          }));
        } catch (error) {
          set({ 
            isConnecting: false, 
            error: error instanceof Error ? error.message : 'Failed to disconnect account'
          });
        }
      },

      testConnection: async (connectionId: string) => {
        try {
          // Implement connection test logic
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Connection test failed' });
          return false;
        }
      },

      // Reddit Posts Actions
      loadRedditPosts: async (userId: string, status?: "draft" | "scheduled" | "published" | "failed") => {
        set({ isLoadingPosts: true, error: null });
        
        try {
          // This would be called from a React component with proper Convex hooks
          set({ isLoadingPosts: false });
        } catch (error) {
          set({ 
            isLoadingPosts: false, 
            error: error instanceof Error ? error.message : 'Failed to load posts'
          });
        }
      },

      createRedditPost: async (userId: string, data: CreateRedditPostArgs) => {
        set({ error: null });
        
        try {
          // This will be implemented with proper Convex mutation calls
          const postId = 'placeholder-post-id';
          
          const newPost: RedditPost = {
            _id: postId,
            _creationTime: Date.now(),
            userId,
            connectionId: get().redditConnection?._id || '',
            fileId: data.fileId,
            subreddit: data.subreddit.replace(/^r\//, ''),
            title: data.title,
            kind: data.kind,
            text: data.text,
            url: data.url,
            nsfw: data.nsfw || false,
            spoiler: data.spoiler || false,
            flairId: data.flairId,
            flairText: data.flairText,
            sendReplies: data.sendReplies !== false,
            status: data.publishAt && data.publishAt > Date.now() ? 'scheduled' : 'draft',
            publishAt: data.publishAt,
            retryCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          set(state => ({
            redditPosts: [...state.redditPosts, newPost]
          }));
          
          return postId;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create post' });
          throw error;
        }
      },

      updateRedditPost: async (postId: string, updates: UpdateRedditPostArgs) => {
        set({ error: null });
        
        try {
          set(state => ({
            redditPosts: state.redditPosts.map(post =>
              post._id === postId
                ? { ...post, ...updates, updatedAt: Date.now() }
                : post
            )
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update post' });
        }
      },

      deleteRedditPost: async (postId: string) => {
        set({ error: null });
        
        try {
          set(state => ({
            redditPosts: state.redditPosts.filter(post => post._id !== postId),
            selectedPost: state.selectedPost?._id === postId ? null : state.selectedPost
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete post' });
        }
      },

      submitPost: async (postId: string) => {
        set({ isPosting: true, error: null });
        
        try {
          // Update post status to publishing
          set(state => ({
            redditPosts: state.redditPosts.map(post =>
              post._id === postId
                ? { ...post, status: 'publishing' as const, updatedAt: Date.now() }
                : post
            )
          }));
          
          // This will be implemented with proper Convex action calls
          // For now, simulate success
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => ({
            redditPosts: state.redditPosts.map(post =>
              post._id === postId
                ? { 
                    ...post, 
                    status: 'published' as const, 
                    publishedAt: Date.now(),
                    publishedUrl: `https://reddit.com/r/${post.subreddit}/comments/example`,
                    updatedAt: Date.now()
                  }
                : post
            ),
            isPosting: false
          }));
          
          return true;
        } catch (error) {
          set(state => ({
            redditPosts: state.redditPosts.map(post =>
              post._id === postId
                ? { 
                    ...post, 
                    status: 'failed' as const, 
                    error: error instanceof Error ? error.message : 'Submission failed',
                    updatedAt: Date.now()
                  }
                : post
            ),
            isPosting: false,
            error: error instanceof Error ? error.message : 'Failed to submit post'
          }));
          return false;
        }
      },

      schedulePost: async (postId: string, publishAt: number) => {
        set({ error: null });
        
        try {
          set(state => ({
            redditPosts: state.redditPosts.map(post =>
              post._id === postId
                ? { ...post, status: 'scheduled' as const, publishAt, updatedAt: Date.now() }
                : post
            )
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to schedule post' });
        }
      },

      // UI State Actions
      setSelectedPost: (post: RedditPost | null) => {
        set({ selectedPost: post });
      },

      clearError: () => {
        set({ error: null });
      },

      // Utility Actions
      validateSubreddit: async (subreddit: string) => {
        try {
          // This would call Reddit API to validate subreddit
          // For now, basic validation
          const cleanSubreddit = subreddit.replace(/^r\//, '');
          return cleanSubreddit.length > 0 && cleanSubreddit.length <= 21;
        } catch {
          return false;
        }
      },

      getPostsByStatus: (status: "draft" | "scheduled" | "published" | "failed") => {
        return get().redditPosts.filter(post => post.status === status);
      },

      getPostsBySubreddit: (subreddit: string) => {
        const cleanSubreddit = subreddit.replace(/^r\//, '');
        return get().redditPosts.filter(post => 
          post.subreddit.toLowerCase() === cleanSubreddit.toLowerCase()
        );
      },
    }),
    {
      name: 'social-store',
    }
  )
);

// Export individual selectors for better performance
export const useSocialConnections = () => useSocialStore(state => state.connections);
export const useRedditConnection = () => useSocialStore(state => state.redditConnection);
export const useRedditPosts = () => useSocialStore(state => state.redditPosts);
export const useSelectedPost = () => useSocialStore(state => state.selectedPost);
export const useSocialError = () => useSocialStore(state => state.error);
export const useIsConnecting = () => useSocialStore(state => state.isConnecting);
export const useIsPosting = () => useSocialStore(state => state.isPosting);

// Export typed actions
export const useSocialActions = () => useSocialStore(state => ({
  loadConnections: state.loadConnections,
  createConnection: state.createConnection,
  disconnectAccount: state.disconnectAccount,
  testConnection: state.testConnection,
  loadRedditPosts: state.loadRedditPosts,
  createRedditPost: state.createRedditPost,
  updateRedditPost: state.updateRedditPost,
  deleteRedditPost: state.deleteRedditPost,
  submitPost: state.submitPost,
  schedulePost: state.schedulePost,
  setSelectedPost: state.setSelectedPost,
  clearError: state.clearError,
  validateSubreddit: state.validateSubreddit,
  getPostsByStatus: state.getPostsByStatus,
  getPostsBySubreddit: state.getPostsBySubreddit,
}));
