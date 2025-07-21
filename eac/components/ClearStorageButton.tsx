// Clear Local Storage Component
// This component provides a button to clear all Zustand store data

import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';
import React from 'react';

const storeKeys = [
  'editor-store',           // Editor/project folders and files
  'calendar-store',         // Calendar and scheduled posts  
  'daily-tracker-store',    // Daily tracking data
  'sidebar-store',          // Sidebar state and preferences
  'materials-store',        // Materials and inventory
];

export function ClearStorageButton() {
  const [isClearing, setIsClearing] = React.useState(false);
  const [clearedKeys, setClearedKeys] = React.useState<string[]>([]);

  const clearAllStores = () => {
    if (typeof window === 'undefined') return;
    
    setIsClearing(true);
    
    console.log('🧹 Clearing all Zustand store data from localStorage...\n');
    
    // First, show what's currently stored
    console.log('🔍 Current localStorage contents:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        console.log(`  - ${key}: ${value?.substring(0, 50)}...`);
      }
    }
    
    // Clear all localStorage items, not just our known stores
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allKeys.push(key);
    }
    
    const cleared: string[] = [];
    
    // Remove all localStorage items
    allKeys.forEach(key => {
      localStorage.removeItem(key);
      cleared.push(key);
      console.log(`✅ Cleared: ${key}`);
    });
    
    // Also clear sessionStorage
    const sessionKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) sessionKeys.push(key);
    }
    
    sessionKeys.forEach(key => {
      sessionStorage.removeItem(key);
      console.log(`✅ Cleared sessionStorage: ${key}`);
    });
    
    // Clear any potential caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
          console.log(`✅ Cleared cache: ${name}`);
        });
      });
    }
    
    setClearedKeys(cleared);
    
    // Auto-refresh after a short delay to show the clean state
    setTimeout(() => {
      console.log('\n🎉 All stores cleared! Refreshing page...');
      
      // Force a hard refresh to ensure all cached data is cleared
      window.location.href = window.location.href;
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={clearAllStores}
        disabled={isClearing}
        variant="destructive"
        size="sm"
        className="w-fit"
      >
        {isClearing ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Clearing...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Stores
          </>
        )}
      </Button>
      
      {clearedKeys.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <p>✅ Cleared {clearedKeys.length} stores:</p>
          <ul className="list-disc list-inside ml-2">
            {clearedKeys.map(key => (
              <li key={key}>{key}</li>
            ))}
          </ul>
          <p className="mt-1 text-green-600">Page will refresh automatically...</p>
        </div>
      )}
    </div>
  );
}
