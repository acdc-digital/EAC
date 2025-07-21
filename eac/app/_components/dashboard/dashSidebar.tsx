// Sidebar Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashSidebar.tsx

"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjects } from "@/lib/hooks/useProjects";
import { useEditorStore, useSidebarStore } from "@/store";
import {
  Braces,
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  Edit3,
  FileCode,
  FileSpreadsheet,
  FileText,
  FileType,
  Folder,
  GripVertical,
  Pin,
  Plus,
  X
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { DashTrash } from "./dashTrash";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileCreationDropdown } from "./_components/fileCreationDropdown";

interface SidebarProps {
  activePanel: string;
}

export function DashSidebar({ activePanel }: SidebarProps) {
  const { openSections, toggleSection, collapseAllSections } = useSidebarStore();
  const { projectFiles, financialFiles, projectFolders, showProjectsCategory, showFinancialCategory, openTab, openSpecialTab, renameFile, renameFolder, createFolder, deleteProjectsCategory, deleteFinancialCategory, reorderProjectFolders, reorderFilesInFolder, closeAllTabs, moveToTrash } = useEditorStore();
  const { createProject } = useProjects();
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; fileId: string; fileName: string }>({
    isOpen: false,
    fileId: '',
    fileName: ''
  });
  const [renamingFile, setRenamingFile] = useState<{ fileId: string; currentName: string } | null>(null);
  const [renamingFolder, setRenamingFolder] = useState<{ folderId: string; currentName: string } | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderRename, setNewFolderRename] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [draggedFile, setDraggedFile] = useState<string | null>(null);
  const [dragOverFile, setDragOverFile] = useState<string | null>(null);
  const [isFileDropdownOpen, setIsFileDropdownOpen] = useState(false);
  const [preselectedFolder, setPreselectedFolder] = useState<{id: string, name: string, category: 'project' | 'financial'} | null>(null);
  const createButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const handleDeleteClick = (fileId: string, fileName: string) => {
    setDeleteConfirmation({ isOpen: true, fileId, fileName });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.fileId) {
      // Find the file to move to trash
      const file = [...projectFiles, ...financialFiles].find(f => f.id === deleteConfirmation.fileId);
      if (file) {
        moveToTrash(file, 'file');
      }
      setDeleteConfirmation({ isOpen: false, fileId: '', fileName: '' });
    }
  };

  // File rename handlers
  const handleRenameClick = (fileId: string, currentName: string) => {
    // Remove file extension for editing
    const nameWithoutExtension = currentName.replace(/\.[^/.]+$/, "");
    setRenamingFile({ fileId, currentName: nameWithoutExtension });
    setNewFileName(nameWithoutExtension);
  };

  const handleRenameSubmit = () => {
    if (renamingFile && newFileName.trim()) {
      renameFile(renamingFile.fileId, newFileName.trim());
      setRenamingFile(null);
      setNewFileName('');
    }
  };

  const handleRenameCancel = () => {
    setRenamingFile(null);
    setNewFileName('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleRenameCancel();
    }
  };

  // Folder rename handlers
  const handleFolderRenameClick = (folderId: string, currentName: string) => {
    setRenamingFolder({ folderId, currentName });
    setNewFolderRename(currentName);
  };

  const handleFolderRenameSubmit = () => {
    if (renamingFolder && newFolderRename.trim()) {
      renameFolder(renamingFolder.folderId, newFolderRename.trim());
      setRenamingFolder(null);
      setNewFolderRename('');
    }
  };

  const handleFolderRenameCancel = () => {
    setRenamingFolder(null);
    setNewFolderRename('');
  };

  const handleFolderRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFolderRenameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleFolderRenameCancel();
    }
  };



  const handleFolderNameSubmit = async () => {
    if (newFolderName.trim()) {
      setIsCreatingProject(true);
      
      // Create folder in the local editor store
      createFolder(newFolderName.trim(), 'project');
      
      // Also create a project in the Convex database
      try {
        const newProject = await createProject({
          name: newFolderName.trim(),
          status: 'active',
          // You can add userId here if you have user context
          // userId: currentUser?.id,
        });
        
        console.log('Project created in database:', newProject);
      } catch (error) {
        console.error('Failed to create project in database:', error);
        // The folder was still created locally, so we don't prevent that
        // But you could show an error toast here if desired
      } finally {
        setIsCreatingProject(false);
      }
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

  const handleDragStart = useCallback((e: React.DragEvent, folderId: string) => {
    setDraggedItem(folderId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', folderId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Only update drag over item if it's different from the current one
    if (draggedItem && draggedItem !== folderId && dragOverItem !== folderId) {
      setDragOverItem(folderId);
    }
  }, [draggedItem, dragOverItem]);

  const handleDragLeave = useCallback(() => {
    setDragOverItem(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    
    // Perform the actual reordering on drop
    if (draggedItem && draggedItem !== folderId) {
      const draggedIndex = projectFolders.findIndex(folder => folder.id === draggedItem);
      const dropIndex = projectFolders.findIndex(folder => folder.id === folderId);
      
      if (draggedIndex !== -1 && dropIndex !== -1 && draggedIndex !== dropIndex) {
        reorderProjectFolders(draggedIndex, dropIndex);
      }
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  }, [draggedItem, projectFolders, reorderProjectFolders]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverItem(null);
  }, []);

  // File drag handlers
  const handleFileDragStart = useCallback((e: React.DragEvent, fileId: string, folderId: string) => {
    setDraggedFile(fileId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', fileId);
    e.dataTransfer.setData('folderId', folderId);
  }, []);

  const handleFileDragOver = useCallback((e: React.DragEvent, fileId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedFile && draggedFile !== fileId && dragOverFile !== fileId) {
      setDragOverFile(fileId);
    }
  }, [draggedFile, dragOverFile]);

  const handleFileDragLeave = useCallback(() => {
    setDragOverFile(null);
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent, dropFileId: string, folderId: string) => {
    e.preventDefault();
    
    if (draggedFile && draggedFile !== dropFileId) {
      // Get files in the same folder
      const folderFiles = projectFiles.filter(file => file.folderId === folderId);
      const draggedIndex = folderFiles.findIndex(file => file.id === draggedFile);
      const dropIndex = folderFiles.findIndex(file => file.id === dropFileId);
      
      if (draggedIndex !== -1 && dropIndex !== -1 && draggedIndex !== dropIndex) {
        reorderFilesInFolder(folderId, draggedIndex, dropIndex, 'project');
      }
    }
    
    setDraggedFile(null);
    setDragOverFile(null);
  }, [draggedFile, projectFiles, reorderFilesInFolder]);

  const handleFileDragEnd = useCallback(() => {
    setDraggedFile(null);
    setDragOverFile(null);
  }, []);

  const handleCreateFileInFolder = (folderId: string, folderName: string, category: 'project' | 'financial') => {
    setPreselectedFolder({ id: folderId, name: folderName, category });
    setIsFileDropdownOpen(true);
  };

  const handleCloseDropdown = () => {
    setIsFileDropdownOpen(false);
    setPreselectedFolder(null);
  };

  // Create dynamic file structure using store data
  const fileStructure = useMemo(() => {
    // Separate pinned and regular folders
    const pinnedFolders = projectFolders.filter(folder => folder.pinned);
    const regularFolders = projectFolders.filter(folder => !folder.pinned);
    
    const sections = [];
    
    // Add System section with pinned folders
    if (showProjectsCategory && pinnedFolders.length > 0) {
      sections.push({
        id: 'system-header',
        name: 'System',
        type: 'header' as const,
        isHeader: true,
      });
      
      sections.push(...pinnedFolders.map(folder => ({
        id: folder.id,
        name: folder.name,
        icon: Folder,
        type: 'folder' as const,
        isFolder: true,
        isPinned: true,
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
      })));
    }
    
    // Add Projects section with regular folders
    if (showProjectsCategory && regularFolders.length > 0) {
      sections.push({
        id: 'projects-header',
        name: 'Projects',
        type: 'header' as const,
        isHeader: true,
      });
      
      sections.push(...regularFolders.map(folder => ({
        id: folder.id,
        name: folder.name,
        icon: Folder,
        type: 'folder' as const,
        isFolder: true,
        isPinned: false,
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
      })));
    }
    
    // Add loose project files
    if (showProjectsCategory) {
      const looseFiles = projectFiles.filter(file => !file.folderId);
      if (looseFiles.length > 0) {
        sections.push(...looseFiles.map(file => ({
          id: file.id,
          name: file.name,
          icon: file.icon,
          type: file.type,
          file: file, // Store the full file object for opening
        })));
      }
    }
    
    // Add Financial section if it exists
    if (showFinancialCategory) {
      sections.push({
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
      });
    }
    
    return sections;
  }, [showProjectsCategory, showFinancialCategory, projectFolders, projectFiles, financialFiles]);

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
      case 'social-connect':
        return (
          <div className="p-4">
            <button
              onClick={() => openSpecialTab('social-connectors', 'Social Media Connectors', 'social-connect')}
              className="w-full text-left bg-[#2d2d2d] hover:bg-[#3d3d3d] p-3 rounded mb-2 text-sm"
            >
              🔗 Open Social Media Connectors
            </button>
            <p className="text-xs text-[#858585]">Connect your social media accounts</p>
          </div>
        );
      case 'post-creator':
        return (
          <div className="p-4">
            <button
              onClick={() => openSpecialTab('post-creator', 'Social Media Post Creator', 'post-creator')}
              className="w-full text-left bg-[#2d2d2d] hover:bg-[#3d3d3d] p-3 rounded mb-2 text-sm"
            >
              ✏️ Open Post Creator
            </button>
            <p className="text-xs text-[#858585]">Create posts for your connected platforms</p>
          </div>
        );
      case 'trash':
        return <DashTrash />;
      default:
        return (
          <div className="p-2">
            <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
              <span>EAC Explorer</span>
              <div className="flex items-center gap-1">
                <button
                  ref={createButtonRef}
                  onClick={() => {
                    setIsCreatingFolder(true);
                  }}
                  className="hover:bg-[#2d2d2d] p-0.5 rounded transition-colors"
                  aria-label="Create new project"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={collapseAllSections}
                  className="hover:bg-[#2d2d2d] p-0.5 rounded transition-colors border border-[#454545]"
                  aria-label="Collapse all folders"
                >
                  <ChevronsDown className="w-3 h-3" />
                </button>
                <button
                  onClick={closeAllTabs}
                  className="hover:bg-[#2d2d2d] p-0.5 rounded transition-colors border border-[#454545]"
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
                      if (isCreatingFolder && !isCreatingProject) {
                        handleFolderNameCancel();
                      }
                    }, 100);
                  }}
                  disabled={isCreatingProject}
                  className={`flex-1 bg-transparent border-none outline-none text-xs text-[#cccccc] placeholder-[#858585] ${
                    isCreatingProject ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder={isCreatingProject ? "Creating project..." : "Project name..."}
                  title="Enter project name"
                  aria-label="Enter project name"
                  autoFocus
                />
              </div>
            )}
            
            <div className="pt-2">
              {fileStructure.map((section, sectionIndex) => {
              // Check if this is a header section
              const isHeader = 'isHeader' in section && section.isHeader;
              
              // Create unique key that combines section ID with index to prevent duplicates
              const uniqueKey = `${section.id}-${sectionIndex}`;
              
              // Render header sections differently
              if (isHeader) {
                return (
                  <div key={uniqueKey} className="mb-2 mt-4 first:mt-0">
                    <div className="text-[10px] uppercase text-[#858585] px-2 py-1 font-medium tracking-wide">
                      {section.name}
                    </div>
                  </div>
                );
              }
              
              const isOpen = openSections.has(section.id);
              const isFolder = 'isFolder' in section && section.isFolder;
              const isDraggedOver = dragOverItem === section.id;
              const isBeingDragged = draggedItem === section.id;
              const isCurrentlyRenamingFolder = renamingFolder?.folderId === section.id;
              
              // Check if this is a user-created folder (not main categories)
              const isUserFolder = isFolder && section.id !== 'projects' && section.id !== 'financial';
              const isPinnedFolder = 'isPinned' in section && section.isPinned;
              const isDraggableFolder = isUserFolder && !isPinnedFolder;
              
              const sectionContent = (
                <div
                  className={`flex items-center w-full hover:bg-[#2d2d2d] px-1 py-0.5 rounded group transition-all duration-150 ${
                    isDraggedOver ? 'bg-[#3a3a3a] border-l-2 border-[#007acc] shadow-lg transform scale-105' : ''
                  } ${isBeingDragged ? 'opacity-30 scale-95' : ''} ${isDraggableFolder ? 'cursor-move' : ''}`}
                  draggable={isDraggableFolder}
                  onDragStart={isDraggableFolder ? (e) => handleDragStart(e, section.id) : undefined}
                  onDragOver={isDraggableFolder ? (e) => handleDragOver(e, section.id) : undefined}
                  onDragLeave={isDraggableFolder ? handleDragLeave : undefined}
                  onDrop={isDraggableFolder ? (e) => handleDrop(e, section.id) : undefined}
                  onDragEnd={isDraggableFolder ? handleDragEnd : undefined}
                >
                  <div
                    onClick={() => !isCurrentlyRenamingFolder && toggleSection(section.id)}
                    className={`flex items-center flex-1 text-left cursor-pointer`}
                  >
                    {isOpen ? (
                      <ChevronDown className="w-3 h-3 mr-1 text-[#858585] cursor-pointer" />
                    ) : (
                      <ChevronRight className="w-3 h-3 mr-1 text-[#858585] cursor-pointer" />
                    )}
                    {section.icon && typeof section.icon === 'function' ? (
                      <section.icon className="w-4 h-4 mr-1 text-[#c09553]" />
                    ) : (
                      <Folder className="w-4 h-4 mr-1 text-[#c09553]" />
                    )}
                    {isCurrentlyRenamingFolder ? (
                      <input
                        type="text"
                        value={newFolderRename}
                        onChange={(e) => setNewFolderRename(e.target.value)}
                        onKeyDown={handleFolderRenameKeyDown}
                        onBlur={() => {
                          setTimeout(() => {
                            if (renamingFolder) {
                              handleFolderRenameCancel();
                            }
                          }, 100);
                        }}
                        className="flex-1 bg-transparent border border-[#454545] outline-none text-xs text-[#cccccc] placeholder-[#858585] px-1 py-0.5 rounded"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Folder name..."
                        title="Enter folder name"
                        aria-label="Enter folder name"
                      />
                    ) : (
                      <div className="flex items-center">
                        <span className="text-xs text-[#cccccc]">{section.name}</span>
                        {isPinnedFolder && (
                          <div title="Pinned folder">
                            <Pin className="w-3 h-3 ml-1 text-[#007acc]" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {(section.id === 'projects' || section.id === 'financial' || 'isFolder' in section) && !isCurrentlyRenamingFolder && (
                    <div className="opacity-0 group-hover:opacity-100 ml-auto flex items-center">
                      {isUserFolder && (
                        <div 
                          className="p-0.5 hover:bg-[#3d3d3d] rounded transition-opacity cursor-grab active:cursor-grabbing mr-1"
                          aria-label={`Drag to reorder ${section.name}`}
                        >
                          <GripVertical className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                        </div>
                      )}
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
                      {!isPinnedFolder && (
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
                              // Move user folder to trash (only if not pinned)
                              const folder = [...projectFolders].find(f => f.id === section.id);
                              if (folder && !folder.pinned) {
                                moveToTrash(folder, 'folder');
                              }
                            }
                          }}
                          className="p-0.5 hover:bg-[#3d3d3d] rounded transition-opacity"
                          aria-label={`Delete ${section.name}`}
                        >
                          <X className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
              
              return (
                <div key={uniqueKey} className="mb-1">
                  {isUserFolder ? (
                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        {sectionContent}
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-48 bg-[#252526] border border-[#454545]">
                        <ContextMenuItem
                          onClick={() => handleFolderRenameClick(section.id, section.name)}
                          className="text-xs text-[#cccccc] hover:bg-[#2a2d2e] flex items-center gap-2 px-2 py-1.5"
                        >
                          <Edit3 className="w-3 h-3" />
                          Rename
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ) : (
                    sectionContent
                  )}
                  
                  {isOpen && 'children' in section && section.children && (
                    <div className="ml-4 space-y-0.5 mt-1">
                      {section.children.map((file, index) => {
                        const FileIconComponent = getFileIconComponent(file.type);
                        const isProjectFile = 'file' in file && file.file;
                        const isCurrentlyRenaming = renamingFile?.fileId === ('id' in file ? file.id : '');
                        const fileId = 'id' in file ? file.id : '';
                        const isDraggedFile = draggedFile === fileId;
                        const isDraggedOverFile = dragOverFile === fileId;
                        
                        return (
                          <ContextMenu key={'id' in file ? file.id : `${section.id}-${index}`}>
                            <ContextMenuTrigger asChild>
                              <div
                                className={`group flex items-center hover:bg-[#2d2d2d] px-1 py-0.5 rounded cursor-pointer transition-all duration-150 ${
                                  isDraggedOverFile ? 'bg-[#3a3a3a] border-l-2 border-[#007acc] shadow-lg transform scale-105' : ''
                                } ${isDraggedFile ? 'opacity-30 scale-95' : ''} ${isProjectFile && !isCurrentlyRenaming ? 'cursor-move' : ''}`}
                                draggable={isProjectFile && !isCurrentlyRenaming}
                                onDragStart={isProjectFile && !isCurrentlyRenaming ? (e) => handleFileDragStart(e, fileId, section.id) : undefined}
                                onDragOver={isProjectFile && !isCurrentlyRenaming ? (e) => handleFileDragOver(e, fileId) : undefined}
                                onDragLeave={isProjectFile && !isCurrentlyRenaming ? handleFileDragLeave : undefined}
                                onDrop={isProjectFile && !isCurrentlyRenaming ? (e) => handleFileDrop(e, fileId, section.id) : undefined}
                                onDragEnd={isProjectFile && !isCurrentlyRenaming ? handleFileDragEnd : undefined}
                              >
                                <div
                                  className="flex items-center flex-1"
                                  onClick={() => {
                                    if (isProjectFile && file.file && !isCurrentlyRenaming) {
                                      openTab(file.file);
                                    }
                                  }}
                                >
                                  <FileIconComponent className="w-3 h-3 mr-2 text-[#c09553]" />
                                  {isCurrentlyRenaming ? (
                                    <input
                                      type="text"
                                      value={newFileName}
                                      onChange={(e) => setNewFileName(e.target.value)}
                                      onKeyDown={handleRenameKeyDown}
                                      onBlur={() => {
                                        setTimeout(() => {
                                          if (renamingFile) {
                                            handleRenameCancel();
                                          }
                                        }, 100);
                                      }}
                                      className="flex-1 bg-transparent border border-[#454545] outline-none text-xs text-[#cccccc] placeholder-[#858585] px-1 py-0.5 rounded"
                                      autoFocus
                                      onClick={(e) => e.stopPropagation()}
                                      placeholder="File name..."
                                      title="Enter file name"
                                      aria-label="Enter file name"
                                    />
                                  ) : (
                                    <span className="text-xs text-[#cccccc]">{file.name}</span>
                                  )}
                                </div>
                                {isProjectFile && file.file && !isCurrentlyRenaming && (
                                  <div className="opacity-0 group-hover:opacity-100 ml-auto flex items-center">
                                    <div 
                                      className="p-0.5 hover:bg-[#3d3d3d] rounded transition-opacity cursor-grab active:cursor-grabbing mr-1"
                                      aria-label={`Drag to reorder ${file.name}`}
                                    >
                                      <GripVertical className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(file.file.id, file.name);
                                      }}
                                      className="px-1 hover:bg-[#3d3d3d] rounded transition-opacity"
                                      aria-label={`Delete ${file.name}`}
                                    >
                                      <X className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </ContextMenuTrigger>
                            {isProjectFile && file.file && (
                              <ContextMenuContent>
                                <ContextMenuItem
                                  onClick={() => handleRenameClick(file.file.id, file.name)}
                                  className="flex items-center gap-2"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  Rename
                                </ContextMenuItem>
                              </ContextMenuContent>
                            )}
                          </ContextMenu>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Handle top-level files (files without folders) */}
                  {'file' in section && (
                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <div
                          className={`group flex items-center hover:bg-[#2d2d2d] px-1 py-0.5 rounded ml-4 transition-all duration-150 ${
                            draggedFile === section.file.id ? 'opacity-30 scale-95' : ''
                          } ${dragOverFile === section.file.id ? 'bg-[#3a3a3a] border-l-2 border-[#007acc] shadow-lg transform scale-105' : ''} ${
                            renamingFile?.fileId !== section.file.id ? 'cursor-move' : ''
                          }`}
                          draggable={renamingFile?.fileId !== section.file.id}
                          onDragStart={renamingFile?.fileId !== section.file.id ? (e) => handleFileDragStart(e, section.file.id, '') : undefined}
                          onDragOver={renamingFile?.fileId !== section.file.id ? (e) => handleFileDragOver(e, section.file.id) : undefined}
                          onDragLeave={renamingFile?.fileId !== section.file.id ? handleFileDragLeave : undefined}
                          onDrop={renamingFile?.fileId !== section.file.id ? (e) => handleFileDrop(e, section.file.id, '') : undefined}
                          onDragEnd={renamingFile?.fileId !== section.file.id ? handleFileDragEnd : undefined}
                        >
                          <div
                            className="flex items-center flex-1"
                            onClick={() => {
                              const isCurrentlyRenaming = renamingFile?.fileId === section.file.id;
                              if (section.file && !isCurrentlyRenaming) {
                                openTab(section.file);
                              }
                            }}
                          >
                            {(() => {
                              const IconComponent = getFileIconComponent(section.type);
                              return <IconComponent className="w-3 h-3 mr-2 text-[#c09553]" />;
                            })()}
                            {renamingFile?.fileId === section.file.id ? (
                              <input
                                type="text"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                onKeyDown={handleRenameKeyDown}
                                onBlur={() => {
                                  setTimeout(() => {
                                    if (renamingFile) {
                                      handleRenameCancel();
                                    }
                                  }, 100);
                                }}
                                className="flex-1 bg-transparent border border-[#454545] outline-none text-xs text-[#cccccc] placeholder-[#858585] px-1 py-0.5 rounded"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                placeholder="File name..."
                                title="Enter file name"
                                aria-label="Enter file name"
                              />
                            ) : (
                              <span className="text-xs text-[#cccccc]">{section.name}</span>
                            )}
                          </div>
                          {renamingFile?.fileId !== section.file.id && (
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
                          )}
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem
                          onClick={() => handleRenameClick(section.file.id, section.name)}
                          className="flex items-center gap-2"
                        >
                          <Edit3 className="w-3 h-3" />
                          Rename
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  )}
                </div>
              );
            })}
            </div>
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