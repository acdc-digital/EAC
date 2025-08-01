// Editor Store
// /Users/matthewsimon/Projects/EAC/eac/store/editor/index.ts

import { AtSign, Braces, Calendar, Camera, FileCode, FileSpreadsheet, FileText, FileType, MessageSquare } from 'lucide-react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { EditorState, EditorTab, ProjectFile, ProjectFolder, TrashItem } from './types';

// Helper function to get icon based on file type
const getFileIcon = (type: ProjectFile['type']) => {
  switch (type) {
    case 'typescript':
      return FileCode;
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
      return FileText;
    case 'percent-complete':
      return FileSpreadsheet;
    case 'schedule':
      return FileSpreadsheet;
    case 'materials':
      return FileSpreadsheet;
    case 'facebook':
      return MessageSquare;
    case 'reddit':
      return 'r/'; // Changed from Hash to r/ text
    case 'instagram':
      return Camera;
    case 'x':
      return AtSign;
    case 'calendar':
      return Calendar;
    default:
      return FileCode;
  }
};

// Helper function to get file extension
// Helper function to get file extension
const getFileExtension = (type: ProjectFile['type']): string => {
  switch (type) {
    case 'typescript':
      return '.ts';
    case 'javascript':
      return '.js';
    case 'json':
      return '.json';
    case 'excel':
      return '.xlsx';
    case 'pdf':
      return '.pdf';
    case 'generals':
      return '.generals';
    case 'percent-complete':
      return '.percent';
    case 'schedule':
      return '.schedule';
    case 'materials':
      return '.materials';
    case 'facebook':
      return '.facebook';
    case 'reddit':
      return '.reddit';
    case 'instagram':
      return '.instagram';
    case 'x':
      return '.x';
    case 'markdown':
      return '.md';
    default:
      return '.txt';
  }
};

// Helper function to generate default content for new files
const getDefaultContent = (type: ProjectFile['type'], name: string) => {
  switch (type) {
    case 'typescript':
      return `// ${name}
// Auto-generated TypeScript file

import React from 'react';

interface ${name.replace(/[^a-zA-Z0-9]/g, '')}Props {
  // Define props here
}

export function ${name.replace(/[^a-zA-Z0-9]/g, '')}({ }: ${name.replace(/[^a-zA-Z0-9]/g, '')}Props) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">New Component: ${name}</h1>
      <p className="text-gray-600">Start building your component here...</p>
    </div>
  );
}`;
    case 'javascript':
      return `// ${name}
// Auto-generated JavaScript file

export function ${name.replace(/[^a-zA-Z0-9]/g, '')}() {
  return {
    message: 'Hello from ${name}!',
    data: []
  };
}`;
    case 'json':
      return `{
  "name": "${name}",
  "description": "Auto-generated JSON file",
  "version": "1.0.0",
  "data": {}
}`;
    case 'markdown':
      return `Start writing your content here...`;
    case 'generals':
      return `// ${name} - Project General Information
// This file contains general project details and financial information
// Created on: ${new Date().toISOString()}

Project: ${name}
Status: Active
Created: ${new Date().toLocaleDateString()}

// This file will display the project generals module interface`;
    case 'percent-complete':
      return `// ${name} - Percent Complete Tracker
// This file contains project completion tracking data
// Created on: ${new Date().toISOString()}

Project: ${name}
Type: Percent Complete Tracker
Created: ${new Date().toLocaleDateString()}

// This file will display the percent complete tracking interface`;
    case 'schedule':
      return `// ${name} - Project Schedule
// This file contains project schedule and timeline data
// Created on: ${new Date().toISOString()}

Project: ${name}
Type: Project Schedule
Created: ${new Date().toLocaleDateString()}

// This file will display the project schedule interface with Gantt chart`;
    case 'materials':
      return `// ${name} - Materials Management
// This file contains materials tracking and management data
// Created on: ${new Date().toISOString()}

Project: ${name}
Type: Materials Management
Created: ${new Date().toLocaleDateString()}

// This file will display the materials management interface with manufactured and miscellaneous materials`;
    case 'facebook':
      return `# ${name} - Facebook Post
Platform: Facebook
Created: ${new Date().toLocaleDateString()}

## Post Content
Write your Facebook post content here...

## Settings
- Audience: Public
- Schedule: Now
- Hashtags: #example

## Media
- Images: []
- Videos: []

## Analytics
- Engagement: 0
- Reach: 0
- Clicks: 0`;
    case 'reddit':
      return `# ${name} - Reddit Post
Platform: Reddit
Created: ${new Date().toLocaleDateString()}

## Post Content
Write your Reddit post content here...

## Settings
- Subreddit: r/example
- Post Type: Text/Link/Image
- Flair: Discussion
- NSFW: No

## Media
- Images: []
- Links: []

## Analytics
- Upvotes: 0
- Comments: 0
- Awards: 0`;
    case 'instagram':
      return `# ${name} - Instagram Post
Platform: Instagram
Created: ${new Date().toLocaleDateString()}

## Post Content
Write your Instagram post content here...

## Settings
- Post Type: Feed/Story/Reel
- Location: City, Country
- Alt Text: Describe image
- Comment Settings: Public

## Media
- Images: []
- Videos: []

## Hashtags
#hashtag1 #hashtag2 #hashtag3

## Analytics
- Likes: 0
- Comments: 0
- Shares: 0
- Reach: 0`;
    case 'x':
      return `# ${name} - X/Twitter Post
Platform: X (Twitter)
Created: ${new Date().toLocaleDateString()}

## Post Content
Write your X post content here... (280 character limit)

## Settings
- Reply Settings: Everyone
- Schedule: Now
- Thread: Single Tweet

## Media
- Images: []
- Videos: []
- GIFs: []

## Analytics
- Impressions: 0
- Engagements: 0
- Retweets: 0
- Likes: 0
- Replies: 0`;
    default:
      return `# ${name}

This is a new file created in the EAC Dashboard.
Created on: ${new Date().toISOString()}`;
  }
};

// Initial project files - empty by default, only created when needed
const initialProjectFiles: ProjectFile[] = [];

// Initial financial files - empty by default, only created when needed  
const initialFinancialFiles: ProjectFile[] = [];

// Initial project folders - only created when explicitly needed, not on storage clear
const initialProjectFolders: ProjectFolder[] = [];

export const useEditorStore = create<EditorState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        openTabs: [],
        activeTab: '',
        projectFiles: initialProjectFiles,
        financialFiles: initialFinancialFiles,
        projectFolders: initialProjectFolders,
        financialFolders: [],
        trashItems: [],
        showProjectsCategory: true,
        showFinancialCategory: false, // Don't show by default - only show when user creates financial content
        isLoading: false,
        error: null,

        // Actions
        openTab: (file: ProjectFile) => {
          const { openTabs } = get();
          
          // Check if tab is already open
          const existingTab = openTabs.find(tab => tab.id === file.id);
          if (existingTab) {
            set({ activeTab: existingTab.id });
            return;
          }

          // Define which file types should be auto-pinned
          // You can add more file types here if needed
          const autoPinFileTypes = ['calendar', 'social-connect', 'user-profile', 'post-creator'];
          const shouldAutoPinn = autoPinFileTypes.includes(file.type);
          
          let pinnedOrder: number | undefined;
          if (shouldAutoPinn) {
            // Get the highest pinned order for auto-pinned tabs
            const pinnedTabs = openTabs.filter(t => t.pinned);
            pinnedOrder = pinnedTabs.length > 0 ? Math.max(...pinnedTabs.map(t => t.pinnedOrder || 0)) + 1 : 1;
          }

          // Create new tab with content
          const newTab: EditorTab = {
            id: file.id,
            name: file.name,
            modified: false,
            content: file.content || getDefaultContent(file.type, file.name),
            filePath: file.filePath,
            type: file.type,
            pinned: shouldAutoPinn,
            pinnedOrder: shouldAutoPinn ? pinnedOrder : undefined,
          };

          let newTabs: EditorTab[];
          if (shouldAutoPinn) {
            // For auto-pinned tabs, insert in correct pinned position
            const otherTabs = [...openTabs];
            const insertIndex = otherTabs.filter(t => t.pinned && (t.pinnedOrder || 0) < (pinnedOrder || 0)).length;
            otherTabs.splice(insertIndex, 0, newTab);
            newTabs = otherTabs;
          } else {
            // For non-auto-pinned tabs, insert after all pinned tabs
            const pinnedTabs = openTabs.filter(tab => tab.pinned);
            const unpinnedTabs = openTabs.filter(tab => !tab.pinned);
            newTabs = [...pinnedTabs, ...unpinnedTabs, newTab];
          }

          set({
            openTabs: newTabs,
            activeTab: newTab.id,
          });
        },

        openSpecialTab: (id: string, name: string, type: 'social-connect' | 'post-creator' | 'calendar' | 'user-profile' | 'sign-in') => {
          const { openTabs } = get();
          
          // Check if tab is already open
          const existingTab = openTabs.find(tab => tab.id === id);
          if (existingTab) {
            set({ activeTab: existingTab.id });
            return;
          }

          // Define which tab types should be auto-pinned
          const autoPinTypes = ['user-profile', 'calendar', 'social-connect', 'post-creator'];
          const shouldAutoPinn = autoPinTypes.includes(type);
          
          let pinnedOrder: number | undefined;
          if (shouldAutoPinn) {
            // Get the highest pinned order for auto-pinned tabs
            const pinnedTabs = openTabs.filter(t => t.pinned);
            pinnedOrder = pinnedTabs.length > 0 ? Math.max(...pinnedTabs.map(t => t.pinnedOrder || 0)) + 1 : 1;
          }

          // Create new special tab
          const newTab: EditorTab = {
            id,
            name,
            modified: false,
            content: '',
            filePath: `/${type}`,
            type,
            pinned: shouldAutoPinn,
            pinnedOrder: shouldAutoPinn ? pinnedOrder : undefined,
          };

          let newTabs: EditorTab[];
          if (shouldAutoPinn) {
            // For auto-pinned tabs, insert in correct pinned position
            const otherTabs = [...openTabs];
            const insertIndex = otherTabs.filter(t => t.pinned && (t.pinnedOrder || 0) < (pinnedOrder || 0)).length;
            otherTabs.splice(insertIndex, 0, newTab);
            newTabs = otherTabs;
          } else {
            // For non-auto-pinned tabs, insert after all pinned tabs
            const pinnedTabs = openTabs.filter(tab => tab.pinned);
            const unpinnedTabs = openTabs.filter(tab => !tab.pinned);
            newTabs = [...pinnedTabs, ...unpinnedTabs, newTab];
          }

          set({
            openTabs: newTabs,
            activeTab: newTab.id,
          });
        },

        closeTab: (tabId: string) => {
          const { openTabs, activeTab } = get();
          const tabIndex = openTabs.findIndex(tab => tab.id === tabId);
          
          if (tabIndex === -1) return;

          const newTabs = openTabs.filter(tab => tab.id !== tabId);
          let newActiveTab = activeTab;

          // If closing the active tab, switch to another tab
          if (activeTab === tabId) {
            if (newTabs.length > 0) {
              // Switch to the tab to the right, or the last tab if closing the last one
              const nextIndex = tabIndex < newTabs.length ? tabIndex : newTabs.length - 1;
              newActiveTab = newTabs[nextIndex].id;
            } else {
              newActiveTab = '';
            }
          }

          set({
            openTabs: newTabs,
            activeTab: newActiveTab,
          });
        },

        closeAllTabs: () => {
          set({
            openTabs: [],
            activeTab: '',
          });
        },

        setActiveTab: (tabId: string) => {
          const { openTabs } = get();
          const tabExists = openTabs.some(tab => tab.id === tabId);
          
          if (tabExists) {
            set({ activeTab: tabId });
          }
        },

        reorderTabs: (fromTabId: string, toTabId: string) => {
          const { openTabs } = get();
          const fromIndex = openTabs.findIndex(tab => tab.id === fromTabId);
          const toIndex = openTabs.findIndex(tab => tab.id === toTabId);
          
          if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
            const newTabs = [...openTabs];
            const [movedTab] = newTabs.splice(fromIndex, 1);
            newTabs.splice(toIndex, 0, movedTab);
            set({ openTabs: newTabs });
          }
        },

        pinTab: (tabId: string) => {
          const { openTabs } = get();
          const tabIndex = openTabs.findIndex(tab => tab.id === tabId);
          
          if (tabIndex !== -1) {
            const tab = openTabs[tabIndex];
            
            // Don't pin if already pinned
            if (tab.pinned) return;
            
            // Get the highest pinned order
            const pinnedTabs = openTabs.filter(t => t.pinned);
            const nextPinnedOrder = pinnedTabs.length > 0 ? Math.max(...pinnedTabs.map(t => t.pinnedOrder || 0)) + 1 : 1;
            
            // Update the tab to be pinned
            const updatedTab = { ...tab, pinned: true, pinnedOrder: nextPinnedOrder };
            
            // Remove tab from current position and add to correct pinned position
            const newTabs = [...openTabs];
            newTabs.splice(tabIndex, 1);
            
            // Find the correct position among pinned tabs
            const insertIndex = newTabs.filter(t => t.pinned && (t.pinnedOrder || 0) < nextPinnedOrder).length;
            newTabs.splice(insertIndex, 0, updatedTab);
            
            set({ openTabs: newTabs });
          }
        },

        unpinTab: (tabId: string) => {
          const { openTabs } = get();
          const tabIndex = openTabs.findIndex(tab => tab.id === tabId);
          
          if (tabIndex !== -1) {
            const tab = openTabs[tabIndex];
            
            // Don't unpin if not pinned
            if (!tab.pinned) return;
            
            // Update the tab to be unpinned
            const updatedTab = { ...tab, pinned: false, pinnedOrder: undefined };
            
            // Remove tab from current position
            const newTabs = [...openTabs];
            newTabs.splice(tabIndex, 1);
            
            // Find the position after all pinned tabs
            const pinnedCount = newTabs.filter(t => t.pinned).length;
            newTabs.splice(pinnedCount, 0, updatedTab);
            
            set({ openTabs: newTabs });
          }
        },

        updateTabContent: (tabId: string, content: string) => {
          const { openTabs } = get();
          const updatedTabs = openTabs.map((tab: EditorTab) => 
            tab.id === tabId 
              ? { ...tab, content, modified: true }
              : tab
          );
          
          set({ openTabs: updatedTabs });
        },

        updateFileContent: (tabId: string, content: string) => {
          const { openTabs } = get();
          const updatedTabs = openTabs.map((tab: EditorTab) => 
            tab.id === tabId 
              ? { ...tab, content, modified: true }
              : tab
          );
          
          set({ openTabs: updatedTabs });
        },

        updateFileStatus: (fileId: string, status: 'draft' | 'scheduled' | 'complete') => {
          const { projectFiles, financialFiles } = get();

          // Update in project files
          const updatedProjectFiles = projectFiles.map(file =>
            file.id === fileId ? { ...file, status, modifiedAt: new Date() } : file
          );

          // Update in financial files
          const updatedFinancialFiles = financialFiles.map(file =>
            file.id === fileId ? { ...file, status, modifiedAt: new Date() } : file
          );

          set({
            projectFiles: updatedProjectFiles,
            financialFiles: updatedFinancialFiles
          });
        },

        createNewFile: async (name: string, type: ProjectFile['type'], category: ProjectFile['category'] = 'project', folderId?: string) => {
          const { projectFiles, financialFiles } = get();
          
          // Generate unique ID
          const id = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
          const fileName = `${name}${getFileExtension(type)}`;
          const basePath = category === 'financial' ? '/financial-data' : '/eac-projects';
          
          // Create new file
          const newFile: ProjectFile = {
            id,
            name: fileName,
            icon: getFileIcon(type),
            type,
            category,
            content: getDefaultContent(type, name),
            filePath: `${basePath}/${fileName}`,
            createdAt: new Date(),
            modifiedAt: new Date(),
            folderId, // Add folder assignment
            status: ['facebook', 'reddit', 'instagram', 'x'].includes(type) ? 'draft' : undefined, // Default social media files to draft
          };

          // Add to appropriate file array and ensure category is visible
          if (category === 'financial') {
            set({
              financialFiles: [...financialFiles, newFile],
              showFinancialCategory: true, // Ensure financial category is visible
            });
          } else {
            set({
              projectFiles: [...projectFiles, newFile],
              showProjectsCategory: true, // Ensure projects category is visible
            });
          }

          // Automatically open the new file
          get().openTab(newFile);

          // Save to Convex database (async - don't block UI)
          try {
            // We need to import the Convex hooks here, which isn't ideal
            // Better to handle this in the component level
            console.log('File created locally:', newFile);
            
            // Dispatch custom event that components can listen to
            window.dispatchEvent(new CustomEvent('fileCreated', { 
              detail: { 
                file: newFile,
                projectId: folderId // Using folderId as projectId for now
              } 
            }));
            
          } catch (error) {
            console.error('Failed to save file to database:', error);
          }
        },

        createFolder: (name: string, category: 'project' | 'financial', convexId?: string) => {
          const { projectFolders, financialFolders } = get();
          
          // Check if folder with this name already exists to prevent duplicates
          const existingFolders = category === 'financial' ? financialFolders : projectFolders;
          const folderExists = existingFolders.some(folder => 
            folder.name.toLowerCase() === name.toLowerCase()
          );
          
          if (folderExists) {
            console.log(`Folder "${name}" already exists in ${category} category, skipping creation`);
            return;
          }
          
          // Generate truly unique ID using crypto if available, otherwise fallback to timestamp + random
          let uniqueId: string;
          if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            uniqueId = `folder-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${crypto.randomUUID()}`;
          } else {
            // Fallback for environments without crypto.randomUUID
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 12);
            const counter = Math.floor(Math.random() * 10000);
            uniqueId = `folder-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}-${random}-${counter}`;
          }
          
          // Double-check uniqueness against all existing folder IDs
          const allFolders = [...projectFolders, ...financialFolders];
          while (allFolders.some(folder => folder.id === uniqueId)) {
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            uniqueId = `${uniqueId}-${randomSuffix}`;
          }
          
          // Create new folder
          const newFolder: ProjectFolder = {
            id: uniqueId,
            name,
            category,
            createdAt: new Date(),
            convexId, // Store the Convex project ID
          };

          // Add to appropriate folder array and ensure category is visible
          if (category === 'financial') {
            set({
              financialFolders: [newFolder, ...financialFolders],
              showFinancialCategory: true, // Ensure financial category is visible
            });
          } else {
            set({
              projectFolders: [newFolder, ...projectFolders],
              showProjectsCategory: true, // Ensure projects category is visible
            });
          }
        },

        // Emergency cleanup function for duplicate folder IDs
        cleanupDuplicateFolders: () => {
          const { projectFolders, financialFolders } = get();
          
          // Function to remove duplicates and fix bad IDs
          const cleanupFolders = (folders: ProjectFolder[]) => {
            const seen = new Set<string>();
            const cleaned = folders.filter(folder => {
              // Remove folders with the problematic key pattern
              if (folder.id.includes('folder-index-1753064508939')) {
                console.log(`🧹 Removing problematic folder: ${folder.id} (${folder.name})`);
                return false;
              }
              
              // Remove duplicate IDs
              if (seen.has(folder.id)) {
                console.log(`🧹 Removing duplicate folder: ${folder.id} (${folder.name})`);
                return false;
              }
              
              seen.add(folder.id);
              return true;
            });
            
            // Regenerate IDs for any remaining folders with old patterns
            return cleaned.map(folder => {
              if (folder.id.startsWith('folder-index-') || folder.id.length < 20) {
                const newId = typeof crypto !== 'undefined' && crypto.randomUUID
                  ? `folder-${folder.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${crypto.randomUUID()}`
                  : `folder-${folder.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`;
                
                console.log(`🔄 Regenerating ID for folder: ${folder.id} → ${newId} (${folder.name})`);
                
                return { ...folder, id: newId };
              }
              return folder;
            });
          };
          
          const cleanedProjectFolders = cleanupFolders(projectFolders);
          const cleanedFinancialFolders = cleanupFolders(financialFolders);
          
          if (cleanedProjectFolders.length !== projectFolders.length || 
              cleanedFinancialFolders.length !== financialFolders.length) {
            console.log('🧹 Cleanup completed, updating store...');
            set({
              projectFolders: cleanedProjectFolders,
              financialFolders: cleanedFinancialFolders
            });
          }
        },

        deleteFile: (fileId: string) => {
          const { projectFiles, financialFiles, openTabs } = get();
          
          // Find and remove from appropriate array
          const updatedProjectFiles = projectFiles.filter((file: ProjectFile) => file.id !== fileId);
          const updatedFinancialFiles = financialFiles.filter((file: ProjectFile) => file.id !== fileId);
          
          // Close tab if it's open
          const tabToClose = openTabs.find((tab: EditorTab) => tab.id === fileId);
          if (tabToClose) {
            get().closeTab(fileId);
          }
          
          set({ 
            projectFiles: updatedProjectFiles,
            financialFiles: updatedFinancialFiles 
          });
        },

        renameFile: (fileId: string, newName: string) => {
          const { projectFiles, financialFiles, openTabs } = get();
          
          // Find the file to get its type and generate new filename with extension
          const projectFile = projectFiles.find((file: ProjectFile) => file.id === fileId);
          const financialFile = financialFiles.find((file: ProjectFile) => file.id === fileId);
          const file = projectFile || financialFile;
          
          if (!file) return;
          
          // Generate new filename with appropriate extension
          const newFileName = `${newName}${getFileExtension(file.type)}`;
          const basePath = file.category === 'financial' ? '/financial-data' : '/eac-projects';
          const newFilePath = `${basePath}/${newFileName}`;
          
          // Update the file in appropriate array
          const updatedProjectFiles = projectFiles.map((f: ProjectFile) =>
            f.id === fileId
              ? { ...f, name: newFileName, filePath: newFilePath, modifiedAt: new Date() }
              : f
          );

          const updatedFinancialFiles = financialFiles.map((f: ProjectFile) =>
            f.id === fileId
              ? { ...f, name: newFileName, filePath: newFilePath, modifiedAt: new Date() }
              : f
          );

          // Update open tabs if the file is open
          const updatedTabs = openTabs.map((tab: EditorTab) =>
            tab.id === fileId
              ? { ...tab, name: newFileName, filePath: newFilePath, modified: true }
              : tab
          );

          set({
            projectFiles: updatedProjectFiles,
            financialFiles: updatedFinancialFiles,
            openTabs: updatedTabs,
          });
        },

        renameFolder: (folderId: string, newName: string) => {
          const { projectFolders, financialFolders } = get();
          
          // Update the folder in appropriate array
          const updatedProjectFolders = projectFolders.map((folder: ProjectFolder) =>
            folder.id === folderId
              ? { ...folder, name: newName }
              : folder
          );

          const updatedFinancialFolders = financialFolders.map((folder: ProjectFolder) =>
            folder.id === folderId
              ? { ...folder, name: newName }
              : folder
          );

          set({
            projectFolders: updatedProjectFolders,
            financialFolders: updatedFinancialFolders,
          });
        },

        deleteFolder: (folderId: string) => {
          const { projectFolders, financialFolders, projectFiles, financialFiles, openTabs } = get();

          // Find all files that were in this folder
          const filesToDelete = [
            ...projectFiles.filter((file: ProjectFile) => file.folderId === folderId),
            ...financialFiles.filter((file: ProjectFile) => file.folderId === folderId)
          ];

          // Close tabs for all files in this folder
          filesToDelete.forEach((file: ProjectFile) => {
            const tabToClose = openTabs.find((tab: EditorTab) => tab.id === file.id);
            if (tabToClose) {
              get().closeTab(file.id);
            }
          });
          
          // Remove from appropriate folder array
          const updatedProjectFolders = projectFolders.filter((folder: ProjectFolder) => folder.id !== folderId);
          const updatedFinancialFolders = financialFolders.filter((folder: ProjectFolder) => folder.id !== folderId);
          
          // Also remove any files that were in this folder
          const updatedProjectFiles = projectFiles.filter((file: ProjectFile) => file.folderId !== folderId);
          const updatedFinancialFiles = financialFiles.filter((file: ProjectFile) => file.folderId !== folderId);
          
          set({ 
            projectFolders: updatedProjectFolders,
            financialFolders: updatedFinancialFolders,
            projectFiles: updatedProjectFiles,
            financialFiles: updatedFinancialFiles
          });
        },

        moveToTrash: (item: ProjectFile | ProjectFolder, type: 'file' | 'folder') => {
          const { trashItems, projectFiles, financialFiles, projectFolders, financialFolders, openTabs } = get();
          
          // Create trash item
          const trashItem: TrashItem = {
            id: `trash_${item.id}_${Date.now()}`,
            name: item.name,
            type,
            originalData: item,
            deletedAt: new Date(),
            category: item.category
          };
          
          if (type === 'file') {
            const file = item as ProjectFile;
            
            // Close tab if it's open
            const tabToClose = openTabs.find((tab: EditorTab) => tab.id === file.id);
            if (tabToClose) {
              get().closeTab(file.id);
            }
            
            // Remove from appropriate file array
            const updatedProjectFiles = projectFiles.filter((f: ProjectFile) => f.id !== file.id);
            const updatedFinancialFiles = financialFiles.filter((f: ProjectFile) => f.id !== file.id);
            
            set({
              trashItems: [...trashItems, trashItem],
              projectFiles: updatedProjectFiles,
              financialFiles: updatedFinancialFiles
            });
          } else {
            const folder = item as ProjectFolder;
            
            // Find all files that were in this folder and move them to trash too
            const filesToTrash = [
              ...projectFiles.filter((file: ProjectFile) => file.folderId === folder.id),
              ...financialFiles.filter((file: ProjectFile) => file.folderId === folder.id)
            ];
            
            // Close tabs for all files in this folder
            filesToTrash.forEach((file: ProjectFile) => {
              const tabToClose = openTabs.find((tab: EditorTab) => tab.id === file.id);
              if (tabToClose) {
                get().closeTab(file.id);
              }
            });
            
            // Create trash items for all files in the folder
            const fileTrashItems = filesToTrash.map((file: ProjectFile) => ({
              id: `trash_${file.id}_${Date.now()}`,
              name: file.name,
              type: 'file' as const,
              originalData: file,
              deletedAt: new Date(),
              category: file.category
            }));
            
            // Remove folder and its files from arrays
            const updatedProjectFolders = projectFolders.filter((f: ProjectFolder) => f.id !== folder.id);
            const updatedFinancialFolders = financialFolders.filter((f: ProjectFolder) => f.id !== folder.id);
            const updatedProjectFiles = projectFiles.filter((file: ProjectFile) => file.folderId !== folder.id);
            const updatedFinancialFiles = financialFiles.filter((file: ProjectFile) => file.folderId !== folder.id);
            
            set({
              trashItems: [...trashItems, trashItem, ...fileTrashItems],
              projectFolders: updatedProjectFolders,
              financialFolders: updatedFinancialFolders,
              projectFiles: updatedProjectFiles,
              financialFiles: updatedFinancialFiles
            });
          }
        },

        restoreFromTrash: (trashItemId: string) => {
          const { trashItems, projectFiles, financialFiles, projectFolders, financialFolders } = get();
          
          const trashItem = trashItems.find(item => item.id === trashItemId);
          if (!trashItem) return;
          
          // Remove from trash
          const updatedTrashItems = trashItems.filter(item => item.id !== trashItemId);
          
          // Restore to appropriate array
          if (trashItem.type === 'file') {
            const file = trashItem.originalData as ProjectFile;
            if (file.category === 'project') {
              set({
                trashItems: updatedTrashItems,
                projectFiles: [...projectFiles, { ...file, modifiedAt: new Date() }]
              });
            } else {
              set({
                trashItems: updatedTrashItems,
                financialFiles: [...financialFiles, { ...file, modifiedAt: new Date() }]
              });
            }
          } else {
            const folder = trashItem.originalData as ProjectFolder;
            if (folder.category === 'project') {
              set({
                trashItems: updatedTrashItems,
                projectFolders: [...projectFolders, folder]
              });
            } else {
              set({
                trashItems: updatedTrashItems,
                financialFolders: [...financialFolders, folder]
              });
            }
          }
        },

        permanentlyDelete: (trashItemId: string) => {
          const { trashItems } = get();
          
          // Remove from trash permanently
          const updatedTrashItems = trashItems.filter(item => item.id !== trashItemId);
          set({ trashItems: updatedTrashItems });
        },

        emptyTrash: () => {
          set({ trashItems: [] });
        },

        clearProjectCategory: () => {
          const { openTabs } = get();
          
          // Close all project-related tabs
          const projectTabIds = openTabs
            .filter((tab: EditorTab) => {
              // Find the corresponding file to check its category
              const { projectFiles } = get();
              const file = projectFiles.find((f: ProjectFile) => f.id === tab.id);
              return file?.category === 'project';
            })
            .map((tab: EditorTab) => tab.id);
          
          projectTabIds.forEach((tabId: string) => get().closeTab(tabId));
          
          // Clear all project files and folders
          set({
            projectFiles: [],
            projectFolders: [],
          });
        },

        clearFinancialCategory: () => {
          const { openTabs } = get();
          
          // Close all financial-related tabs
          const financialTabIds = openTabs
            .filter((tab: EditorTab) => {
              // Find the corresponding file to check its category
              const { financialFiles } = get();
              const file = financialFiles.find((f: ProjectFile) => f.id === tab.id);
              return file?.category === 'financial';
            })
            .map((tab: EditorTab) => tab.id);
          
          financialTabIds.forEach((tabId: string) => get().closeTab(tabId));
          
          // Clear all financial files and folders
          set({
            financialFiles: [],
            financialFolders: [],
          });
        },

        deleteProjectsCategory: () => {
          get().clearProjectCategory();
          set({ showProjectsCategory: false });
        },

        deleteFinancialCategory: () => {
          get().clearFinancialCategory();
          set({ showFinancialCategory: false });
        },

        reorderProjectFolders: (fromIndex: number, toIndex: number) => {
          const { projectFolders } = get();
          const newFolders = [...projectFolders];
          const [movedFolder] = newFolders.splice(fromIndex, 1);
          newFolders.splice(toIndex, 0, movedFolder);
          
          set({ projectFolders: newFolders });
        },

        updateProjectFolders: (folders: ProjectFolder[]) => {
          set({ projectFolders: folders });
        },

        reorderFilesInFolder: (folderId: string, fromIndex: number, toIndex: number, category: 'project' | 'financial') => {
          const { projectFiles, financialFiles } = get();
          
          if (category === 'project') {
            // Filter files in the specific folder
            const folderFiles = projectFiles.filter(file => file.folderId === folderId);
            const otherFiles = projectFiles.filter(file => file.folderId !== folderId);
            
            // Reorder files within the folder
            const reorderedFolderFiles = [...folderFiles];
            const [movedFile] = reorderedFolderFiles.splice(fromIndex, 1);
            reorderedFolderFiles.splice(toIndex, 0, movedFile);
            
            // Combine with other files
            const newProjectFiles = [...otherFiles, ...reorderedFolderFiles];
            set({ projectFiles: newProjectFiles });
          } else {
            // Similar logic for financial files
            const folderFiles = financialFiles.filter(file => file.folderId === folderId);
            const otherFiles = financialFiles.filter(file => file.folderId !== folderId);
            
            const reorderedFolderFiles = [...folderFiles];
            const [movedFile] = reorderedFolderFiles.splice(fromIndex, 1);
            reorderedFolderFiles.splice(toIndex, 0, movedFile);
            
            const newFinancialFiles = [...otherFiles, ...reorderedFolderFiles];
            set({ financialFiles: newFinancialFiles });
          }
        },

        saveFile: (tabId: string) => {
          const { openTabs, projectFiles, financialFiles } = get();
          const tab = openTabs.find((t: EditorTab) => t.id === tabId);
          
          if (!tab) return;

          // Update the file content in appropriate array
          const updatedProjectFiles = projectFiles.map((file: ProjectFile) =>
            file.id === tabId
              ? { ...file, content: tab.content, modifiedAt: new Date() }
              : file
          );

          const updatedFinancialFiles = financialFiles.map((file: ProjectFile) =>
            file.id === tabId
              ? { ...file, content: tab.content, modifiedAt: new Date() }
              : file
          );

          const updatedTabs = openTabs.map((t: EditorTab) =>
            t.id === tabId
              ? { ...t, modified: false }
              : t
          );

          set({
            projectFiles: updatedProjectFiles,
            financialFiles: updatedFinancialFiles,
            openTabs: updatedTabs,
          });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        // Fix files that don't have content
        repairFilesWithoutContent: () => {
          const { projectFiles, financialFiles } = get();
          
          const repairedProjectFiles = projectFiles.map(file => {
            if (!file.content || file.content.trim() === '') {
              return {
                ...file,
                content: getDefaultContent(file.type, file.name),
                modifiedAt: new Date()
              };
            }
            return file;
          });
          
          const repairedFinancialFiles = financialFiles.map(file => {
            if (!file.content || file.content.trim() === '') {
              return {
                ...file,
                content: getDefaultContent(file.type, file.name),
                modifiedAt: new Date()
              };
            }
            return file;
          });
          
          set({
            projectFiles: repairedProjectFiles,
            financialFiles: repairedFinancialFiles
          });
        },

        reset: () => {
          set({
            openTabs: [],
            activeTab: '',
            projectFiles: initialProjectFiles,
            financialFiles: initialFinancialFiles,
            projectFolders: [],
            financialFolders: [],
            showProjectsCategory: true,
            showFinancialCategory: false, // Don't auto-show financial category on reset
            isLoading: false,
            error: null,
          });
        },

        // Clear user data when signing out (but keep UI state like theme, etc.)
        clearUserData: () => {
          set({
            openTabs: [],
            activeTab: '',
            projectFiles: [],
            financialFiles: [],
            projectFolders: [],
            financialFolders: [],
            trashItems: [],
            showProjectsCategory: true,
            showFinancialCategory: false,
          });
        },
      }),
      {
        name: 'editor-storage',
        version: 1, // Add version for tab pinning persistence
        // Only persist specific fields
        partialize: (state) => ({ 
          openTabs: state.openTabs.map(tab => ({
            id: tab.id,
            name: tab.name,
            modified: tab.modified,
            content: tab.content,
            filePath: tab.filePath,
            type: tab.type,
            pinned: tab.pinned, // Persist pinned state
            pinnedOrder: tab.pinnedOrder, // Persist pinned order
            // We'll need to restore the icon based on file type
          })),
          activeTab: state.activeTab,
          projectFiles: state.projectFiles,
          financialFiles: state.financialFiles,
          projectFolders: state.projectFolders,
          financialFolders: state.financialFolders,
          showProjectsCategory: state.showProjectsCategory,
          showFinancialCategory: state.showFinancialCategory,
        }),
        // Custom storage to handle icon restoration
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const { state } = JSON.parse(str);
            
            // Restore icons based on file type
            const restoredTabs = (state.openTabs || []).map((tab: Omit<EditorTab, 'icon'>) => {
              let icon = FileCode;
              
              switch (tab.type) {
                case 'typescript':
                case 'javascript':
                  icon = FileCode;
                  break;
                case 'json':
                  icon = Braces;
                  break;
                case 'excel':
                  icon = FileSpreadsheet;
                  break;
                case 'markdown':
                  icon = FileText;
                  break;
                case 'pdf':
                  icon = FileType;
                  break;
              }
              
              return {
                ...tab,
                icon,
              };
            });
            
            return {
              state: {
                ...state,
                openTabs: restoredTabs,
              },
            };
          },
          setItem: (name, value) => {
            localStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Repair any files that don't have content
            if (state.projectFiles) {
              state.projectFiles = state.projectFiles.map(file => {
                if (!file.content || file.content.trim() === '') {
                  return {
                    ...file,
                    content: getDefaultContent(file.type, file.name),
                    modifiedAt: new Date()
                  };
                }
                return file;
              });
            }
            
            if (state.financialFiles) {
              state.financialFiles = state.financialFiles.map(file => {
                if (!file.content || file.content.trim() === '') {
                  return {
                    ...file,
                    content: getDefaultContent(file.type, file.name),
                    modifiedAt: new Date()
                  };
                }
                return file;
              });
            }
            
            // Ensure Instructions folder exists if there are project folders
            if (state.projectFolders && state.projectFolders.length > 0) {
              // Only ensure the Instructions folder if there are already some project folders
              // This prevents auto-creation when storage is intentionally cleared
              const hasInstructionsFolder = state.projectFolders.some(folder =>
                folder.id === 'instructions-folder' && folder.pinned
              );
              
              if (!hasInstructionsFolder) {
                state.projectFolders = [
                  {
                    id: 'instructions-folder',
                    name: 'Instructions',
                    category: 'project',
                    createdAt: new Date(),
                    pinned: true,
                  },
                  ...state.projectFolders
                ];
              }
            }
          }
          // If projectFolders is empty, respect that (don't auto-create anything)
        },
      }
    ),
    { name: 'editor-store' }
  )
); 