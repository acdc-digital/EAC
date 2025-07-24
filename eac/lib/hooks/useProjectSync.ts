/**
 * Custom hook for synchronizing projects between Convex and Zustand
 * Provides real-time synchronization and state management utilities
 */

import { getSyncStatus, performFullSync, type SyncStatus } from "@/lib/utils/stateSync";
import { useEditorStore } from "@/store";
import React from "react";
import { useProjects } from "./useProjects";

export const useProjectSync = () => {
  const { projects, isLoading, error } = useProjects();
  const { createFolder, deleteFolder } = useEditorStore();
  const [lastSyncTime, setLastSyncTime] = React.useState<Date | null>(null);
  const [syncError, setSyncError] = React.useState<string | null>(null);

  // Get current sync status
  const syncStatus = React.useMemo(() => 
    getSyncStatus(projects, isLoading), 
    [projects, isLoading]
  );

  // Perform automatic sync when projects change
  React.useEffect(() => {
    if (projects && projects.length >= 0 && !isLoading) {
      try {
        performFullSync(projects, createFolder, deleteFolder);
        setLastSyncTime(new Date());
        setSyncError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Sync failed";
        setSyncError(errorMessage);
        console.error("❌ Project sync failed:", err);
      }
    }
  }, [projects, isLoading, createFolder, deleteFolder]);

  const enhancedSyncStatus: SyncStatus = {
    ...syncStatus,
    lastSyncTime,
    error: syncError || error
  };

  return {
    isLoading,
    syncStatus: enhancedSyncStatus,
    lastSyncTime,
    error: syncError || error,
  };
};
