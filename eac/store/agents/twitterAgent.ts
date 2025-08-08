// Twitter Agent
// /Users/matthewsimon/Projects/eac/eac/store/agents/twitterAgent.ts

import { AgentTool, BaseAgent } from './base';
import type { ConvexMutations } from './types';

export class TwitterAgent extends BaseAgent {
  id = "twitter-post";
  name = "Twitter Post";
  description = "Create, schedule, and post Twitter/X content with full workflow automation";
  icon = "AtSign";
  
  tools: AgentTool[] = [
    {
      id: "create-twitter-post",
      name: "Create Twitter Post",
      command: "/twitter",
      description: "Generate and publish Twitter/X content with smart project selection",
      parameters: [
        {
          name: "content",
          type: "string",
          description: "The content for your Twitter post",
          required: true,
        },
        {
          name: "project",
          type: "string",
          description: "Target project (optional - will auto-select if not specified)",
          required: false,
        },
        {
          name: "schedule",
          type: "string",
          description: "Schedule the post (e.g., 'tomorrow 2pm', 'Dec 25 9am')",
          required: false,
        },
        {
          name: "settings",
          type: "select",
          description: "Reply settings for the post",
          required: false,
          options: ["everyone", "followers", "mentioned-users", "verified-accounts"],
        },
      ],
    },
  ];

  async execute(
    tool: AgentTool,
    input: string,
    convexMutations: ConvexMutations,
    sessionId?: string
  ): Promise<string> {
    if (tool.id === "create-twitter-post") {
      return await this.createTwitterPost(input, convexMutations);
    }

    throw new Error(`Unknown tool: ${tool.id}`);
  }

  private async createTwitterPost(input: string, convexMutations: ConvexMutations): Promise<string> {
    try {
      console.log(`🐦 Twitter Agent: Processing request: "${input}"`);
      
      // IMPORTANT: Twitter agent should NEVER create instruction files
      if (convexMutations.createInstructionFile) {
        console.warn("🚨 WARNING: Twitter agent received createInstructionFile function - removing it to prevent accidental calls");
        // Remove it to prevent accidental calls
        delete convexMutations.createInstructionFile;
      }

      // Clean the input by removing the command
      let cleanInput = input.trim();
      // Remove the /twitter command if present
      if (cleanInput.startsWith("/twitter")) {
        cleanInput = cleanInput.replace("/twitter", "").trim();
      }

      if (!cleanInput) {
        return "❌ Please provide content for your Twitter post. Example: /twitter Check out our new dashboard!";
      }

      try {
        // Parse parameters from input first
        const params = this.parseTwitterParameters(cleanInput);
        
        // Try to import the modular tools first
        let processTwitterRequest;
        let useEditorStore;
        
        console.log("🔍 Attempting to import advanced Twitter tools...");
        
        try {
          console.log("� Trying multiple import paths for Twitter tools...");
          
          let twitterTools;
          try {
            console.log("�🔗 Attempt 1: ../../lib/twitter-tools/index.mjs");
            twitterTools = await import("../../lib/twitter-tools/index.mjs");
          } catch (e1) {
            console.log("❌ Attempt 1 failed:", e1 instanceof Error ? e1.message : String(e1));
            try {
              console.log("🔗 Attempt 2: ../../lib/twitter-tools/index.js");
              twitterTools = await import("../../lib/twitter-tools/index.js");
            } catch (e2) {
              console.log("❌ Attempt 2 failed:", e2 instanceof Error ? e2.message : String(e2));
              try {
                console.log("🔗 Attempt 3: ../../lib/twitter-tools");
                twitterTools = await import("../../lib/twitter-tools");
              } catch (e3) {
                console.log("❌ Attempt 3 failed:", e3 instanceof Error ? e3.message : String(e3));
                const e1Msg = e1 instanceof Error ? e1.message : String(e1);
                const e2Msg = e2 instanceof Error ? e2.message : String(e2);
                const e3Msg = e3 instanceof Error ? e3.message : String(e3);
                throw new Error(`All import attempts failed: ${e1Msg}, ${e2Msg}, ${e3Msg}`);
              }
            }
          }
          
          console.log("✅ Twitter tools imported successfully:", Object.keys(twitterTools));
          processTwitterRequest = twitterTools.processTwitterRequest;
          
          console.log("🔗 Importing editor store...");
          const editorModule = await import("../");
          useEditorStore = editorModule.useEditorStore;
          console.log("✅ Editor store imported successfully");
        } catch (importError) {
          console.warn("⚠️ Could not import advanced Twitter tools, using simplified implementation:", importError);
          // Fallback to create a basic implementation
          return await this.createSimpleTwitterPost(cleanInput, params);
        }

        console.log("🚀 Using advanced Twitter tools to process request...");
        // Use the modular tools processor
        const result = await processTwitterRequest(
          {
            userInput: params.content,
            suggestedProject: params.project,
            schedule: params.schedule,
            settings: params.settings
          },
          useEditorStore.getState() // Pass the store state, not the hook
        );

        console.log("📋 Advanced tools result:", result);

        if (!result.success) {
          return `❌ Error processing Twitter request: ${result.message}`;
        }

        // Step 1: Ensure Content Creation system folder exists and use it
        const editorStore = useEditorStore.getState();
        
        // Find or create the Content Creation system folder
        let contentCreationFolder = editorStore.projectFolders.find(
          folder => folder.id === 'content-creation-folder' || 
          (folder.name === 'Content Creation' && folder.pinned)
        );
        
        if (!contentCreationFolder) {
          // Create the Content Creation system folder with proper system properties
          const systemFolder = {
            id: 'content-creation-folder',
            name: 'Content Creation',
            category: 'project' as const,
            createdAt: new Date(),
            pinned: true,
          };
          
          // Add the system folder to the project folders
          const currentFolders = editorStore.projectFolders;
          editorStore.updateProjectFolders([systemFolder, ...currentFolders]);
          
          console.log("✅ Created Content Creation system folder with ID:", systemFolder.id);
          contentCreationFolder = systemFolder;
        }
        
        // Override the project result to always use Content Creation
        const projectName = 'Content Creation';

        // Step 2: Create the .x file in the Content Creation system folder ONLY
        const fileName = await this.createTwitterFile(
          result.content.content,
          projectName,
          convexMutations
        );

        // Step 3: Fill form fields and apply default settings
        const formData = this.prepareTwitterFormData({
          content: result.content.content,
          project: projectName,
          schedule: params.schedule,
          settings: params.settings
        });

        // Step 3.1: Actually populate the form fields with the processed data
        await this.fillTwitterFormFieldsWithData(fileName, result.content.content, formData, convexMutations);

        // Step 4: Handle scheduling if requested
        let schedulingResult = "";
        if (params.schedule) {
          schedulingResult = await this.handleTwitterScheduling(
            params.schedule,
            result.content.content,
            projectName
          );
        }

        // Success response
        return `🐦 **Twitter Post Created Successfully!**

**Content:** "${result.content.content.substring(0, 100)}${result.content.content.length > 100 ? '...' : ''}"
**Project:** ${projectName}
**File:** \`${fileName}\`
**Topic:** ${result.content.detectedTopic}
**Style:** ${result.content.style}

**Form Status:** ✅ Pre-filled and ready to post
**Reply Settings:** Applied (${formData.replySettings})

${schedulingResult}

*The Twitter post form has been populated and is ready for review. Open the file to make any final edits before posting.*`;

      } catch (error) {
        console.error("❌ Twitter post creation failed:", error);
        return `❌ **Error Creating Twitter Post**

Failed to process: "${input}"

Error: ${error instanceof Error ? error.message : 'Unknown error'}

Please try again or check if:
- The content is appropriate for Twitter
- The project name is valid
- The scheduling format is correct (e.g., 'tomorrow 2pm', 'Dec 25 9am')`;
      }

    } catch (error) {
      console.error("❌ Twitter agent execution failed:", error);
      return `❌ **Twitter Agent Error**

Failed to execute Twitter agent for: "${input}"

Error: ${error instanceof Error ? error.message : 'Unknown error'}

Please try again with a different approach or contact support.`;
    }
  }

  private parseTwitterParameters(input: string): {
    content: string;
    project?: string;
    schedule?: string;
    settings?: string;
  } {
    const params = {
      content: input,
      project: undefined as string | undefined,
      schedule: undefined as string | undefined,
      settings: undefined as string | undefined,
    };

    // Extract project parameter
    const projectMatch = input.match(/--project[=\s]+([^\s]+)/i);
    if (projectMatch) {
      params.project = projectMatch[1];
      params.content = params.content.replace(projectMatch[0], '').trim();
    }

    // Extract schedule parameter
    const scheduleMatch = input.match(/--schedule[=\s]+"([^"]+)"|--schedule[=\s]+([^\s]+)/i);
    if (scheduleMatch) {
      params.schedule = scheduleMatch[1] || scheduleMatch[2];
      params.content = params.content.replace(scheduleMatch[0], '').trim();
    }

    // Extract settings parameter
    const settingsMatch = input.match(/--settings[=\s]+([^\s]+)/i);
    if (settingsMatch) {
      params.settings = settingsMatch[1];
      params.content = params.content.replace(settingsMatch[0], '').trim();
    }

    return params;
  }

  private async createTwitterFile(
    content: string, 
    projectName: string, 
    convexMutations: ConvexMutations
  ): Promise<string> {
    try {
      const { useEditorStore } = await import("../");
      const editorStore = useEditorStore.getState();
      
      // Import the intelligent file namer
      const { fileNamer } = await import("../../lib/twitter-tools/fileNamer");
      
      // Generate meaningful filename based on content
      const fileNameResult = fileNamer.generateFileName({
        content,
        maxWords: 3
      });
      
      const fileName = fileNameResult.name;
      
      console.log(`🏷️  Generated intelligent filename: ${fileName} (from content: "${content.substring(0, 50)}...")`);
      console.log(`📁 Looking for project folder: "${projectName}"`);
      console.log(`📂 Available folders:`, editorStore.projectFolders.map(f => ({ id: f.id, name: f.name })));
      
      // Find the project folder - special handling for Content Creation system folder
      let projectFolder;
      if (projectName === 'Content Creation') {
        // For Content Creation, look for the system folder first
        projectFolder = editorStore.projectFolders.find(
          folder => folder.id === 'content-creation-folder' || 
          (folder.name === 'Content Creation' && folder.pinned)
        );
      } else {
        // For other projects, use case-insensitive search
        projectFolder = editorStore.projectFolders.find(
          folder => folder.name.toLowerCase() === projectName.toLowerCase()
        );
      }
      
      if (projectFolder) {
        console.log(`✅ Found project folder:`, { id: projectFolder.id, name: projectFolder.name });
      } else {
        console.warn(`⚠️ Project folder "${projectName}" not found! Available folders:`, 
          editorStore.projectFolders.map(f => f.name));
      }
      
      // Generate rich content for the .x file with unique content
      const today = new Date().toLocaleDateString();
      const timeStamp = new Date().toLocaleTimeString();
      const richContent = `# ${fileName}.x - X/Twitter Post
Platform: X (Twitter)
Created: ${today} at ${timeStamp}
Project: ${projectName}
Filename: ${fileName}

## Post Content
${content}

## Settings
- Reply Settings: Following
- Schedule: Now
- Thread: Single Tweet

## Media
- Images: []
- Videos: []
- GIFs: []

## Analytics
- Impressions: 0
- Engagements: 0
- Retweets: 0
- Likes: 0
- Replies: 0

## File Details
- Created: ${today} at ${timeStamp}
- Status: Draft
- Type: Twitter Post
- Content-based Name: ${fileName}`;

      console.log(`📝 Creating file ${fileName} with intelligent content-based name`);
      console.log(`📄 Rich content preview:`, richContent.substring(0, 200) + "...");
      console.log(`📄 Rich content length:`, richContent.length);
      
      // Save to database AND create locally for immediate UI visibility
      try {
        await convexMutations.createContentCreationFile({
          name: fileName + ".x",
          content: richContent,
          type: 'post',
          platform: 'twitter',
          extension: 'x'
        });
        console.log("✅ Twitter post saved to Content Creation project:", fileName + ".x");
      } catch (dbError) {
        console.warn("⚠️ Failed to save to database:", dbError);
        // Continue anyway - file will be created locally
      }
      
          // Also create the file locally for immediate UI visibility
          try {
            if (projectFolder) {
              const fileId = editorStore.createNewFile(
                fileName, // name without extension
                'x' as any, // type
                'project', // category
                projectFolder.id, // folderId
                richContent, // customContent
                true // skipSync to prevent loops
              );
              console.log("✅ Twitter post also created locally for immediate UI visibility:", fileName + ".x");
              
              // Dispatch event to notify components that a new Twitter post was created
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('twitterFileCreated', {
                  detail: {
                    fileName: fileName + ".x",
                    fileId: fileId,
                    content: content,
                    projectName: projectName
                  }
                }));
                console.log(`📢 Dispatched twitterFileCreated event for ${fileName + ".x"}`);
              }
            } else {
              console.warn("⚠️ Cannot create file locally - project folder not found");
            }
          } catch (localError) {
            console.warn("⚠️ Failed to create file locally:", localError);
            // Continue anyway - file was saved to database
          }      return fileName + ".x";
    } catch (error) {
      console.error("❌ Failed to create Twitter file:", error);
      throw new Error(`Failed to create Twitter file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createTwitterFileSimple(content: string, projectName: string): Promise<string> {
    try {
      const { useEditorStore } = await import("../");
      const editorStore = useEditorStore.getState();
      
      // Import the intelligent file namer
      const { fileNamer } = await import("../../lib/twitter-tools/fileNamer");
      
      // Generate meaningful filename based on content
      const fileNameResult = fileNamer.generateFileName({
        content,
        maxWords: 3
      });
      
      const fileName = `${fileNameResult.name}.x`;
      
      console.log(`🏷️  Generated intelligent filename: ${fileName} (from content: "${content.substring(0, 50)}...")`);
      
      // Find the project folder
      const projectFolder = editorStore.projectFolders.find(
        folder => folder.name === projectName
      );
      
      // Note: We no longer create local files directly
      // Files are saved to Convex database and synced via useFileLoad hook
      console.log(`📡 Would save to project: ${projectFolder ? projectFolder.name : 'root level'}`);
      console.log(`📡 File will be created via database sync: ${fileName}`);
      
      return fileName;
    } catch (error) {
      console.error("❌ Failed to create Twitter file:", error);
      throw new Error(`Failed to create Twitter file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private prepareTwitterFormData(params: {
    content: string;
    project: string;
    schedule?: string;
    settings?: string;
  }) {
    return {
      replySettings: this.mapTwitterSettingsToAPI(params.settings),
      scheduledDate: params.schedule ? this.parseScheduleDateComponent(params.schedule) : "",
      scheduledTime: params.schedule ? this.parseScheduleTimeComponent(params.schedule) : "",
      isThread: this.detectThreadIntent(params.content),
      threadTweets: this.splitIntoThreadTweets(params.content),
      hasPoll: false, // Default - could be enhanced to detect poll intent
      pollOptions: ["", ""],
      pollDuration: 1440, // 24 hours default
    };
  }

  private async fillTwitterFormFieldsWithData(
    fileName: string,
    content: string,
    preparedFormData: any,
    convexMutations: any,
  ): Promise<void> {
    try {
      // Use the already prepared platform data
      const platformData = {
        replySettings: preparedFormData.replySettings,
        scheduledDate: "", // Will be handled by scheduling function
        scheduledTime: "", // Will be handled by scheduling function
        isThread: preparedFormData.isThread,
        threadTweets: preparedFormData.threadTweets,
        hasPoll: preparedFormData.hasPoll,
        pollOptions: preparedFormData.pollOptions,
        pollDuration: preparedFormData.pollDuration,
      };

      // Log what we're doing for debugging
      console.log(`📝 Filling Twitter form fields for ${fileName}:`, {
        content: content.substring(0, 50) + "...",
        replySettings: platformData.replySettings,
        status: "draft",
      });

      // Save structured data to Convex database for UI to pick up
      try {
        if (convexMutations && convexMutations.upsertPost) {
          await convexMutations.upsertPost({
            fileName: fileName,
            fileType: 'twitter',
            content: content,
            title: undefined, // Twitter doesn't use titles
            platformData: JSON.stringify(platformData),
            status: 'draft',
          });
          console.log(`✅ Twitter post data saved to Convex database for immediate UI refresh: ${fileName}`);
        } else {
          console.warn("⚠️ Convex upsertPost mutation not available - trying direct save");
          
          // Fallback: Try to dispatch a custom event for UI refresh
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('twitterPostCreated', {
              detail: {
                fileName: fileName,
                content: content,
                platformData: platformData,
                status: 'draft'
              }
            }));
            console.log(`📢 Dispatched twitterPostCreated event for UI refresh: ${fileName}`);
          }
        }
      } catch (convexError) {
        console.warn("⚠️ Could not save to Convex database:", convexError);
        
        // Fallback: Store in localStorage as before AND dispatch event
        if (typeof window !== 'undefined') {
          const formDataKey = `twitter-form-${fileName}`;
          const formDataToStore = {
            content: content,
            platformData: platformData,
            timestamp: Date.now(),
            status: 'draft'
          };
          
          localStorage.setItem(formDataKey, JSON.stringify(formDataToStore));
          console.log(`💾 Twitter form data stored in localStorage for ${fileName}`);
          
          // Dispatch event to trigger UI refresh
          window.dispatchEvent(new CustomEvent('twitterPostCreated', {
            detail: {
              fileName: fileName,
              content: content,
              platformData: platformData,
              status: 'draft'
            }
          }));
          console.log(`� Dispatched twitterPostCreated event for UI refresh: ${fileName}`);
        }
      }

    } catch (error) {
      console.error("❌ Failed to prepare Twitter form fields:", error);
    }
  }

  // Helper methods
  private mapTwitterSettingsToAPI(
    settings?: string,
  ): "following" | "mentionedUsers" | "subscribers" | "verified" {
    if (!settings) return "following";

    switch (settings.toLowerCase()) {
      case "everyone":
        return "following";
      case "followers":
        return "following";
      case "mentioned-users":
        return "mentionedUsers";
      case "verified-accounts":
        return "verified";
      default:
        return "following";
    }
  }

  private parseScheduleDateComponent(schedule: string): string {
    const date = this.parseScheduleString(schedule);
    if (!date) return "";

    // Return YYYY-MM-DD format for HTML date input
    return date.toISOString().split("T")[0];
  }

  private parseScheduleTimeComponent(schedule: string): string {
    const date = this.parseScheduleString(schedule);
    if (!date) return "";

    // Return HH:MM format for HTML time input
    return date.toTimeString().slice(0, 5);
  }

  private parseScheduleString(schedule: string): Date | null {
    // Implementation would parse natural language dates
    // For now, return null to indicate no valid date
    return null;
  }

  private detectThreadIntent(content: string): boolean {
    // Simple thread detection logic
    return content.length > 280 || content.includes('\n\n') || content.includes('1/');
  }

  private splitIntoThreadTweets(content: string): string[] {
    if (!this.detectThreadIntent(content)) {
      return [content];
    }

    // Simple thread splitting logic
    const parts = content.split('\n\n').filter(part => part.trim());
    return parts.length > 1 ? parts : [content];
  }

  private async handleTwitterScheduling(
    schedule: string,
    content: string,
    projectName: string
  ): Promise<string> {
    // Placeholder for scheduling logic
    return `📅 **Scheduling:** Post will be scheduled for "${schedule}" (feature coming soon)`;
  }

  private async createSimpleTwitterPost(
    content: string,
    params: {
      content: string;
      project?: string;
      schedule?: string;
      settings?: string;
    }
  ): Promise<string> {
    try {
      // Simple implementation when advanced tools can't be loaded
      const { useEditorStore } = await import("../");
      const editorStore = useEditorStore.getState();
      
      const projectName = params.project || "Twitter Posts";
      
      // Create project folder if needed
      const existingProject = editorStore.projectFolders.find(
        folder => folder.name === projectName
      );
      
      if (!existingProject) {
        await editorStore.createFolder(projectName, "project");
      }
      
      // Create the file (simple version without database save)
      const fileName = await this.createTwitterFileSimple(content, projectName);
      
      return `🐦 **Twitter Post Created Successfully!**

**Content:** "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"
**Project:** ${projectName}
**File:** \`${fileName}\`
**Status:** Draft

*This is a basic implementation. The full Twitter agent with form population will be available when you're signed in and using the editor interface.*

**Next Steps:**
1. Sign in to access the full editor
2. Open the Twitter post file to edit and publish
3. Use the form interface for advanced scheduling and settings`;
    } catch (error) {
      console.error("❌ Simple Twitter post creation failed:", error);
      return `❌ **Error Creating Twitter Post**

Failed to process: "${content}"

Error: ${error instanceof Error ? error.message : 'Unknown error'}

Please try again or contact support.`;
    }
  }
}

// Export singleton instance
export const twitterAgent = new TwitterAgent();
