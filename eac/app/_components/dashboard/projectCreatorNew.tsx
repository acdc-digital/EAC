"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProjects } from "@/lib/hooks/useProjects";
import { useProjectStore } from "@/store/projects";
import { Project, ProjectStatus } from "@/store/projects/types";
import { Loader2, Plus } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface ProjectCreatorProps {
  trigger?: React.ReactNode;
  onProjectCreated?: (project: Project) => void;
  className?: string;
  userId?: string;
}

export function ProjectCreator({ 
  trigger, 
  onProjectCreated, 
  className = "",
  userId 
}: ProjectCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("active");
  
  const { createProject, nextProjectNumber } = useProjects();
  const { isCreating, error, clearError } = useProjectStore();
  
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Clear form when dialog closes
  const resetForm = useCallback(() => {
    setProjectName("");
    setDescription("");
    setBudget("");
    setStatus("active");
    clearError();
  }, [clearError]);

  // Focus on name input when dialog opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isOpen]);

  // Clear form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      console.error("Project name is required");
      return;
    }

    try {
      const budgetNumber = budget ? parseFloat(budget) : undefined;
      
      const newProject = await createProject({
        name: projectName.trim(),
        description: description.trim() || undefined,
        budget: budgetNumber,
        status,
        userId,
        projectNo: nextProjectNumber,
      });

      if (newProject) {
        console.log(`Project "${newProject.name}" created successfully!`);
        setIsOpen(false);
        onProjectCreated?.(newProject as Project);
      }
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e as React.FormEvent);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const defaultTrigger = (
    <button
      className={`hover:bg-[#2d2d2d] p-0.5 rounded transition-colors ${className}`}
      aria-label="Create new project"
    >
      <Plus className="w-3 h-3" />
    </button>
  );

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || defaultTrigger}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project in your EAC workspace. The project will be saved to your database.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            <div className="space-y-4 py-4">
              {/* Project Name */}
              <div className="space-y-2">
                <label htmlFor="project-name" className="text-sm font-medium">
                  Project Name *
                </label>
                <Input
                  ref={nameInputRef}
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  disabled={isCreating}
                />
              </div>

              {/* Project Number (Auto-generated) */}
              {nextProjectNumber && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Project Number
                  </label>
                  <Input
                    value={nextProjectNumber}
                    disabled
                    className="bg-muted text-muted-foreground"
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief project description (optional)"
                  className="resize-none"
                  rows={3}
                  disabled={isCreating}
                />
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <label htmlFor="budget" className="text-sm font-medium">
                  Budget
                </label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0.00"
                  disabled={isCreating}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <Select 
                  value={status} 
                  onValueChange={(value: ProjectStatus) => setStatus(value)} 
                  disabled={isCreating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Error Display */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !projectName.trim()}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
