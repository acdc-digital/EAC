// Project File Sync Hook
// lib/hooks/useProjectFileSync.ts

import { useEditorStore } from "@/store";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

/**
 * Simplified hook to trigger project file sync events
 * The actual syncing will be handled by components with individual queries
 */
export function useProjectFileSync() {
  const { isSignedIn } = useAuth();
  const { projectFolders, projectFiles } = useEditorStore();

  // Get all projects to sync files for projects with convexId
  const projectsWithConvexId = projectFolders.filter(folder => folder.convexId);

  // Trigger sync events for components to handle
  useEffect(() => {
    if (!isSignedIn || projectsWithConvexId.length === 0) return;

    // Dispatch sync request events for each project
    projectsWithConvexId.forEach(folder => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('requestProjectFileSync', {
          detail: {
            projectId: folder.convexId,
            folderId: folder.id,
            folderName: folder.name
          }
        }));
      }
    });
  }, [
    isSignedIn,
    projectsWithConvexId.map(f => f.convexId).join(','), // Only depend on project IDs
    projectFiles.map(f => f.convexId).filter(Boolean).join(',') // Only depend on existing convex IDs
  ]);

  return {
    // Return project info for components that want to track sync status
    projects: projectsWithConvexId.map(folder => ({
      folderId: folder.id,
      folderName: folder.name,
      convexId: folder.convexId,
    }))
  };
}
