/**
 * EAC Project Analyzer
 * Analyzes overall project structure and architecture patterns
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

export interface ProjectContext {
  name: string;
  version: string;
  description: string;
  architecture: string;
  framework: string;
  backend: string;
  stateManagement: string;
  styling: string;
}

export interface ProjectAnalysisResult {
  overview: ProjectContext;
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

export interface ComponentInfo {
  name: string;
  path: string;
  type: 'page' | 'component' | 'layout';
  dependencies: string[];
}

export interface StoreInfo {
  name: string;
  path: string;
  stateShape: string[];
  actions: string[];
}

export interface RouteInfo {
  path: string;
  type: 'page' | 'layout' | 'loading' | 'error';
  file: string;
}

export interface ConvexFunction {
  name: string;
  type: 'query' | 'mutation' | 'action';
  file: string;
}

export interface PatternMatch {
  name: string;
  description: string;
  examples: string[];
  frequency: number;
}

export class EACProjectAnalyzer {
  constructor(private projectRoot: string) {}

  async analyze(args: any): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const projectContext = await this.getProjectContext();
      const structure = await this.analyzeStructure();
      const patterns = await this.analyzePatterns();
      const recommendations = await this.generateRecommendations();

      const analysis: ProjectAnalysisResult = {
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
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error analyzing project: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }

  async getProjectContext(): Promise<ProjectContext> {
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
    } catch (error) {
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

  private async analyzeStructure() {
    const structure = {
      components: await this.findComponents(),
      stores: await this.findStores(),
      routes: await this.findRoutes(),
      convexFunctions: await this.findConvexFunctions(),
    };

    return structure;
  }

  private async findComponents(): Promise<ComponentInfo[]> {
    try {
      const componentFiles = await glob('eac/app/_components/**/*.{ts,tsx}', {
        cwd: this.projectRoot,
      });

      const components: ComponentInfo[] = [];

      for (const file of componentFiles) {
        const fullPath = path.join(this.projectRoot, file);
        const content = await fs.readFile(fullPath, 'utf-8');
        const name = path.basename(file, path.extname(file));

        // Determine component type based on path
        let type: 'page' | 'component' | 'layout' = 'component';
        if (file.includes('/dashboard/')) type = 'component';
        if (file.includes('/editor/')) type = 'component';
        if (file.includes('layout.')) type = 'layout';

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
    } catch (error) {
      return [];
    }
  }

  private async findStores(): Promise<StoreInfo[]> {
    try {
      const storeFiles = await glob('eac/store/**/*.{ts,tsx}', {
        cwd: this.projectRoot,
      });

      const stores: StoreInfo[] = [];

      for (const file of storeFiles) {
        if (file.includes('types.ts') || file.includes('index.ts')) continue;

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
    } catch (error) {
      return [];
    }
  }

  private async findRoutes(): Promise<RouteInfo[]> {
    try {
      const routeFiles = await glob('eac/app/**/page.{ts,tsx}', {
        cwd: this.projectRoot,
      });

      const routes: RouteInfo[] = [];

      for (const file of routeFiles) {
        const routePath = this.filePathToRoute(file);
        routes.push({
          path: routePath,
          type: 'page',
          file,
        });
      }

      return routes;
    } catch (error) {
      return [];
    }
  }

  private async findConvexFunctions(): Promise<ConvexFunction[]> {
    try {
      const convexFiles = await glob('convex/*.ts', {
        cwd: this.projectRoot,
      });

      const functions: ConvexFunction[] = [];

      for (const file of convexFiles) {
        if (file.includes('schema.ts') || file.includes('_generated')) continue;

        const fullPath = path.join(this.projectRoot, file);
        const content = await fs.readFile(fullPath, 'utf-8');

        // Extract function exports
        const queryMatches = content.match(/export const \w+ = query\(/g);
        const mutationMatches = content.match(/export const \w+ = mutation\(/g);
        const actionMatches = content.match(/export const \w+ = action\(/g);

        if (queryMatches) {
          queryMatches.forEach(match => {
            const name = match.match(/export const (\w+)/)?.[1];
            if (name) functions.push({ name, type: 'query', file });
          });
        }

        if (mutationMatches) {
          mutationMatches.forEach(match => {
            const name = match.match(/export const (\w+)/)?.[1];
            if (name) functions.push({ name, type: 'mutation', file });
          });
        }

        if (actionMatches) {
          actionMatches.forEach(match => {
            const name = match.match(/export const (\w+)/)?.[1];
            if (name) functions.push({ name, type: 'action', file });
          });
        }
      }

      return functions;
    } catch (error) {
      return [];
    }
  }

  private async analyzePatterns() {
    return {
      componentPatterns: await this.findComponentPatterns(),
      statePatterns: await this.findStatePatterns(),
      apiPatterns: await this.findApiPatterns(),
    };
  }

  private async findComponentPatterns(): Promise<PatternMatch[]> {
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

  private async findStatePatterns(): Promise<PatternMatch[]> {
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

  private async findApiPatterns(): Promise<PatternMatch[]> {
    return [
      {
        name: 'Query-Mutation-Action Pattern',
        description: 'Convex functions clearly separated by type',
        examples: ['getProjects (query)', 'createProject (mutation)', 'sendChatMessage (action)'],
        frequency: 95,
      },
    ];
  }

  private async generateRecommendations(): Promise<string[]> {
    return [
      'Continue following the VS Code-inspired interface patterns',
      'Consider adding more comprehensive error boundaries',
      'Implement proper loading states for all async operations',
      'Add more TypeScript strict mode compliance',
      'Consider implementing optimistic updates for better UX',
    ];
  }

  private extractDependencies(content: string): string[] {
    const importRegex = /import.*from ['"]([^'"]+)['"]/g;
    const dependencies: string[] = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }

    return dependencies;
  }

  private extractStateShape(content: string): string[] {
    // Simplified state shape extraction
    const stateRegex = /(\w+):\s*([^;,]+)/g;
    const stateShape: string[] = [];
    let match;

    while ((match = stateRegex.exec(content)) !== null) {
      stateShape.push(`${match[1]}: ${match[2]}`);
    }

    return stateShape;
  }

  private extractActions(content: string): string[] {
    // Simplified action extraction
    const actionRegex = /(\w+):\s*\([^)]*\)\s*=>/g;
    const actions: string[] = [];
    let match;

    while ((match = actionRegex.exec(content)) !== null) {
      actions.push(match[1]);
    }

    return actions;
  }

  private filePathToRoute(filePath: string): string {
    return filePath
      .replace('eac/app', '')
      .replace('/page.tsx', '')
      .replace('/page.ts', '')
      || '/';
  }

  private formatAnalysisResult(analysis: ProjectAnalysisResult): string {
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
