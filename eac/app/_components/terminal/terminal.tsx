// Terminal Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/terminal/terminal.tsx

"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal as TerminalIcon, AlertCircle, Code, ChevronDown, ChevronUp } from "lucide-react";
import { ResizablePanel } from "@/components/ui/resizable";
import { useTerminalStore } from "@/store/terminal";
import { useChatStore } from "@/store/terminal/chat";
import { ChatMessages, RealTerminal } from "./_components";

export function Terminal() {
  const { 
    isCollapsed, 
    toggleCollapse, 
    currentSize, 
    setSize 
  } = useTerminalStore();

  const { messages, isLoading } = useChatStore();

  const handleResize = (size: number) => {
    try {
      if (!isCollapsed && size > 0) {
        const sizePercent = size;
        const current = currentSize || 30;
        const sizeDiff = Math.abs(sizePercent - current);
        
        if (sizeDiff > 5) {
          setSize(sizePercent);
        }
      }
    } catch (error) {
      console.error('Error in terminal resize:', error);
    }
  };

  return (
    <ResizablePanel
      key={`terminal-${isCollapsed}`}
      id="terminal"
      defaultSize={isCollapsed ? 2 : currentSize || 30}
      minSize={isCollapsed ? 4.5 : 15}
      maxSize={60}
      onResize={handleResize}
    >
      <div className="flex flex-col h-full bg-[#181818] border-t border-[#2d2d2d]">
        {/* Fixed Header */}
        <div className="h-[35px] bg-[#181818] border-b border-[#2d2d2d] flex items-center justify-between px-0 flex-shrink-0">
          <Tabs defaultValue="terminal" className="flex-1">
            <TabsList className="h-[35px] bg-transparent rounded-none border-none justify-start p-0">
              <TabsTrigger
                value="terminal"
                className="rounded-none text-xs data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#cccccc] bg-transparent"
              >
                <TerminalIcon className="w-3 h-3 mr-1" />
                Terminal
              </TabsTrigger>
              <TabsTrigger
                value="problems"
                className="rounded-none text-xs data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#cccccc] bg-transparent"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                Problems
              </TabsTrigger>
              <TabsTrigger
                value="output"
                className="rounded-none text-xs data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#cccccc] bg-transparent"
              >
                <Code className="w-3 h-3 mr-1" />
                History
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Collapse/Expand Button */}
          <button
            onClick={toggleCollapse}
            className="w-6 h-6 bg-[#2d2d2d] hover:bg-[#454545] rounded-sm border border-[##454545] flex items-center justify-center transition-colors ml-4 mr-3"
            aria-label={isCollapsed ? "Expand terminal" : "Collapse terminal"}
          >
            {isCollapsed ? (
              <ChevronUp className="w-3 h-3 text-[#cccccc]" />
            ) : (
              <ChevronDown className="w-3 h-3 text-[#cccccc]" />
            )}
          </button>
        </div>

        {/* Scrollable Chat Area */}
        {!isCollapsed && (
          <Tabs defaultValue="terminal" className="flex-1 flex flex-col min-h-0">
            <TabsContent value="terminal" className="flex-1 flex flex-col mt-0 min-h-0">
              <RealTerminal />
            </TabsContent>

            <TabsContent value="problems" className="flex-1 bg-[#0e0e0e] p-2 mt-0 min-h-0">
              <div className="text-xs text-[#858585]">
                No problems detected.
              </div>
            </TabsContent>

            <TabsContent value="output" className="flex-1 flex flex-col mt-0 min-h-0">
              <ChatMessages messages={messages} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ResizablePanel>
  );
}