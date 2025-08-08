// File Creation Dropdown Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/fileCreationDropdown.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";

import { Id } from "@/convex/_generated/dataModel";
import { useFiles } from "@/lib/hooks/useFiles";
import { useEditorStore } from "@/store";
import { ProjectFile } from "@/store/editor/types";

interface FileCreationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedFolder?: {id: string, name: string, category: 'project' | 'financial'} | null;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export function FileCreationDropdown({ isOpen, onClose, preselectedFolder, buttonRef }: FileCreationDropdownProps) {
  const { createNewFile, projectFolders, updateFileConvexId } = useEditorStore();
  const { createFile } = useFiles(null); // We'll get the project ID from the selected folder
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<ProjectFile['type']>('markdown');
  const [newFileFolderId, setNewFileFolderId] = useState<string>('no-folder');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set preselected folder when component opens
  useEffect(() => {
    if (preselectedFolder) {
      setNewFileFolderId(preselectedFolder.id || 'no-folder');
    }
  }, [preselectedFolder]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  const handleCreateFile = async () => {
    if (newFileName.trim()) {
          
          try {
            // First create the file locally
            const localFileId = createNewFile(newFileName.trim(), newFileType, 'project', newFileFolderId === 'no-folder' ? undefined : newFileFolderId);

            // If we have a folder with a convexId, also create the file in Convex
            const selectedFolder = projectFolders.find(f => f.id === newFileFolderId);
            if (selectedFolder?.convexId) {
              try {
                const convexFile = await createFile({
                  name: newFileName.trim(),
                  type: getConvexFileType(newFileType),
                  projectId: selectedFolder.convexId as Id<"projects">,
                  content: getDefaultContentForType(newFileType),
                  extension: getFileExtension(newFileType),
                  platform: getPlatformForFileType(newFileType),
                  size: 0,
                });
                
                console.log(`✅ File "${newFileName.trim()}" created in database:`, convexFile);
                
                // Update the local file with the convex ID to link them
                if (localFileId && convexFile?._id) {
                  updateFileConvexId(localFileId, convexFile._id);
                  console.log(`🔗 Linked local file ${localFileId} with Convex ID ${convexFile._id}`);
                }
                
              } catch (error) {
                console.error(`❌ Error creating file "${newFileName.trim()}" in database:`, error);
              }
            } else {
              console.log(`📁 File "${newFileName.trim()}" created locally only (no project Convex ID)`);
            }
        
      } catch (error) {
        console.error('Error creating file:', error);
      }
      
      // Reset form
      setNewFileName('');
      setNewFileType('markdown');
      setNewFileFolderId('no-folder');
      onClose();
    }
  };

  // Helper function to map editor file types to Convex file types
  const getConvexFileType = (editorType: ProjectFile['type']): "post" | "campaign" | "note" | "document" | "image" | "video" | "other" => {
    switch (editorType) {
      case 'facebook':
      case 'reddit':
      case 'instagram':
      case 'x':
        return 'post';
      case 'markdown':
        return 'note';
      case 'excel':
      case 'pdf':
        return 'document';
      case 'typescript':
      case 'javascript':
      case 'json':
        return 'other';
      default:
        return 'other';
    }
  };

  // Helper function to map editor file types to platform names
  const getPlatformForFileType = (editorType: ProjectFile['type']): "facebook" | "instagram" | "twitter" | "linkedin" | "reddit" | "youtube" | undefined => {
    switch (editorType) {
      case 'facebook':
        return 'facebook';
      case 'instagram':
        return 'instagram';
      case 'x':
        return 'twitter';
      case 'reddit':
        return 'reddit';
      default:
        return undefined;
    }
  };

  // Helper function to get default content
  const getDefaultContentForType = (type: ProjectFile['type']): string => {
    switch (type) {
      case 'markdown':
        return '# New Document\n\nStart writing here...';
      case 'reddit':
        return '# Reddit Post\n\n**Title:** \n\n**Subreddit:** \n\n**Content:**\n\n';
      case 'facebook':
        return '# Facebook Post\n\n**Content:**\n\n';
      default:
        return '';
    }
  };

  // Helper function to get file extension
  const getFileExtension = (type: ProjectFile['type']): string => {
    switch (type) {
      case 'typescript': return '.ts';
      case 'javascript': return '.js';
      case 'json': return '.json';
      case 'excel': return '.xlsx';
      case 'pdf': return '.pdf';
      case 'markdown': return '.md';
      case 'reddit': return '.reddit';
      case 'facebook': return '.facebook';
      case 'instagram': return '.instagram';
      case 'x': return '.x';
      default: return '.txt';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateFile();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  // Calculate position based on button
  const getDropdownPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0 };
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    return {
      top: buttonRect.bottom + 2, // 2px gap below button
      left: buttonRect.left - 140, // Center the 280px dropdown on the button
    };
  };

  const position = getDropdownPosition();

  return (
    <div 
      ref={dropdownRef}
      className="fixed w-70 bg-[#2d2d2d] border border-[#454545] shadow-lg z-[9999] p-3"
      style={{
        top: position.top,
        left: Math.max(8, position.left), // Ensure it doesn't go off-screen left
        width: '280px',
      }}
    >
      <div className="space-y-2">
        {/* Header */}
        <div className="text-xs font-medium text-[#cccccc] border-b border-[#454545] pb-1">
          {preselectedFolder ? `Create File in ${preselectedFolder.name}` : 'Create New File'}
        </div>

        {/* File Name Input */}
        <div className="space-y-1">
          <label className="text-xs text-[#858585]">Name</label>
          <input
            ref={inputRef}
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="Enter file name"
            className="h-6 w-full text-xs bg-[#1e1e1e] border border-[#454545] text-[#cccccc] px-2 py-1 focus:outline-none focus:border-[#007acc]"
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* File Type Select */}
        <div className="space-y-1">
          <label className="text-xs text-[#858585]">Type</label>
          <select 
            value={newFileType} 
            onChange={(e) => setNewFileType(e.target.value as ProjectFile['type'])}
            className="h-6 w-full text-xs bg-[#1e1e1e] border border-[#454545] text-[#cccccc] px-2 py-1 hover:bg-[#2d2d2d] focus:outline-none focus:border-[#007acc]"
            aria-label="Select file type"
          >
            <option value="markdown" className="bg-[#2d2d2d] text-[#cccccc]">Markdown (.md)</option>
            <option value="facebook" className="bg-[#2d2d2d] text-[#cccccc]">Facebook Post (.facebook)</option>
            <option value="reddit" className="bg-[#2d2d2d] text-[#cccccc]">Reddit Post (.reddit)</option>
            <option value="instagram" className="bg-[#2d2d2d] text-[#cccccc]">Instagram Post (.instagram)</option>
            <option value="x" className="bg-[#2d2d2d] text-[#cccccc]">X/Twitter Post (.x)</option>
          </select>
        </div>

        {/* Folder Select */}
        <div className="space-y-1">
          <label className="text-xs text-[#858585]">Folder</label>
          <select 
            value={newFileFolderId} 
            onChange={(e) => setNewFileFolderId(e.target.value)}
            className="h-6 w-full text-xs bg-[#1e1e1e] border border-[#454545] text-[#cccccc] px-2 py-1 hover:bg-[#2d2d2d] focus:outline-none focus:border-[#007acc]"
            aria-label="Select folder"
          >
            <option value="no-folder" className="bg-[#2d2d2d] text-[#cccccc]">No folder</option>
            {projectFolders
              .filter((folder, index, array) => array.findIndex(f => f.id === folder.id) === index) // Remove duplicates
              .map((folder) => (
                <option key={`folder-${folder.id}`} value={folder.id} className="bg-[#2d2d2d] text-[#cccccc]">
                  {folder.name}
                </option>
              ))
            }
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-1 border-t border-[#454545]">
          <button 
            onClick={onClose}
            className="h-6 px-3 text-xs bg-[#3d3d3d] text-[#cccccc] hover:bg-[#4d4d4d] border border-[#454545] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreateFile} 
            disabled={!newFileName.trim()}
            className="h-6 px-3 text-xs bg-[#007acc] text-[#cccccc] hover:bg-[#005a9e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
} 