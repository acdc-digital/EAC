// Editor Store Types
// /Users/matthewsimon/Projects/EAC/eac/store/editor/types.ts

import { LucideIcon } from 'lucide-react';

export interface EditorTab {
  id: string;
  name: string;
  modified: boolean;
  content: string;
  filePath: string;
  type: 'typescript' | 'json' | 'excel' | 'pdf' | 'markdown' | 'javascript' | 'generals' | 'percent-complete' | 'schedule' | 'materials' | 'social-connect' | 'post-creator' | 'calendar' | 'facebook' | 'reddit' | 'instagram' | 'x' | 'user-profile' | 'sign-in' | 'platform-instructions' | 'logo-generator' | 'subscription';
  pinned?: boolean;
  pinnedOrder?: number; // Order among pinned tabs (lower numbers appear first)
}

export interface ProjectFolder {
  id: string;
  name: string;
  category: 'project' | 'financial';
  createdAt: Date;
  pinned?: boolean;
  convexId?: string; // Database project ID for syncing with Convex
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
  icon: LucideIcon | string; // Updated to allow string for custom Reddit "r/" display
  type: 'typescript' | 'json' | 'excel' | 'pdf' | 'markdown' | 'javascript' | 'generals' | 'percent-complete' | 'schedule' | 'materials' | 'social-connect' | 'post-creator' | 'calendar' | 'facebook' | 'reddit' | 'instagram' | 'x' | 'user-profile' | 'sign-in' | 'platform-instructions';
  category: 'project' | 'financial';
  content: string;
  filePath: string;
  createdAt: Date;
  modifiedAt: Date;
  folderId?: string; // Optional folder reference
  status?: 'draft' | 'scheduled' | 'posting' | 'posted' | 'failed' | 'complete'; // Post status for social media files
  convexId?: string; // Database file ID for syncing with Convex
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
  openSpecialTab: (id: string, name: string, type: 'social-connect' | 'post-creator' | 'calendar' | 'user-profile' | 'sign-in' | 'platform-instructions' | 'logo-generator' | 'subscription') => void;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  setActiveTab: (tabId: string) => void;
  reorderTabs: (fromTabId: string, toTabId: string) => void;
  pinTab: (tabId: string) => void;
  unpinTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  updateFileContent: (tabId: string, content: string) => void;
  updateFileContentInStore: (fileId: string, content: string) => void;
  updateFileStatus: (fileId: string, status: 'draft' | 'scheduled' | 'posting' | 'posted' | 'failed' | 'complete') => void;
  updateFileConvexId: (fileId: string, convexId: string) => void;
  updateFolderConvexId: (folderId: string, convexId: string) => void;
  createNewFile: (name: string, type: ProjectFile['type'], category?: ProjectFile['category'], folderId?: string, customContent?: string, skipSync?: boolean) => string;
  createFolder: (name: string, category: 'project' | 'financial', convexId?: string) => void;
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
  updateProjectFolders: (folders: ProjectFolder[]) => void;
  reorderFilesInFolder: (folderId: string, fromIndex: number, toIndex: number, category: 'project' | 'financial') => void;
  saveFile: (tabId: string) => void;
  setError: (error: string | null) => void;
  repairFilesWithoutContent: () => void;
  cleanupDuplicateFolders: () => void;  // Emergency cleanup function
  debugStorage: () => void; // Debug function to troubleshoot persistence issues
  clearStorage: () => void; // Emergency function to clear all storage and reset
  reset: () => void;
  clearUserData: () => void; // Clear user data when signing out
} 