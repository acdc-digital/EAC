"use strict";
/**
 * EAC Convex Analyzer
 * Analyzes Convex schema, functions, and database patterns
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EACConvexAnalyzer = void 0;
class EACConvexAnalyzer {
    projectRoot;
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
    }
    async analyzeConvex(args) {
        // Implementation will be added in future iterations
        return {
            content: [{
                    type: 'text',
                    text: 'Convex analyzer not yet implemented'
                }]
        };
    }
    async getPatterns() {
        return 'Convex patterns not yet analyzed';
    }
}
exports.EACConvexAnalyzer = EACConvexAnalyzer;
//# sourceMappingURL=convex-analyzer.js.map