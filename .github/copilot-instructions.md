# EAC Financial Dashboard - GitHub Copilot Instructions

## Project Overview
This is a Next.js financial dashboard project for project management and financial tracking. The project follows modern React patterns with TypeScript, Tailwind CSS, and Zustand for state management.

## Tech Stack
- **Next.js 15** with App Router
- **TypeScript** (strict mode)
- **Tailwind CSS v4** with CSS Variables
- **ShadCN/UI** components (Open Code approach)
- **Zustand** for state management
- **Convex** for backend/database
- **ESLint** for linting
- **Trunk** for additional linting/formatting
- **Lucide React** for icons
- **Next Themes** for dark/light mode

## Code Style Guidelines

### TypeScript Standards
- Use TypeScript strict mode for all new files
- Define explicit interfaces for all props and data structures
- Prefer `type` for unions and primitives, `interface` for objects
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### Component Architecture Pattern
```tsx
// TypeScript interface
interface ComponentProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
}

// Component with proper styling
export function Component({ className, ...props }: ComponentProps) {
  return (
    <div 
      className={cn(
        "default-styles", 
        className
      )}
      {...props}
    />
  );
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

Example store pattern:
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
  // state
  revenue: 0,
  expenses: 0,
  projects: [],
  isLoading: false,
  error: null,
  // actions
  updateRevenue: (amount) => set({ revenue: amount }),
  // ... other actions
}));
```

## Convex Backend Guidelines

### Query Functions
```ts
export const myQueryFunction = query({
  args: {
    first: v.number(),
    second: v.string(),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db.query("tablename").collect();
    return documents;
  },
});
```

### Mutation Functions
```ts
export const myMutationFunction = mutation({
  args: {
    first: v.string(),
    second: v.string(),
  },
  handler: async (ctx, args) => {
    const message = { body: args.first, author: args.second };
    const id = await ctx.db.insert("messages", message);
    return await ctx.db.get(id);
  },
});
```

### Client-Side Usage
- Use `useQuery(api.myFunctions.myQueryFunction, args)` for queries
- Use `useMutation(api.myFunctions.myMutationFunction)` for mutations
- Always validate arguments with proper Convex validators

## File Structure
- `/app` - Next.js app router pages and layouts
- `/components` - Reusable UI components
- `/components/ui` - ShadCN/UI components
- `/lib` - Utility functions and configurations
- `/convex` - Backend functions and schema
- `/public` - Static assets
- `/store` - Zustand state management stores

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

## AI Assistant Preferences
- Provide complete, runnable code examples
- Include proper TypeScript types and interfaces
- Use CSS variables for theming consistently
- Reference this documentation for patterns
- Suggest performance optimizations when relevant
- Focus on maintainable, secure code for financial operations
