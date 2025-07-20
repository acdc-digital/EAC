// Terminal Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/terminal/terminal.tsx

"use client";

import { ResizablePanel } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTerminalStore } from "@/store/terminal";
import { useChatStore } from "@/store/terminal/chat";
import { AlertCircle, ChevronDown, ChevronUp, Code, Terminal as TerminalIcon } from "lucide-react";
import { ChatMessages, RealTerminal } from "./_components";

export function Terminal() {
  const { 
    isCollapsed, 
    toggleCollapse, 
    setSize 
  } = useTerminalStore();

  const { messages, isLoading } = useChatStore();

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
      defaultSize={isCollapsed ? 2.75 : 40}
      minSize={isCollapsed ? 2.27 : 15}
      maxSize={60}
      onResize={handleResize}
    >
      <div className="flex flex-col h-full bg-[#181818]">
        {/* Fixed Header */}
        <div className="h-[30px] bg-[#0e639c] border-b border-[#2d2d2d] flex items-center justify-between px-0 flex-shrink-0">
          <Tabs defaultValue="terminal" className="flex-1">
            <TabsList className="h-[30px] bg-transparent rounded-none border-none justify-start p-0">
              <TabsTrigger
                value="terminal"
                className="rounded-none text-xs h-[30px] data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#cccccc] bg-transparent cursor-pointer"
                onClick={toggleCollapse}
              >
                <TerminalIcon className="w-3 h-3 mr-1" />
                Terminal
              </TabsTrigger>
              <TabsTrigger
                value="problems"
                className="rounded-none text-xs h-[30px] data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#cccccc] bg-transparent"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                Problems
              </TabsTrigger>
              <TabsTrigger
                value="output"
                className="rounded-none text-xs h-[30px] data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#cccccc] bg-transparent"
              >
                <Code className="w-3 h-3 mr-1" />
                History
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Collapse/Expand Button */}
          <button
            onClick={toggleCollapse}
            className="w-5 h-5 bg-white hover:bg-gray-200 rounded-sm border border-[#cccccc] flex items-center justify-center transition-colors ml-4 mr-3 cursor-pointer"
            aria-label={isCollapsed ? "Expand terminal" : "Collapse terminal"}
          >
            {isCollapsed ? (
              <ChevronUp className="w-2.5 h-2.5 text-[#0e639c]" />
            ) : (
              <ChevronDown className="w-2.5 h-2.5 text-[#0e639c]" />
            )}
          </button>
        </div>

        {/* Scrollable Chat Area - Only show when not collapsed */}
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