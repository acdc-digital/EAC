// Editor Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashEditor.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

import { X, Terminal, AlertCircle, Code, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useEditorStore } from "@/store";
import { ProjectFile } from "@/store/editor/types";

// Dynamic import to avoid SSR issues
const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading editor...</div>
});

// Dynamic import for edit modules
const EditGenerals = dynamic(() => import('./editGenerals').then(mod => ({ default: mod.EditGenerals })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading module...</div>
});

interface DashEditorProps {
  onCreateFile?: () => void;
}

export function DashEditor({ onCreateFile }: DashEditorProps) {
  const { 
    openTabs, 
    activeTab, 
    closeTab, 
    setActiveTab, 
    updateFileContent
  } = useEditorStore();


  const [scrollPosition, setScrollPosition] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [lineCount, setLineCount] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate the visible area width (container width minus button widths)
  const TAB_WIDTH = 200;
  const visibleTabsCount = Math.floor(containerWidth / TAB_WIDTH) || 1;
  const maxScrollPosition = Math.max(0, openTabs.length - visibleTabsCount);

  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);

  // Adjust scroll position if tabs are removed
  useEffect(() => {
    if (scrollPosition > maxScrollPosition) {
      setScrollPosition(maxScrollPosition);
    }
  }, [maxScrollPosition, scrollPosition]);



  const scrollLeft = () => {
    setScrollPosition(Math.max(0, scrollPosition - 1));
  };

  const scrollRight = () => {
    setScrollPosition(Math.min(maxScrollPosition, scrollPosition + 1));
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScrollPosition && openTabs.length > 0;

  const getFileContent = (tabId: string) => {
    const tab = openTabs.find((t) => t.id === tabId);
    return tab ? tab.content : '// File not found';
  };

  const handleContentChange = (content: string) => {
    if (activeTab) {
      // Update the line count based on content
      const lines = content.split('\n').length;
      setLineCount(Math.max(lines + 10, 50)); // Add some extra lines for scrolling
      
      // Update the file content in your store
      updateFileContent(activeTab, content);
    }
  };

  // Get current tab to check if it's editable
  const currentTab = openTabs.find((t) => t.id === activeTab);
  const isEditable = currentTab ? ['typescript', 'javascript', 'json', 'markdown'].includes(currentTab.type) : false;
  const isGeneralsModule = currentTab?.type === 'generals';

  // Debug logging
  console.log('Debug Info:', {
    openTabs: openTabs.length,
    activeTab,
    currentTab: currentTab?.name,
    isEditable,
    hasActiveTab: !!activeTab
  });

  return (
    <main className="flex-1 flex flex-col bg-[#1a1a1a]">
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={70} minSize={30} className="flex flex-col">
          {/* Tab Bar */}
          <div className="h-[35px] bg-[#181818] border-b border-l border-r border-[#2d2d2d] relative flex-shrink-0">
            {/* Tab Container - Full width with space for buttons */}
            <div ref={containerRef} className="absolute left-8 right-16 top-0 bottom-0 overflow-hidden bg-[#0e0e0e]">
              <div 
                className="flex transition-transform duration-200 h-full"
                style={{ 
                  transform: `translateX(-${scrollPosition * 200}px)` 
                }}
              >
                {openTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`
                      flex items-center gap-2 px-3 h-[35px] text-xs border-r border-[#2d2d2d] cursor-pointer flex-shrink-0
                      ${activeTab === tab.id 
                        ? 'bg-[#1a1a1a] text-[#cccccc]' 
                        : 'bg-[#0e0e0e] text-[#858585] hover:bg-[#181818]'
                      }
                    `}
                    style={{ 
                      width: '200px'
                    }}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="w-3 h-3 flex-shrink-0" />
                    <span className={`truncate flex-1 ${tab.modified ? 'text-[#cccccc]' : ''}`}>
                      {tab.name}
                    </span>
                    {tab.modified && <div className="w-2 h-2 bg-[#cccccc] rounded-full flex-shrink-0" />}
                    <X 
                      className="w-3 h-3 hover:bg-[#2d2d2d] rounded flex-shrink-0" 
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Left Scroll Button - Overlay */}
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`
                absolute left-0 z-10 w-8 h-[35px] flex items-center justify-center border-r border-b border-[#2d2d2d] bg-[#181818]
                ${canScrollLeft 
                  ? 'hover:bg-[#2d2d2d] text-[#858585]' 
                  : 'text-[#3d3d3d] opacity-30'
                }
              `}
            >
              <span className="sr-only">Scroll left</span>
              <ChevronLeft className="w-3 h-3" />
            </button>

            {/* Right side buttons container - Overlay */}
            <div className="absolute right-0 z-10 flex h-[35px] bg-[#181818] border-b border-[#2d2d2d]">
              {/* Right Scroll Button */}
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`
                  w-8 h-[35px] flex items-center justify-center border-l border-[#2d2d2d]
                  ${canScrollRight 
                    ? 'hover:bg-[#2d2d2d] text-[#858585]' 
                    : 'text-[#3d3d3d] opacity-30'
                  }
                `}
              >
                <span className="sr-only">Scroll right</span>
                <ChevronRight className="w-3 h-3" />
              </button>
                
              {/* Add New Tab Button */}
              <button 
                className="flex items-center justify-center w-8 h-[35px] text-xs border-l border-[#2d2d2d] hover:bg-[#2d2d2d] text-[#858585]"
                onClick={() => onCreateFile?.()}
              >
                <span className="sr-only">Create new file</span>
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Line numbers */}
            <div className="bg-[#1a1a1a] text-[#858585] text-center px-2 select-none w-[40px] border-r border-[#2d2d2d] flex-shrink-0 overflow-y-auto">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="leading-5 text-xs font-mono h-5">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code content with Tiptap or Edit Modules */}
            <div className="flex-1 overflow-auto">
              {activeTab ? (
                <>
                  {isGeneralsModule ? (
                    <EditGenerals />
                  ) : (
                    <div className="p-4">
                      <TiptapEditor
                        content={getFileContent(activeTab)}
                        onChange={handleContentChange}
                        editable={isEditable}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-[#858585] text-center mt-8 p-4">
                  <p>No file selected</p>
                  <p className="text-xs mt-2">Open a file from the sidebar or create a new one</p>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle className="h-[3px] bg-[#2d2d2d] hover:bg-[#007acc] transition-colors" />

        <ResizablePanel defaultSize={30} minSize={20}>
          {/* Terminal Panel */}
          <Tabs defaultValue="terminal" className="h-full flex flex-col">
            <TabsList className="h-[35px] bg-[#181818] rounded-none border-b border-[#2d2d2d] justify-start">
              <TabsTrigger 
                value="terminal" 
                className="rounded-none text-xs data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#cccccc]"
              >
                <Terminal className="w-3 h-3 mr-1" />
                Terminal
              </TabsTrigger>
              <TabsTrigger 
                value="problems" 
                className="rounded-none text-xs data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#cccccc]"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                Problems
              </TabsTrigger>
              <TabsTrigger 
                value="output" 
                className="rounded-none text-xs data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#cccccc]"
              >
                <Code className="w-3 h-3 mr-1" />
                Output
              </TabsTrigger>
            </TabsList>

            <TabsContent value="terminal" className="flex-1 bg-[#0e0e0e] p-2 mt-0">
              <div className="font-mono text-xs text-[#cccccc] space-y-1">
                <div className="text-[#858585]">$ pnpm dev</div>
                <div className="text-[#4ec9b0]">▲ Next.js 15.0.0</div>
                <div className="text-[#cccccc]">- Local: http://localhost:3000</div>
                <div className="text-[#cccccc]">- Network: http://192.168.1.100:3000</div>
                <div className="text-[#858585]">✓ Ready in 1.2s</div>
                <div className="text-[#858585]">$ _</div>
              </div>
            </TabsContent>

            <TabsContent value="problems" className="flex-1 bg-[#0e0e0e] p-2 mt-0">
              <div className="text-xs text-[#858585]">
                No problems detected.
              </div>
            </TabsContent>

            <TabsContent value="output" className="flex-1 bg-[#0e0e0e] p-2 mt-0">
              <div className="font-mono text-xs text-[#cccccc] space-y-1">
                <div className="text-[#858585]">[2024-01-10 14:30:25] Building EAC Dashboard...</div>
                <div className="text-[#4ec9b0]">[2024-01-10 14:30:26] ✓ Compiled successfully</div>
                <div className="text-[#007acc]">[2024-01-10 14:30:26] Hot reload enabled</div>
              </div>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
} 