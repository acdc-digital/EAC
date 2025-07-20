// Editor Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashEditor.tsx

"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from "react";

import { useEditorStore } from "@/store";
import { useTerminalStore } from "@/store/terminal";
import { AtSign, Braces, Camera, ChevronLeft, ChevronRight, Edit3, FileCode, FileSpreadsheet, FileText, FileType, Hash, MessageSquare, Plus, Users, X } from "lucide-react";

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

// Dynamic import for Social and File Editor components
const SocialConnectors = dynamic(() => import('./socialConnectors').then(mod => ({ default: mod.SocialConnectors })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading social connectors...</div>
});

const FileEditor = dynamic(() => import('./fileEditor').then(mod => ({ default: mod.FileEditor })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading file editor...</div>
});

// Dynamic import for Social Platform Editors
const FacebookPostEditor = dynamic(() => import('./socialPlatforms/facebookPostEditor').then(mod => ({ default: mod.FacebookPostEditor })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading Facebook editor...</div>
});

const XPostEditor = dynamic(() => import('./socialPlatforms/xPostEditor').then(mod => ({ default: mod.XPostEditor })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading X editor...</div>
});

const InstagramPostEditor = dynamic(() => import('./socialPlatforms/instagramPostEditor').then(mod => ({ default: mod.InstagramPostEditor })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading Instagram editor...</div>
});

const RedditPostEditor = dynamic(() => import('./socialPlatforms/redditPostEditor').then(mod => ({ default: mod.RedditPostEditor })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading Reddit editor...</div>
});

interface DashEditorProps {}

export function DashEditor({}: DashEditorProps) {
  const { 
    openTabs, 
    activeTab, 
    closeTab, 
    setActiveTab, 
    updateFileContent,
    createNewFile
  } = useEditorStore();

  const { isCollapsed: isTerminalCollapsed } = useTerminalStore();

  const [scrollPosition, setScrollPosition] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

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

  // Close create menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
    };

    if (showCreateMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreateMenu]);

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

  const handleCreateFile = (type: 'typescript' | 'javascript' | 'json' | 'markdown' | 'facebook' | 'instagram' | 'x' | 'reddit') => {
    const defaultNames = {
      typescript: 'NewComponent',
      javascript: 'newScript',
      json: 'config',
      markdown: 'README',
      facebook: 'facebook-post',
      instagram: 'instagram-post',
      x: 'x-post',
      reddit: 'reddit-post'
    };
    
    const baseName = defaultNames[type];
    const timestamp = Date.now();
    const fileName = `${baseName}-${timestamp}`;
    
    createNewFile(fileName, type, 'project');
    setShowCreateMenu(false);
  };

  // Calculate line count based on active tab's content height - using a simple static approach
  const lineCount = 50; // Fixed line count to prevent infinite loops

  // Get current tab to check if it's editable
  const currentTab = openTabs.find((t) => t.id === activeTab);
  const isEditable = currentTab ? ['typescript', 'javascript', 'json', 'markdown'].includes(currentTab.type) : false;
  const isGeneralsModule = currentTab?.type === 'generals';
  const isPercentCompleteModule = currentTab?.type === 'percent-complete';
  const isScheduleModule = currentTab?.type === 'schedule';
  const isMaterialsModule = currentTab?.type === 'materials';
  const isSocialConnectModule = currentTab?.type === 'social-connect';
  const isPostCreatorModule = currentTab?.type === 'post-creator';

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
                          case 'social-connect':
                            return Users;
                          case 'post-creator':
                            return Edit3;
                          case 'facebook':
                            return MessageSquare;
                          case 'reddit':
                            return Hash;
                          case 'instagram':
                            return Camera;
                          case 'x':
                            return AtSign;
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
                
              {/* Add New Tab Button - Now functional */}
              <div className="relative" ref={createMenuRef}>
                <button
                  className="flex items-center justify-center w-8 h-[35px] text-xs border-l border-[#2d2d2d] text-[#858585] hover:bg-[#2d2d2d] transition-colors"
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                >
                  <span className="sr-only">Create new file</span>
                  <Plus className="w-3 h-3" />
                </button>

                {/* Create file dropdown menu */}
                {showCreateMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[#2d2d2d] border border-[#454545] rounded shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => handleCreateFile('typescript')}
                        className="flex items-center w-full px-3 py-2 text-xs text-[#cccccc] hover:bg-[#3d3d3d] transition-colors"
                      >
                        <FileCode className="w-3 h-3 mr-2" />
                        TypeScript Component
                      </button>
                      <button
                        onClick={() => handleCreateFile('javascript')}
                        className="flex items-center w-full px-3 py-2 text-xs text-[#cccccc] hover:bg-[#3d3d3d] transition-colors"
                      >
                        <FileCode className="w-3 h-3 mr-2" />
                        JavaScript File
                      </button>
                      <button
                        onClick={() => handleCreateFile('json')}
                        className="flex items-center w-full px-3 py-2 text-xs text-[#cccccc] hover:bg-[#3d3d3d] transition-colors"
                      >
                        <Braces className="w-3 h-3 mr-2" />
                        JSON Configuration
                      </button>
                      <button
                        onClick={() => handleCreateFile('markdown')}
                        className="flex items-center w-full px-3 py-2 text-xs text-[#cccccc] hover:bg-[#3d3d3d] transition-colors"
                      >
                        <FileText className="w-3 h-3 mr-2" />
                        Markdown Document
                      </button>
                      <hr className="border-[#454545] my-1" />
                      <button
                        onClick={() => handleCreateFile('facebook')}
                        className="flex items-center w-full px-3 py-2 text-xs text-[#cccccc] hover:bg-[#3d3d3d] transition-colors"
                      >
                        <MessageSquare className="w-3 h-3 mr-2" />
                        Facebook Post
                      </button>
                      <button
                        onClick={() => handleCreateFile('x')}
                        className="flex items-center w-full px-3 py-2 text-xs text-[#cccccc] hover:bg-[#3d3d3d] transition-colors"
                      >
                        <AtSign className="w-3 h-3 mr-2" />
                        X (Twitter) Post
                      </button>
                      <button
                        onClick={() => handleCreateFile('instagram')}
                        className="flex items-center w-full px-3 py-2 text-xs text-[#cccccc] hover:bg-[#3d3d3d] transition-colors"
                      >
                        <Camera className="w-3 h-3 mr-2" />
                        Instagram Post
                      </button>
                      <button
                        onClick={() => handleCreateFile('reddit')}
                        className="flex items-center w-full px-3 py-2 text-xs text-[#cccccc] hover:bg-[#3d3d3d] transition-colors"
                      >
                        <Hash className="w-3 h-3 mr-2" />
                        Reddit Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                      ) : isSocialConnectModule ? (
                        <SocialConnectors />
                      ) : isPostCreatorModule ? (
                        <FileEditor />
                      ) : currentTab?.type === 'facebook' ? (
                        <FacebookPostEditor
                          fileName={currentTab.name}
                          onChange={(content) => updateFileContent(currentTab.id, content)}
                        />
                      ) : currentTab?.type === 'x' ? (
                        <XPostEditor
                          fileName={currentTab.name}
                          onChange={(content) => updateFileContent(currentTab.id, content)}
                        />
                      ) : currentTab?.type === 'instagram' ? (
                        <InstagramPostEditor
                          fileName={currentTab.name}
                          onChange={(content) => updateFileContent(currentTab.id, content)}
                        />
                      ) : currentTab?.type === 'reddit' ? (
                        <RedditPostEditor
                          fileName={currentTab.name}
                          onChange={(content) => updateFileContent(currentTab.id, content)}
                        />
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