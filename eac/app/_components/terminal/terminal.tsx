// Terminal Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/terminal.tsx

// Terminal Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/terminal.tsx

"use client";

import { ResizablePanel } from "@/components/ui/resizable";
import { useTerminalStore } from "@/store/terminal";
import { useSessionStore } from "@/store/terminal/session";
import { useConvexAuth } from "convex/react";
import { AlertCircle, History, Settings, Terminal as TerminalIcon } from "lucide-react";
import { AgentsPanel, ChatMessages, SessionsPanel, SessionsRow } from "./_components";
import { HistoryTab } from "./historyTab";

export function Terminal() {
  const { 
    isCollapsed, 
    toggleCollapse, 
    setSize,
    activeTab,
    setActiveTab
  } = useTerminalStore();
  const { isAuthenticated } = useConvexAuth();
  const { isSessionsPanelOpen, isAgentsPanelOpen } = useSessionStore();

  const handleResize = (size: number) => {
    try {
      // Simple size update - no complex logic
      setSize(size);
    } catch (error) {
      console.error('Error in terminal resize:', error);
    }
  };

  return (
    <ResizablePanel
      key={`terminal-${isCollapsed}`}
      id="terminal"
      defaultSize={isCollapsed ? 3 : 40}
      minSize={isCollapsed ? 3 : 15}
      maxSize={isCollapsed ? 3 : 60}
      onResize={handleResize}
      className={isCollapsed ? "flex-shrink-0" : ""}
    >
      <div className={`flex flex-col ${isCollapsed ? 'h-[25px]' : 'h-full bg-[#181818]'}`}>
        {/* Fixed Header */}
        <div className={`h-[25px] bg-[#0e639c] flex items-center justify-between px-0 flex-shrink-0`}>
          <div className="flex items-center">
            <div className="h-[25px] bg-transparent rounded-none border-none justify-start p-0 flex items-center">
              <button
                className={`rounded-none text-xs h-[25px] px-3 min-w-[70px] flex items-center justify-center ${
                  !isCollapsed && activeTab === 'terminal' 
                    ? 'bg-[#0e639c] text-white' 
                    : 'bg-transparent text-white'
                } ${
                  isAuthenticated 
                    ? 'hover:bg-[#ffffff20] cursor-pointer' 
                    : 'opacity-60 cursor-default pointer-events-none'
                }`}
                onClick={() => {
                  if (!isAuthenticated) return;
                  
                  // Handle terminal tab click behavior
                  if (isCollapsed) {
                    // If collapsed, expand and set as active tab
                    toggleCollapse();
                    setActiveTab("terminal");
                  } else if (activeTab === 'terminal') {
                    // If already active and expanded, collapse the terminal
                    toggleCollapse();
                  } else {
                    // If not active but expanded, just set as active tab
                    setActiveTab("terminal");
                  }
                }}
                disabled={!isAuthenticated}
                title={isAuthenticated ? "Terminal" : ""}
              >
                <TerminalIcon className="w-3 h-3 mr-1" />
                Terminal
              </button>
              <button
                className={`rounded-none text-xs h-[25px] ${!isCollapsed && activeTab === 'history' ? 'bg-[#094771] text-white' : 'bg-transparent text-white'} ${isAuthenticated && !isCollapsed ? 'hover:bg-[#ffffff20] cursor-pointer' : 'opacity-60 cursor-default'} px-3 min-w-[70px] flex items-center justify-center`}
                onClick={() => {
                  if (!isAuthenticated) return;
                  
                  // Only handle history tab click if terminal is expanded
                  if (!isCollapsed) {
                    if (activeTab === 'history') {
                      // If already active and expanded, collapse the terminal
                      toggleCollapse();
                    } else {
                      // If not active but expanded, just set as active tab
                      setActiveTab("history");
                    }
                  }
                  // If collapsed, do nothing - don't expand the terminal
                }}
                disabled={!isAuthenticated || isCollapsed}
                title={isAuthenticated ? "History" : ""}
              >
                <History className="w-3 h-3 mr-1" />
                History
              </button>
              <button
                className="rounded-none text-xs h-[25px] bg-transparent text-white opacity-60 px-3 min-w-[70px] flex items-center justify-center"
                disabled
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                Problems
              </button>
              <button
                className="rounded-none text-xs h-[25px] bg-transparent text-white opacity-60 px-3 min-w-[70px] flex items-center justify-center"
                disabled
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                Problems
              </button>
              <button
                className="rounded-none text-xs h-[25px] bg-transparent text-white opacity-60 px-3 min-w-[70px] flex items-center justify-center"
                disabled
              >
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Sessions Row - Only show when not collapsed and terminal tab is active */}
        {!isCollapsed && activeTab === "terminal" && (
          <SessionsRow />
        )}

        {/* Content Area - Only show when not collapsed */}
        {!isCollapsed && (
          <div className="flex-1 flex flex-col min-h-0">
            {activeTab === "terminal" && (
              <>
                {isSessionsPanelOpen ? (
                  <SessionsPanel />
                ) : isAgentsPanelOpen ? (
                  <AgentsPanel />
                ) : (
                  <ChatMessages />
                )}
              </>
            )}
            {activeTab === "history" && <HistoryTab />}
            {activeTab === "problems" && (
              <div className="flex-1 bg-[#0e0e0e] p-2 min-h-0">
                <div className="text-xs text-[#858585]">
                  No problems detected.
                </div>
              </div>
            )}
            {activeTab === "settings" && (
              <div className="flex-1 bg-[#0e0e0e] p-2 min-h-0">
                <div className="text-xs text-[#858585]">
                  Terminal settings coming soon...
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ResizablePanel>
  );
}