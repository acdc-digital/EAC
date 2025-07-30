// X/Twitter Posts Store (Zustand)
// /Users/matthewsimon/Projects/eac/eac/store/social/xPosts.ts

import type { Id } from '@/convex/_generated/dataModel';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface XPostFormData {
  text: string;
  replySettings: 'everyone' | 'mentionedUsers' | 'followers';
  scheduledDate: string;
  scheduledTime: string;
  isThread: boolean;
  threadTweets: string[];
  mediaFiles: {
    name: string;
    size: number;
    type: string;
    // We'll store file references instead of actual File objects
  }[]; 
  hasPoll: boolean;
  pollOptions: string[];
  pollDuration: string;
}

export interface XPost {
  _id: Id<"xPosts">;
  _creationTime: number;
  userId: string;
  connectionId: Id<"socialConnections">;
  fileId?: Id<"files">;
  fileName?: string;
  
  // Content
  text: string;
  mediaIds?: string[];
  mediaUrls?: string[];
  mediaTypes?: ('image' | 'video' | 'gif')[];
  
  // Reply/Thread
  replyToId?: string;
  isThread: boolean;
  threadPosition?: number;
  
  // Settings
  replySettings: 'everyone' | 'mentionedUsers' | 'followers';
  geo?: {
    coordinates: [number, number];
    placeName?: string;
  };
  
  // Scheduling & Status
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  publishAt?: number;
  publishedAt?: number;
  tweetUrl?: string;
  tweetId?: string;
  
  // Analytics
  retweetCount?: number;
  likeCount?: number;
  replyCount?: number;
  quoteCount?: number;
  impressionCount?: number;
  
  // Character tracking
  characterCount: number;
  isOverLimit: boolean;
  
  // Error handling
  error?: string;
  retryCount: number;
  lastRetryAt?: number;
  contributesToMonthlyLimit: boolean;
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}

interface XPostStoreState {
  // Posts data
  posts: XPost[];
  currentPost: XPost | null;
  isLoading: boolean;
  error: string | null;
  
  // Form data cache (persisted per fileName)
  formDataCache: Record<string, XPostFormData>;
  
  // Actions
  loadPosts: (userId: string, connectionId?: Id<"socialConnections">) => Promise<void>;
  loadPostByFileName: (userId: string, fileName: string) => Promise<void>;
  createPost: (data: Partial<XPost>) => Promise<Id<"xPosts">>;
  updatePost: (postId: Id<"xPosts">, data: Partial<XPost>) => Promise<void>;
  updatePostStatus: (postId: Id<"xPosts">, status: XPost['status'], additionalData?: Partial<XPost>) => Promise<void>;
  
  // Form data management
  saveFormData: (fileName: string, data: XPostFormData) => void;
  getFormData: (fileName: string) => XPostFormData | null;
  clearFormData: (fileName: string) => void;
  
  // UI Actions
  setCurrentPost: (post: XPost | null) => void;
  clearError: () => void;
}

// Default form data
const getDefaultFormData = (): XPostFormData => ({
  text: '',
  replySettings: 'everyone',
  scheduledDate: '',
  scheduledTime: '',
  isThread: false,
  threadTweets: [''],
  mediaFiles: [],
  hasPoll: false,
  pollOptions: ['', ''],
  pollDuration: '1440',
});

export const useXPostStore = create<XPostStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        posts: [],
        currentPost: null,
        isLoading: false,
        error: null,
        formDataCache: {},

        // Actions
        loadPosts: async (userId: string, connectionId?: Id<"socialConnections">) => {
          set({ isLoading: true, error: null });
          
          try {
            // This will be called from React components with proper Convex hooks
            // For now, we'll implement it as a placeholder
            set({ isLoading: false });
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to load posts'
            });
          }
        },

        loadPostByFileName: async (userId: string, fileName: string) => {
          set({ isLoading: true, error: null });
          
          try {
            // This will be implemented with proper Convex queries
            set({ isLoading: false });
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to load post'
            });
          }
        },

        createPost: async (data: Partial<XPost>) => {
          try {
            // This will be implemented with Convex mutations
            const postId = `post_${Date.now()}` as Id<"xPosts">;
            
            // Update local state optimistically
            const newPost: XPost = {
              _id: postId,
              _creationTime: Date.now(),
              userId: data.userId || 'temp-user-id',
              connectionId: data.connectionId || '' as Id<"socialConnections">,
              text: data.text || '',
              isThread: data.isThread || false,
              replySettings: data.replySettings || 'everyone',
              status: data.status || 'draft',
              characterCount: data.text?.length || 0,
              isOverLimit: (data.text?.length || 0) > 280,
              retryCount: 0,
              contributesToMonthlyLimit: false,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              ...data,
            };
            
            set(state => ({
              posts: [...state.posts, newPost],
              currentPost: newPost
            }));
            
            return postId;
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to create post' });
            throw error;
          }
        },

        updatePost: async (postId: Id<"xPosts">, data: Partial<XPost>) => {
          try {
            set(state => ({
              posts: state.posts.map(post =>
                post._id === postId
                  ? { ...post, ...data, updatedAt: Date.now() }
                  : post
              ),
              currentPost: state.currentPost?._id === postId 
                ? { ...state.currentPost, ...data, updatedAt: Date.now() }
                : state.currentPost
            }));
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update post' });
          }
        },

        updatePostStatus: async (postId: Id<"xPosts">, status: XPost['status'], additionalData?: Partial<XPost>) => {
          try {
            const updates = {
              status,
              ...additionalData,
              updatedAt: Date.now()
            };

            set(state => ({
              posts: state.posts.map(post =>
                post._id === postId ? { ...post, ...updates } : post
              ),
              currentPost: state.currentPost?._id === postId 
                ? { ...state.currentPost, ...updates }
                : state.currentPost
            }));
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update post status' });
          }
        },

        // Form data management
        saveFormData: (fileName: string, data: XPostFormData) => {
          console.log('� Store: Saving form data for', fileName);
          set(state => ({
            formDataCache: {
              ...state.formDataCache,
              [fileName]: { ...data }
            }
          }));
        },

        getFormData: (fileName: string) => {
          const data = get().formDataCache[fileName];
          console.log('🔍 Store: Retrieved form data for', fileName, data ? '✅ Found' : '❌ Not found');
          return data ? { ...data } : null;
        },

        clearFormData: (fileName: string) => {
          set(state => {
            const { [fileName]: removed, ...rest } = state.formDataCache;
            return { formDataCache: rest };
          });
        },

        // UI Actions
        setCurrentPost: (post: XPost | null) => {
          set({ currentPost: post });
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'x-post-store',
        partialize: (state) => ({
          formDataCache: state.formDataCache,
        }),
      }
    ),
    { name: 'x-post-store' }
  )
);

// Selector hooks for better performance
export const useXPosts = () => useXPostStore(state => state.posts);
export const useCurrentXPost = () => useXPostStore(state => state.currentPost);
export const useXPostLoading = () => useXPostStore(state => state.isLoading);
export const useXPostError = () => useXPostStore(state => state.error);

// Individual action hooks for stable references
export const useLoadXPosts = () => useXPostStore(state => state.loadPosts);
export const useCreateXPost = () => useXPostStore(state => state.createPost);
export const useUpdateXPost = () => useXPostStore(state => state.updatePost);
export const useSaveXFormData = () => useXPostStore(state => state.saveFormData);
export const useGetXFormData = () => useXPostStore(state => state.getFormData);
