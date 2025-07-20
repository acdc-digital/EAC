# EAC Design System

## Overview
This document outlines the design system and development guidelines for the EAC Financial Dashboard project.

## Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with CSS Variables
- **Components**: ShadCN/UI (Open Code approach)
- **Icons**: Lucide React
- **Theming**: CSS Variables with Light/Dark mode support

## ShadCN/UI Philosophy

### Open Code Approach
- **Full Control**: We own and modify component code directly
- **No Library Dependencies**: Components are copied into our codebase
- **Customization**: Direct editing of component files for specific needs
- **Transparency**: Complete visibility into component implementation

### Core Principles
1. **Composition**: All components share a common, composable interface
2. **Predictability**: Consistent APIs across all components
3. **Beautiful Defaults**: Carefully chosen styles that work out-of-the-box
4. **AI-Ready**: Open code structure for LLM understanding and improvement

## Color System
Use CSS variables for all theming to ensure consistency across light and dark modes.

### Usage Patterns
- Always use semantic color variables: `bg-background text-foreground`
- Never use direct colors: ❌ `bg-white dark:bg-gray-900`
- Follow the background/foreground pairing convention
- Use `text-muted-foreground` for secondary text

## Component Architecture

### File Organization
```
components/
├── ui/              # ShadCN/UI base components
├── dashboard/       # Feature-specific components
├── editor/
└── terminal/
```

## Financial Dashboard Specific Patterns

### Currency Display
```tsx
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
```

### Status Indicators
```tsx
const getStatusColor = (status: 'profit' | 'loss' | 'neutral') => {
  return cn({
    'text-green-600 dark:text-green-400': status === 'profit',
    'text-red-600 dark:text-red-400': status === 'loss',
    'text-muted-foreground': status === 'neutral',
  });
};
```
