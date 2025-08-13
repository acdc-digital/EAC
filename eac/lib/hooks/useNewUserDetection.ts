"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { useEffect, useState } from "react";

/**
 * Hook to detect if this is a new user's first login
 * Uses multiple detection methods:
 * 1. Session-based detection (primary)
 * 2. Convex user sessions check
 * 3. localStorage as fallback
 * Returns true only once per user when they first authenticate
 */
export function useNewUserDetection() {
  const { isAuthenticated } = useConvexAuth();
  const { user, isLoaded } = useUser();
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  // Query user from Convex to check if they exist
  const convexUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );

  // Query user's sessions to see if they have any previous activity
  const userSessions = useQuery(
    api.chat.getUserSessions,
    isAuthenticated ? {} : "skip"
  );

  useEffect(() => {
    if (isLoaded && isAuthenticated && user && !hasChecked) {
      const userVisitKey = `eac_user_visited_${user.id}`;
      const sessionKey = `eac_session_new_user_${user.id}`;
      
      // Check if we've already detected new user in this session
      const sessionNewUser = sessionStorage.getItem(sessionKey);
      
      console.log('🔍 Multi-method new user detection...', {
        clerkUser: !!user,
        userId: user.id,
        userVisitKey,
        sessionKey,
        sessionNewUser,
        sessionCount: userSessions?.length || 0,
        hasVisitedBefore: !!localStorage.getItem(userVisitKey),
        convexDataLoaded: convexUser !== undefined && userSessions !== undefined
      });

      // Method 1: Session-based detection (most reliable for current session)
      if (sessionNewUser === 'true') {
        setIsNewUser(true);
        console.log('🎯 Session-based new user detection: TRUE');
        setHasChecked(true);
        return;
      } else if (sessionNewUser === 'false') {
        setIsNewUser(false);
        console.log('👋 Session-based returning user detection: FALSE');
        setHasChecked(true);
        return;
      }

      // Method 2: Check session count (if user has sessions, they're not new)
      // Only proceed if Convex data is loaded, otherwise fall back to localStorage
      if (userSessions !== undefined && userSessions.length > 0) {
        setIsNewUser(false);
        sessionStorage.setItem(sessionKey, 'false');
        localStorage.setItem(userVisitKey, 'true');
        console.log('👋 Session-based returning user detection: FALSE (has', userSessions.length, 'sessions)');
        setHasChecked(true);
        return;
      }

      // Method 3: Check localStorage for previous visits
      const hasVisitedBefore = localStorage.getItem(userVisitKey);
      
      if (!hasVisitedBefore) {
        // Mark as visited and new user for this session
        localStorage.setItem(userVisitKey, 'true');
        sessionStorage.setItem(sessionKey, 'true');
        
        // This is a new user
        setIsNewUser(true);
        console.log('🎉 New user detected! Setting keys:', { userVisitKey, sessionKey });
      } else {
        // Mark as returning user for this session
        sessionStorage.setItem(sessionKey, 'false');
        setIsNewUser(false);
        console.log('👋 LocalStorage-based returning user detected, found key:', userVisitKey);
      }
      
      setHasChecked(true);
    }
  }, [isLoaded, isAuthenticated, user, convexUser, userSessions, hasChecked]);

  // Helper function to force new user state (for testing)
  const forceNewUserState = () => {
    if (user) {
      const userVisitKey = `eac_user_visited_${user.id}`;
      const sessionKey = `eac_session_new_user_${user.id}`;
      
      // Clear both localStorage and sessionStorage
      localStorage.removeItem(userVisitKey);
      sessionStorage.removeItem(sessionKey);
      
      // Reset state
      setIsNewUser(null);
      setHasChecked(false);
      
      console.log('🔄 Forced new user state reset');
    }
  };

  return {
    isNewUser,
    isChecking: !hasChecked && isAuthenticated && isLoaded,
    forceNewUserState, // Exposed for testing purposes
  };
}
