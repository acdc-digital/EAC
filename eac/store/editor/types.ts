// Editor Store Types
// /Users/matthewsimon/Projects/EAC/eac/store/editor/types.ts

import { LucideIcon } from 'lucide-react';

export interface EditorTab {
  id: string;
  name: string;
  modified: boolean;
  content: string;
  filePath: string;
  type: 'typescript' | 'json' | 'excel' | 'pdf' | 'markdown' | 'javascript' | 'generals' | 'percent-complete' | 'schedule' | 'materials' | 'social-connect' | 'post-creator' | 'facebook' | 'reddit' | 'instagram' | 'x';
}

export interface ProjectFolder {
  id: string;
  name: string;
  category: 'project' | 'financial';
  createdAt: Date;
}

export interface TrashItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  originalData: ProjectFile | ProjectFolder;
  deletedAt: Date;
  category: 'project' | 'financial';
}

export interface ProjectFile {
  id: string;
  name: string;
  icon: LucideIcon;
  type: 'typescript' | 'json' | 'excel' | 'pdf' | 'markdown' | 'javascript' | 'generals' | 'percent-complete' | 'schedule' | 'materials' | 'social-connect' | 'post-creator' | 'facebook' | 'reddit' | 'instagram' | 'x';
  category: 'project' | 'financial';
  content: string;
  filePath: string;
  createdAt: Date;
  modifiedAt: Date;
  folderId?: string; // Optional folder reference
  status?: 'draft' | 'scheduled' | 'complete'; // Post status for social media files
}

export interface EditorState {
  // State
  openTabs: EditorTab[];
  activeTab: string;
  projectFiles: ProjectFile[];
  financialFiles: ProjectFile[];
  projectFolders: ProjectFolder[];
  financialFolders: ProjectFolder[];
  trashItems: TrashItem[];
  showProjectsCategory: boolean;
  showFinancialCategory: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  openTab: (file: ProjectFile) => void;
  openSpecialTab: (id: string, name: string, type: 'social-connect' | 'post-creator') => void;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  updateFileContent: (tabId: string, content: string) => void;
  updateFileStatus: (fileId: string, status: 'draft' | 'scheduled' | 'complete') => void;
  createNewFile: (name: string, type: ProjectFile['type'], category?: ProjectFile['category'], folderId?: string) => void;
  createFolder: (name: string, category: 'project' | 'financial') => void;
  deleteFile: (fileId: string) => void;
  renameFile: (fileId: string, newName: string) => void;
  deleteFolder: (folderId: string) => void;
  renameFolder: (folderId: string, newName: string) => void;
  moveToTrash: (item: ProjectFile | ProjectFolder, type: 'file' | 'folder') => void;
  restoreFromTrash: (trashItemId: string) => void;
  permanentlyDelete: (trashItemId: string) => void;
  emptyTrash: () => void;
  clearProjectCategory: () => void;
  clearFinancialCategory: () => void;
  deleteProjectsCategory: () => void;
  deleteFinancialCategory: () => void;
  reorderProjectFolders: (fromIndex: number, toIndex: number) => void;
  reorderFilesInFolder: (folderId: string, fromIndex: number, toIndex: number, category: 'project' | 'financial') => void;
  saveFile: (tabId: string) => void;
  setError: (error: string | null) => void;
  cleanupDuplicateFolders: () => void;  // Emergency cleanup function
  reset: () => void;
} 