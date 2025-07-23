// Social Connection Sync Hook
// Prevents duplicate queries and manages state consistency
// /Users/matthewsimon/Projects/eac/eac/lib/hooks/useSocialConnectionSync.ts

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect, useRef } from "react";

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
  
  console.log(`🔍 useSocialConnectionSync [${hookInstanceId}] - Raw connections:`, connections);
  
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

  // Helper function to get connection by platform
  const getConnectionByPlatform = (platform: string) => {
    console.log(`🔍 getConnectionByPlatform('${platform}') called`);
    console.log('🔍 Available connections:', connections?.map((c: Connection) => ({ 
      platform: c.platform, 
      username: c.username, 
      isActive: c.isActive,
      hasTwitterToken: !!c.twitterAccessToken 
    })));
    
    const connection = connections?.find((conn: Connection) => conn.platform === platform) || null;
    console.log(`🔍 Found connection for '${platform}':`, connection ? 'YES' : 'NO');
    
    return connection;
  };

  // Helper function to check if platform is connected
  const isPlatformConnected = (platform: string) => {
    const connection = getConnectionByPlatform(platform);
    return connection?.isActive === true && !!connection.twitterAccessToken;
  };

  // Memoized platform-specific connections to ensure React detects changes
  const twitterConnection = connections?.find((conn: Connection) => conn.platform === 'twitter') || null;
  const redditConnection = connections?.find((conn: Connection) => conn.platform === 'reddit') || null;
  const facebookConnection = connections?.find((conn: Connection) => conn.platform === 'facebook') || null;
  const instagramConnection = connections?.find((conn: Connection) => conn.platform === 'instagram') || null;

  // Debug what we're about to return
  console.log(`🔍 useSocialConnectionSync [${hookInstanceId}] RETURN VALUES:`, {
    connectionsLength: connections?.length || 0,
    isLoading: connections === undefined,
    twitterConnectionFound: !!twitterConnection,
    twitterConnectionDetails: twitterConnection ? {
      id: twitterConnection._id,
      platform: twitterConnection.platform,
      username: twitterConnection.username,
      isActive: twitterConnection.isActive,
      hasToken: !!twitterConnection.twitterAccessToken
    } : 'NULL'
  });

  return {
    connections: connections || [],
    isLoading: connections === undefined,
    getConnectionByPlatform,
    isPlatformConnected,
    // Convenient platform-specific getters - now properly memoized
    twitterConnection,
    redditConnection,
    facebookConnection,
    instagramConnection,
  };
}
