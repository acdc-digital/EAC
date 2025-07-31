// VS Code-Inspired EAC Dashboard - Homepage
// /Users/matthewsimon/Projects/EAC/eac/app/page.tsx

"use client";

import { useTrashSync } from "@/lib/hooks/useTrashSync";
import { useUserSync } from "@/lib/hooks/useUserSync";
import { initializeHistory } from "@/lib/initializeHistory";
import { useSidebarStore } from "@/store";
import { AuthLoading, useConvexAuth } from "convex/react";
import {
    AlertCircle,
    Copyright,
    Cpu,
    Wifi
} from "lucide-react";
import { useEffect } from "react";
import { DashActivityBar } from "./_components/dashboard/dashActivityBar";
import { DashEditor } from "./_components/dashboard/dashEditor";
import { DashSidebar } from "./_components/dashboard/dashSidebar";
import { FileSync } from "./_components/dashboard/fileSync";

export default function HomePage() {
  const { activePanel, setActivePanel } = useSidebarStore();
  const { isAuthenticated, isLoading } = useConvexAuth();
  
  // Sync user data with Convex when authenticated
  useUserSync();
  
  // Sync trash items with database when authenticated
  useTrashSync();

  // Initialize history logging on mount
  useEffect(() => {
    initializeHistory();
  }, []);

  // Set active panel based on authentication state
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // When not authenticated, show profile panel (user icon) as active
        setActivePanel('profile');
      }
      // When authenticated, keep current panel (don't force change to explorer)
    }
  }, [isAuthenticated, isLoading, setActivePanel]);

  return (
    <>
      <AuthLoading>
        <div className="h-screen w-screen flex items-center justify-center bg-[#0e0e0e] text-[#cccccc]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e639c] mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </AuthLoading>
      
      {/* Always show the same dashboard layout regardless of authentication */}
      <div className="h-screen w-screen flex flex-col bg-[#0e0e0e] text-[#cccccc] font-mono text-sm overflow-hidden relative">
        {/* File Sync Component - Hidden utility for syncing files to database */}
        <FileSync />
        
        {/* Title Bar - 32px */}
        <header className={`h-8 bg-[#181818] border-b border-[#2d2d2d] flex items-center px-0 select-none ${!isAuthenticated ? 'opacity-50' : ''}`}>
          {/* Title */}
          <div className="flex-1 flex justify-start ml-2">
            <span className="text-xs text-[#858585]">
              EAC Financial Dashboard & Project Management Editor
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <div className={`flex-1 flex overflow-hidden ${!isAuthenticated ? 'opacity-50' : ''}`}>
          {/* Activity Bar - Only user icon is active when not authenticated */}
          <DashActivityBar
            activePanel={activePanel}
            onPanelChange={setActivePanel}
          />
          {/* Main work area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <DashSidebar activePanel={activePanel} />

            {/* Editor Area */}
            <DashEditor />
          </div>
        </div>

        {/* Status Bar - 22px */}
        <footer className={`h-[22px] bg-[#2d2d2d] text-[#cccccc] text-xs flex items-center px-2 justify-between ${!isAuthenticated ? 'opacity-50' : ''}`}>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Copyright className="w-3 h-3" />
              <span>ACDC.digital</span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertCircle className="w-3 h-3" />
              <span>0</span>
            </div>
            <span>EAC Dashboard v1.0.0</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>TypeScript React</span>
            <div className="flex items-center space-x-1">
              <Cpu className="w-3 h-3" />
              <span>85%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wifi className="w-3 h-3" />
              <span>Connected</span>
            </div>
            <span>UTF-8</span>
            <span>CRLF</span>
            <span>Ln 24, Col 16</span>
          </div>
        </footer>
      </div>
    </>
  );
}
