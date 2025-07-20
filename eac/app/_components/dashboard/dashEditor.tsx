// Editor Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashEditor.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";

import { X, Plus, ChevronLeft, ChevronRight, FileCode, FileText, FileSpreadsheet, FileType, Braces } from "lucide-react";
import { useEditorStore } from "@/store";
import { useTerminalStore } from "@/store/terminal";
import { ProjectFile } from "@/store/editor/types";

// Dynamic import to avoid SSR issues
const TiptapEditor = dynamic(() => import('@/app/_components/editor/_components/TiptapEditor'), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading editor...</div>
});

// Dynamic import for edit modules
const EditGenerals = dynamic(() => import('../editor/editGenerals').then(mod => ({ default: mod.EditGenerals })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading module...</div>
});

const EditPercentComplete = dynamic(() => import('../editor/editPercentComplete').then(mod => ({ default: mod.EditPercentComplete })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading module...</div>
});

const EditSchedule = dynamic(() => import('../editor/editSchedule').then(mod => ({ default: mod.EditSchedule })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading module...</div>
});

const EditMaterials = dynamic(() => import('../editor/editMaterials').then(mod => ({ default: mod.EditMaterials })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading module...</div>
});

// Dynamic import for Terminal component
const Terminal = dynamic(() => import('../terminal/terminal').then(mod => ({ default: mod.Terminal })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading terminal...</div>
});

interface DashEditorProps {}

export function DashEditor({}: DashEditorProps) {
  const { 
    openTabs, 
    activeTab, 
    closeTab, 
    setActiveTab, 
    updateFileContent
  } = useEditorStore();

  const { isCollapsed: isTerminalCollapsed } = useTerminalStore();

  const [scrollPosition, setScrollPosition] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [tabContentHeights, setTabContentHeights] = useState<{ [tabId: string]: number }>({});

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
      // Update the file content in your store
      updateFileContent(activeTab, content);
    }
  };

  // Effect to monitor content height changes for the active tab
  useEffect(() => {
    const updateContentHeight = () => {
      if (contentRef.current && activeTab) {
        const height = contentRef.current.scrollHeight;
        setTabContentHeights(prev => ({
          ...prev,
          [activeTab]: height
        }));
      }
    };

    // Initial measurement
    updateContentHeight();

    // Set up ResizeObserver to monitor content changes
    const resizeObserver = new ResizeObserver(updateContentHeight);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [activeTab, openTabs]);

  // Calculate line count based on active tab's content height
  const activeTabContentHeight = activeTab ? (tabContentHeights[activeTab] || 0) : 0;
  const lineCount = Math.max(Math.ceil(activeTabContentHeight / 20), 50); // 20px per line (5px line height)

  // Debug logging
  console.log('Content height debug:', {
    activeTab,
    activeTabContentHeight,
    lineCount,
    tabContentHeights,
    scrollHeight: contentRef.current?.scrollHeight,
    offsetHeight: contentRef.current?.offsetHeight
  });

  // Get current tab to check if it's editable
  const currentTab = openTabs.find((t) => t.id === activeTab);
  const isEditable = currentTab ? ['typescript', 'javascript', 'json', 'markdown'].includes(currentTab.type) : false;
  const isGeneralsModule = currentTab?.type === 'generals';
  const isPercentCompleteModule = currentTab?.type === 'percent-complete';
  const isScheduleModule = currentTab?.type === 'schedule';
  const isMaterialsModule = currentTab?.type === 'materials';

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
                    {(() => {
                      const getTabIcon = (type: string) => {
                        switch (type) {
                          case 'typescript':
                          case 'javascript':
                            return FileCode;
                          case 'json':
                            return Braces;
                          case 'excel':
                            return FileSpreadsheet;
                          case 'markdown':
                            return FileText;
                          case 'pdf':
                            return FileType;
                          case 'generals':
                            return FileText;
                          case 'percent-complete':
                            return FileSpreadsheet;
                          case 'schedule':
                            return FileSpreadsheet;
                          case 'materials':
                            return FileSpreadsheet;
                          default:
                            return FileCode;
                        }
                      };
                      const IconComponent = getTabIcon(tab.type);
                      return <IconComponent className="w-3 h-3 flex-shrink-0" />;
                    })()}
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
                
              {/* Add New Tab Button - Disabled (file creation moved to sidebar) */}
              <button 
                className="flex items-center justify-center w-8 h-[35px] text-xs border-l border-[#2d2d2d] text-[#3d3d3d] opacity-30 cursor-not-allowed"
                disabled
              >
                <span className="sr-only">Create new file (use sidebar)</span>
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code content with Tiptap or Edit Modules */}
            <div 
              className="flex-1 overflow-scroll editor-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#454545 #2d2d2d'
              }}
            >
              <style jsx>{`
                .editor-scrollbar::-webkit-scrollbar {
                  width: 14px;
                  height: 14px;
                  background: #2d2d2d;
                }
                .editor-scrollbar::-webkit-scrollbar-track {
                  background: #2d2d2d;
                  border-radius: 0px;
                }
                .editor-scrollbar::-webkit-scrollbar-thumb {
                  background: #454545;
                  border-radius: 0px;
                  border: 1px solid #2d2d2d;
                  min-height: 20px;
                }
                .editor-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #555555;
                }
                .editor-scrollbar::-webkit-scrollbar-corner {
                  background: #2d2d2d;
                }
                .editor-scrollbar {
                  scrollbar-width: thin;
                  scrollbar-color: #454545 #2d2d2d;
                }
              `}</style>
              <div className="flex min-h-full">
                {/* Line numbers - synchronized with content */}
                <div className="bg-[#1a1a1a] text-[#858585] text-center px-2 select-none w-[40px] border-r border-[#2d2d2d] flex-shrink-0">
                  {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i} className="leading-5 text-xs font-mono h-5">
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Editor content */}
                <div ref={contentRef} className="flex-1">
                  {activeTab ? (
                    <>
                      {isGeneralsModule ? (
                        <EditGenerals />
                      ) : isPercentCompleteModule ? (
                        <EditPercentComplete />
                      ) : isScheduleModule ? (
                        <EditSchedule />
                      ) : isMaterialsModule ? (
                        <EditMaterials />
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
            </div>
          </div>
        </ResizablePanel>

        {!isTerminalCollapsed && (
          <ResizableHandle className="h-[3px] bg-[#2d2d2d] hover:bg-[#007acc] transition-colors" />
        )}

        <Terminal />
      </ResizablePanelGroup>
    </main>
  );
} 