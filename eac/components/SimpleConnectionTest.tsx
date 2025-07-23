// Simple Test Component to Check If Database Data Reaches the UI
"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export function SimpleConnectionTest() {
  const connections = useQuery(api.reddit.getSocialConnections, { userId: 'temp-user-id' });
  
  return (
    <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg m-4">
      <h3 className="text-green-300 font-bold">🧪 Simple Connection Test</h3>
      <div className="mt-2 text-sm">
        {connections === undefined ? (
          <div className="text-yellow-300">Loading...</div>
        ) : (
          <div>
            <div className="text-green-300">Found {connections.length} connections</div>
            {connections.map(conn => (
              <div key={conn._id} className="text-xs text-green-200 mt-1">
                {conn.platform}: {conn.username} (Active: {conn.isActive ? 'Yes' : 'No'})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
