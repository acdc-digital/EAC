// VS Code-Inspired EAC Dashboard - Homepage
// /Users/matthewsimon/Projects/EAC/eac/app/page.tsx

"use client";

import { useTrashSync } from "@/lib/hooks/useTrashSync";
import { useUserSync } from "@/lib/hooks/useUserSync";
import { initializeHistory } from "@/lib/initializeHistory";
import { useSidebarStore } from "@/store";
import { useEditorStore } from "@/store/editor";
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

export default function HomePage() {
  const { activePanel, setActivePanel } = useSidebarStore();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { openSpecialTab, openTabs, activeTab } = useEditorStore();
  
  // Sync user data with Convex when authenticated
  useUserSync();
  
  // Sync trash items with database when authenticated
  useTrashSync();

  // Initialize history logging on mount
  useEffect(() => {
    initializeHistory();
  }, []);

  // Check if sign-in tab is currently active
  const currentTab = openTabs.find(tab => tab.id === activeTab);
  const isSignInTabActive = currentTab?.type === 'sign-in';

  // Set active panel and open appropriate tab based on authentication state
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // When not authenticated, show profile panel (user icon) as active
        setActivePanel('profile');
        // Auto-open sign-in tab if no tabs are open or no sign-in tab exists
        const hasSignInTab = openTabs.some(tab => tab.type === 'sign-in');
        if (!hasSignInTab) {
          openSpecialTab('sign-in', 'Sign In', 'sign-in');
        }
      } else {
        // When authenticated, only auto-open user profile tab on initial load if no tabs exist at all
        // Don't auto-reopen if user manually closed it
        const hasAnyTabs = openTabs.length > 0;
        const hasUserProfileTab = openTabs.some(tab => tab.type === 'user-profile');
        
        // Only auto-open user profile if there are no tabs at all (initial load)
        if (!hasAnyTabs && !hasUserProfileTab) {
          openSpecialTab('user-profile', 'User Profile', 'user-profile');
        }
        // Keep current panel as is - don't force any changes when user is authenticated
      }
    }
  }, [isAuthenticated, isLoading, setActivePanel, openSpecialTab]);

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
        {/* File Sync Component - Hidden utility for syncing files to database - TEMPORARILY DISABLED */}
        {/* <FileSync /> */}
        
        {/* Title Bar - 32px */}
        <header className={`h-8 bg-[#181818] border-b border-[#2d2d2d] flex items-center px-0 select-none ${!isAuthenticated && !isSignInTabActive ? 'opacity-50' : ''}`}>
          {/* Title */}
          <div className="flex-1 flex justify-start ml-2">
            <span className="text-xs text-[#858585]">
              EAC Financial Dashboard & Project Management Editor
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <div className={`flex-1 flex overflow-hidden ${!isAuthenticated && !isSignInTabActive ? 'opacity-50' : ''}`}>
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
        <footer className={`h-[22px] bg-[#2d2d2d] text-[#cccccc] text-xs flex items-center px-2 justify-between ${!isAuthenticated && !isSignInTabActive ? 'opacity-50' : ''}`}>
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
