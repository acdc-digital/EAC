"use client";

import { fileHelpers, useFiles } from "@/lib/hooks/useFiles";
import type { ProjectFile } from "@/store/editor/types";
import { useProjectStore } from "@/store/projects";
import { useEffect } from "react";

/**
 * FileSync component handles syncing locally created files to the Convex database
 * This component listens for custom file creation events and saves them to the database
 */
export function FileSync() {
  const { projects } = useProjectStore();
  const { createFile } = useFiles(null);

  useEffect(() => {
    const handleFileCreated = async (event: CustomEvent<{ file: ProjectFile; projectId?: string }>) => {
      const { file, projectId } = event.detail;
      
      try {
        // Find the corresponding project in the database
        // For now, we'll create a mapping between local folders and database projects
        let dbProjectId = null;
        
        if (projectId && projects.length > 0) {
          // Try to find project by name match (folder name -> project name)
          const matchingProject = projects.find((p) => 
            p.name.toLowerCase() === file.name.toLowerCase() ||
            p.name.toLowerCase() === projectId.toLowerCase()
          );
          
          if (matchingProject) {
            dbProjectId = matchingProject._id;
          }
        }
        
        // If no specific project found, use the first available project or create a default one
        if (!dbProjectId && projects.length > 0) {
          dbProjectId = projects[0]._id;
        }
        
        // Skip database save if no projects exist yet
        if (!dbProjectId) {
          console.log('No projects available in database, skipping file sync');
          return;
        }

        // Map ProjectFile type to database file type
        const mapFileType = (type: ProjectFile['type']): "post" | "campaign" | "note" | "document" | "image" | "video" | "other" => {
          switch (type) {
            case 'facebook':
            case 'instagram':
            case 'reddit':
            case 'x':
              return 'post';
            case 'markdown':
              return 'note';
            case 'excel':
            case 'json':
            case 'typescript':
            case 'javascript':
            case 'pdf':
              return 'document';
            default:
              return 'other';
          }
        };

        // Map social platform type
        const mapPlatform = (type: ProjectFile['type']): "facebook" | "instagram" | "twitter" | "linkedin" | "reddit" | "youtube" | undefined => {
          switch (type) {
            case 'facebook':
              return 'facebook';
            case 'instagram':
              return 'instagram';
            case 'x':
              return 'twitter';
            case 'reddit':
              return 'reddit';
            default:
              return undefined;
          }
        };

        // Prepare file data for database
        const extension = fileHelpers.getExtension(file.name);
        const mimeType = fileHelpers.getMimeType(extension);
        const contentSize = file.content ? new Blob([file.content]).size : 0;

        const fileData = {
          name: file.name,
          type: mapFileType(file.type),
          projectId: dbProjectId,
          content: file.content,
          extension: extension || undefined,
          size: contentSize > 0 ? contentSize : undefined,
          path: file.filePath,
          mimeType,
          platform: mapPlatform(file.type),
          postStatus: file.status === 'draft' ? 'draft' as const : undefined,
          // Add userId if available from auth context
          userId: undefined, // TODO: Add user context when available
        };

        // Save to database
        const savedFile = await createFile(fileData);
        console.log('File saved to database:', savedFile);

      } catch (error) {
        console.error('Failed to sync file to database:', error);
      }
    };

    // Listen for file creation events
    const eventHandler = (event: Event) => {
      const customEvent = event as CustomEvent<{ file: ProjectFile; projectId?: string }>;
      handleFileCreated(customEvent);
    };
    
    window.addEventListener('fileCreated', eventHandler);

    // Cleanup listener
    return () => {
      window.removeEventListener('fileCreated', eventHandler);
    };
  }, [createFile, projects]);

  // This component doesn't render anything
  return null;
}
