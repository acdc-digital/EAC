"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFiles } from "@/lib/hooks/useFiles";
import { useProjectStore } from "@/store/projects";
import { File, FileText, FolderOpen, Image, Video } from "lucide-react";

/**
 * FilesDatabase component displays files stored in the Convex database
 * This helps visualize when files are successfully synced from the UI to the database
 */
export function FilesDatabase() {
  const { projects } = useProjectStore();
  const currentProject = projects.length > 0 ? projects[0] : null;
  const { files, fileStats, isLoading } = useFiles(currentProject?._id || null);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'post':
      case 'note':
        return FileText;
      case 'image':
        return Image;
      case 'video':
        return Video;
      default:
        return File;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'post':
        return 'bg-blue-500';
      case 'note':
        return 'bg-green-500';
      case 'document':
        return 'bg-purple-500';
      case 'image':
        return 'bg-yellow-500';
      case 'video':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPlatformColor = (platform?: string) => {
    switch (platform) {
      case 'facebook':
        return 'bg-blue-600';
      case 'instagram':
        return 'bg-pink-500';
      case 'twitter':
        return 'bg-sky-500';
      case 'reddit':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-[#2d2d2d] border-[#454545] p-4">
        <h3 className="text-lg font-semibold mb-4 text-[#cccccc]">Database Files</h3>
        <div className="text-[#858585] text-center py-8">Loading files...</div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#2d2d2d] border-[#454545] p-4">
      <div className="flex items-center gap-2 mb-4">
        <FolderOpen className="w-5 h-5 text-[#c09553]" />
        <h3 className="text-lg font-semibold text-[#cccccc]">Database Files</h3>
        {currentProject && (
          <Badge variant="outline" className="text-xs border-[#454545] text-[#858585]">
            {currentProject.name}
          </Badge>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-[#1e1e1e] p-2 rounded border border-[#454545]">
          <div className="text-xs text-[#858585]">Total Files</div>
          <div className="text-lg font-semibold text-[#cccccc]">{fileStats.total}</div>
        </div>
        <div className="bg-[#1e1e1e] p-2 rounded border border-[#454545]">
          <div className="text-xs text-[#858585]">Posts</div>
          <div className="text-lg font-semibold text-[#cccccc]">{fileStats.byType.post || 0}</div>
        </div>
        <div className="bg-[#1e1e1e] p-2 rounded border border-[#454545]">
          <div className="text-xs text-[#858585]">Documents</div>
          <div className="text-lg font-semibold text-[#cccccc]">{fileStats.byType.document || 0}</div>
        </div>
        <div className="bg-[#1e1e1e] p-2 rounded border border-[#454545]">
          <div className="text-xs text-[#858585]">Notes</div>
          <div className="text-lg font-semibold text-[#cccccc]">{fileStats.byType.note || 0}</div>
        </div>
      </div>

      {/* Files List */}
      {files.length === 0 ? (
        <div className="text-[#858585] text-center py-8">
          {currentProject ? 'No files in database yet. Create some files to see them here.' : 'No projects available. Create a project first.'}
        </div>
      ) : (
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {files.map((file) => {
              const IconComponent = getFileIcon(file.type);
              return (
                <div key={file._id} className="bg-[#1e1e1e] p-3 rounded border border-[#454545] hover:bg-[#252525] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <IconComponent className="w-4 h-4 flex-shrink-0 text-[#858585]" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-[#cccccc] font-medium truncate">{file.name}</div>
                        {file.path && (
                          <div className="text-xs text-[#858585] truncate">{file.path}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Badge className={`${getTypeColor(file.type)} text-white text-xs`}>
                        {file.type}
                      </Badge>
                      {file.platform && (
                        <Badge className={`${getPlatformColor(file.platform)} text-white text-xs`}>
                          {file.platform}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between text-xs text-[#858585]">
                    <div>
                      {file.size && <span>{Math.round(file.size / 1024)} KB</span>}
                      {file.extension && <span className="ml-2">.{file.extension}</span>}
                    </div>
                    <div>
                      {new Date(file.createdAt).toLocaleDateString()} {new Date(file.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {file.content && (
                    <div className="mt-2 text-xs text-[#858585] line-clamp-2 bg-[#0e0e0e] p-2 rounded border border-[#3d3d3d]">
                      {file.content.substring(0, 150)}...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
