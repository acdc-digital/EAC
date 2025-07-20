// VS Code-Inspired EAC Dashboard
// /Users/matthewsimon/Projects/EAC/eac/app/page.tsx

"use client";

import React from "react";
import { DashActivityBar } from "./_components/dashboard/dashActivityBar";
import { DashSidebar } from "./_components/dashboard/dashSidebar";
import { DashEditor } from "./_components/dashboard/dashEditor";
import { 
  Copyright, 
  AlertCircle, 
  Cpu, 
  Wifi 
} from "lucide-react";
import { useSidebarStore } from "@/store";

export default function DashboardPage() {
  const { activePanel, setActivePanel } = useSidebarStore();



  return (
    <div className="h-screen w-screen flex flex-col bg-[#0e0e0e] text-[#cccccc] font-mono text-sm overflow-hidden">
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

        {/* Sidebar */}
        <DashSidebar activePanel={activePanel} />

        {/* Editor Area */}
        <DashEditor />
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
  );
}
