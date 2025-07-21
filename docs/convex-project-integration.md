# Convex Project Management Integration

This documentation explains how to integrate the new Convex-based project management system with your EAC dashboard.

## Overview

The system consists of:

1. **Convex Backend**:
   - `convex/schema.ts` - Updated with projects table and indexes
   - `convex/projects.ts` - CRUD operations for projects

2. **Frontend State Management**:
   - `store/projects/` - Zustand store for project state
   - `lib/hooks/useProjects.ts` - Custom hook integrating Convex with store

3. **UI Components**:
   - `app/_components/dashboard/projectCreator.tsx` - Project creation dialog
   - `app/_components/dashboard/projectCreatorExamples.tsx` - Integration examples

## Database Schema

The `projects` table includes:

- `name` (string, required) - Project name
- `description` (optional string) - Project description
- `status` (string) - "active", "completed", "on-hold"
- `budget` (optional number) - Project budget
- `projectNo` (optional string) - Auto-generated project number (PRJ-001, PRJ-002, etc.)
- `userId` (optional string) - User who owns the project
- `createdAt` (number) - Creation timestamp
- `updatedAt` (number) - Last update timestamp

## Integration Steps

### 1. Replace the + Button in EAC Explorer

In your `dashSidebar.tsx`, replace the existing Plus button:

```tsx
// Replace this:
<button
  onClick={() => setIsCreatingFolder(true)}
  className="hover:bg-[#2d2d2d] p-0.5 rounded transition-colors"
  aria-label="Create new project"
>
  <Plus className="w-3 h-3" />
</button>

// With this:
<ProjectCreator
  onProjectCreated={(project) => {
    // Handle the created project
    console.log("New project created:", project);
    // You can create a folder for the project:
    // createFolder(project.name, 'project');
  }}
/>
```

### 2. Import Required Components

Add these imports to your `dashSidebar.tsx`:

```tsx
import { ProjectCreator } from "./projectCreator";
import { useProjects } from "@/lib/hooks/useProjects";
```

### 3. Access Project Data

You can access all project data using the custom hook:

```tsx
const {
  createProject,
  updateProject,
  deleteProject,
  refreshProjects,
  nextProjectNumber,
} = useProjects();

// Get project data from store
const { projects, currentProject, projectStats, isLoading, error } =
  useProjectStore();
```

### 4. Project Operations

#### Create Project

```tsx
const newProject = await createProject({
  name: "My New Project",
  description: "Project description",
  status: "active",
  budget: 10000,
  userId: "user-id",
});
```

#### Update Project

```tsx
await updateProject({
  projectId: project._id,
  name: "Updated Name",
  status: "completed",
});
```

#### Delete Project

```tsx
await deleteProject(project._id);
```

#### Get Project Stats

```tsx
const stats = projectStats; // { total, active, completed, onHold, totalBudget }
```

## Usage Examples

### Basic Integration

```tsx
export function EACExplorer() {
  const handleProjectCreated = (project: Project) => {
    // Create a folder for the new project
    createFolder(project.name, "project");

    // Show success message
    console.log(`Project ${project.name} created!`);
  };

  return (
    <div className="p-2">
      <div className="flex items-center justify-between">
        <span>EAC Explorer</span>
        <ProjectCreator
          onProjectCreated={handleProjectCreated}
          userId={currentUser?.id}
        />
      </div>
    </div>
  );
}
```

### Custom Trigger

```tsx
<ProjectCreator
  trigger={
    <Button variant="outline" size="sm">
      <Plus className="w-4 h-4 mr-2" />
      New Project
    </Button>
  }
  onProjectCreated={handleProjectCreated}
/>
```

### Display Projects List

```tsx
export function ProjectsList() {
  const { projects, isLoading } = useProjectStore();

  if (isLoading) return <div>Loading projects...</div>;

  return (
    <div>
      {projects.map((project) => (
        <div key={project._id} className="project-item">
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <span className="status">{project.status}</span>
          {project.budget && <span>${project.budget}</span>}
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

The system includes built-in error handling:

```tsx
const { error, clearError } = useProjectStore();

// Display errors
if (error) {
  return <div className="error">{error}</div>;
}

// Clear errors when needed
clearError();
```

## TypeScript Types

All components are fully typed. Key types:

```tsx
import {
  Project,
  ProjectStatus,
  CreateProjectArgs,
  UpdateProjectArgs,
} from "@/store/projects/types";
```

## Next Steps

1. **User Authentication**: Pass the actual user ID to the `ProjectCreator`
2. **Project Navigation**: Implement navigation to project detail pages
3. **Project Folders**: Integrate with your existing folder system
4. **Project Files**: Link project files to database projects
5. **Search & Filtering**: Add project search and filtering capabilities

## Convex Development

To make changes to the backend:

1. Edit files in the `convex/` directory
2. The Convex dev server will automatically sync changes
3. TypeScript definitions are auto-generated in `convex/_generated/`

The system is ready to use! You can start creating projects that will be saved to your Convex database and integrated with your EAC dashboard.
