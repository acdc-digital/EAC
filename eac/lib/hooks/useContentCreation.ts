// Content Creation Project Management Hook
// /Users/matthewsimon/Projects/eac/eac/lib/hooks/useContentCreation.ts

import { api } from '@/convex/_generated/api';
import { useEditorStore } from '@/store';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook to manage Content Creation project and files
 * Automatically ensures Content Creation project exists for authenticated users
 */
export function useContentCreation() {
  const { isSignedIn } = useAuth();
  const { updateFolderConvexId } = useEditorStore();
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Queries - only run when user is signed in
  const contentCreationProject = useQuery(
    api.projects.getContentCreationProject, 
    isSignedIn ? {} : "skip"
  );
  const contentCreationFiles = useQuery(
    api.files.getContentCreationFiles, 
    isSignedIn ? {} : "skip"
  );

  // Mutations
  const ensureContentCreationProject = useMutation(api.projects.ensureContentCreationProject);
  const createContentCreationFile = useMutation(api.files.createContentCreationFile);
  
  // Force refresh by updating timestamp
  const refreshFiles = useCallback(() => {
    console.log('🔄 Triggering content files refresh...');
    setLastRefresh(Date.now());
  }, []);
  
  // Auto-refresh mechanism - poll for changes for 5 seconds after activity
  const startPolling = useCallback(() => {
    console.log('🔄 Starting content files polling...');
    
    // Clear existing interval
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }
    
    let pollCount = 0;
    const maxPolls = 8; // Poll for 4 seconds (500ms * 8)
    
    pollingInterval.current = setInterval(() => {
      pollCount++;
      console.log(`� Polling content files (${pollCount}/${maxPolls})...`);
      setLastRefresh(Date.now());
      
      if (pollCount >= maxPolls) {
        console.log('⏹️ Stopping content files polling');
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }
      }
    }, 500);
  }, []);

  // Listen for terminal activity that might create files
  useEffect(() => {
    const handleChatActivity = () => {
      console.log('� Chat activity detected, will start polling for new content files...');
      setTimeout(() => {
        startPolling();
      }, 1000); // Wait 1 second then start polling
    };

    // Listen for chat/terminal activity
    window.addEventListener('chatActivity', handleChatActivity);
    
    return () => {
      window.removeEventListener('chatActivity', handleChatActivity);
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [startPolling]);
  
  // Automatically ensure Content Creation project exists when user is signed in
  useEffect(() => {
    if (isSignedIn && !contentCreationProject) {
      ensureContentCreationProject({})
        .then((project) => {
          if (project) {
            console.log('✅ Content Creation project ensured for user:', project._id);
            
            // Update the local Content Creation folder with the Convex project ID
            updateFolderConvexId('content-creation-folder', project._id);
          }
        })
        .catch((error) => {
          console.error('❌ Failed to ensure Content Creation project:', error);
        });
    }
  }, [isSignedIn, contentCreationProject, ensureContentCreationProject]);

  return {
    // Project
    contentCreationProject,
    isContentCreationProjectLoading: contentCreationProject === undefined,
    
    // Files
    contentCreationFiles: contentCreationFiles ?? [],
    isContentCreationFilesLoading: contentCreationFiles === undefined,
    
    // Mutations
    createContentCreationFile,
    
    // Refresh mechanism
    refreshFiles,
    startPolling,
    
    // Status
    isSignedIn,
    isReady: Boolean(isSignedIn && contentCreationProject),
    lastRefresh, // This will trigger re-renders when changed
  };
}
