// Terminal Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/terminal.tsx

"use client";

import { ResizablePanel } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTerminalStore } from "@/store/terminal";
import { AlertCircle, ChevronDown, ChevronUp, History, Settings, Terminal as TerminalIcon } from "lucide-react";
import { ChatMessages } from "./_components";

export function Terminal() {
  const { 
    isCollapsed, 
    toggleCollapse, 
    setSize 
  } = useTerminalStore();

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
        <div className={`h-[25px] bg-[#0e639c] flex items-center justify-between px-0 flex-shrink-0 ${
          isCollapsed ? '' : 'border-b border-[#2d2d2d]'
        }`}>
          <Tabs defaultValue="terminal" className="flex-1">
            <TabsList className="h-[25px] bg-transparent rounded-none border-none justify-start p-0">
              <TabsTrigger
                value="terminal"
                className="rounded-none text-xs h-[25px] data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#cccccc] bg-transparent cursor-pointer"
                onClick={toggleCollapse}
              >
                <TerminalIcon className="w-3 h-3 mr-1" />
                Terminal
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-none text-xs h-[25px] data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#cccccc] bg-transparent cursor-not-allowed opacity-60"
                disabled
              >
                <History className="w-3 h-3 mr-1" />
                History
              </TabsTrigger>
              <TabsTrigger
                value="problems"
                className="rounded-none text-xs h-[25px] data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#cccccc] bg-transparent cursor-not-allowed opacity-60"
                disabled
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                Problems
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-none text-xs h-[25px] data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#cccccc] bg-transparent cursor-not-allowed opacity-60"
                disabled
              >
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Collapse/Expand Button */}
          <button
            onClick={toggleCollapse}
            className="w-5 h-5 hover:bg-[#ffffff20] rounded-sm flex items-center justify-center transition-colors ml-4 mr-3 cursor-pointer"
            aria-label={isCollapsed ? "Expand terminal" : "Collapse terminal"}
          >
            {isCollapsed ? (
              <ChevronUp className="w-2.5 h-2.5 text-white font-bold stroke-2" />
            ) : (
              <ChevronDown className="w-2.5 h-2.5 text-white font-bold stroke-2" />
            )}
          </button>
        </div>

        {/* Scrollable Chat Area - Only show when not collapsed */}
        {!isCollapsed && (
          <Tabs defaultValue="terminal" className="flex-1 flex flex-col min-h-0">
            <TabsContent value="terminal" className="flex-1 flex flex-col mt-0 min-h-0">
              <ChatMessages />
            </TabsContent>

            <TabsContent value="history" className="flex-1 bg-[#0e0e0e] p-2 mt-0 min-h-0">
              <div className="text-xs text-[#858585]">
                Command history coming soon...
              </div>
            </TabsContent>

            <TabsContent value="problems" className="flex-1 bg-[#0e0e0e] p-2 mt-0 min-h-0">
              <div className="text-xs text-[#858585]">
                No problems detected.
              </div>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 bg-[#0e0e0e] p-2 mt-0 min-h-0">
              <div className="text-xs text-[#858585]">
                Terminal settings coming soon...
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ResizablePanel>
  );
}