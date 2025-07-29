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

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white&labelColor=101010)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&labelColor=101010)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&labelColor=101010)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white&labelColor=101010)](https://tailwindcss.com/) [![Zustand](https://img.shields.io/badge/Zustand-State_Management-FF6B35?logo=react&logoColor=white&labelColor=101010)](https://github.com/pmndrs/zustand) [![Convex](https://img.shields.io/badge/Convex-DB-FF6B35?logo=data%3Adownload&logoColor=white&labelColor=101010)](https://convex.dev/) [![Anthropic](https://img.shields.io/badge/Anthropic-Claude-FF6B35?logo=anthropic&logoColor=white&labelColor=101010)](https://anthropic.com/) [![pnpm](https://img.shields.io/badge/pnpm-Workspace-F69220?logo=pnpm&logoColor=white&labelColor=101010)](https://pnpm.io/)

> A modern, VS Code-inspired dashboard for Social management and Media Analytic tracking built with React, Next.js, and TypeScript. This project is optimized for GitHub Copilot in VS Code. The codebase follows modern React patterns with comprehensive documentation to help AI assistants understand the project structure and conventions. Familiarize yourself with our [Copilot Instructions](.github/copilot-instructions.md) to get the most out of AI-assisted development.

## Features

| Feature                 | Description                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| **File Management**     | VS Code-inspired interface with sidebar navigation, tabbed editor, drag & drop folder reordering |
| **Rich Text Editing**   | Tiptap editor integration with syntax highlighting and real-time content updates                 |
| **Project Management**  | Project tracking with budget management, progress indicators, and documentation                  |
| **Financial Dashboard** | Real-time financial metrics, revenue/expense tracking, and budget analysis                       |
| **State Management**    | Zustand store architecture with TypeScript support and persistent storage                        |
| **UI/UX**               | Dark theme, responsive design, smooth animations, and keyboard navigation                        |

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

3. **Start the development servers**

   **Frontend (Next.js):**

   ```bash
   pnpm dev
   ```

   **Backend (Convex):**

   ```bash
   pnpm convex:dev
   ```

   **Open Convex Dashboard:**

   ```bash
   pnpm convex:dashboard
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
├── convex/                       # Convex backend with environment configuration
└── docs/                         # Documentation
```

## Technology Stack

| Category              | Technology         | Description                                |
| --------------------- | ------------------ | ------------------------------------------ |
| **Frontend**          | Next.js 14         | React framework with App Router            |
|                       | React 18           | UI library with hooks and context          |
|                       | TypeScript         | Type-safe JavaScript development           |
|                       | Tailwind CSS       | Utility-first CSS framework                |
|                       | shadcn/ui          | Modern component library                   |
| **State Management**  | Zustand            | Lightweight state management               |
|                       | Persist middleware | Automatic state persistence                |
|                       | Custom storage     | Optimized serialization for complex data   |
| **Rich Text Editing** | Tiptap             | Headless rich text editor                  |
|                       | ProseMirror        | Underlying editor framework                |
|                       | StarterKit         | Essential editing extensions               |
| **Development Tools** | ESLint             | Code linting and formatting                |
|                       | PostCSS            | CSS processing                             |
|                       | pnpm               | Fast, disk space efficient package manager |

## Convex Backend

The EAC project uses Convex for its backend database and API layer, providing real-time data synchronization and serverless functions.

### Database Schema

| Table      | Purpose             | Key Fields                                |
| ---------- | ------------------- | ----------------------------------------- |
| `messages` | Chat/communication  | `text`, `author`, `createdAt`             |
| `projects` | Project management  | `name`, `description`, `status`, `budget` |
| `users`    | User authentication | `email`, `name`, `role`, `authId`         |

### Development Commands

| Command                 | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `pnpm dev`              | Start Next.js development server           |
| `pnpm convex:dev`       | Start Convex dev server (with correct env) |
| `pnpm convex:deploy`    | Deploy to Convex (with correct env)        |
| `pnpm convex:dashboard` | Open Convex dashboard (with correct env)   |

**Note:** All Convex commands automatically use the correct environment file (`.env.local`) to ensure proper deployment targeting.

### Project Structure

```
convex/
├── _generated/          # Auto-generated types and API
├── schema.ts           # Database schema definition
├── messages.ts         # Message-related functions
├── projects.ts         # Project management functions
└── package.json        # Convex dependencies
```

### Environment Configuration

The project uses environment files to manage different Convex deployments and API integrations:

- **`.env.local`** (root): Contains `CONVEX_DEPLOYMENT` and `CONVEX_URL`
- **`eac/.env.local`**: Contains `NEXT_PUBLIC_CONVEX_URL` for the frontend and `ANTHROPIC_API_KEY`

#### Required Environment Variables

Create `eac/.env.local` with the following:

```bash
# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url

# Anthropic Claude API Integration for Terminal Chat
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Important:**

- All Convex commands in `package.json` are configured with `--env-file .env.local` to ensure consistent deployment targeting.
- The Anthropic API key is required for the AI chat functionality in the terminal interface.
- Copy `.env.example` to `.env.local` and fill in your actual API keys.

#### AI Chat Terminal

The dashboard includes an integrated AI chat terminal powered by Anthropic Claude:

- **Access**: Click the terminal tab at the bottom of the interface
- **Format**: Uses terminal-style `$ user:` and `$ system:` prompts
- **Features**: Project-aware AI assistant with context about your EAC dashboard
- **Usage**: Ask questions about Next.js, React, Convex, or project-specific functionality

**Chat Commands:**

```bash
$ user: How do I create a new project?
$ system: To create a new project, click the "New Project" button in the sidebar...

$ user: What's the current project structure?
$ system: The EAC dashboard follows a modular architecture with...
```

### MCP Integration

The project includes Model Context Protocol (MCP) server integration for AI development assistance:

- **Configuration**: `.vscode/mcp.json` (project-specific)
- **GitHub Copilot**: Enhanced with Convex-specific instructions
- **Usage**: Automatically provides database context to AI tools
- **MCP Server**: Custom implementation in `mcp-server/` directory

#### EAC MCP Server

The EAC project includes a custom MCP server implementation that provides comprehensive project context to AI assistants:

```bash
# Install and run MCP server
cd mcp-server
pnpm install
pnpm build
pnpm start
```

**MCP Server Features:**

- **Project Analysis**: Complete architectural overview
- **Pattern Recognition**: Identifies coding patterns and conventions
- **Component Discovery**: Maps React components and their relationships
- **Store Analysis**: Analyzes Zustand state management patterns
- **Convex Integration**: Database schema and function analysis
- **Code Generation**: Scaffolding following EAC patterns (planned)

**Usage with AI Tools:**

- Provides context about project structure and patterns
- Enables intelligent code suggestions following EAC conventions
- Assists with architectural decisions and best practices
- Supports real-time project analysis (planned)

See [`mcp-server/README.md`](mcp-server/README.md) for detailed setup and usage instructions.

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
