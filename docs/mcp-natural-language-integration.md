# EAC MCP Server - Natural Language Integration Specification

## Overview

Yes! You can absolutely ask natural language questions in the chat terminal and have them trigger MCP server actions. The integration works through three layers:

1. **Natural Language Processing** in the OpenAI system prompt
2. **MCP Action Detection** in the Convex chat actions
3. **Direct MCP Server Integration** for complex analysis

## Architecture Flow

```
User Input (Natural Language)
    ↓
Chat Terminal (React Component)
    ↓
Convex Chat Action (OpenAI + MCP Detection)
    ↓
MCP Server Tools (Project Analysis)
    ↓
Structured Response (Terminal Display)
```

## Natural Language Triggers

### Current Chat Commands vs. Natural Language

**Instead of typing:**

```bash
$ user: /project
```

**You can ask naturally:**

```bash
$ user: What's the structure of this project?
$ user: Show me all the components in the dashboard
$ user: How is state management organized?
$ user: What Convex functions do we have?
$ user: Analyze the project architecture
```

## Enhanced Integration Implementation

### 1. Smart Intent Detection

Add to the OpenAI system prompt in `convex/chatActions.ts`:

```typescript
const systemPrompt = `You are an AI assistant for the EAC Financial Dashboard project with MCP server integration.

**When users ask about project analysis, you should:**
1. Detect if they want project structure, components, stores, or Convex analysis
2. Use the available MCP tools to provide detailed, accurate information
3. Format responses in terminal-style for consistency

**Natural Language Triggers for MCP Actions:**
- "project structure/architecture" → eac_project_analyze
- "components/dashboard/UI" → eac_component_finder  
- "state management/stores/Zustand" → eac_store_inspector
- "database/Convex/schema" → eac_convex_analyzer
- "generate/create/scaffold" → eac_code_generator

**Response Format:**
Always format technical information in terminal-style blocks with proper syntax highlighting.
`;
```

### 2. MCP Server Integration in Convex Actions

Create a new Convex action that can call the MCP server:

```typescript
// convex/mcpIntegration.ts
"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { spawn } from "child_process";
import { api } from "./_generated/api";

export const analyzeProjec tWithMCP = action({
  args: {
    query: v.string(),
    analysisType: v.union(
      v.literal("project"),
      v.literal("components"),
      v.literal("stores"),
      v.literal("convex"),
      v.literal("generate")
    ),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Call MCP server
      const mcpResult = await callMCPServer(args.analysisType, args.query);

      // Store the MCP analysis result
      await ctx.runMutation(api.chat.storeChatMessage, {
        role: "assistant",
        content: formatMCPResponse(mcpResult),
        sessionId: args.sessionId,
      });

      return mcpResult;
    } catch (error) {
      console.error("MCP integration error:", error);
      throw error;
    }
  },
});

async function callMCPServer(analysisType: string, query: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const mcpProcess = spawn('node', [
      './mcp-server/dist/index.js',
      '--tool', `eac_${analysisType}_analyze`,
      '--query', query
    ]);

    let output = '';

    mcpProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcpProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`MCP server exited with code ${code}`));
      }
    });
  });
}
```

### 3. Enhanced Chat Message Processing

Update the chat actions to detect natural language MCP triggers:

```typescript
// Enhanced chatActions.ts with MCP integration
export const sendChatMessage = action({
  args: {
    content: v.string(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      // Store user message
      await ctx.runMutation(api.chat.storeChatMessage, {
        role: "user",
        content: args.content,
        sessionId: args.sessionId,
      });

      // Check if message requires MCP analysis
      const mcpIntent = detectMCPIntent(args.content);

      if (mcpIntent) {
        // Trigger MCP server analysis
        const mcpResult = await ctx.runAction(
          api.mcpIntegration.analyzeProjectWithMCP,
          {
            query: args.content,
            analysisType: mcpIntent.type,
            sessionId: args.sessionId,
          },
        );

        // Let OpenAI process the MCP result for natural response
        return await processWithOpenAI(
          args.content,
          mcpResult,
          ctx,
          args.sessionId,
        );
      } else {
        // Regular OpenAI chat
        return await processWithOpenAI(args.content, null, ctx, args.sessionId);
      }
    } catch (error) {
      console.error("Chat error:", error);
      throw error;
    }
  },
});

function detectMCPIntent(
  message: string,
): { type: string; confidence: number } | null {
  const intents = [
    {
      keywords: ["project", "structure", "architecture", "overview", "analyze"],
      type: "project",
      weight: 1.0,
    },
    {
      keywords: ["component", "dashboard", "UI", "interface", "react"],
      type: "components",
      weight: 1.0,
    },
    {
      keywords: ["state", "store", "zustand", "management"],
      type: "stores",
      weight: 1.0,
    },
    {
      keywords: ["convex", "database", "schema", "query", "mutation"],
      type: "convex",
      weight: 1.0,
    },
    {
      keywords: ["generate", "create", "scaffold", "new", "template"],
      type: "generate",
      weight: 1.0,
    },
  ];

  const messageWords = message.toLowerCase().split(/\s+/);

  for (const intent of intents) {
    const matches = intent.keywords.filter((keyword) =>
      messageWords.some((word) => word.includes(keyword)),
    );

    if (matches.length >= 1) {
      return {
        type: intent.type,
        confidence: matches.length / intent.keywords.length,
      };
    }
  }

  return null;
}
```

## Natural Language Examples

### Project Analysis

```bash
$ user: Can you analyze the overall project structure?
$ system: Running project analysis...

# EAC Project Analysis

## Overview
- **Name**: EAC Dashboard
- **Version**: 1.0.0
- **Architecture**: monorepo
- **Framework**: nextjs
- **Backend**: convex
- **State Management**: zustand
- **Styling**: tailwind

## Structure
- **Components**: 23 component files
- **Stores**: 8 store files
- **Pages**: 5 pages
- **Convex Functions**: 12 backend functions

[Full MCP analysis results...]
```

### Component Discovery

```bash
$ user: What dashboard components do we have?
$ system: Analyzing dashboard components...

Found 8 dashboard components:
- **DashSidebar** (sidebar): File explorer with VS Code styling
- **DashEditor** (editor): Tabbed editor with file management
- **DashOverview** (dashboard): Main metrics and project overview
- **DashActivityBar** (navigation): Left activity bar navigation
- **PostCreator** (content): Social media post creation tool
- **ProjectCreator** (projects): New project creation workflow
- **SocialConnectors** (integrations): Social platform connections
- **FileSync** (utilities): File synchronization component

Each follows the VS Code-inspired interface pattern with consistent styling and state management.
```

### State Management Analysis

```bash
$ user: How is state management organized in this project?
$ system: Analyzing Zustand stores...

## State Management Architecture

**Feature-based Store Organization:**
- **editorStore**: File tabs, content, active file state
- **sidebarStore**: Folder structure, selection, drag/drop state
- **projectStore**: Project CRUD, budgets, progress tracking
- **terminalStore**: Chat sessions, command history, UI state
- **materialsStore**: Project materials, resources, attachments

**Patterns Identified:**
- ✅ Persistence middleware for UI state (90% adoption)
- ✅ Immutable updates with set() function (95% adoption)
- ✅ Feature isolation with clear boundaries (85% adoption)
- ✅ TypeScript interfaces for all stores (100% adoption)

**Recommendations:**
- Consider implementing optimistic updates for Convex mutations
- Add devtools middleware for better debugging experience
```

### Code Generation

````bash
$ user: Generate a new dashboard component for analytics
$ system: Generating analytics dashboard component...

```typescript
// Generated: eac/app/_components/dashboard/dashAnalytics.tsx
"use client";

import { Card } from "@/components/ui/card";
import { useProjectStore } from "@/store/projects";
import { cn } from "@/lib/utils";

interface DashAnalyticsProps {
  className?: string;
  projectId?: string;
}

export function DashAnalytics({ className, projectId }: DashAnalyticsProps) {
  const { projects, selectedProjectId } = useProjectStore();

  const activeProject = projects.find(p =>
    p.id === (projectId || selectedProjectId)
  );

  return (
    <div className={cn("flex flex-col h-full bg-[#1a1a1a]", className)}>
      {/* Analytics content */}
      <Card className="bg-[#252526] border-[#454545]">
        <h2 className="text-[#cccccc] text-sm font-medium p-4">
          Project Analytics
        </h2>
        {/* Analytics implementation */}
      </Card>
    </div>
  );
}
````

Component generated following EAC patterns:

- VS Code color scheme
- Consistent TypeScript interfaces
- Zustand store integration
- shadcn/ui components

````

## Advanced Natural Language Features

### 1. Contextual Conversations
```bash
$ user: What components use the editor store?
$ system: [MCP analysis] Found 5 components using useEditorStore:
- DashEditor (primary consumer)
- FileSync (synchronization)
- DashSidebar (file selection)
- ProjectCreator (new file creation)
- Terminal (file operations)

$ user: Show me the editor store structure
$ system: [MCP analysis] Editor store structure:
- files: EditorFile[]
- activeFileId: string | null
- openTabs: TabInfo[]
- isDirty: boolean
- [detailed state analysis...]

$ user: How can I add a new file type to the editor?
$ system: To add a new file type to the editor:

1. Update the EditorFile type in store/editor/types.ts
2. Add the file type to the fileCreationDropdown component
3. Update the file handling logic in DashEditor
4. Consider adding syntax highlighting if needed

Would you like me to generate the specific code changes?
````

### 2. Cross-Domain Analysis

```bash
$ user: How do components interact with the Convex backend?
$ system: [MCP cross-analysis] Component-Convex Integration Analysis:

**Direct Convex Usage:**
- **ProjectCreator**: Uses createProject mutation
- **DashOverview**: Queries project metrics
- **ChatMessages**: Real-time chat with OpenAI actions
- **FileSync**: Sync files to Convex storage

**Integration Patterns:**
- Custom hooks (useProjects, useFiles) bridge Convex ↔ Zustand
- Optimistic updates in project creation
- Real-time subscriptions for chat and project updates
- Error boundaries for Convex operation failures

**Recommendations:**
- Consider adding offline support with Convex sync
- Implement consistent loading states across components
```

### 3. Performance Analysis

```bash
$ user: Are there any performance issues in the project?
$ system: [MCP performance analysis] Performance Analysis Results:

**Potential Issues:**
⚠️  **Large Component Re-renders**: DashSidebar re-renders on every file change
⚠️  **Memory Usage**: Chat history grows without cleanup
⚠️  **Bundle Size**: Tiptap editor adds 200kb to initial bundle

**Optimizations:**
✅ **React.memo** usage in file tree components
✅ **Virtualization** for large file lists
✅ **Code splitting** for editor components

**Recommendations:**
1. Implement useMemo for expensive calculations in analytics
2. Add cleanup for old chat sessions
3. Consider lazy loading for Tiptap editor
4. Use React.Suspense for async components
```

## Implementation Steps

### Phase 1: Basic Natural Language MCP Integration

1. ✅ Enhanced system prompt with MCP awareness
2. ✅ Intent detection for natural language
3. ✅ MCP server integration in Convex actions
4. ✅ Formatted responses in terminal style

### Phase 2: Advanced Conversational Features

1. 🔄 Context-aware follow-up questions
2. 🔄 Cross-domain analysis capabilities
3. 🔄 Code generation from natural descriptions
4. 🔄 Performance and optimization suggestions

### Phase 3: Intelligent Automation

1. 📋 Proactive suggestions based on code changes
2. 📋 Automated code review and improvements
3. 📋 Integration with file watchers for real-time analysis
4. 📋 Team collaboration features

## Technical Benefits

### For Users:

- **Natural Communication**: Ask questions in plain English
- **Instant Analysis**: Real-time project insights without leaving terminal
- **Contextual Help**: Answers based on actual project structure
- **Code Generation**: Create components following established patterns

### For AI Development:

- **Rich Context**: MCP server provides deep project understanding
- **Consistent Patterns**: AI follows established architectural conventions
- **Real-time Updates**: Always current with project changes
- **Domain Expertise**: Specialized knowledge of EAC patterns and practices

## Conclusion

Yes, you can absolutely use natural language in the chat terminal to trigger MCP server actions! The system will intelligently detect when you're asking about project structure, components, state management, or need code generation, and automatically use the appropriate MCP tools to provide detailed, accurate responses.

This creates a powerful development assistant that understands your project intimately and can help with architecture decisions, code generation, and optimization suggestions - all through natural conversation in your familiar terminal interface.
