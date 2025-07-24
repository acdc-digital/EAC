// Social Connection Sync Hook
// Prevents duplicate queries and manages state consistency
// /Users/matthewsimon/Projects/eac/eac/lib/hooks/useSocialConnectionSync.ts

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useRef } from "react";

// Define the connection type
interface Connection {
  _id: string;
  platform: string;
  username: string;
  isActive: boolean;
  twitterAccessToken?: string;
}

export function useSocialConnectionSync(userId: string = 'temp-user-id') {
  // Generate unique hook instance ID for debugging
  const hookInstanceId = useRef(`sync-${Math.random().toString(36).substr(2, 9)}`).current;
  
  // Re-enable social connections query now that functions are deployed
  const connections = useQuery(api.socialConnections.getSocialConnections, { userId });

  // Prevent duplicate logging
  const lastLoggedConnectionsRef = useRef<string>('');
  
  // Only log on connection changes, not every render
  useEffect(() => {
    const connectionSignature = connections ? 
      connections.map((c: Connection) => `${c.platform}-${c._id}`).sort().join('|') : 
      'no-connections';
      
    if (connectionSignature !== lastLoggedConnectionsRef.current) {
      // Reduced logging to prevent performance issues
      if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
        console.log(`🔍 useSocialConnectionSync [${hookInstanceId}] - Connection change detected:`, connections?.length || 0, 'connections');
      }
      lastLoggedConnectionsRef.current = connectionSignature;
    }
  }, [connections, hookInstanceId]);
  
  useEffect(() => {
    if (!connections) return;
    
    // Create signature for connection changes
    const connectionSignature = (connections || [])
      .map((c: Connection) => `${c.platform}-${c.username}-${c._id}`)
      .sort()
      .join('|');
      
    // Only log if connections actually changed
    if (connectionSignature !== lastLoggedConnectionsRef.current) {
      console.log('🔍 Social Connections Updated:', {
        total: (connections || []).length,
        platforms: (connections || []).map((c: Connection) => ({ 
          platform: c.platform, 
          username: c.username, 
          id: c._id 
        }))
      });      lastLoggedConnectionsRef.current = connectionSignature;
    }
  }, [connections]);

  // Helper function to get connection by platform - memoized to prevent re-renders
  const getConnectionByPlatform = useCallback((platform: string) => {
    const connection = connections?.find((conn: Connection) => conn.platform === platform) || null;
    return connection;
  }, [connections]);

  // Helper function to check if platform is connected - memoized
  const isPlatformConnected = useCallback((platform: string) => {
    const connection = getConnectionByPlatform(platform);
    return connection?.isActive === true && !!connection.twitterAccessToken;
  }, [getConnectionByPlatform]);

  // Memoized platform-specific connections to ensure React detects changes properly
  const twitterConnection = useMemo(() => {
    return connections?.find((conn: Connection) => conn.platform === 'twitter') || null;
  }, [connections]);
  
  const redditConnection = useMemo(() => {
    return connections?.find((conn: Connection) => conn.platform === 'reddit') || null;
  }, [connections]);
  
  const facebookConnection = useMemo(() => {
    return connections?.find((conn: Connection) => conn.platform === 'facebook') || null;
  }, [connections]);
  
  const instagramConnection = useMemo(() => {
    return connections?.find((conn: Connection) => conn.platform === 'instagram') || null;
  }, [connections]);

  // Debug what we're about to return - only log on connection changes
  useMemo(() => {
    // Minimal logging to prevent performance issues
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) {
      console.log(`🔍 useSocialConnectionSync [${hookInstanceId}] return - connections: ${connections?.length || 0}, twitter: ${!!twitterConnection}`);
    }
  }, [connections, twitterConnection, hookInstanceId]);

  // Memoize the return object to prevent infinite re-renders
  return useMemo(() => ({
    connections: connections || [],
    isLoading: connections === undefined,
    getConnectionByPlatform,
    isPlatformConnected,
    // Convenient platform-specific getters - now properly memoized
    twitterConnection,
    redditConnection,
    facebookConnection,
    instagramConnection,
  }), [connections, getConnectionByPlatform, isPlatformConnected, twitterConnection, redditConnection, facebookConnection, instagramConnection]);
}
