// Scheduling Agent
// /Users/matthewsimon/Projects/eac/eac/store/agents/schedulingAgent.ts

import { AgentTool, BaseAgent } from './base';
import type { ConvexMutations } from './types';

export class SchedulingAgent extends BaseAgent {
  id = "content-scheduler";
  name = "Content Scheduler";
  description = "Automatically schedule unscheduled content posts based on instructions and optimal timing";
  icon = "Calendar";
  
  tools: AgentTool[] = [
    {
      id: "schedule-content",
      name: "Schedule Content",
      command: "/schedule",
      description: "Automatically schedule unscheduled content with intelligent timing",
      parameters: [
        {
          name: "platform",
          type: "select",
          description: "Platform to schedule content for",
          required: false,
          options: ["all", "twitter", "reddit"],
        },
        {
          name: "strategy",
          type: "select",
          description: "Scheduling strategy to use",
          required: false,
          options: ["optimal", "spread", "custom"],
          default: "optimal",
        },
        {
          name: "timeframe",
          type: "string",
          description: "Time frame for scheduling (e.g., 'next week', '3 days', 'tomorrow')",
          required: false,
          default: "next week",
        },
        {
          name: "frequency",
          type: "string", 
          description: "Posting frequency (e.g., 'daily', 'twice daily', 'every 2 hours')",
          required: false,
          default: "daily",
        },
      ],
    },
    {
      id: "analyze-content",
      name: "Analyze Content",
      command: "/analyze-content",
      description: "Analyze unscheduled content and provide scheduling recommendations",
      parameters: [
        {
          name: "platform",
          type: "select",
          description: "Platform to analyze",
          required: false,
          options: ["all", "twitter", "reddit"],
        },
      ],
    },
  ];

  async execute(
    tool: AgentTool,
    input: string,
    convexMutations: ConvexMutations
  ): Promise<string> {
    if (tool.id === "schedule-content") {
      return await this.scheduleContent(input, convexMutations);
    }
    
    if (tool.id === "analyze-content") {
      return await this.analyzeContent(input, convexMutations);
    }

    throw new Error(`Unknown tool: ${tool.id}`);
  }

  private async scheduleContent(input: string, convexMutations: ConvexMutations): Promise<string> {
    try {
      console.log(`📅 Scheduling Agent: Processing request: "${input}"`);
      
      // Clean the input by removing the command
      let cleanInput = input.trim();
      if (cleanInput.startsWith("/schedule")) {
        cleanInput = cleanInput.replace("/schedule", "").trim();
      }

      // Parse parameters from input
      const params = this.parseSchedulingParameters(cleanInput);
      
      // Get unscheduled posts from database
      const unscheduledPosts = await this.getUnscheduledPosts(params.platform, convexMutations);
      
      if (unscheduledPosts.length === 0) {
        return `✅ No unscheduled ${params.platform === 'all' ? 'content' : params.platform + ' posts'} found. All content appears to be scheduled!`;
      }

      console.log(`📋 Found ${unscheduledPosts.length} unscheduled posts to process`);

      // Generate schedule based on strategy
      const schedule = this.generateSchedule(unscheduledPosts, params);
      
      // Apply scheduling to posts
      const results = await this.applyScheduling(schedule, convexMutations);
      
      // Update file contents with schedule information
      await this.updateFileSchedules(schedule, convexMutations);

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      let resultMessage = `📅 Scheduling completed:\n`;
      resultMessage += `✅ Successfully scheduled: ${successCount} posts\n`;
      if (errorCount > 0) {
        resultMessage += `❌ Errors: ${errorCount} posts\n`;
      }
      
      // Add schedule summary
      resultMessage += `\n📊 Schedule Summary:\n`;
      schedule.forEach((item, index) => {
        const date = new Date(item.scheduledFor);
        const platform = item.post.fileType.toUpperCase();
        resultMessage += `${index + 1}. [${platform}] ${date.toLocaleDateString()} ${date.toLocaleTimeString()} - ${item.post.fileName}\n`;
      });

      return resultMessage;
    } catch (error) {
      console.error("❌ Scheduling Agent error:", error);
      return `❌ Scheduling failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private async analyzeContent(input: string, convexMutations: ConvexMutations): Promise<string> {
    try {
      console.log(`🔍 Scheduling Agent: Analyzing content: "${input}"`);
      
      // Clean the input by removing the command
      let cleanInput = input.trim();
      if (cleanInput.startsWith("/analyze-content")) {
        cleanInput = cleanInput.replace("/analyze-content", "").trim();
      }

      const params = this.parseAnalysisParameters(cleanInput);
      
      // Get unscheduled posts from database
      const unscheduledPosts = await this.getUnscheduledPosts(params.platform, convexMutations);
      
      if (unscheduledPosts.length === 0) {
        return `✅ No unscheduled ${params.platform === 'all' ? 'content' : params.platform + ' posts'} found to analyze.`;
      }

      let analysisResult = `📊 Content Analysis Report\n\n`;
      analysisResult += `📈 Total unscheduled posts: ${unscheduledPosts.length}\n\n`;

      // Analyze by platform
      const platformCounts = unscheduledPosts.reduce((acc, post) => {
        acc[post.fileType] = (acc[post.fileType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      analysisResult += `📱 By Platform:\n`;
      Object.entries(platformCounts).forEach(([platform, count]) => {
        analysisResult += `  • ${platform.toUpperCase()}: ${count} posts\n`;
      });

      // Analyze content types and suggest optimal scheduling
      analysisResult += `\n🎯 Scheduling Recommendations:\n`;
      
      if (platformCounts.twitter) {
        analysisResult += `  • Twitter: Best times are 9 AM, 1 PM, 3 PM weekdays\n`;
      }
      
      if (platformCounts.reddit) {
        analysisResult += `  • Reddit: Best times are 6-8 AM, 12-2 PM, 7-9 PM\n`;
      }

      analysisResult += `\n📋 Unscheduled Posts:\n`;
      unscheduledPosts.forEach((post, index) => {
        const contentPreview = post.content.length > 50 
          ? post.content.substring(0, 50) + '...' 
          : post.content;
        analysisResult += `  ${index + 1}. [${post.fileType.toUpperCase()}] ${post.fileName}\n`;
        analysisResult += `     Content: "${contentPreview}"\n`;
        analysisResult += `     Status: ${post.status}\n`;
      });

      analysisResult += `\n💡 Use "/schedule" to automatically schedule these posts!`;

      return analysisResult;
    } catch (error) {
      console.error("❌ Content analysis error:", error);
      return `❌ Content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private async getUnscheduledPosts(platform: string, convexMutations: ConvexMutations): Promise<any[]> {
    try {
      // Get all posts from agentPosts table using getAllPosts mutation
      if (!convexMutations.getAllPosts) {
        throw new Error("getAllPosts mutation not available");
      }

      const allPosts = await convexMutations.getAllPosts();
      
      // Filter unscheduled posts (those without scheduledFor or with status 'draft')
      let unscheduledPosts = allPosts.filter((post: any) => {
        const isUnscheduled = !post.scheduledFor || post.status === 'draft';
        const platformMatches = platform === 'all' || post.fileType === platform;
        return isUnscheduled && platformMatches;
      });

      console.log(`📊 Found ${unscheduledPosts.length} unscheduled posts for platform: ${platform}`);
      return unscheduledPosts;
    } catch (error) {
      console.error("❌ Error getting unscheduled posts:", error);
      throw error;
    }
  }

  private generateSchedule(posts: any[], params: any): Array<{post: any, scheduledFor: number}> {
    const schedule: Array<{post: any, scheduledFor: number}> = [];
    const now = new Date();
    let currentTime = new Date(now);
    
    // Parse timeframe
    const timeframeDays = this.parseTimeframe(params.timeframe);
    const frequencyHours = this.parseFrequency(params.frequency);
    
    // Sort posts by platform priority (Twitter first for faster engagement)
    const sortedPosts = [...posts].sort((a, b) => {
      if (a.fileType === 'twitter' && b.fileType !== 'twitter') return -1;
      if (a.fileType !== 'twitter' && b.fileType === 'twitter') return 1;
      return 0;
    });

    // Generate optimal scheduling based on strategy
    sortedPosts.forEach((post, index) => {
      let scheduledTime: Date;
      
      switch (params.strategy) {
        case 'optimal':
          scheduledTime = this.getOptimalTime(post.fileType, currentTime, index);
          break;
        case 'spread':
          scheduledTime = this.getSpreadTime(currentTime, timeframeDays, index, sortedPosts.length);
          break;
        case 'custom':
        default:
          scheduledTime = this.getCustomTime(currentTime, frequencyHours * index);
          break;
      }
      
      schedule.push({
        post,
        scheduledFor: scheduledTime.getTime()
      });
      
      // Move current time forward for next post
      currentTime = new Date(scheduledTime.getTime() + (frequencyHours * 60 * 60 * 1000));
    });

    return schedule;
  }

  private getOptimalTime(platform: string, baseTime: Date, index: number): Date {
    const scheduledTime = new Date(baseTime);
    
    // Add days to spread posts
    scheduledTime.setDate(scheduledTime.getDate() + Math.floor(index / 3));
    
    if (platform === 'twitter') {
      // Twitter optimal times: 9 AM, 1 PM, 3 PM
      const optimalHours = [9, 13, 15];
      const hourIndex = index % optimalHours.length;
      scheduledTime.setHours(optimalHours[hourIndex], 0, 0, 0);
    } else if (platform === 'reddit') {
      // Reddit optimal times: 6 AM, 12 PM, 7 PM
      const optimalHours = [6, 12, 19];
      const hourIndex = index % optimalHours.length;
      scheduledTime.setHours(optimalHours[hourIndex], 0, 0, 0);
    }
    
    // Skip weekends for business content
    while (scheduledTime.getDay() === 0 || scheduledTime.getDay() === 6) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    return scheduledTime;
  }

  private getSpreadTime(baseTime: Date, timeframeDays: number, index: number, totalPosts: number): Date {
    const scheduledTime = new Date(baseTime);
    const intervalDays = timeframeDays / totalPosts;
    const daysToAdd = intervalDays * index;
    
    scheduledTime.setDate(scheduledTime.getDate() + Math.floor(daysToAdd));
    scheduledTime.setHours(9 + (index % 8), 0, 0, 0); // Spread throughout business hours
    
    return scheduledTime;
  }

  private getCustomTime(baseTime: Date, hoursOffset: number): Date {
    const scheduledTime = new Date(baseTime);
    scheduledTime.setTime(scheduledTime.getTime() + (hoursOffset * 60 * 60 * 1000));
    return scheduledTime;
  }

  private parseTimeframe(timeframe: string): number {
    const lower = timeframe.toLowerCase();
    if (lower.includes('week')) return 7;
    if (lower.includes('day')) {
      const match = lower.match(/(\d+)\s*day/);
      return match ? parseInt(match[1]) : 1;
    }
    if (lower === 'tomorrow') return 1;
    return 7; // Default to week
  }

  private parseFrequency(frequency: string): number {
    const lower = frequency.toLowerCase();
    if (lower.includes('twice daily')) return 12;
    if (lower.includes('daily')) return 24;
    if (lower.includes('every')) {
      const match = lower.match(/every\s*(\d+)\s*hour/);
      return match ? parseInt(match[1]) : 24;
    }
    return 24; // Default to daily
  }

  private async applyScheduling(schedule: Array<{post: any, scheduledFor: number}>, convexMutations: ConvexMutations): Promise<Array<{success: boolean, error?: string, fileName: string}>> {
    const results: Array<{success: boolean, error?: string, fileName: string}> = [];
    
    for (const item of schedule) {
      try {
        // Update post in agentPosts table with schedule using schedulePost mutation
        if (!convexMutations.schedulePost) {
          throw new Error("schedulePost mutation not available");
        }

        await convexMutations.schedulePost({
          fileName: item.post.fileName,
          fileType: item.post.fileType,
          content: item.post.content,
          title: item.post.title,
          platformData: item.post.platformData,
          scheduledFor: item.scheduledFor,
          userId: item.post.userId,
        });

        results.push({
          success: true,
          fileName: item.post.fileName
        });

        console.log(`✅ Scheduled ${item.post.fileName} for ${new Date(item.scheduledFor).toLocaleString()}`);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          fileName: item.post.fileName
        });
        console.error(`❌ Failed to schedule ${item.post.fileName}:`, error);
      }
    }
    
    return results;
  }

  private async updateFileSchedules(schedule: Array<{post: any, scheduledFor: number}>, convexMutations: ConvexMutations): Promise<void> {
    try {
      // Import editor store to update file contents
      const { useEditorStore } = await import("@/store");
      const editorStore = useEditorStore.getState();

      for (const item of schedule) {
        // Find the file in the editor store
        const file = [...editorStore.projectFiles, ...editorStore.financialFiles].find(
          f => f.name === item.post.fileName || f.name === item.post.fileName.replace('.x', '')
        );

        if (file) {
          try {
            // Parse existing file content
            let existingContent;
            try {
              existingContent = JSON.parse(file.content || "{}");
            } catch {
              existingContent = {};
            }

            // Update with scheduling information  
            const scheduledDateTime = new Date(item.scheduledFor);
            const updatedContent = {
              ...existingContent,
              status: "scheduled",
              schedule: {
                scheduledDate: scheduledDateTime.toISOString().split("T")[0],
                scheduledTime: scheduledDateTime.toTimeString().slice(0, 5),
              },
              scheduledFor: item.scheduledFor,
            };

            // Update file content in editor store
            editorStore.updateFileContent(
              file.id,
              JSON.stringify(updatedContent, null, 2)
            );

            console.log(`📝 Updated file ${file.name} with schedule information`);
          } catch (error) {
            console.error(`❌ Failed to update file ${file.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("❌ Error updating file schedules:", error);
    }
  }

  private parseSchedulingParameters(input: string): any {
    const params = {
      platform: 'all',
      strategy: 'optimal',
      timeframe: 'next week',
      frequency: 'daily',
    };

    // Extract platform
    const platformMatch = input.match(/platform:\s*(\w+)/i);
    if (platformMatch) {
      params.platform = platformMatch[1].toLowerCase();
    }

    // Extract strategy
    const strategyMatch = input.match(/strategy:\s*(\w+)/i);
    if (strategyMatch) {
      params.strategy = strategyMatch[1].toLowerCase();
    }

    // Extract timeframe
    const timeframeMatch = input.match(/timeframe:\s*([\w\s]+?)(?:\s|$)/i);
    if (timeframeMatch) {
      params.timeframe = timeframeMatch[1].trim();
    }

    // Extract frequency
    const frequencyMatch = input.match(/frequency:\s*([\w\s]+?)(?:\s|$)/i);
    if (frequencyMatch) {
      params.frequency = frequencyMatch[1].trim();
    }

    return params;
  }

  private parseAnalysisParameters(input: string): any {
    const params = {
      platform: 'all',
    };

    // Extract platform
    const platformMatch = input.match(/platform:\s*(\w+)/i);
    if (platformMatch) {
      params.platform = platformMatch[1].toLowerCase();
    }

    return params;
  }
}

// Export the singleton instance
export const schedulingAgent = new SchedulingAgent();
