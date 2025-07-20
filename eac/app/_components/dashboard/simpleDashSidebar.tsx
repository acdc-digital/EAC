// Temporary Simple Sidebar Component
// This is a debugging version to isolate the infinite loop issue

"use client";

import { useEditorStore, useSidebarStore } from "@/store";
import { ChevronDown, ChevronRight, FileText, Folder } from "lucide-react";
import { useCallback } from "react";

interface SidebarProps {
  activePanel: string;
}

export function SimpleDashSidebar({ activePanel }: SidebarProps) {
  const { openSections, toggleSection } = useSidebarStore();
  const { projectFiles, financialFiles, openTab } = useEditorStore();

  // Memoize callback functions to prevent unnecessary re-renders
  const handleToggleSection = useCallback((sectionId: string) => {
    toggleSection(sectionId);
  }, [toggleSection]);

  const handleOpenTab = useCallback((file: Parameters<typeof openTab>[0]) => {
    openTab(file);
  }, [openTab]);

  if (activePanel !== 'explorer') {
    return null;
  }

  return (
    <aside className="w-64 bg-[#181818] border-r border-[#2d2d2d] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#2d2d2d]">
        <h2 className="text-sm font-medium text-[#cccccc]">EXPLORER</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {/* Projects Section */}
          <div className="mb-2">
            <div
              className="flex items-center w-full hover:bg-[#2d2d2d] px-1 py-0.5 rounded cursor-pointer"
              onClick={() => handleToggleSection('projects')}
            >
              {openSections.has('projects') ? (
                <ChevronDown className="w-3 h-3 mr-1 text-[#858585]" />
              ) : (
                <ChevronRight className="w-3 h-3 mr-1 text-[#858585]" />
              )}
              <Folder className="w-4 h-4 mr-1 text-[#c09553]" />
              <span className="text-xs text-[#cccccc]">Projects</span>
            </div>

            {openSections.has('projects') && (
              <div className="ml-4 space-y-0.5 mt-1">
                {projectFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center hover:bg-[#2d2d2d] px-1 py-0.5 rounded cursor-pointer"
                    onClick={() => handleOpenTab(file)}
                  >
                    <FileText className="w-3 h-3 mr-2 text-[#858585]" />
                    <span className="text-xs text-[#cccccc]">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial Section */}
          <div className="mb-2">
            <div
              className="flex items-center w-full hover:bg-[#2d2d2d] px-1 py-0.5 rounded cursor-pointer"
              onClick={() => handleToggleSection('financial')}
            >
              {openSections.has('financial') ? (
                <ChevronDown className="w-3 h-3 mr-1 text-[#858585]" />
              ) : (
                <ChevronRight className="w-3 h-3 mr-1 text-[#858585]" />
              )}
              <Folder className="w-4 h-4 mr-1 text-[#c09553]" />
              <span className="text-xs text-[#cccccc]">Financial Data</span>
            </div>

            {openSections.has('financial') && (
              <div className="ml-4 space-y-0.5 mt-1">
                {financialFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center hover:bg-[#2d2d2d] px-1 py-0.5 rounded cursor-pointer"
                    onClick={() => handleOpenTab(file)}
                  >
                    <FileText className="w-3 h-3 mr-2 text-[#858585]" />
                    <span className="text-xs text-[#cccccc]">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
