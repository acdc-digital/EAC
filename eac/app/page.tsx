// VS Code-Inspired EAC Dashboard - Homepage
// /Users/matthewsimon/Projects/EAC/eac/app/page.tsx

"use client";

import { useTrashSync } from "@/lib/hooks/useTrashSync";
import { useUserSync } from "@/lib/hooks/useUserSync";
import { initializeHistory } from "@/lib/initializeHistory";
import { useSidebarStore } from "@/store";
import { SignInButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
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
  
  // Sync user data with Convex when authenticated
  useUserSync();
  
  // Sync trash items with database when authenticated
  useTrashSync();

  // Initialize history logging on mount
  useEffect(() => {
    initializeHistory();
  }, []);

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
      
      <Unauthenticated>
        <div className="h-screen w-screen flex items-center justify-center bg-[#0e0e0e] text-[#cccccc]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">EAC Dashboard</h1>
            <p className="mb-6">Please sign in to access your dashboard.</p>
            <SignInButton mode="modal">
              <button className="bg-[#0e639c] hover:bg-[#1177bb] text-white px-6 py-2 rounded">
                Sign In to Continue
              </button>
            </SignInButton>
          </div>
        </div>
      </Unauthenticated>
      
      <Authenticated>
        <div className="h-screen w-screen flex flex-col bg-[#0e0e0e] text-[#cccccc] font-mono text-sm overflow-hidden">
          {/* File Sync Component - Hidden utility for syncing files to database */}
          <FileSync />
          
          {/* Title Bar - 32px */}
          <header className="h-8 bg-[#181818] border-b border-[#2d2d2d] flex items-center px-0 select-none">
            {/* Title */}
            <div className="flex-1 flex justify-start ml-2">
              <span className="text-xs text-[#858585]">
                EAC Financial Dashboard & Project Management Editor
              </span>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Activity Bar */}
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
          <footer className="h-[22px] bg-[#2d2d2d] text-[#cccccc] text-xs flex items-center px-2 justify-between">
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
      </Authenticated>
    </>
  );
}
