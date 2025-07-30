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

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white&labelColor=101010)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&labelColor=101010)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&labelColor=101010)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white&labelColor=101010)](https://tailwindcss.com/) [![Zustand](https://img.shields.io/badge/Zustand-State_Management-FF6B35?logo=react&logoColor=white&labelColor=101010)](https://github.com/pmndrs/zustand) [![Convex](https://img.shields.io/badge/Convex-DB-FF6B35?logo=data%3Adownload&logoColor=white&labelColor=101010)](https://convex.dev/) [![Anthropic](https://img.shields.io/badge/Anthropic-Claude-FF6B35?logo=anthropic&logoColor=white&labelColor=101010)](https://anthropic.com/) [![pnpm](https://img.shields.io/badge/pnpm-Workspace-F69220?logo=pnpm&logoColor=white&labelColor=101010)](https://pnpm.io/)

> An intelligent social media management platform powered by AI agents and advanced analytics. Built with Next.js, TypeScript, ShadCN, and Tailwind CSS, EAC provides automated content creation, multi-platform posting, engagement analytics, and AI-driven insights through integrated Claude agents. The VS Code-inspired interface offers a familiar development environment for managing social media campaigns with sophisticated automation and real-time data synchronization using Convex DB's reactive database.

## Features

| Feature                        | Description                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| **AI Agent Management**        | Claude-powered agents for content creation, scheduling, and engagement optimization             |
| **Multi-Platform Integration** | Seamless posting and analytics across Reddit, X (Twitter), Instagram, LinkedIn, and TikTok      |
| **Content Generation**         | AI-driven content creation with brand voice consistency and audience targeting                  |
| **Social Analytics Dashboard** | Real-time engagement metrics, audience insights, and performance tracking across all platforms  |
| **Automated Scheduling**       | Intelligent post scheduling with optimal timing recommendations and cross-platform coordination |
| **Campaign Management**        | Project-based campaign organization with budget tracking, ROI analysis, and performance reports |
| **Real-Time Collaboration**    | Team workspace with role-based permissions, shared campaigns, and live editing capabilities     |
| **MCP Server Integration**     | Model Context Protocol for enhanced AI assistance and custom tool integration                   |

## Project Structure

```
EAC/
├── eac/                          # Main application
│   ├── app/                      # Next.js app directory
│   │   ├── _components/          # Application components
│   │   │   ├── dashboard/        # Social media dashboard module
│   │   │   │   ├── _components/  # Dashboard-specific components
│   │   │   │   │   └── agentCreationDropdown.tsx
│   │   │   │   ├── dashSidebar.tsx      # Campaign & platform navigator
│   │   │   │   ├── dashEditor.tsx       # Content creation interface
│   │   │   │   ├── dashOverview.tsx     # Analytics dashboard
│   │   │   │   └── dashActivityBar.tsx  # Platform switching navigation
│   │   │   ├── editor/           # Content creation module
│   │   │   │   ├── _components/  # Editor-specific components
│   │   │   │   │   ├── ContentEditor.tsx       # AI-powered content editor
│   │   │   │   │   ├── engagementTracker.tsx   # Real-time engagement metrics
│   │   │   │   │   └── campaignAnalytics.tsx   # Campaign performance reports
│   │   │   │   ├── postScheduler.tsx           # Multi-platform scheduling
│   │   │   │   ├── audienceTargeting.tsx       # Audience insights & targeting
│   │   │   │   ├── campaignSettings.tsx        # Campaign configuration
│   │   │   │   └── contentLibrary.tsx          # Media asset management
│   │   │   ├── agents/           # AI agent management
│   │   │   │   ├── agentTerminal.tsx            # Agent command interface
│   │   │   │   ├── agentWorkflows.tsx           # Automated workflow manager
│   │   │   │   └── agentAnalytics.tsx           # Agent performance tracking
│   │   │   └── navbar.tsx        # Navigation bar
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

The EAC project uses Convex for its backend database and API layer, providing real-time data synchronization and serverless functions for social media management.

### Database Schema

| Table               | Purpose                 | Key Fields                                         |
| ------------------- | ----------------------- | -------------------------------------------------- |
| `campaigns`         | Social media campaigns  | `name`, `platforms`, `status`, `budget`, `metrics` |
| `posts`             | Content and scheduling  | `content`, `platform`, `scheduledAt`, `status`     |
| `analytics`         | Engagement metrics      | `platform`, `postId`, `likes`, `shares`, `reach`   |
| `agents`            | AI agent configurations | `name`, `type`, `settings`, `isActive`             |
| `socialConnections` | Platform integrations   | `platform`, `accessToken`, `userId`, `isActive`    |

#### AI Agent Terminal

The dashboard includes an integrated AI agent terminal powered by Anthropic Claude with MCP server integration:

- **Access**: Click the terminal tab at the bottom of the interface
- **Agents**: Create and manage specialized AI agents for content creation, scheduling, and analytics
- **MCP Commands**: Execute Model Context Protocol commands for enhanced automation
- **Context Awareness**: Agents understand your campaigns, audience data, and platform performance
- **Natural Language**: Communicate with agents using natural language for complex social media tasks

**Agent Commands:**

```bash
$ user: Create a Twitter thread about our new product launch
$ agent: I'll create a 5-tweet thread optimized for engagement with your brand voice...

$ user: Analyze the performance of last week's Instagram posts
$ agent: Analyzing 12 posts from last week. Best performer: carousel post with 1.2K likes...

$ user: Schedule posts across all platforms for next week
$ agent: Planning optimal posting schedule based on audience activity patterns...
```

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
