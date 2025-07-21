// Project Sync Component - Add this to your dashboard to sync existing projects
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashboard/ProjectSync.tsx

"use client";

import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { useSyncProjects } from '../../../lib/hooks/useSyncProjects';

export function ProjectSync() {
  const [isManualSync, setIsManualSync] = useState(false);
  const { syncProjectIds, getSyncStatus, isLoading } = useSyncProjects();

  const handleSync = () => {
    setIsManualSync(true);
    const syncedCount = syncProjectIds();
    
    setTimeout(() => {
      setIsManualSync(false);
      if (syncedCount > 0) {
        alert(`✅ Successfully synced ${syncedCount} projects with database!`);
      } else {
        alert('📁 No projects needed syncing');
      }
    }, 1000);
  };

  if (isLoading) {
    return (
      <Card className="p-4 mb-4">
        <div className="text-sm text-gray-600">Loading project sync status...</div>
      </Card>
    );
  }

  const status = getSyncStatus();

  if (status.unsynced === 0) {
    return (
      <Card className="p-4 mb-4 bg-green-50 border-green-200">
        <div className="text-sm text-green-700">
          ✅ All projects are synced with database ({status.synced} projects)
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-4 bg-yellow-50 border-yellow-200">
      <div className="space-y-2">
        <div className="text-sm text-yellow-800">
          ⚠️ Project Sync Status:
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <div>• Local projects: {status.totalLocal}</div>
          <div>• Database projects: {status.totalDatabase}</div>
          <div>• Synced: {status.synced}</div>
          <div className="text-yellow-700">• Need sync: {status.unsynced}</div>
        </div>
        <Button 
          onClick={handleSync}
          disabled={isManualSync || !status.canSync}
          size="sm"
          className="w-full"
        >
          {isManualSync ? '🔄 Syncing...' : `🔗 Sync ${status.unsynced} Projects`}
        </Button>
        <div className="text-xs text-gray-500">
          This will link your local projects to database records by matching names.
          After syncing, the trash system will work with the database.
        </div>
      </div>
    </Card>
  );
}
