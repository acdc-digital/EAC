/**
 * EAC Convex Analyzer
 * Analyzes Convex schema, functions, and database patterns
 */
export declare class EACConvexAnalyzer {
    private projectRoot;
    constructor(projectRoot: string);
    analyzeConvex(args: any): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
    getPatterns(): Promise<string>;
}
//# sourceMappingURL=convex-analyzer.d.ts.map