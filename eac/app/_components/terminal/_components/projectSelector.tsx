// Project Selector Component for Agent File Creation - Terminal Style
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/projectSelector.tsx

"use client";

import { api } from "@/convex/_generated/api";
import { Project } from "@/store/projects/types";
import { useQuery } from "convex/react";
import { CheckCircle, ChevronDown, ChevronRight, Clock, Folder, Plus, XCircle } from "lucide-react";
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
  const allProjects = useQuery(api.projects.getProjects, {}) || [];
  // Filter out system folders - only show user-created projects
  const projects = allProjects.filter((project: Project) => 
    project.name.toLowerCase() !== 'instructions' && 
    project.name.toLowerCase() !== 'content creation'
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
  const isLoading = allProjects === undefined;

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleConfirm = () => {
    if (selectedProject) {
      onProjectSelected(selectedProject);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-[#4ec9b0]';
      case 'completed':
        return 'text-[#569cd6]';
      case 'on-hold':
        return 'text-[#dcdcaa]';
      default:
        return 'text-[#858585]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3 h-3 text-[#858585]" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-[#858585]" />;
      case 'on-hold':
        return <Clock className="w-3 h-3 text-[#858585]" />;
      default:
        return <XCircle className="w-3 h-3 text-[#858585]" />;
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-[#858585]">
        <Folder className="w-3.5 h-3.5 text-[#4ec9b0]" />
        <span>Project Selection</span>
        {isLoading && <Clock className="w-3 h-3 text-yellow-400 animate-spin" />}
      </div>

      {/* File Details */}
      {fileDetails && (
        <div className="flex items-center gap-2 text-xs text-[#858585]">
          <Plus className="w-3 h-3 text-[#4ec9b0]" />
          <span>Creating:</span>
          <span className="text-[#cccccc] font-mono">{fileDetails.fileName}</span>
          <span className="text-[#858585]">({fileDetails.fileType})</span>
        </div>
      )}

      {/* Projects List Drawer */}
      <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded">
        <button
          onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
          className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
        >
          {isProjectsExpanded ? 
            <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
            <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
          }
          <span className="text-xs text-[#007acc] flex-1 text-left">
            Available Projects ({projects.length})
          </span>
        </button>
        
        {isProjectsExpanded && (
          <div className="px-2 pb-2">
            {isLoading ? (
              <div className="text-[10px] text-[#858585] py-1">
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="text-[10px] text-[#858585] py-1">
                No projects found. Create a project first.
              </div>
            ) : (
              <div className="space-y-0">
                {projects.map((project: Project) => (
                  <button
                    key={project._id}
                    onClick={() => handleProjectSelect(project)}
                    className={`w-full flex items-center justify-between px-1 hover:bg-[#2d2d2d]/30 py-1 text-left ${
                      selectedProject?._id === project._id
                        ? 'bg-[#007acc]/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getStatusIcon(project.status)}
                      <span className={`text-xs truncate ${
                        selectedProject?._id === project._id
                          ? 'text-[#007acc]'
                          : 'text-[#cccccc]'
                      }`}>
                        {project.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#858585] ml-2">
                      select
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Project Preview */}
      {selectedProject && (
        <div className="flex items-center gap-2 text-xs text-[#858585]">
          <CheckCircle className="w-3 h-3 text-[#007acc]" />
          <span>Selected:</span>
          <span className="text-[#cccccc] font-mono">{selectedProject.name}</span>
          <span className={`text-[10px] font-mono ${getStatusColor(selectedProject.status)}`}>
            ({selectedProject.status})
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-1">
        <div className="text-xs text-[#858585]">Add file to project</div>
        <div>
          <button
            onClick={handleConfirm}
            disabled={!selectedProject}
            className={`text-xs px-3 py-1 rounded border transition-colors ${
              selectedProject 
                ? 'bg-[#007acc] text-white border-[#007acc] hover:bg-[#1e90ff] hover:border-[#1e90ff]' 
                : 'bg-transparent text-[#454545] border-[#454545] cursor-not-allowed'
            }`}
          >
            Confirm
          </button>
        </div>
        
        <div className="text-xs text-[#858585]">Cancel operation</div>
        <div>
          <button
            onClick={onCancel}
            className="text-xs text-[#858585] hover:text-[#cccccc] underline-offset-2 hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
