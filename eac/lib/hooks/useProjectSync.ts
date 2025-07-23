/**
 * Custom hook for synchronizing projects between Convex and Zustand
 * Temporarily disabled until Convex functions are fixed
 */
export const useProjectSync = () => {
  // Return a stub interface while Convex is being fixed
  return {
    isLoading: false,
    syncStatus: 'disabled' as const,
    lastSyncTime: null,
    error: null,
  };
};
