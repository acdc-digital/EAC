// Trash Management Hook
// lib/hooks/useTrash.ts

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";

export function useTrash(projectId?: Id<"projects">) {
  // Get deleted files from Convex
  const deletedFiles = useQuery(api.files.getDeletedFiles, projectId ? { projectId } : {});

  // Mutations
  const softDeleteFile = useMutation(api.files.softDeleteFile);
  const restoreFile = useMutation(api.files.restoreFile);
  const permanentlyDeleteFile = useMutation(api.files.permanentlyDeleteFile);

  // Soft delete a file (move to trash)
  const moveToTrash = async (fileId: Id<"files">, deletedBy?: string) => {
    try {
      await softDeleteFile({ id: fileId, deletedBy });
      console.log(`✅ File moved to trash`);
    } catch (error) {
      console.error(`❌ Error moving file to trash:`, error);
      throw error;
    }
  };

  // Restore a file from trash
  const restoreFromTrash = async (fileId: Id<"files">) => {
    try {
      await restoreFile({ id: fileId });
      console.log(`✅ File restored from trash`);
    } catch (error) {
      console.error(`❌ Error restoring file from trash:`, error);
      throw error;
    }
  };

  // Permanently delete a file
  const permanentlyDelete = async (fileId: Id<"files">) => {
    try {
      console.log(`🗑️ Starting permanent deletion for file ID: ${fileId}`);
      const result = await permanentlyDeleteFile({ id: fileId });
      console.log(`✅ File permanently deleted from database:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Error permanently deleting file:`, error);
      throw error;
    }
  };

  // Format Convex files into the format expected by the trash UI
  const trashItems = (deletedFiles || []).map(file => ({
    id: file._id,
    name: file.name,
    type: 'file' as const,
    category: 'project' as const, // or determine based on file.type
    deletedAt: new Date(file.updatedAt), // Using updatedAt as deletion timestamp
    originalData: {
      id: file._id,
      name: file.name,
      icon: 'FileText', // You might want to determine this based on file.type
      type: file.type || 'document',
      category: 'project' as const,
      content: file.content || '',
      filePath: file.path || `/${file.name}`,
      createdAt: new Date(file.createdAt),
      modifiedAt: new Date(file.lastModified),
      folderId: file.projectId, // Using projectId as folderId
      convexId: file._id,
    }
  }));

  return {
    // Data
    trashItems,
    deletedFiles,
    isLoading: deletedFiles === undefined,

    // Actions
    moveToTrash,
    restoreFromTrash,
    permanentlyDelete,

    // Raw mutations (for direct use if needed)
    softDeleteFile,
    restoreFile: restoreFile,
    permanentlyDeleteFile,
  };
}
