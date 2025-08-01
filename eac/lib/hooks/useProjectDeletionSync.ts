// Hook for handling project deletion events and syncing with database
// /Users/matthewsimon/Projects/eac/eac/lib/hooks/useProjectDeletionSync.ts

"use client";

import { api } from '@/convex/_generated/api';
import type { ProjectFile, ProjectFolder } from '@/store/editor/types';
import { useAuth } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { useEffect } from 'react';

interface ProjectDeletionEvent {
  folder: ProjectFolder;
  convexId: string;
  files: ProjectFile[];
}

export function useProjectDeletionSync() {
  const { isSignedIn, userId } = useAuth();
  const deleteProject = useMutation(api.trash.deleteProject);

  useEffect(() => {
    const handleProjectDeleted = (event: Event) => {
      const customEvent = event as CustomEvent<ProjectDeletionEvent>;
      
      if (!isSignedIn || !userId) {
        console.log('📝 User not signed in, skipping database project deletion sync');
        return;
      }

      const { folder, convexId, files } = customEvent.detail;

      const syncDeletion = async () => {
        try {
          console.log('🗑️ Syncing project deletion to database:', folder.name);
          
          // Delete the project from the database (this will also handle associated files)
          await deleteProject({
            id: convexId as any,
            deletedBy: userId
          });
          
          console.log('✅ Project successfully moved to trash in database:', folder.name);
        } catch (error) {
          console.error('❌ Failed to sync project deletion to database:', error);
        }
      };

      syncDeletion();
    };

    // Listen for project deletion events
    window.addEventListener('projectDeletedLocally', handleProjectDeleted);

    return () => {
      window.removeEventListener('projectDeletedLocally', handleProjectDeleted);
    };
  }, [isSignedIn, userId, deleteProject]);

  return { isOnline: isSignedIn };
}
