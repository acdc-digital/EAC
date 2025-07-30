import { Id } from "@/convex/_generated/dataModel";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
    Project,
    ProjectStats,
    ProjectStatus,
    ProjectStoreState
} from "./types";

/**
 * Initial state for the project store
 */
const initialState = {
  // Data
  projects: [],
  currentProject: null,
  projectStats: null,
  
  // UI State
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  
  // Filters
  statusFilter: "all" as ProjectStatus | "all",
  userFilter: null,
};

/**
 * Project store using Zustand
 * Manages project data, UI state, and filtering for the EAC dashboard
 */
export const useProjectStore = create<ProjectStoreState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Actions
      setProjects: (projects: Project[]) => 
        set({ projects }, false, "setProjects"),

      setCurrentProject: (project: Project | null) => 
        set({ currentProject: project }, false, "setCurrentProject"),

      setProjectStats: (stats: ProjectStats) => 
        set({ projectStats: stats }, false, "setProjectStats"),

      setIsLoading: (loading: boolean) => 
        set({ isLoading: loading }, false, "setIsLoading"),

      setIsCreating: (creating: boolean) => 
        set({ isCreating: creating }, false, "setIsCreating"),

      setIsUpdating: (updating: boolean) => 
        set({ isUpdating: updating }, false, "setIsUpdating"),

      setError: (error: string | null) => 
        set({ error }, false, "setError"),

      setStatusFilter: (filter: ProjectStatus | "all") => 
        set({ statusFilter: filter }, false, "setStatusFilter"),

      setUserFilter: (userId: string | null) => 
        set({ userFilter: userId }, false, "setUserFilter"),

      // Helper methods
      addProject: (project: Project) =>
        set(
          (state) => ({ 
            projects: [project, ...state.projects] 
          }),
          false,
          "addProject"
        ),

      updateProject: (projectId: Id<"projects">, updates: Partial<Project>) =>
        set(
          (state) => ({
            projects: state.projects.map((p) =>
              p._id === projectId ? { ...p, ...updates } : p
            ),
            currentProject: 
              state.currentProject?._id === projectId
                ? { ...state.currentProject, ...updates }
                : state.currentProject,
          }),
          false,
          "updateProject"
        ),

      removeProject: (projectId: Id<"projects">) =>
        set(
          (state) => ({
            projects: state.projects.filter((p) => p._id !== projectId),
            currentProject:
              state.currentProject?._id === projectId
                ? null
                : state.currentProject,
          }),
          false,
          "removeProject"
        ),

      getProjectById: (projectId: Id<"projects">) => {
        const { projects } = get();
        return projects.find((p) => p._id === projectId);
      },

      getProjectsByStatus: (status: ProjectStatus) => {
        const { projects } = get();
        return projects.filter((p) => p.status === status);
      },

      clearError: () => 
        set({ error: null }, false, "clearError"),

      reset: () => 
        set(initialState, false, "reset"),
    }),
    {
      name: "project-store",
      store: "ProjectStore",
    }
  )
);
