# EAC Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-State_Management-orange?style=for-the-badge&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
[![pnpm](https://img.shields.io/badge/pnpm-Workspace-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> A modern, VS Code-inspired dashboard for project management and financial tracking built with React, Next.js, and TypeScript.

## 🎯 Overview

EAC Dashboard is a sophisticated project management application that combines the familiar interface of VS Code with powerful project and financial management capabilities. Built with modern web technologies, it provides a seamless experience for managing projects, tracking finances, and organizing files with persistent state management.

## ✨ Features

### 🗂️ File Management System
- **VS Code-inspired interface** with familiar sidebar navigation
- **Tabbed editor** with support for multiple file types
- **Drag & drop folder reordering** with real-time position updates
- **Persistent state** - maintains open tabs and folder structure across sessions
- **File creation dialog** with folder organization support
- **File deletion** with confirmation dialogs

### 📝 Rich Text Editing
- **Tiptap editor integration** for markdown and rich text files
- **Syntax highlighting** with VS Code-style theming
- **Real-time content updates** with line count tracking
- **Multiple file type support** (TypeScript, JavaScript, JSON, Excel, PDF, Markdown)

### 💼 Project Management
- **Project Generals module** with comprehensive project tracking
- **Budget management** with cost analysis and margin calculations
- **Progress tracking** with visual indicators and completion percentages
- **Notes and documentation** integrated into project files

### 💰 Financial Dashboard
- **Real-time financial metrics** display
- **Revenue and expense tracking** with growth indicators
- **Budget vs actual reporting** with variance analysis
- **Financial data visualization** in dedicated panels

### 🏗️ State Management
- **Zustand store architecture** with TypeScript support
- **Persistent storage** using localStorage with custom serialization
- **Modular store design** with separate editor and sidebar stores
- **Automatic state restoration** on application reload

### 🎨 UI/UX Features
- **Dark theme** matching VS Code aesthetic
- **Responsive design** with resizable panels
- **Smooth animations** and transitions
- **Accessibility support** with proper ARIA labels
- **Keyboard navigation** support

## 🚀 Quick Start

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

## 🏗️ Project Structure

```
EAC/
├── eac/                          # Main application
│   ├── app/                      # Next.js app directory
│   │   ├── _components/          # Dashboard components
│   │   │   ├── dashSidebar.tsx   # File explorer sidebar
│   │   │   ├── dashEditor.tsx    # Tabbed editor component
│   │   │   ├── dashOverview.tsx  # Overview dashboard
│   │   │   └── dashActivityBar.tsx # Activity bar navigation
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main dashboard page
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── navbar.tsx            # Navigation bar
│   │   ├── TiptapEditor.tsx      # Rich text editor
│   │   └── editGenerals.tsx      # Project generals form
│   ├── store/                    # Zustand state management
│   │   ├── editor/               # Editor store
│   │   │   ├── index.ts          # Editor state and actions
│   │   │   └── types.ts          # TypeScript definitions
│   │   ├── sidebar/              # Sidebar store
│   │   │   ├── index.ts          # Sidebar state and actions
│   │   │   └── types.ts          # TypeScript definitions
│   │   └── index.ts              # Store exports
│   └── lib/                      # Utility functions
├── convex/                       # Convex backend (future integration)
└── docs/                         # Documentation
```

## 🛠️ Technology Stack

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

## 📊 Key Components

### Editor Store (`/eac/store/editor/`)
Manages the core application state including:
- Open tabs and active file tracking
- Project and financial file management
- Folder organization and hierarchy
- File creation, deletion, and modification
- Content persistence and restoration

### Sidebar Store (`/eac/store/sidebar/`)
Handles sidebar-specific state:
- Collapsible section management
- Active panel tracking
- Persistent sidebar state

### Dashboard Components
- **DashSidebar** - File explorer with drag & drop
- **DashEditor** - Tabbed editor with rich text support
- **EditGenerals** - Project management interface
- **TiptapEditor** - Rich text editing component

## 🔧 Configuration

### Environment Setup
The project uses a pnpm workspace configuration with multiple packages:
- `eac/` - Main application
- `convex/` - Backend services (future)

### Styling
- **Tailwind CSS** with custom VS Code-inspired color scheme
- **Dark theme** as default with `#1a1a1a` backgrounds
- **Custom CSS** for Tiptap editor styling

### State Persistence
- **localStorage** integration with custom serialization
- **Selective persistence** - only essential state is saved
- **Icon restoration** - proper handling of React components in storage

## 🎨 Design System

### Colors
- **Background**: `#1a1a1a` (VS Code dark)
- **Surface**: `#2d2d2d` (Elevated surfaces)
- **Text**: `#cccccc` (Primary text)
- **Accent**: `#007acc` (VS Code blue)
- **Muted**: `#858585` (Secondary text)

### Typography
- **Font Family**: System fonts (SF Pro, Segoe UI)
- **Monospace**: Menlo, Monaco, Courier New
- **Sizes**: 12px base with 20px line height

## 🚀 Deployment

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

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **VS Code** - Interface inspiration and design patterns
- **shadcn/ui** - Beautiful, accessible component library
- **Tiptap** - Excellent rich text editing capabilities
- **Zustand** - Simple and effective state management

---

<div align="center">
  <strong>Built with ❤️ using modern web technologies</strong>
</div>

