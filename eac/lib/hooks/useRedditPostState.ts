// File-specific Reddit Post State Management
// /Users/matthewsimon/Projects/eac/eac/lib/hooks/useRedditPostState.ts

import { useCallback, useEffect, useState } from 'react';

export interface RedditPostFormState {
  postTitle: string;
  postContent: string;
  postType: 'self' | 'link' | 'image' | 'video';
  subreddit: string;
  flair: string;
  linkUrl: string;
  isNsfw: boolean;
  isSpoiler: boolean;
  sendReplies: boolean;
  scheduledDate: string;
  scheduledTime: string;
  mediaFiles: File[];
}

const defaultState: RedditPostFormState = {
  postTitle: '',
  postContent: '',
  postType: 'self',
  subreddit: '',
  flair: '',
  linkUrl: '',
  isNsfw: false,
  isSpoiler: false,
  sendReplies: true,
  scheduledDate: '',
  scheduledTime: '',
  mediaFiles: [],
};

// Global file state map to persist state across component unmounts
const fileStateMap = new Map<string, RedditPostFormState>();

// Utility function to clear state for a specific file (useful when creating new files)
export function clearRedditPostState(fileName: string) {
  console.log(`🧹 Clearing Reddit state for file: ${fileName}`);
  fileStateMap.delete(fileName);
  // Force a re-render by dispatching a custom event that components can listen to
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('redditStateCleared', { 
      detail: { fileName } 
    }));
  }
}

// Utility function to check if a file has existing state
export function hasRedditPostState(fileName: string): boolean {
  return fileStateMap.has(fileName);
}

export function useRedditPostState(fileName: string) {
  // Initialize state from file map or default - always check for existing state first
  const [state, setState] = useState<RedditPostFormState>(() => {
    const existingState = fileStateMap.get(fileName);
    if (existingState) {
      return existingState;
    }
    // Return a completely fresh copy of default state for new files
    return { ...defaultState };
  });

  // Track the current fileName to detect changes
  const [currentFileName, setCurrentFileName] = useState(fileName);

  // When fileName changes (switching files), update state accordingly
  useEffect(() => {
    if (currentFileName !== fileName) {
      const existingState = fileStateMap.get(fileName);
      if (existingState) {
        // Load existing file state
        setState(existingState);
      } else {
        // New file - start completely blank and ensure it's not in the map
        fileStateMap.delete(fileName); // Ensure clean slate
        setState({ ...defaultState });
      }
      setCurrentFileName(fileName);
    }
  }, [fileName, currentFileName]);

  // Keep file state map updated whenever state changes
  useEffect(() => {
    fileStateMap.set(fileName, state);
  }, [fileName, state]);

  // Listen for external state clearing events
  useEffect(() => {
    const handleStateCleared = (event: CustomEvent) => {
      if (event.detail.fileName === fileName) {
        setState({ ...defaultState });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('redditStateCleared', handleStateCleared as EventListener);
      return () => {
        window.removeEventListener('redditStateCleared', handleStateCleared as EventListener);
      };
    }
  }, [fileName]);

  // Individual setters that maintain file-specific state
  const setPostTitle = useCallback((value: string) => {
    setState(prev => ({ ...prev, postTitle: value }));
  }, []);

  const setPostContent = useCallback((value: string) => {
    setState(prev => ({ ...prev, postContent: value }));
  }, []);

  const setPostType = useCallback((value: 'self' | 'link' | 'image' | 'video') => {
    setState(prev => ({ ...prev, postType: value }));
  }, []);

  const setSubreddit = useCallback((value: string) => {
    setState(prev => ({ ...prev, subreddit: value }));
  }, []);

  const setFlair = useCallback((value: string) => {
    setState(prev => ({ ...prev, flair: value }));
  }, []);

  const setLinkUrl = useCallback((value: string) => {
    setState(prev => ({ ...prev, linkUrl: value }));
  }, []);

  const setIsNsfw = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, isNsfw: value }));
  }, []);

  const setIsSpoiler = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, isSpoiler: value }));
  }, []);

  const setSendReplies = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, sendReplies: value }));
  }, []);

  const setScheduledDate = useCallback((value: string) => {
    setState(prev => ({ ...prev, scheduledDate: value }));
  }, []);

  const setScheduledTime = useCallback((value: string) => {
    setState(prev => ({ ...prev, scheduledTime: value }));
  }, []);

  const setMediaFiles = useCallback((value: File[]) => {
    setState(prev => ({ ...prev, mediaFiles: value }));
  }, []);

  // Bulk update function for loading from database
  const loadFromExistingPost = useCallback((postData: Partial<RedditPostFormState>) => {
    setState(prev => ({ ...prev, ...postData }));
  }, []);

  // Function to explicitly reset state to defaults (useful for new files)
  const resetToDefaults = useCallback(() => {
    setState({ ...defaultState });
    fileStateMap.delete(fileName); // Remove from map so it starts fresh
  }, [fileName]);

  // Function to get current state as plain object (for API calls)
  const getFormData = useCallback(() => {
    return {
      title: state.postTitle,
      text: state.postContent,
      kind: state.postType,
      subreddit: state.subreddit,
      flairText: state.flair,
      url: state.linkUrl,
      nsfw: state.isNsfw,
      spoiler: state.isSpoiler,
      sendReplies: state.sendReplies,
      // Convert scheduled date/time to publishAt timestamp
      publishAt: state.scheduledDate && state.scheduledTime 
        ? new Date(`${state.scheduledDate}T${state.scheduledTime}`).getTime()
        : undefined,
    };
  }, [state]);

  return {
    // State values
    ...state,
    
    // Setters
    setPostTitle,
    setPostContent,
    setPostType,
    setSubreddit,
    setFlair,
    setLinkUrl,
    setIsNsfw,
    setIsSpoiler,
    setSendReplies,
    setScheduledDate,
    setScheduledTime,
    setMediaFiles,
    
    // Utility functions
    loadFromExistingPost,
    resetToDefaults,
    getFormData,
  };
}
