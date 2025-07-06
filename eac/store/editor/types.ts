// Editor Store Types
// /Users/matthewsimon/Projects/EAC/eac/store/editor/types.ts

import { LucideIcon } from 'lucide-react';

export interface EditorTab {
  id: string;
  name: string;
  modified: boolean;
  content: string;
  filePath: string;
  type: 'typescript' | 'json' | 'excel' | 'pdf' | 'markdown' | 'javascript' | 'generals';
}

export interface ProjectFolder {
  id: string;
  name: string;
  category: 'project' | 'financial';
  createdAt: Date;
}

export interface ProjectFile {
  id: string;
  name: string;
  icon: LucideIcon;
  type: 'typescript' | 'json' | 'excel' | 'pdf' | 'markdown' | 'javascript' | 'generals';
  category: 'project' | 'financial';
  content: string;
  filePath: string;
  createdAt: Date;
  modifiedAt: Date;
  folderId?: string; // Optional folder reference
}

export interface EditorState {
  // State
  openTabs: EditorTab[];
  activeTab: string;
  projectFiles: ProjectFile[];
  financialFiles: ProjectFile[];
  projectFolders: ProjectFolder[];
  financialFolders: ProjectFolder[];
  showProjectsCategory: boolean;
  showFinancialCategory: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  openTab: (file: ProjectFile) => void;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  updateFileContent: (tabId: string, content: string) => void;
  createNewFile: (name: string, type: ProjectFile['type'], category?: ProjectFile['category'], folderId?: string) => void;
  createFolder: (name: string, category: 'project' | 'financial') => void;
  deleteFile: (fileId: string) => void;
  deleteFolder: (folderId: string) => void;
  clearProjectCategory: () => void;
  clearFinancialCategory: () => void;
  deleteProjectsCategory: () => void;
  deleteFinancialCategory: () => void;
  reorderProjectFolders: (fromIndex: number, toIndex: number) => void;
  saveFile: (tabId: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
} 