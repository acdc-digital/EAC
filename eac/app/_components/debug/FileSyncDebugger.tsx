/**
 * Temporary debugging component to help identify file sync issues
 * Add this to your dashboard to see what's happening with file loading
 */

import { api } from "@/convex/_generated/api";
import { useFileLoad } from "@/lib/hooks/useFileLoad";
import { useEditorStore } from "@/store";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";

export function FileSyncDebugger() {
  const { isSignedIn, userId } = useAuth();
  const { projectFiles, projectFolders, showProjectsCategory } = useEditorStore();
  const { allUserFiles, isLoading, isSynced } = useFileLoad();
  
  // Get projects separately to debug
  const allProjects = useQuery(api.projects.getProjects, isSignedIn ? {} : "skip");

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🔍 File Sync Debug</h3>
      
      <div className="space-y-1">
        <div>🔐 Signed In: {isSignedIn ? '✅' : '❌'}</div>
        <div>👤 User ID: {userId || 'None'}</div>
        <div>📡 DB Loading: {isLoading ? '⏳' : '✅'}</div>
        <div>🔄 Synced: {isSynced ? '✅' : '❌'}</div>
        
        <hr className="my-2 border-gray-600" />
        
        <div>🗂️ DB Projects: {allProjects?.length || 0}</div>
        <div>📄 DB Files: {allUserFiles?.length || 0}</div>
        
        <hr className="my-2 border-gray-600" />
        
        <div>📁 Store Folders: {projectFolders?.length || 0}</div>
        <div>📄 Store Files: {projectFiles?.length || 0}</div>
        <div>👁️ Show Projects: {showProjectsCategory ? '✅' : '❌'}</div>
        
        {allUserFiles && allUserFiles.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer">📋 DB Files List</summary>
            <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
              {allUserFiles.map(file => (
                <div key={file._id} className="text-xs">
                  • {file.name} ({file.type})
                </div>
              ))}
            </div>
          </details>
        )}
        
        {projectFiles && projectFiles.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer">📋 Store Files List</summary>
            <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
              {projectFiles.map(file => (
                <div key={file.id} className="text-xs">
                  • {file.name} ({file.type}) 
                  {file.folderId && ` [${file.folderId}]`}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
