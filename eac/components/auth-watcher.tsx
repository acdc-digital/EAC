'use client';

import { useEditorStore } from '@/store/editor';
import { useConvexAuth } from 'convex/react';
import { useEffect, useRef } from 'react';

/**
 * AuthWatcher - Monitors authentication state changes and manages user data/tabs accordingly
 * This component ensures that:
 * - When a user signs out, their projects and files are cleared from the UI
 * - When a user signs in, the sign-in tab is replaced with the user profile tab
 */
export function AuthWatcher() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const clearUserData = useEditorStore((state) => state.clearUserData);
  const closeTab = useEditorStore((state) => state.closeTab);
  const openTabs = useEditorStore((state) => state.openTabs);
  
  // Track the previous authentication state to detect changes
  const prevAuthenticatedRef = useRef<boolean | null>(null);
  // Track if we've done the initial clear check
  const hasInitializedRef = useRef(false);
  
  useEffect(() => {
    // Skip on initial load while authentication is still loading
    if (isLoading) {
      return;
    }
    
    // On first load after auth is resolved, clear data if not authenticated
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      if (!isAuthenticated) {
        console.log('🔐 User not authenticated on load - clearing user data from UI');
        clearUserData();
      } else {
        // If user is authenticated on load, close any existing sign-in tabs
        const signInTab = openTabs.find(tab => tab.type === 'sign-in');
        if (signInTab) {
          console.log('🔐 User authenticated on load - closing sign-in tab');
          closeTab(signInTab.id);
        }
      }
    }
    
    // If we have a previous state and the user went from authenticated to not authenticated
    if (prevAuthenticatedRef.current === true && isAuthenticated === false) {
      console.log('🔐 User signed out - clearing user data from UI');
      clearUserData();
    }
    
    // If we have a previous state and the user went from not authenticated to authenticated
    if (prevAuthenticatedRef.current === false && isAuthenticated === true) {
      console.log('🔐 User signed in - closing sign-in tab');
      
      // Find and close the sign-in tab (user profile tab will be auto-opened by main page)
      const signInTab = openTabs.find(tab => tab.type === 'sign-in');
      if (signInTab) {
        closeTab(signInTab.id);
      }
    }
    
    // Update the previous state
    prevAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, isLoading, clearUserData, closeTab, openTabs]);
  
  // This component doesn't render anything
  return null;
}
