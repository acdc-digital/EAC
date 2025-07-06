// Sidebar Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashSidebar.tsx

"use client";

import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  X,
  Plus,
  FileCode,
  Braces,
  FileSpreadsheet,
  FileText,
  FileType,
  ChevronsDown
} from "lucide-react";
import { useEditorStore, useSidebarStore } from "@/store";
import { FileCreationDropdown } from "./fileCreationDropdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activePanel: string;
}

export function DashSidebar({ activePanel }: SidebarProps) {
  const { openSections, toggleSection, collapseAllSections } = useSidebarStore();
  const { projectFiles, financialFiles, projectFolders, showProjectsCategory, showFinancialCategory, openTab, deleteFile, createFolder, deleteFolder, deleteProjectsCategory, deleteFinancialCategory, reorderProjectFolders, closeAllTabs } = useEditorStore();
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; fileId: string; fileName: string }>({
    isOpen: false,
    fileId: '',
    fileName: ''
  });
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [isFileDropdownOpen, setIsFileDropdownOpen] = useState(false);
  const [preselectedFolder, setPreselectedFolder] = useState<{id: string, name: string, category: 'project' | 'financial'} | null>(null);
  const createButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const handleDeleteClick = (fileId: string, fileName: string) => {
    setDeleteConfirmation({ isOpen: true, fileId, fileName });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.fileId) {
      deleteFile(deleteConfirmation.fileId);
      setDeleteConfirmation({ isOpen: false, fileId: '', fileName: '' });
    }
  };



  const handleFolderNameSubmit = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim(), 'project');
    }
    setIsCreatingFolder(false);
    setNewFolderName('');
  };

  const handleFolderNameCancel = () => {
    setIsCreatingFolder(false);
    setNewFolderName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFolderNameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleFolderNameCancel();
    }
  };

  const handleDragStart = (e: React.DragEvent, folderId: string) => {
    setDraggedItem(folderId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', folderId);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedItem && draggedItem !== folderId) {
      const draggedIndex = projectFolders.findIndex(folder => folder.id === draggedItem);
      const dropIndex = projectFolders.findIndex(folder => folder.id === folderId);
      
      if (draggedIndex !== -1 && dropIndex !== -1 && draggedIndex !== dropIndex) {
        reorderProjectFolders(draggedIndex, dropIndex);
      }
    }
    
    setDragOverItem(folderId);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleCreateFileInFolder = (folderId: string, folderName: string, category: 'project' | 'financial') => {
    setPreselectedFolder({ id: folderId, name: folderName, category });
    setIsFileDropdownOpen(true);
  };

  const handleCloseDropdown = () => {
    setIsFileDropdownOpen(false);
    setPreselectedFolder(null);
  };

  // Create dynamic file structure using store data
  const fileStructure = [
    // Add project folders as top-level items (only if projects category exists)
    ...(showProjectsCategory ? projectFolders.map(folder => ({
      id: folder.id,
      name: folder.name,
      icon: Folder,
      type: 'folder' as const,
      isFolder: true,
      children: [
        // Show files that belong to this folder
        ...projectFiles.filter(file => file.folderId === folder.id).map(file => ({
          id: file.id,
          name: file.name,
          icon: file.icon,
          type: file.type,
          file: file,
        }))
      ]
    })) : []),
    // Show project files that aren't in folders as top-level items
    ...(showProjectsCategory ? projectFiles.filter(file => !file.folderId).map(file => ({
      id: file.id,
      name: file.name,
      icon: file.icon,
      type: file.type,
      file: file, // Store the full file object for opening
    })) : []),
    // Only show financial category if it exists
    ...(showFinancialCategory ? [{
      id: 'financial',
      name: 'Financial Data',
      icon: Folder,
      children: financialFiles.map(file => ({
        id: file.id,
        name: file.name,
        icon: file.icon,
        type: file.type,
        file: file, // Store the full file object for opening
      }))
    }] : [])
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'typescript': return 'text-[#007acc]';
      case 'json': return 'text-[#ffd700]';
      case 'excel': return 'text-[#4ec9b0]';
      case 'pdf': return 'text-[#ff6b6b]';
      case 'folder': return 'text-[#c09553]';
      default: return 'text-[#858585]';
    }
  };

  const getFileIconComponent = (type: string) => {
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
        return FileCode;
      default:
        return FileCode;
    }
  };

  const renderContent = () => {
    switch (activePanel) {
      case 'financial':
        return (
          <div className="p-2">
            <div className="text-xs uppercase text-[#858585] px-2 py-1 mb-2">
              Financial Overview
            </div>
            <div className="space-y-2">
              <div className="bg-[#2d2d2d] rounded p-2">
                <div className="text-xs text-[#cccccc] font-medium">Monthly Revenue</div>
                <div className="text-lg text-[#4ec9b0] font-mono">$47,382.50</div>
                <div className="text-xs text-[#858585]">+12.3% from last month</div>
              </div>
              <div className="bg-[#2d2d2d] rounded p-2">
                <div className="text-xs text-[#cccccc] font-medium">Expenses</div>
                <div className="text-lg text-[#ce9178] font-mono">$23,451.20</div>
                <div className="text-xs text-[#858585]">-5.2% from last month</div>
              </div>
              <div className="bg-[#2d2d2d] rounded p-2">
                <div className="text-xs text-[#cccccc] font-medium">Net Profit</div>
                <div className="text-lg text-[#dcdcaa] font-mono">$23,931.30</div>
                <div className="text-xs text-[#858585]">+18.7% from last month</div>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-2">
            <div className="text-xs uppercase text-[#858585] px-2 py-1 mb-2">
              Analytics Dashboard
            </div>
            <div className="space-y-1">
              <div className="hover:bg-[#2d2d2d] px-2 py-1 rounded text-xs cursor-pointer">
                📊 Revenue Trends
              </div>
              <div className="hover:bg-[#2d2d2d] px-2 py-1 rounded text-xs cursor-pointer">
                📈 Growth Metrics
              </div>
              <div className="hover:bg-[#2d2d2d] px-2 py-1 rounded text-xs cursor-pointer">
                💰 Cost Analysis
              </div>
              <div className="hover:bg-[#2d2d2d] px-2 py-1 rounded text-xs cursor-pointer">
                🎯 KPI Dashboard
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-2">
            <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
              <span>EAC Explorer</span>
              <div className="flex items-center gap-1">
                <button
                  ref={createButtonRef}
                  onClick={() => {
                    setPreselectedFolder(null);
                    setIsFileDropdownOpen(true);
                  }}
                  className="hover:bg-[#2d2d2d] p-0.5 rounded transition-colors"
                  aria-label="Create new file"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={collapseAllSections}
                  className="hover:bg-[#2d2d2d] p-0.5 rounded transition-colors border border-[#454545] rounded"
                  aria-label="Collapse all folders"
                >
                  <ChevronsDown className="w-3 h-3" />
                </button>
                <button
                  onClick={closeAllTabs}
                  className="hover:bg-[#2d2d2d] p-0.5 rounded transition-colors border border-[#454545] rounded"
                  aria-label="Close all tabs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            {/* Show new folder input at the top level when creating */}
            {isCreatingFolder && (
              <div className="flex items-center w-full hover:bg-[#2d2d2d] px-1 py-0.5 rounded mb-1">
                <ChevronRight className="w-3 h-3 mr-1 text-[#858585]" />
                <Folder className="w-4 h-4 mr-1 text-[#c09553]" />
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    // Only cancel if we're not in the middle of submitting
                    setTimeout(() => {
                      if (isCreatingFolder) {
                        handleFolderNameCancel();
                      }
                    }, 100);
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-xs text-[#cccccc] placeholder-[#858585]"
                  title="Enter folder name"
                  aria-label="Enter folder name"
                  autoFocus
                />
              </div>
            )}
            
            {fileStructure.map((section) => {
              const isOpen = openSections.has(section.id);
              const isFolder = 'isFolder' in section && section.isFolder;
              const isDraggedOver = dragOverItem === section.id;
              const isBeingDragged = draggedItem === section.id;
              
              return (
                <div key={section.id} className="mb-1">
                  <div 
                    className={`flex items-center w-full hover:bg-[#2d2d2d] px-1 py-0.5 rounded group ${
                      isDraggedOver ? 'bg-[#3a3a3a] border-l-2 border-[#5a5a5a]' : ''
                    } ${isBeingDragged ? 'opacity-50' : ''}`}
                    draggable={isFolder}
                    onDragStart={(e) => isFolder && handleDragStart(e, section.id)}
                    onDragOver={(e) => isFolder && handleDragOver(e, section.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => isFolder && handleDrop(e)}
                    onDragEnd={handleDragEnd}
                  >
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={`flex items-center flex-1 text-left ${isFolder ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
                    >
                      {isOpen ? (
                        <ChevronDown className="w-3 h-3 mr-1 text-[#858585] cursor-pointer" />
                      ) : (
                        <ChevronRight className="w-3 h-3 mr-1 text-[#858585] cursor-pointer" />
                      )}
                      <section.icon className="w-4 h-4 mr-1 text-[#c09553]" />
                      <span className="text-xs text-[#cccccc]">{section.name}</span>
                    </button>
                    {(section.id === 'projects' || section.id === 'financial' || 'isFolder' in section) && (
                      <div className="opacity-0 group-hover:opacity-100 ml-auto flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const folderId = section.id === 'projects' ? '' : section.id === 'financial' ? '' : section.id;
                            const category = section.id === 'financial' ? 'financial' : 'project';
                            handleCreateFileInFolder(folderId, section.name, category);
                          }}
                          className="p-0.5 hover:bg-[#3d3d3d] rounded transition-opacity"
                          aria-label={`Create file in ${section.name}`}
                        >
                          <Plus className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (section.id === 'projects') {
                              // Delete the entire projects category
                              deleteProjectsCategory();
                            } else if (section.id === 'financial') {
                              // Delete the entire financial category
                              deleteFinancialCategory();
                            } else {
                              // Delete specific folder
                              deleteFolder(section.id);
                            }
                          }}
                          className="p-0.5 hover:bg-[#3d3d3d] rounded transition-opacity"
                          aria-label={`Delete ${section.name}`}
                        >
                          <X className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {isOpen && 'children' in section && (
                    <div className="ml-4 space-y-0.5 mt-1">
                      {section.children.map((file, index) => {
                        const FileIconComponent = getFileIconComponent(file.type);
                        const isProjectFile = 'file' in file && file.file;
                        
                        return (
                          <div 
                            key={'id' in file ? file.id : `${section.id}-${index}`}
                            className="group flex items-center hover:bg-[#2d2d2d] px-1 py-0.5 rounded cursor-pointer"
                          >
                            <div
                              className="flex items-center flex-1"
                              onClick={() => {
                                if (isProjectFile && file.file) {
                                  openTab(file.file);
                                }
                              }}
                            >
                              <FileIconComponent className={`w-3 h-3 mr-2 ${getFileIcon(file.type)}`} />
                              <span className="text-xs text-[#cccccc]">{file.name}</span>
                            </div>
                            {isProjectFile && file.file && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(file.file.id, file.name);
                                }}
                                className="opacity-0 group-hover:opacity-100 ml-auto px-1 hover:bg-[#3d3d3d] rounded transition-opacity"
                                aria-label={`Delete ${file.name}`}
                              >
                                <X className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Handle top-level files (files without folders) */}
                  {'file' in section && (
                    <div 
                      className="group flex items-center hover:bg-[#2d2d2d] px-1 py-0.5 rounded cursor-pointer ml-4"
                      onClick={() => {
                        if (section.file) {
                          openTab(section.file);
                        }
                      }}
                    >
                      <div className="flex items-center flex-1">
                        {(() => {
                          const FileIconComponent = getFileIconComponent(section.type);
                          return <FileIconComponent className={`w-3 h-3 mr-2 ${getFileIcon(section.type)}`} />;
                        })()}
                        <span className="text-xs text-[#cccccc]">{section.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(section.file.id, section.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 ml-auto px-1 hover:bg-[#3d3d3d] rounded transition-opacity"
                        aria-label={`Delete ${section.name}`}
                      >
                        <X className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
    }
  };

  return (
    <>
      <aside className="w-60 min-w-60 max-w-60 bg-[#181818] border-r border-[#2d2d2d] flex flex-col flex-shrink-0">
        <ScrollArea className="flex-1">
          {renderContent()}
        </ScrollArea>
      </aside>

      <Dialog open={deleteConfirmation.isOpen} onOpenChange={(open) => {
        if (!open) {
          setDeleteConfirmation({ isOpen: false, fileId: '', fileName: '' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteConfirmation.fileName}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmation({ isOpen: false, fileId: '', fileName: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Creation Dropdown */}
      <FileCreationDropdown
        isOpen={isFileDropdownOpen}
        onClose={handleCloseDropdown}
        preselectedFolder={preselectedFolder}
        buttonRef={createButtonRef}
      />
    </>
  );
} 