// Force Refresh Social Connections Component
// Test component to bypass React caching issues

"use client";

import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import React from "react";

export function ForceRefreshConnections() {
  // Force a fresh query with a timestamp to bypass caching
  const { userId } = useAuth();
  const connections = useQuery(api.reddit.getSocialConnections, userId ? { userId } : "skip");

  const handleForceRefresh = () => {
    console.log('🔄 Force refreshing connections...');
    // This will trigger a re-render and fresh query
    window.location.reload();
  };

  React.useEffect(() => {
    console.log('🔍 ForceRefreshConnections - Raw query result:', connections);
    
    if (connections) {
      connections.forEach((conn, index) => {
        console.log(`🔍 Connection ${index}:`, {
          id: conn._id,
          platform: conn.platform,
          username: conn.username,
          isActive: conn.isActive,
          hasAccessToken: !!conn.twitterAccessToken,
          tokenLength: conn.twitterAccessToken?.length
        });
      });
    }
  }, [connections]);

  return (
    <div className="p-4 bg-blue-900/20 border border-blue-500 rounded-lg m-4">
      <h3 className="text-blue-300 font-bold">🔄 Force Refresh Test</h3>
      <p className="text-sm text-blue-200 mt-2">
        Connections found: {connections?.length || 0}
      </p>
      
      {connections?.map((conn) => (
        <div key={conn._id} className="mt-2 p-2 bg-blue-800/30 rounded text-xs">
          <div><strong>Platform:</strong> {conn.platform}</div>
          <div><strong>Username:</strong> {conn.username}</div>
          <div><strong>Active:</strong> {conn.isActive ? '✅' : '❌'}</div>
          <div><strong>Has Token:</strong> {conn.twitterAccessToken ? '✅' : '❌'}</div>
        </div>
      ))}
      
      <button 
        onClick={handleForceRefresh}
        className="mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm"
      >
        Force Page Refresh
      </button>
    </div>
  );
}
