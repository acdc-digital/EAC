// File Creation Dropdown Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/fileCreationDropdown.tsx

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useEditorStore } from "@/store";
import { ProjectFile } from "@/store/editor/types";

interface FileCreationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedFolder?: {id: string, name: string, category: 'project' | 'financial'} | null;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export function FileCreationDropdown({ isOpen, onClose, preselectedFolder, buttonRef }: FileCreationDropdownProps) {
  const { createNewFile, projectFolders } = useEditorStore();
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

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      createNewFile(newFileName.trim(), newFileType, 'project', newFileFolderId === 'no-folder' ? undefined : newFileFolderId);
      // Reset form
      setNewFileName('');
      setNewFileType('markdown');
      setNewFileFolderId('no-folder');
      onClose();
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
      top: buttonRect.bottom + 4, // 4px gap below button
      left: buttonRect.left - 160, // Center the 320px dropdown on the button
    };
  };

  const position = getDropdownPosition();

  return (
    <div 
      ref={dropdownRef}
      className="fixed w-80 bg-[#2d2d2d] border border-[#454545] rounded-md shadow-lg z-[9999] p-4"
      style={{
        top: position.top,
        left: Math.max(8, position.left), // Ensure it doesn't go off-screen left
      }}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="text-sm font-medium text-[#cccccc] border-b border-[#454545] pb-2">
          {preselectedFolder ? `Create File in ${preselectedFolder.name}` : 'Create New File'}
        </div>

        {/* File Name Input */}
        <div className="space-y-1">
          <label className="text-xs text-[#858585]">Name</label>
          <Input
            ref={inputRef}
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="Enter file name"
            className="h-8 text-sm bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* File Type Select */}
        <div className="space-y-1">
          <label className="text-xs text-[#858585]">Type</label>
          <select 
            value={newFileType} 
            onChange={(e) => setNewFileType(e.target.value as ProjectFile['type'])}
            className="h-8 w-full text-sm bg-[#1e1e1e] border border-[#454545] text-[#cccccc] rounded-md px-3 py-1 hover:bg-[#2d2d2d] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
            aria-label="Select file type"
          >
            <option value="markdown" className="bg-[#2d2d2d] text-[#cccccc]">Markdown (.md)</option>
            <option value="generals" className="bg-[#2d2d2d] text-[#cccccc]">Project Generals</option>
          </select>
        </div>

        {/* Folder Select */}
        <div className="space-y-1">
          <label className="text-xs text-[#858585]">Folder</label>
          <select 
            value={newFileFolderId} 
            onChange={(e) => setNewFileFolderId(e.target.value)}
            className="h-8 w-full text-sm bg-[#1e1e1e] border border-[#454545] text-[#cccccc] rounded-md px-3 py-1 hover:bg-[#2d2d2d] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
            aria-label="Select folder"
          >
            <option value="no-folder" className="bg-[#2d2d2d] text-[#cccccc]">No folder</option>
            {projectFolders.map((folder) => (
              <option key={folder.id} value={folder.id} className="bg-[#2d2d2d] text-[#cccccc]">
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#454545]">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose}
            className="h-7 text-xs"
          >
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleCreateFile} 
            disabled={!newFileName.trim()}
            className="h-7 text-xs"
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
} 