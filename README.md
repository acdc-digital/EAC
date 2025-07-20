# EAC Dashboard

![Repository Views Since Release](https://visitor-badge.laobi.icu/badge?page_id=matthewsimon.EAC)

```text
 _____    _    ____     
| ____|  / \  / ___|___ 
|  _|   / _ \| |   / __|
| |___ / ___ \ |___\__ \
|_____/_/   \_\____|___/
```

**Version:** `1.0.0` | **License:** MIT | **Status:** Active Development

---

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white&labelColor=101010)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&labelColor=101010)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&labelColor=101010)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white&labelColor=101010)](https://tailwindcss.com/) [![Zustand](https://img.shields.io/badge/Zustand-State_Management-FF6B35?logo=react&logoColor=white&labelColor=101010)](https://github.com/pmndrs/zustand) [![Convex](https://img.shields.io/badge/Convex-DB-FF6B35?logo=data%3Adownload&logoColor=white&labelColor=101010)](https://convex.dev/) [![OpenAI](https://img.shields.io/badge/OpenAI-API-000000?logo=openai&logoColor=white&labelColor=101010)](https://openai.com/) [![pnpm](https://img.shields.io/badge/pnpm-Workspace-F69220?logo=pnpm&logoColor=white&labelColor=101010)](https://pnpm.io/)

> A modern, VS Code-inspired dashboard for project management and financial tracking built with React, Next.js, and TypeScript.

## Overview

EAC Dashboard is a project management application that combines the familiar interface of VS Code with project and financial management capabilities. Built with modern web technologies, it provides a seamless experience for managing projects, tracking finances, and organizing files with persistent state management.

## Features

| Feature | Description |
|---------|-------------|
| **File Management** | VS Code-inspired interface with sidebar navigation, tabbed editor, drag & drop folder reordering |
| **Rich Text Editing** | Tiptap editor integration with syntax highlighting and real-time content updates |
| **Project Management** | Project tracking with budget management, progress indicators, and documentation |
| **Financial Dashboard** | Real-time financial metrics, revenue/expense tracking, and budget analysis |
| **State Management** | Zustand store architecture with TypeScript support and persistent storage |
| **UI/UX** | Dark theme, responsive design, smooth animations, and keyboard navigation |

## Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/EAC.git
   cd EAC
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## Project Structure

```
EAC/
├── eac/                          # Main application
│   ├── app/                      # Next.js app directory
│   │   ├── _components/          # Application components
│   │   │   ├── dashboard/        # Dashboard module
│   │   │   │   ├── _components/  # Dashboard-specific components
│   │   │   │   │   └── fileCreationDropdown.tsx
│   │   │   │   ├── dashSidebar.tsx      # File explorer sidebar
│   │   │   │   ├── dashEditor.tsx       # Tabbed editor component
│   │   │   │   ├── dashOverview.tsx     # Overview dashboard
│   │   │   │   └── dashActivityBar.tsx  # Activity bar navigation
│   │   │   ├── editor/           # Editor module
│   │   │   │   ├── _components/  # Editor-specific components
│   │   │   │   │   ├── TiptapEditor.tsx     # Rich text editor
│   │   │   │   │   ├── dailyTracker.tsx     # Daily time tracking
│   │   │   │   │   └── weeklyAnalytics.tsx  # Weekly reporting
│   │   │   │   ├── editSchedule.tsx         # Schedule management
│   │   │   │   ├── editPercentComplete.tsx  # Progress tracking
│   │   │   │   ├── editGenerals.tsx         # Project generals form
│   │   │   │   └── editMaterials.tsx        # Materials management
│   │   │   └── navbar.tsx        # Navigation bar
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main dashboard page
│   ├── components/               # Shared UI components
│   │   ├── css/                  # Component styles
│   │   │   └── tiptap-editor.css # Tiptap editor styles
│   │   ├── ui/                   # shadcn/ui components
│   │   │   └── [17 UI components]
│   │   └── theme-provider.tsx    # Theme configuration
│   ├── store/                    # Zustand state management
│   │   ├── dailyTracker/         # Daily tracking store
│   │   ├── editor/               # Editor store
│   │   ├── materials/            # Materials store
│   │   ├── sidebar/              # Sidebar store
│   │   ├── terminal/             # Terminal store
│   │   └── index.ts              # Store exports
│   └── lib/                      # Utility functions
├── convex/                       # Convex backend (future integration)
└── docs/                         # Documentation
```

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks and context
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library

### State Management
- **Zustand** - Lightweight state management
- **Persist middleware** - Automatic state persistence
- **Custom storage** - Optimized serialization for complex data

### Rich Text Editing
- **Tiptap** - Headless rich text editor
- **ProseMirror** - Underlying editor framework
- **StarterKit** - Essential editing extensions

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **pnpm** - Fast, disk space efficient package manager

## Deployment

### Build for Production
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

### Export Static Site
```bash
pnpm export
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **VS Code** - Interface inspiration and design patterns
- **shadcn/ui** - Beautiful, accessible component library
- **Tiptap** - Excellent rich text editing capabilities
- **Zustand** - Simple and effective state management

---

© 2025 ACDC.digital • Maintainer: msimon@acdc.digital
