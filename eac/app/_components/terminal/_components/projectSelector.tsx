// Project Selector Component for Agent File Creation
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/projectSelector.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Project } from "@/store/projects/types";
import { useQuery } from "convex/react";
import { Folder, Plus } from "lucide-react";
import { useState } from "react";

interface ProjectSelectorProps {
  onProjectSelected: (project: Project) => void;
  onCancel: () => void;
  fileDetails?: {
    fileName: string;
    fileType: string;
    description?: string;
  };
  className?: string;
}

export function ProjectSelector({ 
  onProjectSelected, 
  onCancel, 
  fileDetails, 
  className = "" 
}: ProjectSelectorProps) {
  const projects = useQuery(api.projects.getProjects, {}) || [];
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const isLoading = projects === undefined;

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find((p: Project) => p._id === projectId);
    if (project) {
      setSelectedProject(project);
    }
  };

  const handleConfirm = () => {
    if (selectedProject) {
      onProjectSelected(selectedProject);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#4ec9b0]/20 text-[#4ec9b0] border-[#4ec9b0]/30';
      case 'completed':
        return 'bg-[#569cd6]/20 text-[#569cd6] border-[#569cd6]/30';
      case 'on-hold':
        return 'bg-[#dcdcaa]/20 text-[#dcdcaa] border-[#dcdcaa]/30';
      default:
        return 'bg-[#858585]/20 text-[#858585] border-[#858585]/30';
    }
  };

  return (
    <Card className={`bg-[#1e1e1e] border-[#2d2d2d] ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#4ec9b0]/20 rounded-lg">
            <Folder className="w-4 h-4 text-[#4ec9b0]" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-sm text-[#cccccc] mb-1">
              Select Project
            </CardTitle>
            <CardDescription className="text-xs text-[#858585]">
              Choose which project to add the new file to
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* File Details Preview */}
        {fileDetails && (
          <div className="p-3 bg-[#2d2d2d] rounded-lg border border-[#454545]">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="w-3 h-3 text-[#4ec9b0]" />
              <span className="text-xs font-medium text-[#cccccc]">
                Creating File
              </span>
            </div>
            <div className="text-xs text-[#b3b3b3]">
              <div><span className="text-[#858585]">Name:</span> {fileDetails.fileName}</div>
              <div><span className="text-[#858585]">Type:</span> {fileDetails.fileType}</div>
              {fileDetails.description && (
                <div><span className="text-[#858585]">Description:</span> {fileDetails.description}</div>
              )}
            </div>
          </div>
        )}

        {/* Project Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#cccccc]">
            Choose Project
          </label>
          
          {isLoading ? (
            <div className="text-xs text-[#858585] py-2">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-xs text-[#858585] py-2">
              No projects found. Create a project first.
            </div>
          ) : (
            <Select onValueChange={handleProjectSelect} value={selectedProject?._id || ""}>
              <SelectTrigger className="bg-[#2d2d2d] border-[#454545] text-[#cccccc] text-xs">
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent className="bg-[#2d2d2d] border-[#454545]">
                {projects.map((project: Project) => (
                  <SelectItem 
                    key={project._id} 
                    value={project._id}
                    className="text-[#cccccc] hover:bg-[#252526] focus:bg-[#252526] text-xs"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{project.name}</span>
                      <Badge 
                        variant="outline" 
                        className={`ml-2 text-[10px] ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Selected Project Preview */}
        {selectedProject && (
          <div className="p-3 bg-[#252526] rounded-lg border border-[#454545]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-[#cccccc]">
                  {selectedProject.name}
                </div>
                {selectedProject.description && (
                  <div className="text-[10px] text-[#858585] mt-1">
                    {selectedProject.description}
                  </div>
                )}
              </div>
              <Badge 
                variant="outline" 
                className={`text-[10px] ${getStatusColor(selectedProject.status)}`}
              >
                {selectedProject.status}
              </Badge>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleConfirm}
            disabled={!selectedProject}
            className="flex-1 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs h-8"
          >
            Add to Project
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="px-3 bg-transparent border-[#454545] text-[#cccccc] hover:bg-[#252526] text-xs h-8"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
