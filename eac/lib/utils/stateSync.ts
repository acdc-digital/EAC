/**
 * State Synchronization Utilities
 * Provides utilities for syncing between Convex database and Zustand stores
 */

import { useEditorStore } from "@/store";
import { useProjectStore } from "@/store/projects";
import type { Project } from "@/store/projects/types";

export interface SyncStatus {
  isLoading: boolean;
  lastSyncTime: Date | null;
  convexProjectCount: number;
  zustandProjectCount: number;
  zustandFolderCount: number;
  error: string | null;
}

/**
 * Clear all persisted state data
 * Call this when you want to reset everything to match the database
 */
export function clearAllPersistedState() {
  console.log("🧹 Clearing all persisted state...");
  
  // Clear all localStorage keys used by the app
  const keysToRemove = [
    'editor-storage',
    'project-store',
    'sidebar-store',
    'social-store',
    'terminal-store',
    'calendar-store',
    'materials-store',
    'daily-tracker-store'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`  ✅ Cleared ${key}`);
  });
  
  // Reset Zustand stores to initial state
  useEditorStore.getState().reset();
  useProjectStore.getState().reset();
  
  console.log("🎉 All persisted state cleared successfully!");
  console.log("💡 Refresh the page to see the changes");
}

/**
 * Get current sync status between Convex and Zustand
 */
export function getSyncStatus(
  convexProjects: Project[] | undefined,
  isLoadingProjects: boolean
): SyncStatus {
  const { projectFolders } = useEditorStore.getState();
  const { projects } = useProjectStore.getState();
  
  return {
    isLoading: isLoadingProjects,
    lastSyncTime: new Date(),
    convexProjectCount: convexProjects?.length ?? 0,
    zustandProjectCount: projects.length,
    zustandFolderCount: projectFolders.length,
    error: null
  };
}

/**
 * Sync Convex projects to Zustand editor folders
 * This ensures the sidebar shows projects from the database
 */
export function syncConvexProjectsToZustand(
  convexProjects: Project[],
  createFolder: (name: string, category: 'project' | 'financial', convexId?: string) => void
) {
  const { projectFolders } = useEditorStore.getState();
  
  // Get existing folder names (case-insensitive) and their convex IDs
  const existingFolders = new Map(
    projectFolders
      .filter(f => !f.pinned) // Don't sync over pinned folders like Instructions
      .map(f => [f.name.toLowerCase(), f.convexId])
  );
  
  // Find projects that exist in Convex but not in Zustand, or exist but don't have convexId
  const projectsToSync = convexProjects.filter(project => {
    if (!project.name) return false;
    
    const folderName = project.name.toLowerCase();
    const existingConvexId = existingFolders.get(folderName);
    
    // Sync if folder doesn't exist OR if it exists but doesn't have the convex ID
    return !existingFolders.has(folderName) || !existingConvexId;
  });
  
  if (projectsToSync.length > 0) {
    console.log(`🔄 Syncing ${projectsToSync.length} projects from Convex to Zustand:`, 
      projectsToSync.map(p => p.name)
    );
    
    // Add missing projects to editor store or update existing ones with convex ID
    projectsToSync.forEach((project, index) => {
      // Use setTimeout to prevent race conditions with ID generation
      setTimeout(() => {
        createFolder(project.name, 'project', project._id);
        console.log(`  ✅ Synced folder: ${project.name} with Convex ID: ${project._id}`);
      }, index * 50); // 50ms delay between folder creations
    });
  }
}

/**
 * Remove Zustand folders that don't exist in Convex
 * This cleans up old folders when projects are deleted from the database
 */
export function removeOrphanedZustandFolders(
  convexProjects: Project[],
  deleteFolder: (folderId: string) => void
) {
  const { projectFolders } = useEditorStore.getState();
  
  // Get project names from Convex (case-insensitive)
  const convexProjectNames = new Set(
    convexProjects.map(p => p.name?.toLowerCase()).filter(Boolean)
  );
  
  // Find folders that exist in Zustand but not in Convex (exclude pinned folders)
  const orphanedFolders = projectFolders.filter(folder => 
    !folder.pinned && 
    folder.category === 'project' &&
    !convexProjectNames.has(folder.name.toLowerCase())
  );
  
  if (orphanedFolders.length > 0) {
    console.log(`🗑️ Removing ${orphanedFolders.length} orphaned folders:`, 
      orphanedFolders.map(f => f.name)
    );
    
    orphanedFolders.forEach(folder => {
      deleteFolder(folder.id);
      console.log(`  ✅ Removed folder: ${folder.name}`);
    });
  }
}

/**
 * Full bidirectional sync between Convex and Zustand
 */
export function performFullSync(
  convexProjects: Project[],
  createFolder: (name: string, category: 'project' | 'financial', convexId?: string) => void,
  deleteFolder: (folderId: string) => void
) {
  console.log("🔄 Performing full sync between Convex and Zustand...");
  
  // Sync new projects from Convex to Zustand
  syncConvexProjectsToZustand(convexProjects, createFolder);
  
  // Remove orphaned folders from Zustand
  setTimeout(() => {
    removeOrphanedZustandFolders(convexProjects, deleteFolder);
  }, convexProjects.length * 60); // Wait for all folder creations to complete
  
  console.log("✅ Full sync completed");
}
