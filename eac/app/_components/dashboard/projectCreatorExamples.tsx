/**
 * Example integration of ProjectCreator with the EAC Explorer
 * This demonstrates how to integrate the project creator with your existing sidebar
 */

import { Project } from "@/store/projects/types";
import { Plus } from "lucide-react";
import { ProjectCreator } from "./projectCreator";

// Example 1: Replace the existing + button in dashSidebar.tsx
export const ProjectCreateButton = () => {
  return (
    <ProjectCreator
      className=""
      onProjectCreated={(project) => {
        console.log("New project created:", project);
        // Here you can:
        // 1. Add the project to local state
        // 2. Show a success message
        // 3. Navigate to the project
        // 4. Update the UI to show the new project
      }}
    />
  );
};

// Example 2: Custom trigger with different styling
export const CustomProjectCreator = () => {
  return (
    <ProjectCreator
      trigger={
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      }
      onProjectCreated={(project) => {
        // Custom handling after project creation
        console.log("Project created:", project.name);
      }}
    />
  );
};

// Example 3: Integration with existing sidebar structure
export const IntegratedProjectCreator = () => {
  const handleProjectCreated = (project: Project) => {
    // Here's where you could integrate with your existing editor store:
    // - Create a new project folder
    // - Open a default file for the project
    // - Update the sidebar to show the new project
    
    console.log("New project created:", project);
    
    // Example: You might want to create a folder in the existing system
    // createFolder(project.name, 'project');
    
    // Or navigate to a project view
    // router.push(`/projects/${project._id}`);
  };

  return (
    <div className="flex items-center gap-1">
      <ProjectCreator
        onProjectCreated={handleProjectCreated}
        userId="current-user-id" // Pass the actual user ID
      />
      {/* Other existing buttons */}
    </div>
  );
};
