// File Creation Dropdown Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/fileCreationDropdown.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";

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