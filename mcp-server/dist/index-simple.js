#!/usr/bin/env node
"use strict";
/**
 * EAC MCP Server Entry Point - Simplified Implementation
 * Model Context Protocol server for the EAC Financial Dashboard
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EACMCPServer = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
// Simplified MCP server implementation for demonstration
class EACMCPServer {
    projectRoot;
    constructor() {
        this.projectRoot = process.env.EAC_PROJECT_ROOT || process.cwd();
    }
    async analyze() {
        try {
            const analysis = await this.analyzeProject();
            return this.formatAnalysis(analysis);
        }
        catch (error) {
            return `Error analyzing project: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
    async analyzeProject() {
        const packageJson = await this.getPackageJson();
        const structure = await this.analyzeStructure();
        return {
            overview: {
                name: packageJson.name || 'EAC Dashboard',
                version: packageJson.version || '1.0.0',
                description: packageJson.description || 'EAC Financial Dashboard',
                architecture: 'monorepo',
                framework: 'nextjs',
                backend: 'convex',
                stateManagement: 'zustand',
                styling: 'tailwind',
            },
            structure,
            patterns: await this.analyzePatterns(),
        };
    }
    async getPackageJson() {
        try {
            const packageJsonPath = path.join(this.projectRoot, 'package.json');
            const content = await fs.readFile(packageJsonPath, 'utf-8');
            return JSON.parse(content);
        }
        catch {
            return {};
        }
    }
    async analyzeStructure() {
        const structure = {
            components: await this.countFiles('eac/app/_components/**/*.{ts,tsx}'),
            stores: await this.countFiles('eac/store/**/*.{ts,tsx}'),
            pages: await this.countFiles('eac/app/**/page.{ts,tsx}'),
            convexFunctions: await this.countFiles('convex/*.ts'),
        };
        return structure;
    }
    async countFiles(pattern) {
        try {
            const files = await fs.readdir(path.join(this.projectRoot, pattern.split('/')[0]));
            return files.length;
        }
        catch {
            return 0;
        }
    }
    async analyzePatterns() {
        return {
            componentPatterns: [
                'VS Code-inspired interface design',
                'Feature-based component organization',
                'Compound component patterns',
            ],
            statePatterns: [
                'Feature-based Zustand stores',
                'Persistence middleware for UI state',
                'Real-time sync with Convex',
            ],
            apiPatterns: [
                'Query-Mutation-Action separation',
                'TypeScript-first schema design',
                'Real-time subscriptions',
            ],
        };
    }
    formatAnalysis(analysis) {
        return `# EAC Project Analysis

## Overview
- **Name**: ${analysis.overview.name}
- **Version**: ${analysis.overview.version}
- **Architecture**: ${analysis.overview.architecture}
- **Framework**: ${analysis.overview.framework}
- **Backend**: ${analysis.overview.backend}
- **State Management**: ${analysis.overview.stateManagement}
- **Styling**: ${analysis.overview.styling}

## Structure
- **Components**: ~${analysis.structure.components} component files
- **Stores**: ~${analysis.structure.stores} store files  
- **Pages**: ~${analysis.structure.pages} pages
- **Convex Functions**: ~${analysis.structure.convexFunctions} backend functions

## Key Patterns

### Component Patterns
${analysis.patterns.componentPatterns.map((p) => `- ${p}`).join('\n')}

### State Management Patterns
${analysis.patterns.statePatterns.map((p) => `- ${p}`).join('\n')}

### API Patterns
${analysis.patterns.apiPatterns.map((p) => `- ${p}`).join('\n')}

## Architecture Insights

The EAC Dashboard follows a sophisticated monorepo architecture with clear separation of concerns:

1. **Frontend (Next.js 15)**: Modern React patterns with App Router
2. **Backend (Convex)**: Real-time database with TypeScript functions
3. **State Management (Zustand)**: Feature-based stores with persistence
4. **UI Framework (Tailwind + shadcn/ui)**: Consistent design system
5. **Development Workflow**: VS Code-inspired interface patterns

## Recommendations for AI Development

1. **Component Creation**: Follow the established patterns in \`app/_components/\`
2. **State Management**: Use feature-based stores in \`store/\` directory
3. **Database Operations**: Leverage Convex queries, mutations, and actions
4. **Styling**: Maintain consistency with Tailwind CSS variables and shadcn/ui
5. **TypeScript**: Use strict mode and proper interfaces throughout

## Notable Features

- **Terminal Chat Integration**: AI chat with Anthropic Claude
- **VS Code Interface**: Familiar development environment patterns
- **Real-time Collaboration**: Convex enables real-time data sync
- **Financial Dashboard**: Specialized for project management and analytics
- **Modern Tech Stack**: Latest versions of React, Next.js, and TypeScript
`;
    }
    async run() {
        console.log('EAC MCP Server - Simplified Analysis Tool');
        console.log('========================================\n');
        const analysis = await this.analyze();
        console.log(analysis);
    }
}
exports.EACMCPServer = EACMCPServer;
// Check if running directly
if (process.argv[1] === __filename || process.argv[1].endsWith('index.js')) {
    const server = new EACMCPServer();
    server.run().catch((error) => {
        console.error('Failed to run EAC MCP analysis:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index-simple.js.map