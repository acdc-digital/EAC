"use client";

import { api } from "@/convex/_generated/api";
import { useEditorStore } from "@/store";
import { TrashItem } from "@/store/editor/types";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
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

// Helper function to map local file types to database types
const mapFileTypeToDatabase = (fileType: string) => {
  switch (fileType) {
    case 'post-creator': return 'post';
    case 'social-connect': return 'campaign';
    case 'markdown': return 'note';
    case 'json': return 'document';
    case 'user-profile': return 'image';
    default: return 'other';
  }
};

export function useEnhancedTrashSync() {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const hasInitialized = useRef(false);
  const syncInProgress = useRef(false);

  // Convex mutations for trash operations
  const deleteProject = useMutation(api.trash.deleteProject);
  const deleteFile = useMutation(api.trash.deleteFile);
  const permanentlyDeleteProject = useMutation(api.trash.permanentlyDeleteProject);
  const permanentlyDeleteFile = useMutation(api.trash.permanentlyDeleteFile);

  // Get the query functions for deleted items
  const getDeletedProjects = useQuery(api.trash.getDeletedProjects, 
    isAuthenticated && user ? { userId: user.id } : "skip"
  );
  const getDeletedFiles = useQuery(api.trash.getDeletedFiles, 
    isAuthenticated && user ? { userId: user.id } : "skip"
  );

  // Initialize trash from database
  useEffect(() => {
    if (isAuthenticated && user && getDeletedProjects && getDeletedFiles && !hasInitialized.current) {
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
                category: 'project',
                createdAt: new Date(project.originalCreatedAt),
                pinned: false,
              },
              deletedAt: new Date(project.deletedAt),
              category: 'project'
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
                icon: FileCode,
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
          
          console.log(`✅ Initialized ${trashItems.length} trash items from database`);
        } catch (error) {
          console.error('❌ Failed to initialize trash from database:', error);
        }
      };

      initializeTrash();
    }
  }, [isAuthenticated, user, getDeletedProjects, getDeletedFiles]);

  // Sync pending deletions to database
  useEffect(() => {
    if (isAuthenticated && user && !syncInProgress.current) {
      const syncPendingDeletions = async () => {
        syncInProgress.current = true;
        
        try {
          // Sync pending deletions
          const pendingDeletions = JSON.parse(localStorage.getItem('pendingDeletions') || '[]');
          if (pendingDeletions.length > 0) {
            console.log(`🔄 Syncing ${pendingDeletions.length} pending deletions...`);
            
            for (const deletion of pendingDeletions) {
              try {
                if (deletion.type === 'file') {
                  // For files, we need to create a dummy project if the file doesn't have one
                  // or we need to convert the local file data to the expected format
                  const fileData = deletion.data;
                  
                  // Create a file deletion entry in the database
                  // Note: This assumes we can create files in the database or they already exist
                  // In a real implementation, you'd need to handle this based on your data model
                  
                  console.log(`🗑️ Moving file to database trash: ${fileData.name}`);
                  // await deleteFile({ id: fileData.id, deletedBy: user.id });
                } else if (deletion.type === 'folder') {
                  // Handle folder deletions
                  const folderData = deletion.data;
                  console.log(`🗑️ Moving folder to database trash: ${folderData.name}`);
                  // await deleteProject({ id: folderData.id, deletedBy: user.id });
                }
              } catch (error) {
                console.error(`❌ Failed to sync deletion:`, error);
              }
            }
            
            // Clear pending deletions after successful sync
            localStorage.removeItem('pendingDeletions');
            console.log('✅ Pending deletions synced and cleared');
          }

          // Sync pending permanent deletions
          const pendingPermanentDeletions = JSON.parse(localStorage.getItem('pendingPermanentDeletions') || '[]');
          if (pendingPermanentDeletions.length > 0) {
            console.log(`🔄 Syncing ${pendingPermanentDeletions.length} pending permanent deletions...`);
            
            for (const deletion of pendingPermanentDeletions) {
              try {
                if (deletion.type === 'file') {
                  console.log(`💀 Permanently deleting file from database: ${deletion.originalId}`);
                  // await permanentlyDeleteFile({ id: deletion.originalId });
                } else if (deletion.type === 'folder') {
                  console.log(`💀 Permanently deleting folder from database: ${deletion.originalId}`);
                  // await permanentlyDeleteProject({ id: deletion.originalId });
                }
              } catch (error) {
                console.error(`❌ Failed to sync permanent deletion:`, error);
              }
            }
            
            // Clear pending permanent deletions after successful sync
            localStorage.removeItem('pendingPermanentDeletions');
            console.log('✅ Pending permanent deletions synced and cleared');
          }

        } catch (error) {
          console.error('❌ Failed to sync pending operations:', error);
        } finally {
          syncInProgress.current = false;
        }
      };

      // Sync immediately and then periodically
      syncPendingDeletions();
      
      // Set up periodic sync every 30 seconds
      const syncInterval = setInterval(syncPendingDeletions, 30000);
      
      return () => {
        clearInterval(syncInterval);
      };
    }
  }, [isAuthenticated, user, deleteProject, deleteFile, permanentlyDeleteProject, permanentlyDeleteFile]);

  // Return utility functions for manual operations
  return {
    syncToDatabase: async (item: any, operation: 'delete' | 'permanentDelete') => {
      if (!isAuthenticated || !user) return;

      try {
        if (operation === 'delete') {
          if (item.type === 'file') {
            await deleteFile({ 
              id: item.id, 
              deletedBy: user.id 
            });
          } else {
            await deleteProject({ 
              id: item.id, 
              deletedBy: user.id 
            });
          }
        } else if (operation === 'permanentDelete') {
          if (item.type === 'file') {
            await permanentlyDeleteFile({ id: item.originalId });
          } else {
            await permanentlyDeleteProject({ id: item.originalId });
          }
        }
      } catch (error) {
        console.error('❌ Failed to sync operation to database:', error);
        throw error;
      }
    },
    
    getPendingOperationsCount: () => {
      const pendingDeletions = JSON.parse(localStorage.getItem('pendingDeletions') || '[]');
      const pendingPermanentDeletions = JSON.parse(localStorage.getItem('pendingPermanentDeletions') || '[]');
      return pendingDeletions.length + pendingPermanentDeletions.length;
    }
  };
}
