# EAC Financial Dashboard - GitHub Copilot Instructions

## Project Overview

This is a VS Code-inspired Next.js financial dashboard project for social media management, project tracking, and financial analytics. The project follows modern React patterns with TypeScript, Tailwind CSS, Zustand for state management, and Convex for real-time backend operations.

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** (strict mode)
- **Tailwind CSS v4** with CSS Variables
- **ShadCN/UI** components (Open Code approach)
- **Zustand** for state management with persistence
- **Convex** for real-time backend/database
- **Tiptap** for rich text editing
- **ESLint** for linting
- **Trunk** for additional linting/formatting
- **Lucide React** for icons
- **Next Themes** for dark/light mode
- **pnpm** workspace for monorepo management

## Code Style Guidelines

### TypeScript Standards

- Use TypeScript strict mode for all new files
- Define explicit interfaces for all props and data structures
- Prefer `type` for unions and primitives, `interface` for objects
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Use union types for controlled values (e.g., `'active' | 'completed' | 'on-hold'`)

### Component Architecture Pattern

```tsx
// TypeScript interface
interface ComponentProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
}

// Component with proper styling and ref forwarding when needed
export function Component({ className, ...props }: ComponentProps) {
  return <div className={cn("default-styles", className)} {...props} />;
}
```

### ShadCN/UI Guidelines

- Use CSS variables for theming: `bg-background text-foreground`
- Avoid direct colors: NOT `bg-white dark:bg-gray-900`
- Always use `cn()` utility for conditional classes
- Install components via CLI: `npx shadcn@latest add [component]`
- Modify component code directly for customization
- Follow `background`/`foreground` color convention

### Tailwind CSS Best Practices

- Use CSS variables: `bg-background text-foreground`
- Mobile-first responsive design
- Consistent spacing scale: 4, 6, 8, 12, 16, 24, 32
- Class order: Layout → Spacing → Colors → Typography → Effects

### Zustand State Management

- One store per domain/feature
- Flat state structure when possible
- Always use TypeScript interfaces
- Use immutable updates with `set` function
- Implement persistence for UI state (sidebar, editor tabs)
- Use devtools middleware for debugging
- Handle complex state serialization (Sets, Maps) with custom storage

Example store pattern:

```typescript
interface ProjectStoreState {
  projects: Project[];
  selectedProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  // Actions
  createProject: (project: CreateProjectArgs) => Promise<Project>;
  updateProject: (id: string, updates: UpdateProjectArgs) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
  setSelectedProject: (id: string | null) => void;
}

const useProjectStore = create<ProjectStoreState>()(
  devtools(
    (set, get) => ({
      // state
      projects: [],
      selectedProjectId: null,
      isLoading: false,
      error: null,
      // actions with Convex integration
      createProject: async (projectData) => {
        const project = await convexMutation(
          api.projects.createProject,
          projectData,
        );
        set((state) => ({ projects: [...state.projects, project] }));
        return project;
      },
      // ... other actions
    }),
    { name: "project-store" },
  ),
);
```

## Convex Backend Guidelines

### Schema Definition

```ts
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("on-hold"),
    ),
    budget: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.optional(v.string()),
    projectNumber: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_user", ["userId"])
    .index("by_project_number", ["projectNumber"]),
});
```

### Query Functions

```ts
export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_status")
      .collect();
    return projects;
  },
});
```

### Mutation Functions

```ts
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("on-hold"),
    ),
    budget: v.optional(v.number()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const projectNumber = await generateProjectNumber(ctx);
    const now = Date.now();

    const project = {
      ...args,
      projectNumber,
      createdAt: now,
      updatedAt: now,
    };

    const id = await ctx.db.insert("projects", project);
    return await ctx.db.get(id);
  },
});
```

### Client-Side Usage with Custom Hooks

```ts
// lib/hooks/useProjects.ts
import { api } from "../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";

export function useProjects() {
  const projects = useQuery(api.projects.getProjects, {});
  const createProject = useMutation(api.projects.createProject);
  const updateProject = useMutation(api.projects.updateProject);

  return {
    projects: projects ?? [],
    isLoading: projects === undefined,
    createProject,
    updateProject,
  };
}
```

### Convex-Zustand Integration Pattern

- Use custom hooks to bridge Convex queries/mutations with Zustand stores
- Handle optimistic updates in Zustand for better UX
- Sync Convex data changes back to Zustand state
- Use Convex for server state, Zustand for client/UI state

## File Structure

- `/app` - Next.js app router pages and layouts
- `/app/_components` - Application-specific components organized by feature
  - `/dashboard` - Main dashboard interface (sidebar, editor, overview, activity bar)
  - `/editor` - Project editing components (materials, schedule, tracking)
  - `/terminal` - Terminal and chat interface components
- `/components` - Reusable UI components
- `/components/ui` - ShadCN/UI components
- `/lib` - Utility functions and configurations
- `/lib/hooks` - Custom React hooks (including Convex integrations)
- `/convex` - Backend functions and schema
- `/store` - Zustand state management stores organized by feature
- `/public` - Static assets
- `/docs` - Project documentation

## Dashboard-Specific Patterns

### VS Code-Inspired Interface Architecture

- **Activity Bar**: Left navigation with panel switching (`dashActivityBar.tsx`)
- **Sidebar**: Context-aware sidebar with file explorer and panel-specific content (`dashSidebar.tsx`)
- **Editor**: Tabbed editor interface with file management (`dashEditor.tsx`)
- **Overview**: Dashboard homepage with metrics and project overview (`dashOverview.tsx`)

### Project Creation Workflow Integration

```tsx
// Dashboard Plus button integration with Convex
const handleFolderNameSubmit = async () => {
  if (newFolderName.trim()) {
    setIsCreatingProject(true);

    // Create folder in local editor store
    createFolder(newFolderName.trim(), "project");

    // Sync to Convex database
    try {
      const newProject = await createProject({
        name: newFolderName.trim(),
        status: "active",
      });
      console.log("Project created in database:", newProject);
    } catch (error) {
      console.error("Failed to create project in database:", error);
    } finally {
      setIsCreatingProject(false);
    }
  }
  setIsCreatingFolder(false);
  setNewFolderName("");
};
```

### Drag and Drop Implementation

- Implement folder reordering with `onDragStart`, `onDragOver`, `onDrop` handlers
- Use visual feedback with opacity changes and drag indicators
- Store drag state in component state, persist order in Zustand store

### Context Menu Integration

```tsx
// Right-click context menus for file operations
<ContextMenu>
  <ContextMenuTrigger asChild>{/* Your component */}</ContextMenuTrigger>
  <ContextMenuContent className="w-48 bg-[#252526] border border-[#454545]">
    <ContextMenuItem
      onClick={() => handleRenameClick(item.id, item.name)}
      className="text-xs text-[#cccccc] hover:bg-[#2a2d2e] flex items-center gap-2"
    >
      <Edit3 className="w-3 h-3" />
      Rename
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

## Financial Dashboard Specific Guidelines

- Always validate financial data with proper Convex validators
- Use proper number formatting for currency
- Implement proper access controls in Convex functions
- Add comprehensive error handling for financial operations
- Use TypeScript strict mode for financial calculations
- Log important financial actions for audit trails
- Use financial color conventions for profit/loss indicators

## Development Best Practices

- Follow Next.js App Router patterns
- Use ShadCN/UI components with Open Code approach
- Implement proper error handling
- Follow React best practices (hooks, state management)
- Consider responsive design and mobile-first approach
- Include accessibility features (ARIA labels, keyboard navigation)
- Always include proper Convex argument validation
- Prioritize security in financial operations
- Use custom hooks to bridge Convex and Zustand
- Implement optimistic updates for better UX

## AI Assistant Preferences

- Provide complete, runnable code examples
- Include proper TypeScript types and interfaces
- Use CSS variables for theming consistently
- Reference this documentation for patterns
- Suggest performance optimizations when relevant
- Focus on maintainable, secure code for financial operations
