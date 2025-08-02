// Content Creation Project Management Hook
// /Users/matthewsimon/Projects/eac/eac/lib/hooks/useContentCreation.ts

import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { useEffect } from 'react';

/**
 * Hook to manage Content Creation project and files
 * Automatically ensures Content Creation project exists for authenticated users
 */
export function useContentCreation() {
  const { isSignedIn } = useAuth();
  
  // Queries - only run when user is signed in
  const contentCreationProject = useQuery(
    api.projects.getContentCreationProject, 
    isSignedIn ? {} : "skip"
  );
  const contentCreationFiles = useQuery(
    api.files.getContentCreationFiles, 
    isSignedIn && contentCreationProject ? {} : "skip"
  );
  
  // Mutations
  const ensureContentCreationProject = useMutation(api.projects.ensureContentCreationProject);
  const createContentCreationFile = useMutation(api.files.createContentCreationFile);
  
  // Automatically ensure Content Creation project exists when user is signed in
  useEffect(() => {
    if (isSignedIn && !contentCreationProject) {
      ensureContentCreationProject({})
        .then(() => {
          console.log('✅ Content Creation project ensured for user');
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
    
    // Status
    isSignedIn,
    isReady: Boolean(isSignedIn && contentCreationProject),
  };
}
