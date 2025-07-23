import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
// import { useEditorStore } from "@/store";
import { useProjectStore } from "@/store/projects";
import { CreateProjectArgs, UpdateProjectArgs } from "@/store/projects/types";
import { useMutation, useQuery } from "convex/react";
import React from "react";

/**
 * Custom hook for project operations using Convex and Zustand
 * Provides methods to interact with projects in the database
 */
export const useProjects = () => {
  const {
    setProjects,
    setProjectStats,
    setIsLoading,
    setIsCreating,
    setIsUpdating,
    setError,
    clearError,
    addProject,
  } = useProjectStore();

  // Get editor store for syncing sidebar folders
  // const { createFolder } = useEditorStore();

  // Convex mutations
  const createProjectMutation = useMutation(api.projects.createProject);
  const deleteProjectMutation = useMutation(api.trash.deleteProject);
  
  // Re-enable Convex queries now that functions are deployed
  const generateProjectNumberQuery = useQuery(api.projects.generateProjectNumber, {});

  // Convex queries  
  const projectsQuery = useQuery(api.projects.getProjects, {});
  const projectStatsQuery = useQuery(api.projects.getProjectStats, {});

  // Update store when data changes
  React.useEffect(() => {
    if (projectsQuery) {
      setProjects(projectsQuery);
      setIsLoading(false);
    }
  }, [projectsQuery, setProjects, setIsLoading]);

  React.useEffect(() => {
    if (projectStatsQuery) {
      // Map to expected format
      const stats = {
        total: projectStatsQuery.total || 0,
        active: projectStatsQuery.active || 0,
        completed: 0,
        onHold: 0,
        totalBudget: 0
      };
      setProjectStats(stats);
    } else {
      // Set default stats when no data
      const defaultStats = {
        total: 0,
        active: 0,
        completed: 0,
        onHold: 0,
        totalBudget: 0
      };
      setProjectStats(defaultStats);
    }
  }, [projectStatsQuery, setProjectStats]);

  // Temporarily disable sync until Convex functions are fixed
  /*
  // Sync database projects with sidebar folders (prevent duplicates)
  React.useEffect(() => {
    if (projectsQuery && projectsQuery.length > 0) {
      const { projectFolders } = useEditorStore.getState();
      
      // Find projects that exist in database but not in sidebar
      const existingFolderNames = new Set(projectFolders.map(f => f.name.toLowerCase()));
      const newProjects = projectsQuery.filter(project => 
        project.name && !existingFolderNames.has(project.name.toLowerCase())
      );
      
      // Add missing projects to sidebar (sequential operation with delay to prevent ID conflicts)
      if (newProjects.length > 0) {
        console.log(`Syncing ${newProjects.length} new projects to sidebar:`, newProjects.map(p => p.name));
        
        // Process projects sequentially with a small delay to ensure unique IDs
        newProjects.forEach((project, index) => {
          setTimeout(() => {
            createFolder(project.name, 'project');
          }, index * 10); // 10ms delay between each folder creation
        });
      }
    }
  }, [projectsQuery, createFolder]);
  */

  /**
   * Create a new project
   */
  const createProject = async (projectData: CreateProjectArgs) => {
    try {
      setIsCreating(true);
      clearError();

      // Generate project number if not provided
      let projectNo = projectData.projectNo;
      if (!projectNo && generateProjectNumberQuery) {
        projectNo = String(generateProjectNumberQuery);
      }

      const newProject = await createProjectMutation({
        ...projectData,
        projectNo,
      });

      if (newProject) {
        addProject(newProject);
      }

      return newProject;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create project";
      setError(errorMessage);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Update an existing project
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateProject = async (_args: UpdateProjectArgs) => {
    try {
      setIsUpdating(true);
      clearError();

      // Note: Update functionality not available in current API
      // Would need to implement api.projects.updateProject
      throw new Error("Update functionality not implemented");
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update project";
      setError(errorMessage);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete a project (moves to trash)
   */
  const deleteProject = async (projectId: Id<"projects">, deletedBy?: string) => {
    try {
      setIsUpdating(true);
      clearError();

      // Call the trash system to soft delete the project
      await deleteProjectMutation({
        id: projectId,
        deletedBy: deletedBy || 'user',
      });

      console.log(`✅ Project moved to database trash successfully`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete project";
      setError(errorMessage);
      console.error('❌ Error moving project to database trash:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Return the hook interface
  return {
    // State
    projects: projectsQuery ?? [],
    projectStats: projectStatsQuery,
    nextProjectNumber: generateProjectNumberQuery || 1,
    isLoading: projectsQuery === undefined,
    isCreating: useProjectStore.getState().isCreating,
    isUpdating: useProjectStore.getState().isUpdating,
    error: useProjectStore.getState().error,
    
    // Actions
    createProject,
    updateProject,
    deleteProject,
    clearError,
  };
};
