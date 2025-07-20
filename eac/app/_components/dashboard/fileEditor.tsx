// File Editor Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/dashboard/fileEditor.tsx

"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/store";
import { ProjectFile } from "@/store/editor/types";
import { AtSign, Camera, ChevronDown, ChevronRight, FileText, Folder, Hash, MessageSquare } from "lucide-react";
import { useState } from 'react';

export function FileEditor() {
  const { 
    projectFiles, 
    financialFiles, 
    projectFolders, 
    financialFolders,
    openTab,
    updateFileStatus
  } = useEditorStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Filter to show only social media and markdown files
  const filteredProjectFiles = projectFiles.filter(file => 
    ['facebook', 'reddit', 'instagram', 'x', 'markdown'].includes(file.type)
  );
  
  const filteredFinancialFiles = financialFiles.filter(file => 
    ['facebook', 'reddit', 'instagram', 'x', 'markdown'].includes(file.type)
  );

  const getStatusBadge = (file: ProjectFile) => {
    if (!['facebook', 'reddit', 'instagram', 'x'].includes(file.type)) {
      return <div className="w-20"></div>; // Empty space for non-social files
    }
    
    const status = file.status || 'draft';
    const statusConfig = {
      draft: { label: 'Draft', color: 'bg-[#4a4a4a] text-[#cccccc]', next: 'scheduled' as const },
      scheduled: { label: 'Scheduled', color: 'bg-[#3b82f6] text-white', next: 'complete' as const },
      complete: { label: 'Complete', color: 'bg-[#10b981] text-white', next: 'draft' as const }
    };

    const config = statusConfig[status];
    
    return (
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent opening the file
          updateFileStatus(file.id, config.next);
        }}
        className={`px-2 py-0.5 text-xs rounded-full hover:opacity-80 transition-opacity ${config.color}`}
        title={`Click to change to ${config.next}`}
      >
        {config.label}
      </button>
    );
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'facebook':
        return MessageSquare;
      case 'reddit':
        return Hash;
      case 'instagram':
        return Camera;
      case 'x':
        return AtSign;
      case 'markdown':
        return FileText;
      default:
        return FileText;
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'facebook':
        return 'Facebook Post';
      case 'reddit':
        return 'Reddit Post';
      case 'instagram':
        return 'Instagram Post';
      case 'x':
        return 'X/Twitter Post';
      case 'markdown':
        return 'Markdown Document';
      default:
        return 'Unknown';
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFiles = (files: typeof filteredProjectFiles, folders: typeof projectFolders) => {
    const filesWithoutFolder = files.filter(file => !file.folderId);
    const filesInFolders = folders.map(folder => ({
      folder,
      files: files.filter(file => file.folderId === folder.id)
    })).filter(group => group.files.length > 0);

    return (
      <div className="space-y-1">
        {/* Table Header */}
        {(filesWithoutFolder.length > 0 || filesInFolders.length > 0) && (
          <div className="flex items-center px-3 py-2 text-xs font-medium text-[#858585] uppercase tracking-wide border-b border-[#2d2d2d] bg-[#1a1a1a]">
            <div className="flex-1">File Name</div>
            <div className="w-24 text-center">Type</div>
            <div className="w-20 text-center">Status</div>
          </div>
        )}

        {/* Files not in folders */}
        {filesWithoutFolder.map(file => {
          const IconComponent = getFileIcon(file.type);
          return (
            <div
              key={file.id}
              onClick={() => openTab(file)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-[#2d2d2d] cursor-pointer text-[#cccccc] text-sm group border-b border-[#2d2d2d]/30"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <IconComponent className="w-4 h-4 flex-shrink-0 text-[#858585]" />
                <span className="truncate">{file.name}</span>
              </div>
              <div className="w-24 text-center text-xs text-[#858585]">
                {getFileTypeLabel(file.type)}
              </div>
              <div className="w-20 text-center">
                {getStatusBadge(file)}
              </div>
            </div>
          );
        })}

        {/* Files in folders */}
        {filesInFolders.map(({ folder, files }) => {
          const isExpanded = expandedFolders.has(folder.id);
          return (
            <div key={folder.id}>
              <div
                onClick={() => toggleFolder(folder.id)}
                className="flex items-center gap-1 px-3 py-2 hover:bg-[#2d2d2d] cursor-pointer text-[#cccccc] text-sm border-b border-[#2d2d2d]/30"
              >
                <div className="flex items-center gap-1 flex-1">
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                  )}
                  <Folder className="w-4 h-4 flex-shrink-0 text-[#007acc]" />
                  <span className="truncate">{folder.name}</span>
                </div>
                <div className="w-24 text-center text-xs text-[#858585]">
                  {files.length} files
                </div>
                <div className="w-20"></div>
              </div>
              
              {isExpanded && (
                <div className="bg-[#1a1a1a]">
                  {files.map(file => {
                    const IconComponent = getFileIcon(file.type);
                    return (
                      <div
                        key={file.id}
                        onClick={() => openTab(file)}
                        className="flex items-center gap-2 px-6 py-2 hover:bg-[#2d2d2d] cursor-pointer text-[#cccccc] text-sm group border-b border-[#2d2d2d]/20"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <IconComponent className="w-4 h-4 flex-shrink-0 text-[#858585]" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <div className="w-24 text-center text-xs text-[#858585]">
                          {getFileTypeLabel(file.type)}
                        </div>
                        <div className="w-20 text-center">
                          {getStatusBadge(file)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      <div className="px-4 py-3 border-b border-[#2d2d2d]">
        <h2 className="text-sm font-medium text-[#cccccc] mb-1">File Editor</h2>
        <p className="text-xs text-[#858585]">Edit your posts and markdown files</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Project Files Section */}
          {(filteredProjectFiles.length > 0 || projectFolders.length > 0) && (
            <div className="mb-4">
              <div className="px-3 py-2 text-xs font-medium text-[#858585] uppercase tracking-wide">
                Projects ({filteredProjectFiles.length} files)
              </div>
              {renderFiles(filteredProjectFiles, projectFolders)}
            </div>
          )}

          {/* Financial Files Section */}
          {(filteredFinancialFiles.length > 0 || financialFolders.length > 0) && (
            <div className="mb-4">
              <div className="px-3 py-2 text-xs font-medium text-[#858585] uppercase tracking-wide">
                Financial ({filteredFinancialFiles.length} files)
              </div>
              {renderFiles(filteredFinancialFiles, financialFolders)}
            </div>
          )}

          {/* Empty State */}
          {filteredProjectFiles.length === 0 && filteredFinancialFiles.length === 0 && (
            <div className="px-3 py-8 text-center text-[#858585]">
              <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm mb-2">No files to edit</p>
              <p className="text-xs">Create some social media posts or markdown files to get started.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
