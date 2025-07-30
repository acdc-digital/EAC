import { Id } from "@/convex/_generated/dataModel";

/**
 * Project status types
 */
export type ProjectStatus = "active" | "completed" | "on-hold";

/**
 * Project interface matching Convex schema
 */
export interface Project {
  _id: Id<"projects">;
  _creationTime: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  budget?: number;
  projectNo?: string;
  userId?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Arguments for creating a new project
 */
export interface CreateProjectArgs {
  name: string;
  description?: string;
  status?: ProjectStatus;
  budget?: number;
  projectNo?: string;
  userId?: string;
}

/**
 * Arguments for updating a project
 */
export interface UpdateProjectArgs {
  projectId: Id<"projects">;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  budget?: number;
  projectNo?: string;
}

/**
 * Project statistics
 */
export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  onHold: number;
  totalBudget: number;
}

/**
 * Project store state interface
 */
export interface ProjectStoreState {
  // Data
  projects: Project[];
  currentProject: Project | null;
  projectStats: ProjectStats | null;
  
  // UI State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  
  // Filters
  statusFilter: ProjectStatus | "all";
  userFilter: string | null;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setProjectStats: (stats: ProjectStats) => void;
  setIsLoading: (loading: boolean) => void;
  setIsCreating: (creating: boolean) => void;
  setIsUpdating: (updating: boolean) => void;
  setError: (error: string | null) => void;
  setStatusFilter: (filter: ProjectStatus | "all") => void;
  setUserFilter: (userId: string | null) => void;
  
  // Helper methods
  addProject: (project: Project) => void;
  updateProject: (projectId: Id<"projects">, updates: Partial<Project>) => void;
  removeProject: (projectId: Id<"projects">) => void;
  getProjectById: (projectId: Id<"projects">) => Project | undefined;
  getProjectsByStatus: (status: ProjectStatus) => Project[];
  clearError: () => void;
  reset: () => void;
}
