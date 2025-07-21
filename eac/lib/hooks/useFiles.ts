import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export interface FileCreationArgs {
  name: string;
  type: "post" | "campaign" | "note" | "document" | "image" | "video" | "other";
  projectId: Id<"projects">;
  content?: string;
  extension?: string;
  size?: number;
  userId?: string;
  path?: string;
  mimeType?: string;
  platform?: "facebook" | "instagram" | "twitter" | "linkedin" | "reddit" | "youtube";
  postStatus?: "draft" | "scheduled" | "published" | "archived";
  scheduledAt?: number;
}

export interface FileUpdateArgs {
  name?: string;
  content?: string;
  size?: number;
  path?: string;
  mimeType?: string;
  platform?: "facebook" | "instagram" | "twitter" | "linkedin" | "reddit" | "youtube";
  postStatus?: "draft" | "scheduled" | "published" | "archived";
  scheduledAt?: number;
}

export function useFiles(projectId: Id<"projects"> | null, includeDeleted = false) {
  const files = useQuery(
    api.files.getFilesByProject, 
    projectId ? { projectId, includeDeleted } : "skip"
  );
  
  const createFile = useMutation(api.files.createFile);
  const updateFile = useMutation(api.files.updateFile);
  const deleteFile = useMutation(api.files.deleteFile);
  const restoreFile = useMutation(api.files.restoreFile);

  const fileStats = useQuery(
    api.files.getProjectFileStats,
    projectId ? { projectId } : "skip"
  );

  return {
    files: files ?? [],
    fileStats: fileStats ?? {
      total: 0,
      byType: {},
      byPlatform: {},
      totalSize: 0,
      lastModified: 0,
    },
    isLoading: files === undefined,
    createFile,
    updateFile,
    deleteFile,
    restoreFile,
  };
}

export function useFilesByType(
  projectId: Id<"projects"> | null, 
  type: "post" | "campaign" | "note" | "document" | "image" | "video" | "other"
) {
  const files = useQuery(
    api.files.getFilesByType,
    projectId ? { projectId, type } : "skip"
  );

  return {
    files: files ?? [],
    isLoading: files === undefined,
  };
}

export function useFilesByPlatform(
  projectId: Id<"projects"> | null,
  platform: "facebook" | "instagram" | "twitter" | "linkedin" | "reddit" | "youtube"
) {
  const files = useQuery(
    api.files.getFilesByPlatform,
    projectId ? { projectId, platform } : "skip"
  );

  return {
    files: files ?? [],
    isLoading: files === undefined,
  };
}

export function useFile(fileId: Id<"files"> | null) {
  const file = useQuery(
    api.files.getFile,
    fileId ? { fileId } : "skip"
  );

  return {
    file,
    isLoading: file === undefined,
  };
}

export function useFileSearch(projectId: Id<"projects"> | null, searchTerm: string) {
  const files = useQuery(
    api.files.searchFiles,
    projectId && searchTerm.length > 0 ? { projectId, searchTerm } : "skip"
  );

  return {
    files: files ?? [],
    isLoading: files === undefined,
  };
}

// Helper functions for file operations
export const fileHelpers = {
  // Get file extension from filename
  getExtension: (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  },

  // Get MIME type from extension
  getMimeType: (extension: string): string => {
    const mimeTypes: Record<string, string> = {
      // Text files
      'txt': 'text/plain',
      'md': 'text/markdown',
      'json': 'application/json',
      'csv': 'text/csv',
      
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      
      // Videos
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      
      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  },

  // Determine file type from extension
  getFileType: (extension: string): "post" | "campaign" | "note" | "document" | "image" | "video" | "other" => {
    const ext = extension.toLowerCase();
    
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
      return 'image';
    }
    
    // Videos
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) {
      return 'video';
    }
    
    // Text/markdown files could be posts
    if (['md', 'txt'].includes(ext)) {
      return 'post';
    }
    
    // Documents
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(ext)) {
      return 'document';
    }
    
    return 'other';
  },

  // Format file size for display
  formatFileSize: (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },

  // Generate unique filename if conflict exists
  generateUniqueFilename: (baseName: string, existingFiles: Array<{ name: string }>): string => {
    const existing = existingFiles.map(f => f.name);
    if (!existing.includes(baseName)) return baseName;
    
    const parts = baseName.split('.');
    const ext = parts.length > 1 ? '.' + parts.pop() : '';
    const name = parts.join('.');
    
    let counter = 1;
    let newName = `${name} (${counter})${ext}`;
    
    while (existing.includes(newName)) {
      counter++;
      newName = `${name} (${counter})${ext}`;
    }
    
    return newName;
  },
};
