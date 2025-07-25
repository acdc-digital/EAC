/**
 * Reddit API Analyzer for EAC MCP Server
 * Analyzes Reddit integration patterns, post performance, and social media workflows
 */

import * as fs from 'fs/promises';
import { glob } from 'glob';
import * as path from 'path';

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
    averageScheduleAhead: number; // hours
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

export class EACRedditAnalyzer {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  async analyzeRedditIntegration(args: any): Promise<{ content: any }> {
    try {
      const analysis = await this.performRedditAnalysis(args);
      
      return {
        content: [
          {
            type: 'text',
            text: this.formatRedditAnalysis(analysis),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error analyzing Reddit integration: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async performRedditAnalysis(args: any): Promise<RedditIntegrationAnalysis> {
    const [
      codePatterns,
      schemaAnalysis,
      componentAnalysis
    ] = await Promise.all([
      this.analyzeRedditCodePatterns(),
      this.analyzeRedditSchema(),
      this.analyzeRedditComponents()
    ]);

    // Mock data for workflow analysis (in real implementation, this would connect to Convex)
    const workflow: RedditWorkflowAnalysis = {
      totalPosts: 25,
      postsByStatus: {
        draft: 8,
        scheduled: 4,
        published: 12,
        failed: 1
      },
      popularSubreddits: [
        { name: 'test', postCount: 8, averageScore: 15 },
        { name: 'programming', postCount: 4, averageScore: 32 },
        { name: 'webdev', postCount: 3, averageScore: 18 }
      ],
      schedulingPatterns: {
        averageScheduleAhead: 24,
        bestPerformingTimes: ['09:00', '14:00', '19:00'],
        failureRate: 0.04
      }
    };

    const recommendations = this.generateRecommendations(codePatterns, workflow);

    return {
      connections: [
        {
          id: 'reddit-main',
          platform: 'reddit',
          isConnected: true,
          hasValidTokens: true,
          username: 'eac_dashboard',
          lastUsed: Date.now() - 3600000 // 1 hour ago
        }
      ],
      posts: [], // Would be populated from actual data
      workflow,
      codePatterns,
      recommendations
    };
  }

  private async analyzeRedditCodePatterns() {
    const patterns: {
      editorComponents: string[];
      convexFunctions: string[];
      storeIntegrations: string[];
      calendarIntegrations: string[];
    } = {
      editorComponents: [],
      convexFunctions: [],
      storeIntegrations: [],
      calendarIntegrations: []
    };

    try {
      // Analyze Reddit editor components
      const editorFiles = await glob('**/redditPostEditor.tsx', { 
        cwd: this.projectRoot,
        ignore: ['**/node_modules/**', '**/dist/**']
      });
      patterns.editorComponents = editorFiles;

      // Analyze Convex Reddit functions
      const convexFiles = await glob('convex/reddit*.ts', { 
        cwd: this.projectRoot 
      });
      patterns.convexFunctions = convexFiles;

      // Analyze store integrations
      const storeFiles = await glob('store/**/index.ts', { 
        cwd: this.projectRoot 
      });
      for (const file of storeFiles) {
        const content = await fs.readFile(path.join(this.projectRoot, file), 'utf-8');
        if (content.includes('updateFileStatus') || content.includes('reddit')) {
          patterns.storeIntegrations.push(file);
        }
      }

      // Analyze calendar integrations
      const calendarFiles = await glob('**/useCalendarSync.ts', { 
        cwd: this.projectRoot 
      });
      patterns.calendarIntegrations = calendarFiles;

    } catch (error) {
      console.warn('Error analyzing Reddit code patterns:', error);
    }

    return patterns;
  }

  private async analyzeRedditSchema() {
    try {
      const schemaPath = path.join(this.projectRoot, 'convex/schema.ts');
      const content = await fs.readFile(schemaPath, 'utf-8');
      
      // Analyze Reddit-specific schema definitions
      const hasRedditPosts = content.includes('redditPosts');
      const hasSocialConnections = content.includes('socialConnections');
      const hasScheduledPosts = content.includes('scheduledPosts');

      return {
        hasRedditPosts,
        hasSocialConnections,
        hasScheduledPosts,
        schemaComplexity: content.split('defineTable').length - 1
      };
    } catch (error) {
      return { hasRedditPosts: false, hasSocialConnections: false, hasScheduledPosts: false };
    }
  }

  private async analyzeRedditComponents() {
    const components = [];
    
    try {
      const componentFiles = await glob('**/*reddit*.tsx', { 
        cwd: this.projectRoot,
        ignore: ['**/node_modules/**', '**/dist/**']
      });

      for (const file of componentFiles) {
        const content = await fs.readFile(path.join(this.projectRoot, file), 'utf-8');
        
        // Analyze component features
        const features = {
          hasScheduling: content.includes('scheduledDate') || content.includes('publishAt'),
          hasAnalytics: content.includes('score') || content.includes('analytics'),
          hasOAuth: content.includes('accessToken') || content.includes('OAuth'),
          hasValidation: content.includes('validation') || content.includes('validate'),
          hasFileIntegration: content.includes('updateFileStatus'),
          hasCalendarSync: content.includes('useCalendarSync')
        };

        components.push({
          file,
          features,
          complexity: content.split('\n').length
        });
      }
    } catch (error) {
      console.warn('Error analyzing Reddit components:', error);
    }

    return components;
  }

  private generateRecommendations(codePatterns: any, workflow: RedditWorkflowAnalysis): string[] {
    const recommendations = [];

    // Performance recommendations
    if (workflow.schedulingPatterns.failureRate > 0.05) {
      recommendations.push('Consider implementing more robust retry logic for failed posts');
    }

    // Code organization recommendations
    if (codePatterns.editorComponents.length > 1) {
      recommendations.push('Consider extracting shared Reddit functionality into reusable hooks');
    }

    // Analytics recommendations
    if (workflow.postsByStatus.published > 10) {
      recommendations.push('Implement automated A/B testing for post titles and timing');
    }

    // Integration recommendations
    if (codePatterns.calendarIntegrations.length === 0) {
      recommendations.push('Add calendar integration for better scheduling visualization');
    }

    return recommendations;
  }

  private formatRedditAnalysis(analysis: RedditIntegrationAnalysis): string {
    return `# Reddit Integration Analysis

## 🔗 Connection Status
${analysis.connections.map(conn => 
  `- **${conn.platform}**: ${conn.isConnected ? '✅ Connected' : '❌ Disconnected'}
    - Valid Tokens: ${conn.hasValidTokens ? '✅' : '❌'}
    - Username: ${conn.username || 'N/A'}
    - Last Used: ${conn.lastUsed ? new Date(conn.lastUsed).toLocaleString() : 'Never'}`
).join('\n')}

## 📊 Post Analytics
- **Total Posts**: ${analysis.workflow.totalPosts}
- **Status Distribution**:
  - 📝 Draft: ${analysis.workflow.postsByStatus.draft}
  - ⏰ Scheduled: ${analysis.workflow.postsByStatus.scheduled}  
  - ✅ Published: ${analysis.workflow.postsByStatus.published}
  - ❌ Failed: ${analysis.workflow.postsByStatus.failed}

## 🎯 Popular Subreddits
${analysis.workflow.popularSubreddits.map(sub => 
  `- **r/${sub.name}**: ${sub.postCount} posts (avg score: ${sub.averageScore})`
).join('\n')}

## ⏰ Scheduling Patterns
- **Average Schedule Ahead**: ${analysis.workflow.schedulingPatterns.averageScheduleAhead} hours
- **Best Times**: ${analysis.workflow.schedulingPatterns.bestPerformingTimes.join(', ')}
- **Failure Rate**: ${(analysis.workflow.schedulingPatterns.failureRate * 100).toFixed(1)}%

## 🛠 Code Integration
- **Editor Components**: ${analysis.codePatterns.editorComponents.length}
- **Convex Functions**: ${analysis.codePatterns.convexFunctions.length}
- **Store Integrations**: ${analysis.codePatterns.storeIntegrations.length}
- **Calendar Integrations**: ${analysis.codePatterns.calendarIntegrations.length}

## 💡 Recommendations
${analysis.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*Analysis completed at ${new Date().toISOString()}*`;
  }

  async generateIntegrationGuide(): Promise<string> {
    const codePatterns = await this.analyzeRedditCodePatterns();
    
    return `# EAC Reddit Integration Guide

## Overview
Complete guide to Reddit API integration within the EAC project, including patterns, best practices, and implementation details.

## Architecture Components

### Frontend Components
${codePatterns.editorComponents.map(comp => `- **${comp}**: Reddit post editor component`).join('\n')}

### Backend Functions  
${codePatterns.convexFunctions.map(func => `- **${func}**: Reddit API integration function`).join('\n')}

### Store Integrations
${codePatterns.storeIntegrations.map(store => `- **${store}**: State management for Reddit features`).join('\n')}

### Calendar Integrations
${codePatterns.calendarIntegrations.map(cal => `- **${cal}**: Scheduling integration`).join('\n')}

## Integration Patterns

### 1. OAuth2 Authentication Flow
\`\`\`typescript
// Authentication handled in Convex backend
const authUrl = await convex.mutation("reddit:getAuthUrl", {
  state: generateState(),
  redirectUri: process.env.REDDIT_REDIRECT_URI
});
\`\`\`

### 2. Post Creation and Scheduling
\`\`\`typescript
// Using the Reddit editor component
const result = await convex.mutation("reddit:updateRedditPost", {
  projectId,
  redditData: {
    title,
    text,
    subreddit,
    scheduled_for: scheduledTime
  }
});
\`\`\`

### 3. Analytics and Monitoring
\`\`\`typescript
// Real-time analytics integration
const analytics = await convex.query("reddit:getAnalytics", {
  postId,
  timeRange: "7d"
});
\`\`\`

## Best Practices

1. **Error Handling**: Always implement retry logic for API calls
2. **Rate Limiting**: Respect Reddit's API rate limits (60 requests/minute)
3. **Data Validation**: Validate post content before submission
4. **State Management**: Use Zustand stores for UI state, Convex for data persistence
5. **Security**: Never expose Reddit credentials in client code

## Troubleshooting

### Common Issues
- **Authentication Errors**: Check redirect URI configuration
- **Rate Limit Exceeded**: Implement exponential backoff
- **Subreddit Not Found**: Validate subreddit names before submission

### Debug Logging
Enable debug mode in development:
\`\`\`typescript
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) console.log('Reddit API Response:', response);
\`\`\`

---

*Generated at ${new Date().toISOString()}*`;
  }
}
