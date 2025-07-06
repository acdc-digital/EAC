// Editor Store
// /Users/matthewsimon/Projects/EAC/eac/store/editor/index.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { FileCode, FileText, FileSpreadsheet, FileType, Braces } from 'lucide-react';
import { EditorState, EditorTab, ProjectFile, ProjectFolder } from './types';

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
    default:
      return FileCode;
  }
};

// Helper function to get file extension
const getFileExtension = (type: ProjectFile['type']) => {
  switch (type) {
    case 'typescript':
      return '.tsx';
    case 'javascript':
      return '.js';
    case 'json':
      return '.json';
    case 'excel':
      return '.xlsx';
    case 'markdown':
      return '.md';
    case 'pdf':
      return '.pdf';
    case 'generals':
      return '.generals';
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
    default:
      return `# ${name}

This is a new file created in the EAC Dashboard.
Created on: ${new Date().toISOString()}`;
  }
};

// Initial project files
const initialProjectFiles: ProjectFile[] = [
  {
    id: 'budget-2024',
    name: 'Q4-Budget-2024.xlsx',
    icon: FileSpreadsheet,
    type: 'excel',
    category: 'project',
    content: '// Excel file content placeholder',
    filePath: '/eac-projects/Q4-Budget-2024.xlsx',
    createdAt: new Date('2024-01-01'),
    modifiedAt: new Date('2024-01-15'),
  },
  {
    id: 'marketing-roi',
    name: 'Marketing-ROI.tsx',
    icon: FileCode,
    type: 'typescript',
    category: 'project',
    content: `// Marketing ROI Component
import React from 'react';

export function MarketingROI() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Marketing ROI Analysis</h2>
      <p>ROI: 245%</p>
    </div>
  );
}`,
    filePath: '/eac-projects/Marketing-ROI.tsx',
    createdAt: new Date('2024-01-05'),
    modifiedAt: new Date('2024-01-20'),
  },
  {
    id: 'revenue-analysis',
    name: 'Revenue-Analysis.json',
    icon: Braces,
    type: 'json',
    category: 'project',
    content: `{
  "quarter": "Q4 2024",
  "revenue": {
    "total": 189500,
    "growth": 12.3,
    "breakdown": {
      "recurring": 145000,
      "new_business": 44500
    }
  }
}`,
    filePath: '/eac-projects/Revenue-Analysis.json',
    createdAt: new Date('2024-01-10'),
    modifiedAt: new Date('2024-01-25'),
  },
  {
    id: 'expense-report',
    name: 'Expense-Report.pdf',
    icon: FileType,
    type: 'pdf',
    category: 'project',
    content: '// PDF file content placeholder',
    filePath: '/eac-projects/Expense-Report.pdf',
    createdAt: new Date('2024-01-12'),
    modifiedAt: new Date('2024-01-22'),
  },
];

// Initial financial files
const initialFinancialFiles: ProjectFile[] = [
  {
    id: 'current-month-report',
    name: 'Current-Month-Report.json',
    icon: Braces,
    type: 'json',
    category: 'financial',
    content: `{
  "month": "January 2024",
  "revenue": {
    "total": 47382.50,
    "growth": 12.3,
    "sources": {
      "subscriptions": 35000,
      "one_time": 12382.50
    }
  },
  "expenses": {
    "total": 23451.20,
    "breakdown": {
      "payroll": 18000,
      "marketing": 3200,
      "operations": 2251.20
    }
  },
  "profit": 23931.30
}`,
    filePath: '/financial-data/Current-Month-Report.json',
    createdAt: new Date('2024-01-01'),
    modifiedAt: new Date('2024-01-31'),
  },
  {
    id: 'quarterly-forecast',
    name: 'Q1-Forecast-2024.xlsx',
    icon: FileSpreadsheet,
    type: 'excel',
    category: 'financial',
    content: '// Excel forecasting model with quarterly projections',
    filePath: '/financial-data/Q1-Forecast-2024.xlsx',
    createdAt: new Date('2024-01-01'),
    modifiedAt: new Date('2024-01-15'),
  },
  {
    id: 'annual-summary',
    name: 'Annual-Summary-2023.pdf',
    icon: FileType,
    type: 'pdf',
    category: 'financial',
    content: '// Annual financial summary report',
    filePath: '/financial-data/Annual-Summary-2023.pdf',
    createdAt: new Date('2023-12-31'),
    modifiedAt: new Date('2024-01-05'),
  },
  {
    id: 'budget-tracker',
    name: 'Budget-Tracker.tsx',
    icon: FileCode,
    type: 'typescript',
    category: 'financial',
    content: `// Budget Tracker Component
import React from 'react';

export function BudgetTracker() {
  const budgets = [
    { category: 'Marketing', allocated: 15000, spent: 12500 },
    { category: 'Operations', allocated: 25000, spent: 18200 },
    { category: 'Development', allocated: 30000, spent: 28500 },
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Budget Tracker</h2>
      <div className="space-y-2 mt-4">
        {budgets.map((budget, index) => (
          <div key={index} className="flex justify-between">
            <span>{budget.category}</span>
            <span>\${budget.spent} / \${budget.allocated}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    filePath: '/financial-data/Budget-Tracker.tsx',
    createdAt: new Date('2024-01-10'),
    modifiedAt: new Date('2024-01-28'),
  },
];

export const useEditorStore = create<EditorState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        openTabs: [],
        activeTab: '',
        projectFiles: initialProjectFiles,
        financialFiles: initialFinancialFiles,
        projectFolders: [],
        financialFolders: [],
        showProjectsCategory: true,
        showFinancialCategory: true,
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

          // Create new tab
          const newTab: EditorTab = {
            id: file.id,
            name: file.name,
            modified: false,
            content: file.content,
            filePath: file.filePath,
            type: file.type,
          };

          set({
            openTabs: [...openTabs, newTab],
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

        createNewFile: (name: string, type: ProjectFile['type'], category: ProjectFile['category'] = 'project', folderId?: string) => {
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
        },

        createFolder: (name: string, category: 'project' | 'financial') => {
          const { projectFolders, financialFolders } = get();
          
          // Generate unique ID
          const id = `folder-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
          
          // Create new folder
          const newFolder: ProjectFolder = {
            id,
            name,
            category,
            createdAt: new Date(),
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

        reset: () => {
          set({
            openTabs: [],
            activeTab: '',
            projectFiles: initialProjectFiles,
            financialFiles: initialFinancialFiles,
            projectFolders: [],
            financialFolders: [],
            showProjectsCategory: true,
            showFinancialCategory: true,
            isLoading: false,
            error: null,
          });
        },
      }),
      {
        name: 'editor-storage',
        // Only persist specific fields
        partialize: (state) => ({ 
          openTabs: state.openTabs.map(tab => ({
            id: tab.id,
            name: tab.name,
            modified: tab.modified,
            content: tab.content,
            filePath: tab.filePath,
            type: tab.type,
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
      }
    ),
    { name: 'editor-store' }
  )
); 