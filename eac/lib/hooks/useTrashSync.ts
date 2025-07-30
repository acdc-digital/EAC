"use client";

import { api } from "@/convex/_generated/api";
import { useEditorStore } from "@/store";
import { TrashItem } from "@/store/editor/types";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { FileCode } from "lucide-react";
import { useEffect, useRef } from "react";

// Helper function to map database file types to ProjectFile types
const mapDatabaseTypeToFileType = (dbType: string) => {
  switch (dbType) {
    case 'post': return 'post-creator';
    case 'campaign': return 'social-connect';
    case 'note': return 'markdown';
    case 'document': return 'json';
    case 'image': return 'user-profile';
    case 'video': return 'user-profile';
    default: return 'json';
  }
};

export function useTrashSync() {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const hasInitialized = useRef(false);

  // Get the query functions for deleted items
  const getDeletedProjects = useQuery(api.trash.getDeletedProjects, 
    isAuthenticated && user ? { userId: user.id } : "skip"
  );
  const getDeletedFiles = useQuery(api.trash.getDeletedFiles, 
    isAuthenticated && user ? { userId: user.id } : "skip"
  );

  useEffect(() => {
    if (isAuthenticated && user && getDeletedProjects && getDeletedFiles && !hasInitialized.current) {
      // Initialize trash items from database
      const initializeTrash = async () => {
        try {
          // Convert the data to the format expected by the store
          const deletedProjects = getDeletedProjects || [];
          const deletedFiles = getDeletedFiles || [];
          
          // Convert database items to local trash items
          const trashItems: TrashItem[] = [];

          // Convert deleted projects
          deletedProjects.forEach((project) => {
            trashItems.push({
              id: `trash_${project.originalId}_${project.deletedAt}`,
              name: project.name,
              type: 'folder',
              originalData: {
                id: project.originalId,
                name: project.name,
                category: 'project', // Default to project category
                createdAt: new Date(project.originalCreatedAt),
                pinned: false,
              },
              deletedAt: new Date(project.deletedAt),
              category: 'project' // Default to project category
            });
          });

          // Convert deleted files
          deletedFiles.forEach((file) => {
            trashItems.push({
              id: `trash_${file.originalId}_${file.deletedAt}`,
              name: file.name,
              type: 'file',
              originalData: {
                id: file.originalId,
                name: file.name,
                type: mapDatabaseTypeToFileType(file.type),
                icon: FileCode, // Use a default icon
                content: file.content || '',
                category: 'project',
                createdAt: new Date(file.originalCreatedAt),
                modifiedAt: new Date(file.originalUpdatedAt),
                filePath: file.path || `/${file.name}`,
                folderId: undefined,
              },
              deletedAt: new Date(file.deletedAt),
              category: 'project'
            });
          });

          // Update the store with trash items directly
          useEditorStore.setState({ trashItems });
          hasInitialized.current = true;
          
          console.log(`Initialized ${trashItems.length} trash items from database`);
        } catch (error) {
          console.error('Failed to initialize trash from database:', error);
        }
      };

      initializeTrash();
    }
  }, [isAuthenticated, user, getDeletedProjects, getDeletedFiles]);

  return { isAuthenticated, user };
}
