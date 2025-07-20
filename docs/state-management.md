# Zustand State Management Guide
## EAC Financial Dashboard Project

### Overview
Zustand is our chosen state management solution for the EAC Financial Dashboard. It's lightweight, performant, and provides excellent TypeScript support without the boilerplate of Redux.

## Core Principles

### 1. Store Structure
- **One store per domain/feature**: Create separate stores for different business domains
- **Flat state structure**: Avoid deeply nested state when possible
- **Immutable updates**: Always use the `set` function for state changes

### 2. TypeScript Integration
Always use TypeScript interfaces for type safety:

```typescript
interface FinancialState {
  revenue: number;
  expenses: number;
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  // Actions
  updateRevenue: (amount: number) => void;
  fetchProjects: () => Promise<void>;
  setError: (error: string | null) => void;
}

const useFinancialStore = create<FinancialState>((set, get) => ({
  // Initial state
  revenue: 0,
  expenses: 0,
  projects: [],
  isLoading: false,
  error: null,
  
  // Actions
  updateRevenue: (amount: number) => 
    set({ revenue: amount }),
    
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await api.projects.list();
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  setError: (error: string | null) => 
    set({ error }),
}));
```

## Store Organization

### File Structure
```
store/
├── index.ts           # Re-export all stores
├── dailyTracker/
│   ├── index.ts       # Store implementation
│   └── types.ts       # TypeScript interfaces
├── editor/
│   ├── index.ts
│   └── types.ts
├── materials/
│   ├── index.ts
│   └── types.ts
└── sidebar/
    ├── index.ts
    └── types.ts
```

### Example Store Implementation

```typescript
// store/financial/types.ts
export interface Project {
  id: string;
  name: string;
  budget: number;
  spent: number;
  status: 'active' | 'completed' | 'on-hold';
}

export interface FinancialState {
  // Data
  revenue: number;
  expenses: number;
  projects: Project[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  selectedProjectId: string | null;
  
  // Actions
  updateRevenue: (amount: number) => void;
  updateExpenses: (amount: number) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  selectProject: (id: string | null) => void;
  fetchProjects: () => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

// store/financial/index.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FinancialState, Project } from './types';

export const useFinancialStore = create<FinancialState>()(
  devtools(
    (set, get) => ({
      // Initial state
      revenue: 0,
      expenses: 0,
      projects: [],
      isLoading: false,
      error: null,
      selectedProjectId: null,

      // Simple state updates
      updateRevenue: (amount: number) => 
        set({ revenue: amount }, false, 'updateRevenue'),
        
      updateExpenses: (amount: number) => 
        set({ expenses: amount }, false, 'updateExpenses'),
        
      selectProject: (id: string | null) => 
        set({ selectedProjectId: id }, false, 'selectProject'),
        
      setError: (error: string | null) => 
        set({ error }, false, 'setError'),
        
      setLoading: (loading: boolean) => 
        set({ isLoading: loading }, false, 'setLoading'),

      // Complex state updates
      addProject: (projectData: Omit<Project, 'id'>) => 
        set((state) => ({
          projects: [
            ...state.projects,
            { ...projectData, id: crypto.randomUUID() }
          ]
        }), false, 'addProject'),

      updateProject: (id: string, updates: Partial<Project>) => 
        set((state) => ({
          projects: state.projects.map(project =>
            project.id === id ? { ...project, ...updates } : project
          )
        }), false, 'updateProject'),

      deleteProject: (id: string) => 
        set((state) => ({
          projects: state.projects.filter(project => project.id !== id),
          selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId
        }), false, 'deleteProject'),

      // Async actions
      fetchProjects: async () => {
        const { setLoading, setError } = get();
        
        setLoading(true);
        setError(null);
        
        try {
          // Replace with actual API call
          const projects = await fetch('/api/projects').then(res => res.json());
          set({ projects, isLoading: false }, false, 'fetchProjects/success');
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to fetch projects');
          setLoading(false);
        }
      },
    }),
    {
      name: 'financial-store', // DevTools name
    }
  )
);
```

## Usage Patterns in Components

### Basic Usage
```tsx
import { useFinancialStore } from '@/store/financial';

function FinancialOverview() {
  const { revenue, expenses, isLoading } = useFinancialStore();
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div>
      <p>Revenue: ${revenue}</p>
      <p>Expenses: ${expenses}</p>
      <p>Profit: ${revenue - expenses}</p>
    </div>
  );
}
```

### Selective Subscriptions (Performance Optimization)
```tsx
import { useFinancialStore } from '@/store/financial';

function ProjectSelector() {
  // Only subscribe to projects and selectedProjectId
  const { projects, selectedProjectId, selectProject } = useFinancialStore(
    (state) => ({
      projects: state.projects,
      selectedProjectId: state.selectedProjectId,
      selectProject: state.selectProject,
    })
  );
  
  return (
    <select 
      value={selectedProjectId || ''} 
      onChange={(e) => selectProject(e.target.value || null)}
    >
      <option value="">Select a project</option>
      {projects.map(project => (
        <option key={project.id} value={project.id}>
          {project.name}
        </option>
      ))}
    </select>
  );
}
```

### Actions with Effects
```tsx
function ProjectForm() {
  const { addProject, updateProject, selectedProjectId } = useFinancialStore();
  
  const handleSubmit = async (formData: FormData) => {
    const projectData = {
      name: formData.get('name') as string,
      budget: Number(formData.get('budget')),
      spent: 0,
      status: 'active' as const,
    };
    
    if (selectedProjectId) {
      updateProject(selectedProjectId, projectData);
    } else {
      addProject(projectData);
    }
    
    // Optional: Show success message, redirect, etc.
  };
  
  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

## Advanced Patterns

### Computed Values with Selectors
```typescript
// In store
export const useFinancialStore = create<FinancialState>((set, get) => ({
  // ... other state and actions
  
  // Computed values as getters
  get totalProfit() {
    const { revenue, expenses } = get();
    return revenue - expenses;
  },
  
  get activeProjects() {
    return get().projects.filter(p => p.status === 'active');
  },
}));

// In component
function ProfitDisplay() {
  const totalProfit = useFinancialStore((state) => state.totalProfit);
  const activeProjects = useFinancialStore((state) => state.activeProjects);
  
  return (
    <div>
      <p>Total Profit: ${totalProfit}</p>
      <p>Active Projects: {activeProjects.length}</p>
    </div>
  );
}
```

### Middleware Usage
```typescript
import { subscribeWithSelector } from 'zustand/middleware';

export const useFinancialStore = create<FinancialState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // ... store implementation
    }))
  )
);

// Subscribe to specific changes
useFinancialStore.subscribe(
  (state) => state.selectedProjectId,
  (selectedProjectId) => {
    console.log('Selected project changed:', selectedProjectId);
  }
);
```

## Testing Stores

### Unit Testing
```typescript
import { renderHook, act } from '@testing-library/react';
import { useFinancialStore } from './index';

describe('useFinancialStore', () => {
  beforeEach(() => {
    // Reset store state
    useFinancialStore.setState({
      revenue: 0,
      expenses: 0,
      projects: [],
      isLoading: false,
      error: null,
      selectedProjectId: null,
    });
  });

  it('should update revenue', () => {
    const { result } = renderHook(() => useFinancialStore());
    
    act(() => {
      result.current.updateRevenue(1000);
    });
    
    expect(result.current.revenue).toBe(1000);
  });
  
  it('should add a project', () => {
    const { result } = renderHook(() => useFinancialStore());
    
    const newProject = {
      name: 'Test Project',
      budget: 5000,
      spent: 0,
      status: 'active' as const,
    };
    
    act(() => {
      result.current.addProject(newProject);
    });
    
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0]).toMatchObject(newProject);
  });
});
```

## Best Practices

1. **Keep stores focused**: One store per feature/domain
2. **Use TypeScript**: Always define interfaces for type safety
3. **Immutable updates**: Use `set` function properly
4. **Selective subscriptions**: Only subscribe to needed state
5. **DevTools**: Use devtools middleware for debugging
6. **Action naming**: Use descriptive action names for DevTools
7. **Error handling**: Implement proper error states
8. **Loading states**: Track loading states for async operations

This guide ensures consistent and performant state management across the EAC Financial Dashboard project.
