#!/usr/bin/env node

/**
 * EAC MCP Server Entry Point
 * Model Context Protocol server for the EAC Financial Dashboard
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { EACProjectAnalyzer } from './tools/project-analyzer.js';
import { EACComponentFinder } from './tools/component-finder.js';
import { EACStoreInspector } from './tools/store-inspector.js';
import { EACConvexAnalyzer } from './tools/convex-analyzer.js';
import { EACCodeGenerator } from './tools/code-generator.js';

class EACMCPServer {
  private server: Server;
  private projectAnalyzer: EACProjectAnalyzer;
  private componentFinder: EACComponentFinder;
  private storeInspector: EACStoreInspector;
  private convexAnalyzer: EACConvexAnalyzer;
  private codeGenerator: EACCodeGenerator;

  constructor() {
    this.server = new Server(
      {
        name: 'eac-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    // Initialize analyzers
    const projectRoot = process.env.EAC_PROJECT_ROOT || process.cwd();
    this.projectAnalyzer = new EACProjectAnalyzer(projectRoot);
    this.componentFinder = new EACComponentFinder(projectRoot);
    this.storeInspector = new EACStoreInspector(projectRoot);
    this.convexAnalyzer = new EACConvexAnalyzer(projectRoot);
    this.codeGenerator = new EACCodeGenerator(projectRoot);

    this.setupToolHandlers();
    this.setupResourceHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'eac_project_analyze',
          description: 'Analyze the EAC project structure, patterns, and architecture',
          inputSchema: {
            type: 'object',
            properties: {
              includePatterns: {
                type: 'boolean',
                description: 'Include pattern analysis in results',
                default: true,
              },
              includeRecommendations: {
                type: 'boolean', 
                description: 'Include architectural recommendations',
                default: true,
              },
            },
          },
        },
        {
          name: 'eac_component_finder',
          description: 'Find and analyze React components in the EAC project',
          inputSchema: {
            type: 'object',
            properties: {
              componentName: {
                type: 'string',
                description: 'Specific component name to analyze',
              },
              pattern: {
                type: 'string',
                description: 'Pattern to search for (e.g., "useStore", "useState")',
              },
              includeProps: {
                type: 'boolean',
                description: 'Include prop definitions in analysis',
                default: true,
              },
              includeHooks: {
                type: 'boolean',
                description: 'Include hook usage analysis',
                default: true,
              },
            },
          },
        },
        {
          name: 'eac_store_inspector',
          description: 'Inspect Zustand stores and state management patterns',
          inputSchema: {
            type: 'object',
            properties: {
              storeName: {
                type: 'string',
                description: 'Specific store to analyze (e.g., "useEditorStore")',
              },
              includeUsage: {
                type: 'boolean',
                description: 'Include store usage analysis across components',
                default: true,
              },
              includePatterns: {
                type: 'boolean',
                description: 'Include state management patterns',
                default: true,
              },
            },
          },
        },
        {
          name: 'eac_convex_analyzer',
          description: 'Analyze Convex schema, functions, and database patterns',
          inputSchema: {
            type: 'object',
            properties: {
              includeSchema: {
                type: 'boolean',
                description: 'Include database schema analysis',
                default: true,
              },
              includeFunctions: {
                type: 'boolean',
                description: 'Include query/mutation/action analysis',
                default: true,
              },
              includePatterns: {
                type: 'boolean',
                description: 'Include Convex usage patterns',
                default: true,
              },
            },
          },
        },
        {
          name: 'eac_code_generator',
          description: 'Generate code scaffolding following EAC patterns',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['component', 'store', 'hook', 'page', 'convex-function'],
                description: 'Type of code to generate',
              },
              name: {
                type: 'string',
                description: 'Name for the generated code',
              },
              patterns: {
                type: 'array',
                items: { type: 'string' },
                description: 'Patterns to follow (e.g., ["dashboard", "charts"])',
              },
              customization: {
                type: 'object',
                description: 'Custom options for code generation',
              },
            },
            required: ['type', 'name'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'eac_project_analyze':
            return await this.projectAnalyzer.analyze(args);
          
          case 'eac_component_finder':
            return await this.componentFinder.findComponents(args);
          
          case 'eac_store_inspector':
            return await this.storeInspector.inspectStores(args);
          
          case 'eac_convex_analyzer':
            return await this.convexAnalyzer.analyzeConvex(args);
          
          case 'eac_code_generator':
            return await this.codeGenerator.generateCode(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new Error(`Tool execution failed: ${error.message}`);
      }
    });
  }

  private setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'eac://project-context',
          name: 'EAC Project Context',
          description: 'Comprehensive project metadata and architecture information',
          mimeType: 'application/json',
        },
        {
          uri: 'eac://component-catalog',
          name: 'Component Catalog',
          description: 'Catalog of all React components with usage examples',
          mimeType: 'text/markdown',
        },
        {
          uri: 'eac://development-patterns',
          name: 'Development Patterns Guide',
          description: 'Established patterns and best practices for the EAC project',
          mimeType: 'text/markdown',
        },
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case 'eac://project-context':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(await this.projectAnalyzer.getProjectContext(), null, 2),
              },
            ],
          };

        case 'eac://component-catalog':
          return {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: await this.componentFinder.generateComponentCatalog(),
              },
            ],
          };

        case 'eac://development-patterns':
          return {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: await this.generatePatternsGuide(),
              },
            ],
          };

        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });
  }

  private async generatePatternsGuide(): Promise<string> {
    // Combine insights from all analyzers to generate patterns guide
    const projectAnalysis = await this.projectAnalyzer.analyze({});
    const componentPatterns = await this.componentFinder.getPatterns();
    const storePatterns = await this.storeInspector.getPatterns();
    const convexPatterns = await this.convexAnalyzer.getPatterns();

    return `# EAC Development Patterns Guide

## Architecture Patterns

${projectAnalysis.content[0].text}

## Component Patterns

${componentPatterns}

## State Management Patterns

${storePatterns}

## Convex Backend Patterns

${convexPatterns}

## Best Practices

- Use TypeScript strict mode for all new files
- Follow VS Code-inspired interface patterns
- Implement proper error boundaries
- Use Zustand for client state, Convex for server state
- Follow shadcn/ui component patterns
- Maintain consistent file organization
`;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('EAC MCP Server running on stdio');
  }
}

// Start the server
const server = new EACMCPServer();
server.run().catch((error) => {
  console.error('Failed to start EAC MCP Server:', error);
  process.exit(1);
});
