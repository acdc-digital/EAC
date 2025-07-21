// Hook for syncing local projects with Convex database
// /Users/matthewsimon/Projects/EAC/eac/lib/hooks/useSyncProjects.ts

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEditorStore } from "../../store/editor";

export function useSyncProjects() {
  // Get all database projects
  const databaseProjects = useQuery(api.projects.getProjects, {});
  
  // Get local projects from store
  const { projectFolders, updateProjectFolders } = useEditorStore();

  // Sync function to match local projects with database projects by name
  const syncProjectIds = (): number => {
    if (!databaseProjects || databaseProjects.length === 0) {
      console.log("No database projects to sync");
      return 0;
    }

    let syncCount = 0;
    
    // Update local projects with matching convexId from database
    const updatedFolders = projectFolders.map(localFolder => {
      // Skip if already has convexId
      if (localFolder.convexId) {
        return localFolder;
      }

      // Find matching database project by name
      const matchingDbProject = databaseProjects.find(dbProject => 
        dbProject.name.toLowerCase().trim() === localFolder.name.toLowerCase().trim()
      );

      if (matchingDbProject) {
        console.log(`🔗 Syncing local project "${localFolder.name}" with database ID: ${matchingDbProject._id}`);
        syncCount++;
        return {
          ...localFolder,
          convexId: matchingDbProject._id,
        };
      }

      return localFolder;
    });

    if (syncCount > 0) {
      // Update the store with synced projects
      updateProjectFolders(updatedFolders);
      console.log(`✅ Successfully synced ${syncCount} projects with database IDs`);
    } else {
      console.log("📁 No projects needed syncing");
    }

    return syncCount;
  };

  // Get sync status
  const getSyncStatus = () => {
    const localProjects = projectFolders.filter(f => f.category === 'project');
    const withIds = localProjects.filter(f => f.convexId).length;
    const withoutIds = localProjects.filter(f => !f.convexId).length;
    
    return {
      totalLocal: localProjects.length,
      totalDatabase: databaseProjects?.length || 0,
      synced: withIds,
      unsynced: withoutIds,
      canSync: withoutIds > 0 && (databaseProjects?.length || 0) > 0,
    };
  };

  return {
    syncProjectIds,
    getSyncStatus,
    databaseProjects: databaseProjects || [],
    isLoading: databaseProjects === undefined,
  };
}
