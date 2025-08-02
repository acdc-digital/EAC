// File Sync Hook
// lib/hooks/useFileSync.ts

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEditorStore } from "@/store";
import { ProjectFile } from "@/store/editor/types";
import { useMutation } from "convex/react";
import { useEffect } from "react";

export function useFileSync() {
  const createFileInDB = useMutation(api.files.createFile);
  const { updateFileConvexId } = useEditorStore();

  // Listen for file creation events and sync to Convex
  useEffect(() => {
    const handleFileCreated = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { file, projectId } = customEvent.detail;
      
      try {
        console.log('🔄 Syncing file to Convex:', file.name, { projectId, hasProjectId: !!projectId });
        
        // Skip sync if no project ID (folder wasn't synced to Convex)
        if (!projectId) {
          console.log('⏭️ Skipping Convex sync - no project ID available');
          return;
        }
        
        // Convert file type to Convex format
        const convexFileType = mapToConvexFileType(file.type);
        
        // Create file in Convex database
        const convexFile = await createFileInDB({
          name: file.name,
          type: convexFileType,
          extension: getFileExtension(file.type),
          content: file.content,
          projectId: projectId as Id<"projects">,
          path: file.filePath,
          mimeType: getMimeType(file.type),
          platform: getSocialPlatform(file.type),
        });

        if (convexFile) {
          // Update the local file with the Convex ID
          updateFileConvexId(file.id, convexFile._id);
          console.log(`✅ File "${file.name}" synced to Convex with ID: ${convexFile._id}`);
        }
      } catch (error) {
        console.error(`❌ Failed to sync file "${file.name}" to Convex:`, error);
      }
    };

    // Add event listener
    window.addEventListener('fileCreated', handleFileCreated);

    // Cleanup
    return () => {
      window.removeEventListener('fileCreated', handleFileCreated);
    };
  }, [createFileInDB, updateFileConvexId]);

  return {
    // You could add manual sync functions here if needed
  };
}

// Helper functions
function mapToConvexFileType(editorType: ProjectFile['type']): "post" | "campaign" | "note" | "document" | "image" | "video" | "other" {
  switch (editorType) {
    case 'facebook':
    case 'reddit':
    case 'instagram':
    case 'x':
      return 'post';
    case 'markdown':
      return 'document';
    case 'typescript':
    case 'javascript':
    case 'json':
      return 'document';
    case 'excel':
      return 'document';
    case 'pdf':
      return 'document';
    default:
      return 'other';
  }
}

function getFileExtension(type: ProjectFile['type']): string {
  switch (type) {
    case 'typescript': return 'ts';
    case 'javascript': return 'js';
    case 'json': return 'json';
    case 'markdown': return 'md';
    case 'excel': return 'xlsx';
    case 'pdf': return 'pdf';
    case 'facebook':
    case 'reddit':
    case 'instagram':
    case 'x':
      return 'md'; // Social media posts as markdown
    default: return 'txt';
  }
}

function getMimeType(type: ProjectFile['type']): string {
  switch (type) {
    case 'typescript': return 'text/typescript';
    case 'javascript': return 'text/javascript';
    case 'json': return 'application/json';
    case 'markdown': return 'text/markdown';
    case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'pdf': return 'application/pdf';
    case 'facebook':
    case 'reddit':
    case 'instagram':
    case 'x':
      return 'text/markdown';
    default: return 'text/plain';
  }
}

function getSocialPlatform(type: ProjectFile['type']): "facebook" | "instagram" | "twitter" | "linkedin" | "reddit" | "youtube" | undefined {
  switch (type) {
    case 'facebook': return 'facebook';
    case 'instagram': return 'instagram';
    case 'x': return 'twitter';
    case 'reddit': return 'reddit';
    default: return undefined;
  }
}
