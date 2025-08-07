# EAC Dashboard

![Repository Views Since Release](https://visitor-badge.laobi.icu/badge?page_id=matthewsimon.EAC)

```text
 _____    _    ____
| ____|  / \  / ___|___
|  _|   / _ \| |   / __|
| |___ / ___ \ |___\__ \
|_____/_/   \_\____|___/
```

**Version:** `1.0.0` | **Last Updated:** 2025-02-21 | **License:** MIT | **Status:** Active Development

---

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white&labelColor=101010)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&labelColor=101010)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&labelColor=101010)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white&labelColor=101010)](https://tailwindcss.com/) [![Zustand](https://img.shields.io/badge/Zustand-State_Management-FF6B35?logo=react&logoColor=white&labelColor=101010)](https://github.com/pmndrs/zustand) [![Convex](https://img.shields.io/badge/Convex-DB-FF6B35?logo=data%3Adownload&logoColor=white&labelColor=101010)](https://convex.dev/) [![Anthropic](https://img.shields.io/badge/Anthropic-Claude-FF6B35?logo=anthropic&logoColor=white&labelColor=101010)](https://anthropic.com/) [![pnpm](https://img.shields.io/badge/pnpm-Workspace-F69220?logo=pnpm&logoColor=white&labelColor=101010)](https://pnpm.io/)

> An intelligent social media management platform powered by AI agents and advanced analytics. Built with Next.js, TypeScript, ShadCN, and Tailwind CSS, EAC provides automated content creation, multi-platform posting, engagement analytics, and AI-driven insights through integrated Claude agents. The VS Code-inspired interface offers a familiar development environment for managing social media campaigns with sophisticated automation and real-time data synchronization using Convex DB's reactive database.

## Features

Current implemented feature set (kept realistic and aligned with the Convex schema + agent layer):

| Feature                        | Description                                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| **AI Agent Terminal**          | Unified terminal with slash commands powering multi-step AI-driven workflows                       |
| **Slash Command Agents**       | `/instructions`, `/twitter`, `/create-project`, `/create-file`, `/schedule` (with legacy aliasing) |
| **Multi-Step Agents**          | Interactive project & file creation with pending state, guided inputs, and feedback loops          |
| **Project Management**         | Create and organize projects; soft-delete & recovery pipeline (30‑day retention)                   |
| **File Creation (.x posts)**   | AI-assisted generation of social post files with metadata & future scheduling hooks                |
| **Twitter/X Post Agent**       | Structured content parsing, parameter extraction, backend routing, and safety guards               |
| **Interactive Components**     | Dynamic UI prompts (project selector, file name/type inputs) rendered from chat message schema     |
| **Token Accounting**           | Per-message + per-session token, cost, and input/output tallies with running aggregates            |
| **Soft Delete System**         | `deletedProjects` / `deletedFiles` tables with metadata snapshot & restore window                  |
| **Activity Log**               | Persistent audit trail for file/project/social operations with typed categories                    |
| **Social Connections (Auth)**  | Secure storage of Reddit + X credentials (multi-tier API support, rate/limit metadata)             |
| **Reddit Post Pipeline (WIP)** | Draft + schedule + publish lifecycle with status indices & analytics fields                        |
| **MCP Server Integration**     | Model Context Protocol entry point for external tool augmentation (extensible)                     |
| **Thinking Role Messages**     | Internal reasoning channel (`role: thinking`) excluded from user token billable flow               |
| **Process Indicators**         | In-flight agent step visualization (continuing / waiting) embedded in chat messages                |
| **Schema-Driven UI**           | Frontend derives UX affordances (selectors, inputs) from `chatMessages.interactiveComponent`       |

Planned / Not Yet Implemented (excluded from active claims): Instagram, LinkedIn, Facebook, TikTok full posting, cross-platform scheduling optimization, collaborative multi-user editing.

## Project Structure

```
EAC/
├── eac/                          # Main application
│   ├── app/                      # Next.js app directory
│   │   ├── _components/          # Modular UI feature areas
│   │   │   ├── dashboard/        # Dashboard panels & data surfaces
│   │   │   │   ├── dashSidebar.tsx         # Project / file / connection navigator
│   │   │   │   ├── dashEditor.tsx          # Active file editing surface (integrates agents)
│   │   │   │   ├── dashAgents.tsx          # Agent list & activation panel
│   │   │   │   ├── dashOverview.tsx        # High‑level overview panel
│   │   │   │   ├── dashSocialConnections.tsx # Platform credential management
│   │   │   │   ├── dashTrash.tsx           # Soft-deleted entities management
│   │   │   │   └── dashActivityBar.tsx     # Activity navigation / panel switching
│   │   │   ├── editor/             # Granular edit panels (project/file attributes)
│   │   │   │   ├── editGenerals.tsx        # General project metadata editor
│   │   │   │   ├── editMaterials.tsx       # Materials/resources linkage
│   │   │   │   ├── editPercentComplete.tsx # Progress adjustment
│   │   │   │   └── editSchedule.tsx        # Schedule configuration
│   │   │   ├── terminal/           # Agent terminal UI
│   │   │   │   ├── terminal.tsx           # Main terminal frame
│   │   │   │   ├── historyTab.tsx         # Historical session/messages view
│   │   │   │   └── _components/           # Terminal-specific UI components
│   │   │   ├── calendar/           # Calendar integration (in progress)
│   │   │   ├── debug/              # Debug & diagnostics panels
│   │   │   ├── user-profile/       # User account/profile surfaces
│   │   │   ├── navbar.tsx          # Top navigation / command affordances
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main dashboard page
│   ├── components/               # Shared UI components
│   │   ├── css/                  # Component styles
│   │   │   └── content-editor.css # Content editor styles
│   │   ├── ui/                   # shadcn/ui components
│   │   │   └── [17 UI components]
│   │   └── theme-provider.tsx    # Theme configuration
│   ├── store/                    # Zustand state management
│   │   ├── agents/               # AI agent state management
│   │   ├── campaigns/            # Campaign management store
│   │   ├── content/              # Content creation store
│   │   ├── analytics/            # Analytics data store
│   │   ├── platforms/            # Social platform connections
│   │   └── index.ts              # Store exports
│   └── lib/                      # Utility functions
├── convex/                       # Convex backend with real-time sync
├── mcp-server/                   # Model Context Protocol server
└── docs/                         # Documentation
```

## Technology Stack

| Category                  | Technology      | Description                                       |
| ------------------------- | --------------- | ------------------------------------------------- |
| **Frontend**              | Next.js 15      | React framework with App Router                   |
|                           | React 18        | UI library with hooks and context                 |
|                           | TypeScript      | Type-safe JavaScript development                  |
|                           | Tailwind CSS v4 | Utility-first CSS framework with CSS variables    |
|                           | shadcn/ui       | Modern component library (Open Code approach)     |
| **State Management**      | Zustand         | Lightweight state management with persistence     |
|                           | DevTools        | Development debugging with store inspection       |
|                           | Custom storage  | Optimized serialization for complex data types    |
| **AI & Content Creation** | Tiptap          | Headless rich text editor for content creation    |
|                           | Claude API      | Anthropic's AI for intelligent content generation |
|                           | MCP Server      | Model Context Protocol for agent integration      |
| **Backend & Real-time**   | Convex          | Real-time database with serverless functions      |
|                           | WebSocket sync  | Live data synchronization across clients          |
| **Social Platform APIs**  | Reddit API      | Content posting and engagement tracking           |
|                           | X (Twitter) API | Social media automation and analytics             |
|                           | Facebook Graph  | Page management and advertising integration       |
|                           | Instagram Graph | Visual content management and insights            |
|                           | LinkedIn API    | Professional networking and B2B content sharing   |
|                           | TikTok API      | Short-form video content and trend analytics      |
| **Development Tools**     | ESLint          | Code linting and formatting                       |
|                           | Trunk           | Additional linting and security scanning          |
|                           | pnpm workspace  | Monorepo package management                       |

## Convex Backend

The application uses Convex for real‑time data, agent interaction persistence, token accounting, and soft deletion workflows.

### Active Schema (Authoritative Excerpt)

| Table               | Purpose / Notes                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| `chatMessages`      | All terminal + agent + system + thinking messages; includes interactiveComponent + token fields |
| `chatSessions`      | Aggregated token & cost accounting per session; soft delete via `isDeleted`                     |
| `projects`          | Core project records with status & user association                                             |
| `files`             | Project-scoped files (posts, notes, docs) + social metadata + scheduling fields                 |
| `deletedProjects`   | Soft-deleted project snapshot + associated file references (30‑day retention)                   |
| `deletedFiles`      | Soft-deleted file snapshot with original metadata (30‑day retention)                            |
| `socialConnections` | Stored platform credentials (Reddit + Twitter/X) with OAuth & tier metadata                     |
| `redditPosts`       | Reddit posting lifecycle (draft → scheduled → publishing → published / failed)                  |
| `agentPosts`        | Unified agent-generated post tracking (reddit/twitter) with status transitions                  |
| `activityLogs`      | Audit trail of user/system actions with type+category indices                                   |
| `users`             | Authentication + profile (Clerk integration / legacy fields)                                    |

Additional helper indices support efficient filtering (session activity, non-deleted files, status transitions, platform queries).

### Token Accounting Model

| Level        | Fields                                                              | Purpose                               |
| ------------ | ------------------------------------------------------------------- | ------------------------------------- |
| Message      | `tokenCount`, `inputTokens`, `outputTokens`, `estimatedCost`        | Fine-grained usage + cost estimation  |
| Session      | `totalTokens`, `totalInputTokens`, `totalOutputTokens`, `totalCost` | Running aggregate for UX + limits     |
| Thinking Msg | Excluded from billable accumulation                                 | Internal reasoning / progress markers |

Invariants:

- Session totals = sum of billable assistant + user message token components
- Soft-deleted sessions excluded from active lists (flag only; data retained)
- Cost derived via deterministic per-1K token rate map (see backend utilities)
- Interactive steps (waiting state) never finalize token/cost fields until completion

#### AI Agent Terminal

Integrated Anthropic Claude powered terminal with structured slash commands and interactive, multi-step workflows.

Core slash commands (normalized):

```
/instructions      Generate or refine structured instruction files
/twitter           Create and (future) schedule X/Twitter posts with param parsing
/create-project    Natural language project bootstrap (multi-step with name confirmation)
/create-file       Guided file creation inside existing projects (.x social post files)
/schedule          (Scaffolding) Scheduling & timeline agent (early)
```

Legacy aliases (accepted but not documented in UI) are normalized internally.

Multi-step interaction model:

- Agents emit `role: thinking` messages for internal reasoning (not counted toward billing aggregates)
- Pending user input states rendered via `interactiveComponent` (project selector, file name, file type)
- Process continuity surfaced with `processIndicator` (continuing / waiting)
- Terminal UI listens to message stream and dynamically mounts ephemeral components

Example flow (/create-project):

```
> /create-project Create a project for a March launch campaign with a $5k budget and 3 teaser posts
thinking… parsing requirements
Agent: I can create a project. Please confirm or edit the project name below.
[ Project Name Input Field ]
User supplies name via component → agent resumes → project + optional files created
```

Safety / correctness guards:

- Twitter agent strips disallowed mutation helpers to prevent instruction file creation
- File creation waits for explicit user-provided names (prevents accidental duplicates)
- All operations logged to `activityLogs` with typed categories

### AI Agent & MCP Integration

| Component               | Function                      | Description                                      |
| ----------------------- | ----------------------------- | ------------------------------------------------ |
| **Agent Terminal**      | Command execution interface   | Natural language commands for social media tasks |
| **Content Agents**      | Automated content creation    | AI-generated posts, captions, and copy           |
| **Analytics Agents**    | Performance monitoring        | Real-time insights and optimization suggestions  |
| **Scheduling Agents**   | Cross-platform coordination   | Optimal timing and frequency recommendations     |
| **MCP Server**          | Context protocol integration  | Enhanced AI capabilities with custom tools       |
| **Workflow Automation** | Multi-step campaign execution | End-to-end campaign management with AI oversight |

**MCP Server Features:**

- **Real-time Context**: Live access to campaign data and platform metrics
- **Custom Tools**: Specialized functions for social media management
- **Agent Coordination**: Multiple agents working together on complex campaigns
- **Natural Language Processing**: Convert human instructions into executable workflows

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
- **Anthropic** - Claude AI for intelligent agent automation

---

© 2025 ACDC.digital • Maintainer: msimon@acdc.digital
