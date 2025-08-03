// File Load Hook - Syncs files from Convex to Zustand store
// lib/hooks/useFileLoad.ts

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useEditorStore } from "@/store";
import { ProjectFile } from "@/store/editor/types";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { AtSign, Braces, Calendar, Camera, FileCode, FileSpreadsheet, FileText, FileType, HelpCircle, MessageSquare } from 'lucide-react';
import { useEffect, useRef } from "react";

// Helper function to get icon based on file type (duplicated from store)
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
      return 'r/'; // Text for reddit
    case 'instagram':
      return Camera;
    case 'x':
      return AtSign;
    case 'calendar':
      return Calendar;
    case 'platform-instructions':
      return HelpCircle;
    default:
      return FileCode;
  }
};

// Helper function to get file extension (duplicated from store)
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

export function useFileLoad() {
  const { isSignedIn } = useAuth();
  const { 
    projectFolders, 
    projectFiles,
    createFolder,
    // We'll access replaceWithDatabaseFiles through set()
    // replaceWithDatabaseFiles
  } = useEditorStore();

  // Get all files for all projects the user has access to (only if signed in)
  const allUserFiles = useQuery(api.files.getAllUserFiles, isSignedIn ? {} : "skip");
  const allProjects = useQuery(api.projects.getProjects, isSignedIn ? {} : "skip");

  // Track if we've already synced to prevent continuous updates
  const syncedRef = useRef<boolean>(false);
  const lastSyncRef = useRef<string>('');

  // Aggressive sync: Replace local files with database files
  useEffect(() => {
    if (!isSignedIn || !allUserFiles || !allProjects) return;

    // Create a unique hash of the current database state
    const currentHash = JSON.stringify(allUserFiles.map(f => ({ id: f._id, name: f.name, projectId: f.projectId, content: f.content?.substring(0, 50) })));
    
    // Only sync if the database state has actually changed
    if (lastSyncRef.current === currentHash) {
      return;
    }

    console.log('🔄 AGGRESSIVE SYNC: Replacing local files with database files...');
    console.log(`📂 Found ${allUserFiles.length} files in database`);

    // If no database files, clear local files
    if (allUserFiles.length === 0) {
      console.log('📭 No database files - clearing local project files');
      useEditorStore.setState({ 
        projectFiles: [],
        showProjectsCategory: true 
      });
      lastSyncRef.current = currentHash;
      return;
    }

    // Get current state to work with
    const currentState = useEditorStore.getState();
    
    // First, ensure all project folders exist
    const existingFolders = [...currentState.projectFolders];
    const projectsToCreate = new Map<Id<"projects">, string>();
    
    allUserFiles.forEach(file => {
      const project = allProjects.find(p => p._id === file.projectId);
      if (project && !existingFolders.find(f => f.convexId === project._id)) {
        projectsToCreate.set(project._id, project.name);
      }
    });

    // Create missing project folders synchronously
    for (const [projectId, projectName] of projectsToCreate) {
      console.log(`📁 Creating folder for project: ${projectName}`);
      
      // Create folder object
      const folderId = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
      const newFolder = {
        id: folderId,
        name: projectName,
        category: 'project' as const,
        createdAt: new Date(),
        pinned: false,
        convexId: projectId,
      };
      
      existingFolders.push(newFolder);
    }

    // Update folders if we created any
    if (projectsToCreate.size > 0) {
      useEditorStore.setState({ projectFolders: existingFolders });
    }

    // Now convert all database files to local ProjectFile format
    const databaseFiles: ProjectFile[] = [];
    
    allUserFiles.forEach(convexFile => {
      const project = allProjects.find(p => p._id === convexFile.projectId);
      const folder = existingFolders.find(f => f.convexId === convexFile.projectId);
      
      if (project && folder) {
        const editorFileType = mapFromConvexFileType(convexFile.type, convexFile.platform);
        const fileExtension = getFileExtension(editorFileType);
        const fileName = convexFile.name.includes('.') ? convexFile.name : `${convexFile.name}${fileExtension}`;
        
        const localFile: ProjectFile = {
          id: convexFile._id, // Use Convex ID as local ID for consistency
          name: fileName,
          icon: getFileIcon(editorFileType),
          type: editorFileType,
          category: 'project',
          content: convexFile.content || '',
          filePath: convexFile.path || `/eac-projects/${fileName}`,
          createdAt: new Date(convexFile._creationTime),
          modifiedAt: new Date(convexFile._creationTime),
          folderId: folder.id,
          convexId: convexFile._id,
          status: ['facebook', 'reddit', 'instagram', 'x'].includes(editorFileType) ? 'draft' : undefined,
        };

        databaseFiles.push(localFile);
        console.log(`📄 Converted database file "${convexFile.name}" to local format`);
      } else {
        console.warn(`⚠️ Could not find project or folder for file "${convexFile.name}" (projectId: ${convexFile.projectId})`);
      }
    });

    // Replace ALL local project files with database files
    console.log(`🔄 Replacing ${currentState.projectFiles.length} local files with ${databaseFiles.length} database files`);
    useEditorStore.setState({ 
      projectFiles: databaseFiles,
      showProjectsCategory: databaseFiles.length > 0 
    });
    
    // Update sync tracking
    lastSyncRef.current = currentHash;
    syncedRef.current = true;
    
    console.log('✅ AGGRESSIVE SYNC COMPLETE - UI now shows database files only');
    console.log(`📊 Final state: ${databaseFiles.length} files, ${existingFolders.length} folders`);
  }, [isSignedIn, allUserFiles, allProjects]);

  return {
    allUserFiles: allUserFiles ?? [],
    isLoading: allUserFiles === undefined,
    isSynced: syncedRef.current
  };
}

// Helper function to map Convex file types back to editor file types
function mapFromConvexFileType(
  convexType: "post" | "campaign" | "note" | "document" | "image" | "video" | "other",
  platform?: "facebook" | "instagram" | "twitter" | "linkedin" | "reddit" | "youtube"
): ProjectFile['type'] {
  // If it's a post with a platform, use the platform-specific type
  if (convexType === 'post' && platform) {
    switch (platform) {
      case 'facebook': return 'facebook';
      case 'instagram': return 'instagram';
      case 'twitter': return 'x';
      case 'reddit': return 'reddit';
      default: return 'markdown';
    }
  }

  // Otherwise map by type
  switch (convexType) {
    case 'post': return 'markdown';
    case 'document': return 'markdown';
    case 'note': return 'markdown';
    case 'campaign': return 'markdown';
    default: return 'markdown';
  }
}
