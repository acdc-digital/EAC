#!/usr/bin/env node
"use strict";
/**
 * EAC MCP Server Entry Point
 * Model Context Protocol server for the EAC Financial Dashboard
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const code_generator_js_1 = require("./tools/code-generator.js");
const component_finder_js_1 = require("./tools/component-finder.js");
const convex_analyzer_js_1 = require("./tools/convex-analyzer.js");
const project_analyzer_js_1 = require("./tools/project-analyzer.js");
const reddit_analyzer_js_1 = require("./tools/reddit-analyzer.js");
const reddit_post_generator_js_1 = require("./tools/reddit-post-generator.js");
const social_workflow_optimizer_js_1 = require("./tools/social-workflow-optimizer.js");
const store_inspector_js_1 = require("./tools/store-inspector.js");
class EACMCPServer {
    server;
    projectAnalyzer;
    componentFinder;
    storeInspector;
    convexAnalyzer;
    codeGenerator;
    redditAnalyzer;
    redditPostGenerator;
    socialWorkflowOptimizer;
    constructor() {
        this.server = new index_js_1.Server({
            name: 'eac-mcp-server',
            version: '1.0.0',
        }, {
            capabilities: {
                resources: {},
                tools: {},
            },
        });
        // Initialize analyzers
        const projectRoot = process.env.EAC_PROJECT_ROOT || process.cwd();
        this.projectAnalyzer = new project_analyzer_js_1.EACProjectAnalyzer(projectRoot);
        this.componentFinder = new component_finder_js_1.EACComponentFinder(projectRoot);
        this.storeInspector = new store_inspector_js_1.EACStoreInspector(projectRoot);
        this.convexAnalyzer = new convex_analyzer_js_1.EACConvexAnalyzer(projectRoot);
        this.codeGenerator = new code_generator_js_1.EACCodeGenerator(projectRoot);
        this.redditAnalyzer = new reddit_analyzer_js_1.EACRedditAnalyzer(projectRoot);
        this.redditPostGenerator = new reddit_post_generator_js_1.EACRedditPostGenerator(projectRoot);
        this.socialWorkflowOptimizer = new social_workflow_optimizer_js_1.EACSocialWorkflowOptimizer(projectRoot);
        this.setupToolHandlers();
        this.setupResourceHandlers();
    }
    setupToolHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
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
                {
                    name: 'eac_reddit_analyzer',
                    description: 'Analyze Reddit integration patterns, performance, and architecture',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            analysisType: {
                                type: 'string',
                                enum: ['integration', 'performance', 'recommendations', 'all'],
                                description: 'Type of analysis to perform',
                                default: 'all',
                            },
                            includeMetrics: {
                                type: 'boolean',
                                description: 'Include performance metrics and analytics',
                                default: true,
                            },
                        },
                    },
                },
                {
                    name: 'eac_reddit_post_generator',
                    description: 'Generate Reddit posts and templates following EAC patterns',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                enum: ['post', 'template', 'optimization'],
                                description: 'Type of generation to perform',
                            },
                            subreddit: {
                                type: 'string',
                                description: 'Target subreddit for post generation',
                            },
                            topic: {
                                type: 'string',
                                description: 'Topic or theme for the generated content',
                            },
                            options: {
                                type: 'object',
                                description: 'Additional options for content generation',
                            },
                        },
                        required: ['type'],
                    },
                },
                {
                    name: 'eac_social_workflow_optimizer',
                    description: 'Optimize social media workflows and automation strategies',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            platform: {
                                type: 'string',
                                enum: ['reddit', 'twitter', 'facebook', 'instagram', 'all'],
                                description: 'Social media platform to optimize',
                                default: 'reddit',
                            },
                            focus: {
                                type: 'string',
                                enum: ['automation', 'time', 'engagement', 'quality'],
                                description: 'Optimization focus area',
                            },
                        },
                    },
                },
            ],
        }));
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'eac_project_analyze':
                        return await this.projectAnalyzer.analyze(args || {});
                    case 'eac_component_finder':
                        return await this.componentFinder.findComponents(args || {});
                    case 'eac_store_inspector':
                        return await this.storeInspector.inspectStores(args || {});
                    case 'eac_convex_analyzer':
                        return await this.convexAnalyzer.analyzeConvex(args || {});
                    case 'eac_code_generator':
                        return await this.codeGenerator.generateCode(args || {});
                    case 'eac_reddit_analyzer':
                        return await this.redditAnalyzer.analyzeRedditIntegration(args || {});
                    case 'eac_reddit_post_generator':
                        return await this.redditPostGenerator.generateRedditPost(args || {});
                    case 'eac_social_workflow_optimizer':
                        return await this.socialWorkflowOptimizer.optimizeWorkflow(args || {});
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Tool execution failed: ${errorMessage}`);
            }
        });
    }
    setupResourceHandlers() {
        this.server.setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => ({
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
                {
                    uri: 'eac://reddit-integration',
                    name: 'Reddit Integration Guide',
                    description: 'Complete Reddit API integration patterns and best practices',
                    mimeType: 'text/markdown',
                },
                {
                    uri: 'eac://social-workflow-templates',
                    name: 'Social Media Workflow Templates',
                    description: 'Pre-built workflow templates and optimization strategies',
                    mimeType: 'application/json',
                },
            ],
        }));
        this.server.setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
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
                case 'eac://reddit-integration':
                    return {
                        contents: [
                            {
                                uri,
                                mimeType: 'text/markdown',
                                text: await this.redditAnalyzer.generateIntegrationGuide(),
                            },
                        ],
                    };
                case 'eac://social-workflow-templates':
                    return {
                        contents: [
                            {
                                uri,
                                mimeType: 'application/json',
                                text: JSON.stringify(await this.socialWorkflowOptimizer.getWorkflowTemplates(), null, 2),
                            },
                        ],
                    };
                default:
                    throw new Error(`Unknown resource: ${uri}`);
            }
        });
    }
    async generatePatternsGuide() {
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
        const transport = new stdio_js_1.StdioServerTransport();
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
//# sourceMappingURL=index.js.map