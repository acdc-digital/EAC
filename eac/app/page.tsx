// VS Code-Inspired EAC Dashboard
// /Users/matthewsimon/Projects/EAC/eac/app/page.tsx

"use client";

import React, { useState } from "react";
import { DashActivityBar } from "./_components/dashActivityBar";
import { DashSidebar } from "./_components/dashSidebar";
import { DashEditor } from "./_components/dashEditor";
import { 
  GitBranch, 
  AlertCircle, 
  Cpu, 
  Wifi 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSidebarStore, useEditorStore } from "@/store";
import { ProjectFile } from "@/store/editor/types";

export default function DashboardPage() {
  const { activePanel, setActivePanel } = useSidebarStore();
  const { createNewFile, projectFolders, financialFolders } = useEditorStore();
  
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<ProjectFile['type']>('typescript');
  const [newFileCategory, setNewFileCategory] = useState<ProjectFile['category']>('project');
  const [newFileFolderId, setNewFileFolderId] = useState<string>('no-folder');
  const [preselectedFolder, setPreselectedFolder] = useState<{id: string, name: string, category: 'project' | 'financial'} | null>(null);

  const handleCreateFileInFolder = (folderId: string, folderName: string, category: 'project' | 'financial') => {
    setPreselectedFolder({ id: folderId, name: folderName, category });
    setNewFileCategory(category);
    setNewFileFolderId(folderId || 'no-folder');
    setIsFileDialogOpen(true);
  };

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      createNewFile(newFileName.trim(), newFileType, newFileCategory, newFileFolderId === 'no-folder' ? undefined : newFileFolderId);
      setNewFileName('');
      setNewFileType('typescript');
      setNewFileCategory('project');
      setNewFileFolderId('no-folder');
      setPreselectedFolder(null);
      setIsFileDialogOpen(false);
    }
  };

  const handleCloseDialog = () => {
    setIsFileDialogOpen(false);
    setNewFileName('');
    setNewFileType('typescript');
    setNewFileCategory('project');
    setNewFileFolderId('no-folder');
    setPreselectedFolder(null);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0e0e0e] text-[#cccccc] font-mono text-sm overflow-hidden">
      {/* Title Bar - 32px */}
      <header className="h-8 bg-[#181818] border-b border-[#2d2d2d] flex items-center px-6 select-none">
        {/* Title */}
        <div className="flex-1 flex justify-start ml-6">
          <span className="text-xs text-[#858585]">
            EAC Financial Dashboard - Visual Studio Code
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <DashActivityBar 
          activePanel={activePanel} 
          onPanelChange={setActivePanel} 
        />

        {/* Sidebar */}
        <DashSidebar activePanel={activePanel} onCreateFileInFolder={handleCreateFileInFolder} />

        {/* Editor Area */}
        <DashEditor onCreateFile={() => setIsFileDialogOpen(true)} />
      </div>

      {/* Status Bar - 22px */}
      <footer className="h-[22px] bg-[#2d2d2d] text-[#cccccc] text-xs flex items-center px-2 justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <GitBranch className="w-3 h-3" />
            <span>main</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>0</span>
          </div>
          <span>EAC Dashboard v1.0.0</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>TypeScript React</span>
          <div className="flex items-center space-x-1">
            <Cpu className="w-3 h-3" />
            <span>85%</span>
          </div>
          <div className="flex items-center space-x-1">
            <Wifi className="w-3 h-3" />
            <span>Connected</span>
          </div>
          <span>UTF-8</span>
          <span>CRLF</span>
          <span>Ln 24, Col 16</span>
        </div>
      </footer>

      {/* File Creation Dialog */}
      <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {preselectedFolder ? `Create New File in ${preselectedFolder.name}` : 'Create New File'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filename" className="text-right">
                Name
              </Label>
              <Input
                id="filename"
                value={newFileName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFileName(e.target.value)}
                placeholder="Enter file name"
                className="col-span-3"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    handleCreateFile();
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filetype" className="text-right">
                Type
              </Label>
              <Select value={newFileType} onValueChange={(value: string) => setNewFileType(value as ProjectFile['type'])}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="typescript">TypeScript (.tsx)</SelectItem>
                  <SelectItem value="javascript">JavaScript (.js)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                  <SelectItem value="markdown">Markdown (.md)</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                  <SelectItem value="generals">Project Generals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select value={newFileCategory} onValueChange={(value: string) => {
                setNewFileCategory(value as ProjectFile['category']);
                setNewFileFolderId('no-folder');
              }}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">EAC Projects</SelectItem>
                  <SelectItem value="financial">Financial Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder" className="text-right">
                Folder
              </Label>
              <Select value={newFileFolderId} onValueChange={(value: string) => setNewFileFolderId(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select folder (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-folder">No folder</SelectItem>
                  {newFileCategory === 'project' && projectFolders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                  {newFileCategory === 'financial' && financialFolders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleCreateFile} disabled={!newFileName.trim()}>
              Create File
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
