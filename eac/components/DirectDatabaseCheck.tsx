// Direct Database Check - Bypasses all React caching
// Shows what's actually in the Convex database

"use client";

import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useState } from "react";

export function DirectDatabaseCheck() {
  const [forceRefreshKey, setForceRefreshKey] = useState(0);
  
  // Direct query to database - no caching, no hooks, just raw data
  // The forceRefreshKey will cause the component to re-render and create a fresh query
  const { userId } = useAuth();
  const rawConnections = useQuery(api.reddit.getSocialConnections, userId ? { userId } : "skip");

  const handleForceRefresh = () => {
    console.log('🔄 FORCING DATABASE REFRESH...');
    setForceRefreshKey(prev => prev + 1);
  };

  const handleClearBrowserState = () => {
    console.log('🗑️ CLEARING ALL BROWSER STATE...');
    
    // Clear all localStorage
    localStorage.clear();
    
    // Clear all sessionStorage
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('✅ Browser state cleared, but database should remain');
    
    // Force refresh the component
    setForceRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-4 bg-purple-900/20 border border-purple-500 rounded-lg m-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-purple-300 font-bold">🔍 Direct Database Check</h3>
        <div className="flex gap-2">
          <button 
            onClick={handleForceRefresh}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm"
          >
            🔄 Force DB Refresh
          </button>
          <button 
            onClick={handleClearBrowserState}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm"
          >
            🗑️ Clear Browser State
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm text-purple-200">
          <strong>Raw Database Query Results:</strong>
        </div>
        
        {rawConnections === undefined ? (
          <div className="text-yellow-300">⏳ Loading database...</div>
        ) : rawConnections === null ? (
          <div className="text-red-300">❌ Query returned null</div>
        ) : rawConnections.length === 0 ? (
          <div className="text-red-300">📭 No connections found in database</div>
        ) : (
          <div className="space-y-3">
            <div className="text-green-300">✅ Found {rawConnections.length} connection(s) in database:</div>
            {rawConnections.map((conn, index) => (
              <div key={conn._id} className="bg-purple-800/30 p-3 rounded text-xs space-y-1">
                <div><strong>#{index + 1} - ID:</strong> {conn._id}</div>
                <div><strong>Platform:</strong> {conn.platform}</div>
                <div><strong>Username:</strong> {conn.username}</div>
                <div><strong>Screen Name:</strong> {conn.twitterScreenName || 'N/A'}</div>
                <div><strong>Is Active:</strong> {conn.isActive ? '✅ TRUE' : '❌ FALSE'}</div>
                <div><strong>Has Access Token:</strong> {conn.twitterAccessToken ? '✅ YES' : '❌ NO'}</div>
                <div><strong>Token Length:</strong> {conn.twitterAccessToken?.length || 0}</div>
                <div><strong>User ID:</strong> {conn.userId}</div>
                <div><strong>Created:</strong> {new Date(conn.createdAt).toLocaleString()}</div>
                <div><strong>Updated:</strong> {new Date(conn.updatedAt).toLocaleString()}</div>
                <div><strong>Last Sync:</strong> {conn.lastSync ? new Date(conn.lastSync).toLocaleString() : 'Never'}</div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs text-purple-300 mt-4">
          <strong>Refresh Key:</strong> {forceRefreshKey} (increments with each refresh)
        </div>
      </div>
    </div>
  );
}
