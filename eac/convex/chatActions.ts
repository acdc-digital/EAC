"use node";

import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// MCP Intent Detection Helper
function detectMCPIntent(message: string): { tool: string; confidence: number; params?: any } | null {
  const msg = message.toLowerCase().trim();

  // Skip direct tool commands - these are handled by the terminal chat directly
  if (message.startsWith('/') && message.includes('eac_')) {
    return null;
  }

  // Skip agent results to avoid false positives
  if (message.includes('🤖 Agent Result:') || message.includes('Agent tool failed:')) {
    return null;
  }

  // Skip simple greetings and short messages
  if (msg.length < 10 || 
      ['hi', 'hello', 'hey', 'thanks', 'thank you', 'ok', 'okay', 'yes', 'no'].includes(msg) ||
      msg.match(/^(hi|hello|hey|thanks?|ok|okay|yes|no)[!.?]*$/)) {
    return null;
  }

  // Project creation triggers - be very specific
  if (msg.includes("create") && msg.includes("project") && msg.length > 15 &&
      !msg.includes("instruction") && // Exclude instruction creation
      !msg.includes("document") &&   // Exclude document creation
      !msg.includes("file")) {       // Exclude file creation
    return { 
      tool: "eac_project_creator", 
      confidence: 0.9,
      params: { query: message }
    };
  }

  // Project analysis triggers - be very specific
  if ((msg.includes("analyze") || msg.includes("structure") || msg.includes("overview")) && 
      msg.includes("project") && msg.length > 15) {
    return { tool: "eac_project_analyze", confidence: 0.9 };
  }

  // Component discovery triggers - be very specific
  if ((msg.includes("find") || msg.includes("show") || msg.includes("list")) &&
      (msg.includes("component") || msg.includes("dashboard")) && msg.length > 15) {
    return { tool: "eac_component_finder", confidence: 0.8 };
  }

  // Store analysis triggers - be very specific
  if ((msg.includes("analyze") || msg.includes("show") || msg.includes("inspect")) &&
      (msg.includes("state") || msg.includes("store") || msg.includes("zustand")) && msg.length > 15) {
    return { tool: "eac_store_inspector", confidence: 0.8 };
  }

  // Convex analysis triggers - be very specific
  if ((msg.includes("analyze") || msg.includes("show") || msg.includes("inspect")) &&
      (msg.includes("convex") || msg.includes("database") || msg.includes("schema")) && msg.length > 15) {
    return { tool: "eac_convex_analyzer", confidence: 0.8 };
  }

  // Code generation triggers
  if (msg.includes("generate") || msg.includes("scaffold")) {
    const componentMatch = msg.match(/(?:generate|create|scaffold)\s+(?:a\s+)?(\w+)/);
    return { 
      tool: "eac_code_generator", 
      confidence: 0.7,
      params: { 
        type: "component",
        name: componentMatch?.[1] || "NewComponent"
      }
    };
  }

  return null;
}

// Agent Command Handler
async function handleAgentCommand(ctx: any, command: string, sessionId?: string) {
  try {
    console.log("🤖 Processing agent command:", command);

    // Extract command and input
    const parts = command.split(' ');
    const agentCommand = parts[0].toLowerCase();
    const input = parts.slice(1).join(' ');

    let result: string;

    // Handle different agent commands
    switch (agentCommand) {
      case '/twitter':
        if (!input.trim()) {
          result = `❌ Please provide content for your Twitter post. Example: /twitter Check out our new dashboard!`;
        } else {
          result = await handleTwitterCommand(ctx, command, input, sessionId);
        }
        break;

      case '/instructions':
        if (!input.trim()) {
          result = `❌ Please provide instruction content. Example: /instructions Always say welcome to the EAC`;
        } else {
          result = await handleInstructionsCommand(ctx, command, input);
        }
        break;

      case '/':
        // Show available commands
        result = `🤖 **Available Agent Commands:**

**Twitter Agent**
\`/twitter <content>\` - Create and manage Twitter posts
• Example: \`/twitter Check out our new dashboard!\`
• Options: \`--project ProjectName\` \`--schedule "tomorrow 2pm"\` \`--settings followers\`

**Instructions Agent**  
\`/instructions <content>\` - Create instruction documents
• Example: \`/instructions Always say welcome to the EAC\`
• Options: \`--audience developers\` for specific audiences

**Usage Tips:**
• Commands are case-insensitive
• Use quotes for multi-word parameters
• Type just \`/\` to see this help again

**Examples:**
\`/twitter Our new dashboard is live! --project Marketing --schedule "tomorrow 9am"\`
\`/instructions Use the EAC color scheme for all components --audience developers\``;
        break;

      default:
        result = `❌ **Unknown Command: ${agentCommand}**

Available commands:
• \`/twitter <content>\` - Create Twitter posts
• \`/instructions <content>\` - Create instruction documents
• \`/\` - Show this help

Type \`/\` to see detailed usage examples.`;
        break;
    }

    // Store the agent result
    await ctx.runMutation(api.chat.storeChatMessage, {
      role: "assistant",
      content: result,
      sessionId: sessionId,
    });

    // Add terminal feedback for file/content creation
    if (agentCommand === '/instructions' && result.includes('Created Successfully!')) {
      // Extract filename from result
      const fileMatch = result.match(/\*\*File:\*\*\s*`([^`]+)`/);
      const fileName = fileMatch?.[1] || 'instruction.md';
      
      const terminalFeedback = `[${new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })}] ✅ Instruction file created: ${fileName}
Operation: Instructions agent created markdown document
Status: Ready for editor integration`;

      await ctx.runMutation(api.chat.storeChatMessage, {
        role: "terminal",
        content: terminalFeedback,
        sessionId: sessionId,
        operation: {
          type: "file_created",
          details: {
            fileName: fileName,
            agentType: "instructions",
            fileType: "markdown",
          }
        }
      });
    }

    return { 
      agentTriggered: true, 
      command: agentCommand,
      result: result
    };

  } catch (error) {
    console.error("❌ Agent command handler error:", error);
    
    const errorMsg = `❌ **Agent Command Failed**

Command: \`${command}\`
Error: ${error instanceof Error ? error.message : 'Unknown error'}

Please try again or type \`/\` for help.`;
    
    await ctx.runMutation(api.chat.storeChatMessage, {
      role: "system",
      content: errorMsg,
      sessionId: sessionId,
    });
    
    throw error;
  }
}

// Twitter Command Handler
async function handleTwitterCommand(ctx: any, fullCommand: string, input: string, sessionId?: string): Promise<string> {
  try {
    // Basic Twitter post creation logic
    const rawInput = input.trim();
    
    if (!rawInput) {
      return "❌ Please provide content for your Twitter post. Example: Check out our new dashboard!";
    }

    // Simple parameter parsing
    let projectName = "Twitter Posts";
    let schedule = "";
    let settings = "followers";
    
    // Extract project parameter
    const projectMatch = rawInput.match(/--project[=\s]+([^\s]+)/i);
    if (projectMatch) {
      projectName = projectMatch[1];
    }
    
    // Extract schedule parameter  
    const scheduleMatch = rawInput.match(/--schedule[=\s]+"([^"]+)"|--schedule[=\s]+([^\s]+)/i);
    if (scheduleMatch) {
      schedule = scheduleMatch[1] || scheduleMatch[2];
    }
    
    // Clean content by removing parameters
    const userPrompt = rawInput
      .replace(/--project[=\s]+[^\s]+/gi, '')
      .replace(/--schedule[=\s]+"[^"]+"|--schedule[=\s]+[^\s]+/gi, '')
      .replace(/--settings[=\s]+[^\s]+/gi, '')
      .trim();

    if (!userPrompt) {
      return "❌ Please provide content for your Twitter post after removing parameters.";
    }

    // Generate Twitter post content using Claude
    console.log("🤖 Generating Twitter content for prompt:", userPrompt);
    
    const twitterPrompt = `You are a social media expert creating engaging Twitter/X posts. 

Create a compelling Twitter post based on this request: "${userPrompt}"

Requirements:
- Keep it under 280 characters
- Make it engaging and authentic 
- Use appropriate emojis (2-3 max)
- Include relevant hashtags (2-3 max)
- Match the tone requested ("bro post" = casual/friendly, etc.)
- Make it shareable and conversation-starting

Return ONLY the tweet content, no quotes or explanations.`;

    const completion = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 2048,
      thinking: {
        type: "enabled",
        budget_tokens: 1024
      },
      messages: [{
        role: "user",
        content: twitterPrompt
      }]
    });

    // Process thinking content and response
    let thinkingContent = "";
    let generatedContent = "";

    for (const block of completion.content) {
      if (block.type === "thinking") {
        thinkingContent = block.thinking;
      } else if (block.type === "text") {
        generatedContent = block.text.trim();
      }
    }

    if (!generatedContent) {
      generatedContent = userPrompt;
    }

    // Store thinking content if available
    if (thinkingContent) {
      await ctx.runMutation(api.chat.storeChatMessage, {
        role: "thinking",
        content: `🐦 Twitter Agent Thinking:\n\n${thinkingContent}`,
        sessionId: sessionId,
      });
    }

    console.log("✅ Generated Twitter content:", generatedContent);

    // Use the generated content as the clean content
    const cleanContent = generatedContent;

    // Generate a descriptive title using Claude
    console.log("🏷️ Generating descriptive title for content:", cleanContent);
    
    const titlePrompt = `You are a content organizer creating concise, descriptive titles for social media posts.

Create a short, descriptive title for this Twitter post: "${cleanContent}"

Requirements:
- Keep it under 50 characters
- Make it descriptive and clear
- Capture the main topic/theme
- Use title case
- No quotes or special formatting
- Focus on the key subject matter

Return ONLY the title, no quotes or explanations.`;

    const titleCompletion = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1536,
      thinking: {
        type: "enabled",
        budget_tokens: 1024
      },
      messages: [{
        role: "user",
        content: titlePrompt
      }]
    });

    // Process thinking content and response for title
    let titleThinkingContent = "";
    let generatedTitle = "";

    for (const block of titleCompletion.content) {
      if (block.type === "thinking") {
        titleThinkingContent = block.thinking;
      } else if (block.type === "text") {
        generatedTitle = block.text.trim();
      }
    }

    if (!generatedTitle) {
      generatedTitle = cleanContent.substring(0, 50) + (cleanContent.length > 50 ? '...' : '');
    }

    // Store title thinking content if available
    if (titleThinkingContent) {
      await ctx.runMutation(api.chat.storeChatMessage, {
        role: "thinking",
        content: `🏷️ Title Generation Thinking:\n\n${titleThinkingContent}`,
        sessionId: sessionId,
      });
    }

    console.log("✅ Generated title:", generatedTitle);

    // Generate meaningful filename based on the generated title (not user prompt)
    const titleWords = generatedTitle
      .split(' ')
      .slice(0, 4) // Use more words from title for better filenames
      .map(word => word.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter(word => word.length > 0)
      .join('-');
    
    const timestamp = new Date().toISOString().split('T')[0];
    const hash = Math.random().toString(36).substring(2, 4); // Shorter hash since title is more descriptive
    const fileName = `${titleWords || 'twitter-post'}-${hash}.x`;

    // Create platform data for Twitter in the expected format
    const platformData = JSON.stringify({
      replySettings: settings === "followers" ? "following" : "everyone",
      scheduledDate: schedule ? new Date(schedule).toISOString().split('T')[0] : "",
      scheduledTime: schedule ? new Date(schedule).toTimeString().slice(0, 5) : "",
      isThread: false,
      threadTweets: [""],
      hasPoll: false,
      pollOptions: ["", ""],
      pollDuration: 1440,
      project: projectName,
      visibility: "public"
    });

    // Create the Twitter post in the database
    const post = await ctx.runMutation(api.socialPosts.upsertPost, {
      fileName: fileName,
      fileType: "twitter",
      content: cleanContent,
      title: generatedTitle,
      platformData: platformData,
      status: "draft",
      scheduledFor: schedule ? new Date(schedule).getTime() : undefined,
    });

    // ALSO create a file entry so it shows up in the UI sidebar
    try {
      // Format the content in the proper markdown structure for Twitter files
      const formattedContent = `# ${fileName} - X/Twitter Post
Platform: X (Twitter)
Created: ${new Date().toLocaleDateString()}

## Post Content
${cleanContent}

## Settings
- Reply Settings: Everyone
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
- Replies: 0`;

      await ctx.runMutation(api.files.createContentCreationFile, {
        name: fileName,
        content: formattedContent,
        type: 'post',
        platform: 'twitter',
        extension: 'x'
      });
      console.log("✅ File also created in Content Creation project for UI display");
    } catch (fileError) {
      console.warn("⚠️ Failed to create file entry for UI:", fileError);
      // Continue anyway - the agentPost was created successfully
    }

    // Store the file creation operation for the UI to pick up
    await ctx.runMutation(api.chat.storeChatMessage, {
      role: "terminal",
      content: `[${new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })}] 📁 Creating UI tab for Twitter post: ${fileName}`,
      sessionId: sessionId,
      operation: {
        type: "file_created",
        details: {
          fileName: fileName,
          fileType: "x",
          content: cleanContent,
          platformData: platformData,
          postId: post?._id,
          agentType: "twitter"
        }
      }
    });

    return `🐦 **Twitter Post Created Successfully!**

**File:** \`${fileName}\`
**Title:** "${generatedTitle}"
**Original Prompt:** "${userPrompt}"
**Generated Content:** "${cleanContent.substring(0, 100)}${cleanContent.length > 100 ? '...' : ''}"
**Project:** ${projectName}
**Status:** Draft${schedule ? `\n**Schedule:** ${schedule}` : ''}

The Twitter post has been created using AI-generated content and title, and saved to your database. You can now view and edit it in the editor.

**Next Steps:**
1. Open the Twitter post file in the editor to review and edit
2. Connect your Twitter account for publishing
3. Use the social media management interface for scheduling and analytics`;

  } catch (error) {
    console.error("❌ Twitter command failed:", error);
    return `❌ **Error Creating Twitter Post**

Failed to process Twitter post request: "${input}"

Error: ${error instanceof Error ? error.message : 'Unknown error'}

Please try again or check:
- The content is appropriate for Twitter
- The project name is valid
- The scheduling format is correct (e.g., 'tomorrow 2pm', 'Dec 25 9am')`;
  }
}

// Instructions Command Handler
async function handleInstructionsCommand(ctx: any, fullCommand: string, input: string): Promise<string> {
  try {
    // Basic instruction creation logic - for now, let's create the file directly
    const content = input.trim();
    
    if (!content) {
      return "❌ Please provide instruction content. Example: every time you reply, i want you to tell me a joke first";
    }

    // Generate a brief filename based on content
    const words = content.split(' ').slice(0, 3);
    const briefTitle = words.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
    const fileName = `${briefTitle || 'instruction'}-${new Date().toISOString().split('T')[0]}.md`;

    // Check if the content includes a request for jokes
    const shouldIncludeJoke = content.toLowerCase().includes('joke') || 
                             content.toLowerCase().includes('tell me a joke') ||
                             content.toLowerCase().includes('every time you reply');
    
    let jokeSection = '';
    if (shouldIncludeJoke) {
      const jokes = [
        "Why don't programmers like nature? It has too many bugs! 🐛",
        "Why do programmers prefer dark mode? Because light attracts bugs! 💡",
        "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡",
        "Why do Java developers wear glasses? Because they can't C# 👓",
        "A SQL query goes into a bar, walks up to two tables and asks: 'Can I join you?' 🍺"
      ];
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      jokeSection = `## 😄 Developer Joke

${randomJoke}

---

`;
    }

    // Basic instruction document content
    const documentContent = `# Instructions: ${briefTitle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

*Generated on ${new Date().toISOString().split('T')[0]}*

${jokeSection}## Overview
This document provides comprehensive instructions for: **${content}**

## Instruction Details

${content}

## Implementation Notes

- This instruction should be followed consistently across the project
- Review and update as needed based on project evolution
- Ensure all team members are aware of this guideline

## Best Practices
- Always test in a development environment first
- Keep detailed logs of all changes
- Follow security guidelines
- Document any customizations

---
*Generated by EAC Instructions Agent*`;

    // Ensure Instructions project exists
    await ctx.runMutation(api.projects.ensureInstructionsProject, {});

    // Create the instruction file
    const file = await ctx.runMutation(api.files.createInstructionFile, {
      name: fileName,
      content: documentContent,
      topic: content,
      audience: "developers",
    });

    return `📝 **Instructions Created Successfully!**

**File:** \`${fileName}\`
**Topic:** ${content}
**Location:** /instructions/${fileName}

The instruction document has been created and saved to your Instructions project. You can now view and edit it in the editor.

**Preview:**
${documentContent.split('\n').slice(0, 5).join('\n')}...

*Open the file in the editor to see the complete instructions.*`;

  } catch (error) {
    console.error("❌ Instructions command failed:", error);
    return `❌ **Error Creating Instructions**

Failed to process instruction request: "${input}"

Error: ${error instanceof Error ? error.message : 'Unknown error'}

Please try again or check the system logs for more details.`;
  }
}

// Action to send message to Claude and get response
export const sendChatMessage = action({
  args: {
    content: v.string(),
    originalContent: v.optional(v.string()), // Add this to check only the user's original message for MCP intent
    sessionId: v.optional(v.string()),
    activeAgentId: v.optional(v.string()), // Add support for active agent
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      // Store the user message first (store the original content, not the contextual one)
      await ctx.runMutation(api.chat.storeChatMessage, {
        role: "user",
        content: args.originalContent || args.content,
        sessionId: args.sessionId,
      });

      // Check if message is an agent command (starts with /)
      const messageContent = args.originalContent || args.content;
      if (messageContent.trim().startsWith('/')) {
        return await handleAgentCommand(ctx, messageContent.trim(), args.sessionId);
      }

      // Check if there's an active agent and route message through it
      if (args.activeAgentId) {
        console.log(`🤖 Active agent detected: ${args.activeAgentId}`);
        
        // Route to the appropriate agent based on activeAgentId
        switch (args.activeAgentId) {
          case 'instructions':
            // Transform the message into an instructions command
            const instructionsCommand = `/instructions ${messageContent}`;
            return await handleAgentCommand(ctx, instructionsCommand, args.sessionId);
          
          case 'twitter-post':
            // Transform the message into a twitter command
            const twitterCommand = `/twitter ${messageContent}`;
            return await handleAgentCommand(ctx, twitterCommand, args.sessionId);
          
          default:
            console.log(`⚠️ Unknown active agent: ${args.activeAgentId}, falling through to regular chat`);
            break;
        }
      }

      // Check if message requires MCP analysis - use ONLY the original user message
      const messageForMCPDetection = args.originalContent || args.content;
      const mcpIntent = detectMCPIntent(messageForMCPDetection);
      
      if (mcpIntent && mcpIntent.confidence > 0.85) {
        // Handle project creation directly here
        if (mcpIntent.tool === "eac_project_creator") {
          try {
            // Extract project name from the query
            const query = args.content;
            let projectName = "New Project";
            
            // Look for quoted text first
            const quotedMatch = query.match(/['"`]([^'"`]+)['"`]/);
            if (quotedMatch) {
              projectName = quotedMatch[1].trim();
            } else {
              // Look for "called X" pattern
              const calledMatch = query.match(/called\s+([^\s]+)/i);
              if (calledMatch) {
                projectName = calledMatch[1].trim();
              }
            }
            
            console.log("Creating project directly:", projectName);
            
            // Create the project in database
            const newProject = await ctx.runMutation(api.projects.createProject, {
              name: projectName,
              status: "active" as const,
            });
            
            if (!newProject) {
              throw new Error("Failed to create project - no project returned");
            }
            
            // Store success message
            const successMessage = `$ system: Project Created Successfully!

✅ **${newProject.name}**
   📅 Created: ${new Date().toLocaleDateString()}
   📊 Status: ${newProject.status}
   🔢 Project ID: ${newProject._id}

Project "${newProject.name}" has been created in your database!`;

            await ctx.runMutation(api.chat.storeChatMessage, {
              role: "terminal",
              content: successMessage,
              sessionId: args.sessionId,
              operation: {
                type: "project_created",
                details: {
                  projectName: newProject.name,
                  projectId: newProject._id,
                }
              }
            });

            return { 
              mcpTriggered: true, 
              tool: mcpIntent?.tool || "eac_project_creator",
              result: successMessage
            };

            await ctx.runMutation(api.chat.storeChatMessage, {
              role: "assistant",
              content: successMessage,
              sessionId: args.sessionId,
            });
            
            return { 
              mcpTriggered: true, 
              tool: mcpIntent?.tool || "eac_project_creator", 
              project: newProject 
            };
          } catch (error) {
            console.error("Direct project creation error:", error);
            
            const errorMsg = `❌ Failed to create project: ${error instanceof Error ? error.message : "Unknown error"}`;
            
            await ctx.runMutation(api.chat.storeChatMessage, {
              role: "system",
              content: errorMsg,
              sessionId: args.sessionId,
            });
            
            throw error;
          }
        }
        
        // For other MCP intents, just acknowledge
        const systemMessage = `🔧 MCP Intent Detected: ${mcpIntent.tool} (confidence: ${mcpIntent.confidence})`;
        await ctx.runMutation(api.chat.storeChatMessage, {
          role: "system", 
          content: systemMessage,
          sessionId: args.sessionId,
        });
        
        // Return early - MCP result already stored
        return { mcpTriggered: true, tool: mcpIntent.tool };
      }

      // ✨ UPDATED: Always use streaming with thinking for regular chat messages
      console.log("🔄 Routing to streaming chat with thinking enabled");
      return await ctx.runAction(api.chatActions.sendChatMessageWithStreaming, {
        content: args.content,
        originalContent: args.originalContent,
        sessionId: args.sessionId,
        activeAgentId: args.activeAgentId,
      });

    } catch (error) {
      console.error("Chat error:", error);
      
      await ctx.runMutation(api.chat.storeChatMessage, {
        role: "system",
        content: `Error: ${error instanceof Error ? error.message : "Failed to get AI response"}`,
        sessionId: args.sessionId,
      });

      throw error;
    }
  },
});

// Action to send message to Claude and get response with streaming thinking
export const sendChatMessageWithStreaming = action({
  args: {
    content: v.string(),
    originalContent: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    activeAgentId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      // Store the user message first
      await ctx.runMutation(api.chat.storeChatMessage, {
        role: "user",
        content: args.originalContent || args.content,
        sessionId: args.sessionId,
      });

      // Check if message is an agent command (starts with /)
      const messageContent = args.originalContent || args.content;
      if (messageContent.trim().startsWith('/')) {
        return await handleAgentCommand(ctx, messageContent.trim(), args.sessionId);
      }

      // Check if there's an active agent and route message through it
      if (args.activeAgentId) {
        console.log(`🤖 Active agent detected: ${args.activeAgentId}`);
        
        switch (args.activeAgentId) {
          case 'instructions':
            const instructionsCommand = `/instructions ${messageContent}`;
            return await handleAgentCommand(ctx, instructionsCommand, args.sessionId);
          
          case 'twitter-post':
            const twitterCommand = `/twitter ${messageContent}`;
            return await handleAgentCommand(ctx, twitterCommand, args.sessionId);
          
          default:
            console.log(`⚠️ Unknown active agent: ${args.activeAgentId}, falling through to regular chat`);
            break;
        }
      }

      // Check if message requires MCP analysis
      const messageForMCPDetection = args.originalContent || args.content;
      const mcpIntent = detectMCPIntent(messageForMCPDetection);
      
      if (mcpIntent && mcpIntent.confidence > 0.85) {
        // Handle project creation directly here
        if (mcpIntent.tool === "eac_project_creator") {
          try {
            const newProject = await ctx.runMutation(api.projects.createProject, {
              name: mcpIntent.params?.name || `Project ${Date.now()}`,
              description: mcpIntent.params?.description || "Auto-created project",
              status: "active",
              budget: mcpIntent.params?.budget,
            });

            if (!newProject) {
              throw new Error("Failed to create project");
            }

            const successMessage = `✅ **Project Created Successfully!**

🎯 **Project Name:** ${newProject.name}
📝 **Description:** ${newProject.description || "No description provided"}
💰 **Budget:** ${newProject.budget ? `$${newProject.budget}` : "Not specified"}
📊 **Status:** ${newProject.status}
🔢 **Project ID:** ${newProject._id}

Project "${newProject.name}" has been created in your database!`;

            await ctx.runMutation(api.chat.storeChatMessage, {
              role: "terminal",
              content: successMessage,
              sessionId: args.sessionId,
              operation: {
                type: "project_created",
                details: {
                  projectName: newProject.name,
                  projectId: newProject._id,
                }
              }
            });

            return { 
              mcpTriggered: true, 
              tool: mcpIntent?.tool || "eac_project_creator",
              result: successMessage
            };
          } catch (error) {
            console.error("Direct project creation error:", error);
            
            const errorMsg = `❌ Failed to create project: ${error instanceof Error ? error.message : "Unknown error"}`;
            
            await ctx.runMutation(api.chat.storeChatMessage, {
              role: "system",
              content: errorMsg,
              sessionId: args.sessionId,
            });
            
            throw error;
          }
        }
        
        // For other MCP intents, just acknowledge
        const systemMessage = `🔧 MCP Intent Detected: ${mcpIntent.tool} (confidence: ${mcpIntent.confidence})`;
        await ctx.runMutation(api.chat.storeChatMessage, {
          role: "system", 
          content: systemMessage,
          sessionId: args.sessionId,
        });
        
        return { mcpTriggered: true, tool: mcpIntent.tool };
      }

      // Regular Claude processing for non-MCP messages
      const recentMessages = await ctx.runQuery(api.chat.getChatMessages, {
        sessionId: args.sessionId,
        limit: 20,
      });

      // Prepare messages for Claude API
      const claudeMessages: Anthropic.MessageParam[] = recentMessages
        .filter((msg: any) => msg.role === "user" || msg.role === "assistant")
        .map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }));

      const systemPrompt = `You are an AI assistant for the EAC Financial Dashboard project with MCP (Model Context Protocol) integration.

**EAC Project Specifics:**
- Financial analytics and project tracking
- Social media management workflows  
- Project budgeting and cost analysis
- Dashboard metrics and reporting

**Technical Stack:**
- Next.js 15 with App Router and TypeScript
- Convex real-time backend/database
- Zustand state management with persistence
- Tailwind CSS v4 with shadcn/ui components
- Tiptap rich text editing
- VS Code-inspired interface design

**Response Style:**
- Be concise and terminal-friendly
- Use markdown formatting for code blocks
- Focus on EAC-specific patterns and best practices
- Provide actionable technical guidance
- Format responses clearly for terminal display

For general questions not requiring MCP analysis, provide helpful guidance about EAC development patterns, React/Next.js best practices, and Convex integration techniques.`;

      // Create a streaming response with extended thinking (always enabled)
      const stream = await anthropic.messages.stream({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 4000,
        thinking: {
          type: "enabled",
          budget_tokens: 2048
        },
        system: systemPrompt,
        messages: claudeMessages,
      });

      let thinkingContent = "";
      let assistantResponse = "";
      let currentThinkingId: string | null = null;
      let currentAssistantId: string | null = null;

      // Process the stream
      for await (const event of stream) {
        if (event.type === 'content_block_start') {
          if (event.content_block.type === 'thinking') {
            // Store initial thinking message
            const thinkingMessageId = await ctx.runMutation(api.chat.storeChatMessage, {
              role: "thinking",
              content: "🧠 AI is thinking...",
              sessionId: args.sessionId,
            });
            currentThinkingId = thinkingMessageId;
          } else if (event.content_block.type === 'text') {
            // Store initial assistant message for streaming response
            const assistantMessageId = await ctx.runMutation(api.chat.storeChatMessage, {
              role: "assistant",
              content: "",
              sessionId: args.sessionId,
            });
            currentAssistantId = assistantMessageId;
          }
        } else if (event.type === 'content_block_delta') {
          if (event.delta.type === 'thinking_delta') {
            thinkingContent += event.delta.thinking;
            
            // Update the thinking message in real-time
            if (currentThinkingId) {
              await ctx.runMutation(api.chat.updateChatMessage, {
                messageId: currentThinkingId,
                content: thinkingContent
              });
            }
          } else if (event.delta.type === 'text_delta') {
            assistantResponse += event.delta.text;
            
            // Update the assistant message in real-time
            if (currentAssistantId) {
              await ctx.runMutation(api.chat.updateChatMessage, {
                messageId: currentAssistantId,
                content: assistantResponse
              });
            }
          }
        }
      }

      if (!assistantResponse) {
        throw new Error("No response from Claude");
      }

      // Track token usage for this conversation
      if (args.sessionId) {
        try {
          // Get final message with usage data
          const finalMessage = await stream.finalMessage();
          const inputTokens = finalMessage.usage?.input_tokens || 0;
          const outputTokens = finalMessage.usage?.output_tokens || 0;
          
          // Calculate cost (Claude 3.7 Sonnet pricing: $3/MTok input, $15/MTok output)
          const inputCost = (inputTokens / 1000000) * 3.0;
          const outputCost = (outputTokens / 1000000) * 15.0;
          const totalCost = inputCost + outputCost;

          // First ensure session exists
          await ctx.runMutation(api.tokenActions.upsertChatSession, {
            sessionId: args.sessionId,
            preview: args.originalContent || args.content,
          });

          // Update token usage
          await ctx.runMutation(api.tokenActions.updateSessionTokens, {
            sessionId: args.sessionId,
            inputTokens,
            outputTokens,
            estimatedCost: totalCost,
          });

          console.log(`🔢 Token usage (streaming) - Session: ${args.sessionId}, Input: ${inputTokens}, Output: ${outputTokens}, Cost: $${totalCost.toFixed(4)}`);
        } catch (tokenError) {
          console.error("Token tracking error:", tokenError);
          // Don't fail the whole request if token tracking fails
        }
      }

      // Return the streamed response (already stored during streaming)
      return {
        thinking: thinkingContent,
        response: assistantResponse,
        storedResponse: currentAssistantId || "no-id"
      };

    } catch (error) {
      console.error("Chat error:", error);
      
      await ctx.runMutation(api.chat.storeChatMessage, {
        role: "system",
        content: `Error: ${error instanceof Error ? error.message : "Failed to get AI response"}`,
        sessionId: args.sessionId,
      });

      throw error;
    }
  },
});
