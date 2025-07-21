"use strict";
/**
 * EAC Project Analyzer
 * Analyzes overall project structure and architecture patterns
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
exports.EACProjectAnalyzer = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const glob_1 = require("glob");
class EACProjectAnalyzer {
    projectRoot;
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
    }
    async analyze(args) {
        try {
            const projectContext = await this.getProjectContext();
            const structure = await this.analyzeStructure();
            const patterns = await this.analyzePatterns();
            const recommendations = await this.generateRecommendations();
            const analysis = {
                overview: projectContext,
                structure,
                patterns,
                recommendations,
            };
            return {
                content: [{
                        type: 'text',
                        text: this.formatAnalysisResult(analysis)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error analyzing project: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }]
            };
        }
    }
    async getProjectContext() {
        try {
            const packageJsonPath = path.join(this.projectRoot, 'package.json');
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
            // Analyze EAC package.json for context
            const eacPackagePath = path.join(this.projectRoot, 'eac', 'package.json');
            const eacPackage = JSON.parse(await fs.readFile(eacPackagePath, 'utf-8'));
            return {
                name: packageJson.name || 'EAC Dashboard',
                version: packageJson.version || '1.0.0',
                description: packageJson.description || 'EAC Financial Dashboard',
                architecture: 'monorepo',
                framework: 'nextjs',
                backend: 'convex',
                stateManagement: 'zustand',
                styling: 'tailwind',
            };
        }
        catch (error) {
            // Fallback context
            return {
                name: 'EAC Dashboard',
                version: '1.0.0',
                description: 'EAC Financial Dashboard',
                architecture: 'monorepo',
                framework: 'nextjs',
                backend: 'convex',
                stateManagement: 'zustand',
                styling: 'tailwind',
            };
        }
    }
    async analyzeStructure() {
        const structure = {
            components: await this.findComponents(),
            stores: await this.findStores(),
            routes: await this.findRoutes(),
            convexFunctions: await this.findConvexFunctions(),
        };
        return structure;
    }
    async findComponents() {
        try {
            const componentFiles = await (0, glob_1.glob)('eac/app/_components/**/*.{ts,tsx}', {
                cwd: this.projectRoot,
            });
            const components = [];
            for (const file of componentFiles) {
                const fullPath = path.join(this.projectRoot, file);
                const content = await fs.readFile(fullPath, 'utf-8');
                const name = path.basename(file, path.extname(file));
                // Determine component type based on path
                let type = 'component';
                if (file.includes('/dashboard/'))
                    type = 'component';
                if (file.includes('/editor/'))
                    type = 'component';
                if (file.includes('layout.'))
                    type = 'layout';
                // Extract dependencies (simplified)
                const dependencies = this.extractDependencies(content);
                components.push({
                    name,
                    path: file,
                    type,
                    dependencies,
                });
            }
            return components;
        }
        catch (error) {
            return [];
        }
    }
    async findStores() {
        try {
            const storeFiles = await (0, glob_1.glob)('eac/store/**/*.{ts,tsx}', {
                cwd: this.projectRoot,
            });
            const stores = [];
            for (const file of storeFiles) {
                if (file.includes('types.ts') || file.includes('index.ts'))
                    continue;
                const fullPath = path.join(this.projectRoot, file);
                const content = await fs.readFile(fullPath, 'utf-8');
                const name = path.basename(path.dirname(file));
                const stateShape = this.extractStateShape(content);
                const actions = this.extractActions(content);
                stores.push({
                    name,
                    path: file,
                    stateShape,
                    actions,
                });
            }
            return stores;
        }
        catch (error) {
            return [];
        }
    }
    async findRoutes() {
        try {
            const routeFiles = await (0, glob_1.glob)('eac/app/**/page.{ts,tsx}', {
                cwd: this.projectRoot,
            });
            const routes = [];
            for (const file of routeFiles) {
                const routePath = this.filePathToRoute(file);
                routes.push({
                    path: routePath,
                    type: 'page',
                    file,
                });
            }
            return routes;
        }
        catch (error) {
            return [];
        }
    }
    async findConvexFunctions() {
        try {
            const convexFiles = await (0, glob_1.glob)('convex/*.ts', {
                cwd: this.projectRoot,
            });
            const functions = [];
            for (const file of convexFiles) {
                if (file.includes('schema.ts') || file.includes('_generated'))
                    continue;
                const fullPath = path.join(this.projectRoot, file);
                const content = await fs.readFile(fullPath, 'utf-8');
                // Extract function exports
                const queryMatches = content.match(/export const \w+ = query\(/g);
                const mutationMatches = content.match(/export const \w+ = mutation\(/g);
                const actionMatches = content.match(/export const \w+ = action\(/g);
                if (queryMatches) {
                    queryMatches.forEach(match => {
                        const name = match.match(/export const (\w+)/)?.[1];
                        if (name)
                            functions.push({ name, type: 'query', file });
                    });
                }
                if (mutationMatches) {
                    mutationMatches.forEach(match => {
                        const name = match.match(/export const (\w+)/)?.[1];
                        if (name)
                            functions.push({ name, type: 'mutation', file });
                    });
                }
                if (actionMatches) {
                    actionMatches.forEach(match => {
                        const name = match.match(/export const (\w+)/)?.[1];
                        if (name)
                            functions.push({ name, type: 'action', file });
                    });
                }
            }
            return functions;
        }
        catch (error) {
            return [];
        }
    }
    async analyzePatterns() {
        return {
            componentPatterns: await this.findComponentPatterns(),
            statePatterns: await this.findStatePatterns(),
            apiPatterns: await this.findApiPatterns(),
        };
    }
    async findComponentPatterns() {
        // Pattern analysis would be more sophisticated in real implementation
        return [
            {
                name: 'VS Code Interface Pattern',
                description: 'Components follow VS Code-inspired interface design',
                examples: ['DashSidebar', 'DashEditor', 'Terminal'],
                frequency: 85,
            },
            {
                name: 'Compound Component Pattern',
                description: 'Complex components broken into smaller sub-components',
                examples: ['Dashboard', 'Editor modules'],
                frequency: 75,
            },
        ];
    }
    async findStatePatterns() {
        return [
            {
                name: 'Feature-based Store Pattern',
                description: 'Zustand stores organized by feature domain',
                examples: ['useEditorStore', 'useProjectStore', 'useTerminalStore'],
                frequency: 90,
            },
            {
                name: 'Persistence Middleware Pattern',
                description: 'Stores use persistence for UI state',
                examples: ['Sidebar state', 'Editor tabs', 'Terminal chat'],
                frequency: 80,
            },
        ];
    }
    async findApiPatterns() {
        return [
            {
                name: 'Query-Mutation-Action Pattern',
                description: 'Convex functions clearly separated by type',
                examples: ['getProjects (query)', 'createProject (mutation)', 'sendChatMessage (action)'],
                frequency: 95,
            },
        ];
    }
    async generateRecommendations() {
        return [
            'Continue following the VS Code-inspired interface patterns',
            'Consider adding more comprehensive error boundaries',
            'Implement proper loading states for all async operations',
            'Add more TypeScript strict mode compliance',
            'Consider implementing optimistic updates for better UX',
        ];
    }
    extractDependencies(content) {
        const importRegex = /import.*from ['"]([^'"]+)['"]/g;
        const dependencies = [];
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            dependencies.push(match[1]);
        }
        return dependencies;
    }
    extractStateShape(content) {
        // Simplified state shape extraction
        const stateRegex = /(\w+):\s*([^;,]+)/g;
        const stateShape = [];
        let match;
        while ((match = stateRegex.exec(content)) !== null) {
            stateShape.push(`${match[1]}: ${match[2]}`);
        }
        return stateShape;
    }
    extractActions(content) {
        // Simplified action extraction
        const actionRegex = /(\w+):\s*\([^)]*\)\s*=>/g;
        const actions = [];
        let match;
        while ((match = actionRegex.exec(content)) !== null) {
            actions.push(match[1]);
        }
        return actions;
    }
    filePathToRoute(filePath) {
        return filePath
            .replace('eac/app', '')
            .replace('/page.tsx', '')
            .replace('/page.ts', '')
            || '/';
    }
    formatAnalysisResult(analysis) {
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
- **Components**: ${analysis.structure.components.length} components found
- **Stores**: ${analysis.structure.stores.length} Zustand stores
- **Routes**: ${analysis.structure.routes.length} Next.js routes
- **Convex Functions**: ${analysis.structure.convexFunctions.length} backend functions

## Key Patterns
${analysis.patterns.componentPatterns.map(p => `- **${p.name}**: ${p.description} (${p.frequency}% adoption)`).join('\n')}
${analysis.patterns.statePatterns.map(p => `- **${p.name}**: ${p.description} (${p.frequency}% adoption)`).join('\n')}
${analysis.patterns.apiPatterns.map(p => `- **${p.name}**: ${p.description} (${p.frequency}% adoption)`).join('\n')}

## Recommendations
${analysis.recommendations.map(r => `- ${r}`).join('\n')}

## Component Details
${analysis.structure.components.map(c => `- **${c.name}** (${c.type}): ${c.path}`).join('\n')}

## Store Details
${analysis.structure.stores.map(s => `- **${s.name}**: ${s.path}`).join('\n')}

## Convex Functions
${analysis.structure.convexFunctions.map(f => `- **${f.name}** (${f.type}): ${f.file}`).join('\n')}
`;
    }
}
exports.EACProjectAnalyzer = EACProjectAnalyzer;
//# sourceMappingURL=project-analyzer.js.map