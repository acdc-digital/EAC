/**
 * EAC Project Analyzer
 * Analyzes overall project structure and architecture patterns
 */
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
export declare class EACProjectAnalyzer {
    private projectRoot;
    constructor(projectRoot: string);
    analyze(args: any): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
    getProjectContext(): Promise<ProjectContext>;
    private analyzeStructure;
    private findComponents;
    private findStores;
    private findRoutes;
    private findConvexFunctions;
    private analyzePatterns;
    private findComponentPatterns;
    private findStatePatterns;
    private findApiPatterns;
    private generateRecommendations;
    private extractDependencies;
    private extractStateShape;
    private extractActions;
    private filePathToRoute;
    private formatAnalysisResult;
}
//# sourceMappingURL=project-analyzer.d.ts.map