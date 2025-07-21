/**
 * Social Media Workflow Optimizer for EAC MCP Server
 * Analyzes and optimizes social media posting workflows based on EAC patterns
 */
export interface WorkflowStep {
    id: string;
    name: string;
    description: string;
    estimatedTime: number;
    dependencies: string[];
    automation: 'full' | 'partial' | 'manual';
    status: 'completed' | 'in-progress' | 'pending' | 'blocked';
}
export interface SocialMediaWorkflow {
    name: string;
    platform: 'reddit' | 'twitter' | 'facebook' | 'instagram' | 'all';
    steps: WorkflowStep[];
    totalTime: number;
    automationLevel: number;
    successRate: number;
}
export interface WorkflowOptimization {
    currentWorkflow: SocialMediaWorkflow;
    optimizedWorkflow: SocialMediaWorkflow;
    improvements: {
        timeReduction: number;
        automationIncrease: number;
        newAutomations: string[];
        processImprovements: string[];
    };
    implementation: {
        priority: 'high' | 'medium' | 'low';
        complexity: 'simple' | 'moderate' | 'complex';
        estimatedDevelopmentTime: string;
        requiredComponents: string[];
    };
}
export declare class EACSocialWorkflowOptimizer {
    private projectRoot;
    constructor(projectRoot: string);
    optimizeWorkflow(args: {
        platform?: string;
        focus?: string;
    }): Promise<{
        content: any;
    }>;
    private getCurrentWorkflow;
    private generateOptimization;
    private calculateAutomationLevel;
    private formatWorkflowOptimization;
    getWorkflowTemplates(): Promise<any>;
}
//# sourceMappingURL=social-workflow-optimizer.d.ts.map