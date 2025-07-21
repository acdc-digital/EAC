/**
 * Reddit API Analyzer for EAC MCP Server
 * Analyzes Reddit integration patterns, post performance, and social media workflows
 */
export interface RedditConnectionInfo {
    id: string;
    platform: string;
    isConnected: boolean;
    hasValidTokens: boolean;
    username?: string;
    lastUsed?: number;
}
export interface RedditPostInfo {
    id: string;
    title: string;
    subreddit: string;
    status: 'draft' | 'scheduled' | 'published' | 'failed';
    publishAt?: number;
    publishedUrl?: string;
    redditId?: string;
    analytics?: {
        score?: number;
        upvoteRatio?: number;
        numComments?: number;
    };
}
export interface RedditWorkflowAnalysis {
    totalPosts: number;
    postsByStatus: {
        draft: number;
        scheduled: number;
        published: number;
        failed: number;
    };
    popularSubreddits: Array<{
        name: string;
        postCount: number;
        averageScore: number;
    }>;
    schedulingPatterns: {
        averageScheduleAhead: number;
        bestPerformingTimes: string[];
        failureRate: number;
    };
}
export interface RedditIntegrationAnalysis {
    connections: RedditConnectionInfo[];
    posts: RedditPostInfo[];
    workflow: RedditWorkflowAnalysis;
    codePatterns: {
        editorComponents: string[];
        convexFunctions: string[];
        storeIntegrations: string[];
        calendarIntegrations: string[];
    };
    recommendations: string[];
}
export declare class EACRedditAnalyzer {
    private projectRoot;
    constructor(projectRoot: string);
    analyzeRedditIntegration(args: any): Promise<{
        content: any;
    }>;
    private performRedditAnalysis;
    private analyzeRedditCodePatterns;
    private analyzeRedditSchema;
    private analyzeRedditComponents;
    private generateRecommendations;
    private formatRedditAnalysis;
    generateIntegrationGuide(): Promise<string>;
}
//# sourceMappingURL=reddit-analyzer.d.ts.map