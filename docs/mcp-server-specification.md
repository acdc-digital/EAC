# EAC Dashboard MCP Server Specification

## Overview

This document specifies the development of a Model Context Protocol (MCP) server implementation for the EAC Financial Dashboard project. The MCP server will provide AI assistants with comprehensive context about the project's architecture, patterns, and development practices to enhance AI-assisted development.

## Project Analysis

### Current Technology Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Backend**: Convex real-time database with Anthropic Claude integration
- **State Management**: Zustand with persistence middleware
- **UI Framework**: Tailwind CSS v4 + shadcn/ui components
- **Rich Text**: Tiptap editor with ProseMirror
- **Package Manager**: pnpm workspace monorepo
- **Development**: ESLint, TypeScript strict mode

### Architecture Patterns

- VS Code-inspired interface design
- Feature-based component organization
- Real-time data synchronization with Convex
- Terminal-style AI chat integration
- Financial data visualization and tracking
- Project management with budget analysis

## MCP Server Requirements

### 1. Core Functionality

#### 1.1 Project Context Provider

```typescript
interface ProjectContext {
  name: string;
  version: string;
  architecture: "monorepo" | "single-package";
  framework: "nextjs" | "react" | "vue";
  backend: "convex" | "firebase" | "supabase";
  stateManagement: "zustand" | "redux" | "context";
  styling: "tailwind" | "styled-components" | "css-modules";
}
```

#### 1.2 File System Analysis

- **Component Discovery**: Automatically detect React components and their patterns
- **Store Analysis**: Map Zustand stores and their relationships
- **Route Mapping**: Analyze Next.js App Router structure
- **Database Schema**: Parse Convex schema definitions
- **Dependency Analysis**: Track package dependencies and versions

#### 1.3 Code Pattern Recognition

- **Component Patterns**: Identify reusable component structures
- **Hook Patterns**: Detect custom hooks and their usage
- **State Patterns**: Map state management implementations
- **API Patterns**: Analyze Convex queries, mutations, and actions

### 2. MCP Server Implementation

#### 2.1 Server Structure

```
eac-mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── server.ts             # Core MCP server implementation
│   ├── tools/                # MCP tools implementation
│   │   ├── project-analyzer.ts      # Project structure analysis
│   │   ├── component-finder.ts      # React component discovery
│   │   ├── store-inspector.ts       # Zustand store analysis
│   │   ├── convex-schema.ts         # Database schema parser
│   │   ├── dependency-tracker.ts    # Package dependency analysis
│   │   └── code-generator.ts        # Code scaffolding tool
│   ├── resources/            # MCP resources
│   │   ├── project-context.ts       # Project metadata resource
│   │   ├── component-docs.ts        # Component documentation
│   │   └── patterns-guide.ts        # Development patterns guide
│   └── utils/
│       ├── file-parser.ts           # AST parsing utilities
│       ├── pattern-matcher.ts       # Code pattern matching
│       └── config-loader.ts         # Configuration management
├── schemas/                  # JSON schemas for validation
└── docs/                    # MCP server documentation
```

#### 2.2 Core MCP Tools

##### Tool: `eac_project_analyze`

**Purpose**: Analyze overall project structure and provide architectural insights

```typescript
interface ProjectAnalysisResult {
  overview: {
    name: string;
    version: string;
    description: string;
    architecture: string;
  };
  structure: {
    components: ComponentInfo[];
    stores: StoreInfo[];
    routes: RouteInfo[];
    convexFunctions: ConvexFunction[];
  };
  patterns: {
    componentPatterns: PatternMatch[];
    statePatterns: PatternMatch[];
    apiPatterns: PatternMatch[];
  };
  recommendations: string[];
}
```

##### Tool: `eac_component_finder`

**Purpose**: Find and analyze React components with their props, hooks, and patterns

```typescript
interface ComponentAnalysis {
  name: string;
  path: string;
  type: "page" | "component" | "layout";
  props: PropDefinition[];
  hooks: HookUsage[];
  dependencies: string[];
  patterns: ComponentPattern[];
  examples: CodeExample[];
}
```

##### Tool: `eac_store_inspector`

**Purpose**: Analyze Zustand stores and their state management patterns

```typescript
interface StoreAnalysis {
  name: string;
  path: string;
  stateShape: StateDefinition;
  actions: ActionDefinition[];
  persistence: PersistenceConfig;
  usage: StoreUsage[];
  patterns: StatePattern[];
}
```

##### Tool: `eac_convex_analyzer`

**Purpose**: Parse Convex schema and functions for database context

```typescript
interface ConvexAnalysis {
  schema: {
    tables: TableDefinition[];
    indexes: IndexDefinition[];
    relationships: RelationshipMap[];
  };
  functions: {
    queries: QueryDefinition[];
    mutations: MutationDefinition[];
    actions: ActionDefinition[];
  };
  patterns: ConvexPattern[];
}
```

##### Tool: `eac_code_generator`

**Purpose**: Generate code scaffolding following EAC patterns

```typescript
interface CodeGeneratorOptions {
  type: "component" | "store" | "hook" | "page" | "convex-function";
  name: string;
  patterns: string[];
  dependencies: string[];
  customization: Record<string, any>;
}
```

#### 2.3 MCP Resources

##### Resource: `eac://project-context`

**Purpose**: Provide comprehensive project context and metadata

```typescript
interface ProjectContextResource {
  uri: "eac://project-context";
  name: "EAC Project Context";
  mimeType: "application/json";
  content: ProjectContext;
}
```

##### Resource: `eac://component-catalog`

**Purpose**: Catalog of all React components with usage examples

```typescript
interface ComponentCatalogResource {
  uri: "eac://component-catalog";
  name: "Component Catalog";
  mimeType: "text/markdown";
  content: ComponentCatalog;
}
```

##### Resource: `eac://development-patterns`

**Purpose**: Development patterns and best practices guide

```typescript
interface PatternsGuideResource {
  uri: "eac://development-patterns";
  name: "Development Patterns Guide";
  mimeType: "text/markdown";
  content: DevelopmentPatterns;
}
```

### 3. Advanced Features

#### 3.1 Real-time Context Updates

- **File Watcher**: Monitor file system changes
- **Hot Reload**: Update context when files are modified
- **Dependency Tracking**: Detect when dependencies change
- **Pattern Evolution**: Track how patterns evolve over time

#### 3.2 AI-Powered Insights

- **Code Quality Analysis**: Identify potential improvements
- **Pattern Recommendations**: Suggest better architectural patterns
- **Dependency Optimization**: Recommend package updates or alternatives
- **Performance Insights**: Identify performance bottlenecks

#### 3.3 Integration Features

- **VS Code Extension**: Deep integration with the editor
- **GitHub Copilot Enhancement**: Provide context to Copilot
- **Terminal Integration**: Command-line interface for MCP tools
- **Dashboard Integration**: Web interface for MCP insights

### 4. Configuration

#### 4.1 MCP Server Configuration (`mcp-server.config.json`)

```json
{
  "server": {
    "name": "eac-mcp-server",
    "version": "1.0.0",
    "description": "MCP server for EAC Dashboard project"
  },
  "project": {
    "root": "./",
    "workspaces": ["eac", "convex"],
    "excludePatterns": [".next", "node_modules", ".git"]
  },
  "analysis": {
    "enableRealTimeUpdates": true,
    "enableAIInsights": true,
    "analysisDepth": "deep",
    "cacheStrategy": "smart"
  },
  "tools": {
    "projectAnalyzer": { "enabled": true },
    "componentFinder": { "enabled": true },
    "storeInspector": { "enabled": true },
    "convexAnalyzer": { "enabled": true },
    "codeGenerator": { "enabled": true }
  },
  "resources": {
    "projectContext": { "enabled": true, "updateInterval": "5s" },
    "componentCatalog": { "enabled": true, "updateInterval": "10s" },
    "patternsGuide": { "enabled": true, "updateInterval": "1m" }
  }
}
```

#### 4.2 VS Code Integration (`.vscode/mcp.json`)

```json
{
  "mcpServers": {
    "eac-dashboard": {
      "command": "node",
      "args": ["./mcp-server/dist/index.js"],
      "env": {
        "EAC_PROJECT_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

### 5. Implementation Phases

#### Phase 1: Core Foundation (Weeks 1-2)

- [ ] MCP server basic structure
- [ ] File system analysis tools
- [ ] Project structure parsing
- [ ] Basic component discovery
- [ ] Configuration system

#### Phase 2: Pattern Recognition (Weeks 3-4)

- [ ] Component pattern analysis
- [ ] Zustand store inspection
- [ ] Convex schema parsing
- [ ] Code pattern matching algorithms
- [ ] Resource providers implementation

#### Phase 3: Advanced Features (Weeks 5-6)

- [ ] Real-time file watching
- [ ] AI-powered insights
- [ ] Code generation tools
- [ ] Performance analysis
- [ ] Integration testing

#### Phase 4: Integration & Polish (Weeks 7-8)

- [ ] VS Code extension integration
- [ ] Terminal command interface
- [ ] Dashboard web interface
- [ ] Documentation and examples
- [ ] Performance optimization

### 6. Technical Specifications

#### 6.1 Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "@babel/parser": "^7.23.0",
    "@babel/types": "^7.23.0",
    "@typescript-eslint/parser": "^6.0.0",
    "chokidar": "^3.5.3",
    "glob": "^10.3.0",
    "typescript": "^5.0.0"
  }
}
```

#### 6.2 Performance Requirements

- **Startup Time**: < 2 seconds for initial project analysis
- **Real-time Updates**: < 500ms for file change detection
- **Memory Usage**: < 100MB for typical project size
- **Response Time**: < 100ms for MCP tool calls

#### 6.3 Compatibility

- **Node.js**: >= 18.0.0
- **TypeScript**: >= 5.0.0
- **MCP Protocol**: >= 2024-11-05
- **VS Code**: >= 1.85.0

### 7. Usage Examples

#### 7.1 Component Analysis

```bash
# Find all components using Zustand stores
mcp-cli eac_component_finder --pattern="useStore"

# Analyze component props and patterns
mcp-cli eac_component_finder --component="DashSidebar"
```

#### 7.2 Store Analysis

```bash
# Inspect all Zustand stores
mcp-cli eac_store_inspector --all

# Analyze specific store usage
mcp-cli eac_store_inspector --store="useEditorStore"
```

#### 7.3 Code Generation

```bash
# Generate new component following EAC patterns
mcp-cli eac_code_generator --type=component --name="ProjectAnalytics" --patterns=dashboard,charts

# Generate Convex function
mcp-cli eac_code_generator --type=convex-function --name="getProjectMetrics"
```

### 8. Benefits for AI Development

#### 8.1 Enhanced AI Context

- **Architectural Awareness**: AI understands project structure and patterns
- **Pattern Consistency**: Suggestions follow established project conventions
- **Dependency Awareness**: AI knows what packages and tools are available
- **Real-time Updates**: Context stays current as project evolves

#### 8.2 Improved Development Velocity

- **Code Generation**: Generate scaffolding following project patterns
- **Pattern Suggestions**: Recommend best practices and improvements
- **Refactoring Assistance**: Help maintain consistency during changes
- **Documentation**: Auto-generate documentation from code analysis

#### 8.3 Quality Assurance

- **Pattern Compliance**: Ensure new code follows established patterns
- **Best Practices**: Suggest improvements based on project standards
- **Performance Insights**: Identify potential performance issues
- **Security Analysis**: Detect potential security concerns

## Conclusion

The EAC Dashboard MCP server will significantly enhance AI-assisted development by providing comprehensive project context, pattern recognition, and intelligent code generation capabilities. This implementation will serve as a model for other complex React/Next.js projects with similar architectural patterns.

The server will integrate seamlessly with existing development workflows while providing powerful new capabilities for AI assistants to understand and contribute to the project effectively.
