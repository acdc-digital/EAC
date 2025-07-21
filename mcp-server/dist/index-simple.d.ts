#!/usr/bin/env node
/**
 * EAC MCP Server Entry Point - Simplified Implementation
 * Model Context Protocol server for the EAC Financial Dashboard
 */
declare class EACMCPServer {
    private projectRoot;
    constructor();
    analyze(): Promise<string>;
    private analyzeProject;
    private getPackageJson;
    private analyzeStructure;
    private countFiles;
    private analyzePatterns;
    private formatAnalysis;
    run(): Promise<void>;
}
export { EACMCPServer };
//# sourceMappingURL=index-simple.d.ts.map