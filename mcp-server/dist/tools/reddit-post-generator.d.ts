/**
 * Reddit Post Generator for EAC MCP Server
 * Generates Reddit post templates and content based on EAC patterns
 */
export interface RedditPostTemplate {
    title: string;
    content: string;
    subreddit: string;
    type: 'self' | 'link';
    tags: string[];
    scheduleSuggestion?: string;
}
export interface RedditContentOptions {
    topic?: string;
    tone?: 'professional' | 'casual' | 'technical' | 'educational';
    length?: 'short' | 'medium' | 'long';
    includeCall2Action?: boolean;
    targetSubreddits?: string[];
    type?: 'post' | 'template' | 'optimization';
    subreddit?: string;
}
export declare class EACRedditPostGenerator {
    private projectRoot;
    constructor(projectRoot: string);
    generateRedditPost(args: RedditContentOptions): Promise<{
        content: any;
    }>;
    private generatePostTemplate;
    private getPostTemplates;
    private selectTemplateByOptions;
    private customizeTemplate;
    private getRedditTechnicalDetails;
    private getRedditFeatureList;
    private generateTopicTags;
    private getAdditionalContent;
    private generateOptimizationSuggestions;
    private getOptimalPostingTimes;
    private generateTitleVariations;
    private getEngagementTips;
    private suggestSubreddits;
    private formatPostGeneration;
}
//# sourceMappingURL=reddit-post-generator.d.ts.map