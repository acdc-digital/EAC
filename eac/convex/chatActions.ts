"use node";

import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// MCP Intent Detection Helper
function detectMCPIntent(message: string): { tool: string; confidence: number; params?: any } | null {
  const msg = message.toLowerCase();

  // Skip direct tool commands - these are handled by the terminal chat directly
  if (message.startsWith('/') && message.includes('eac_')) {
    return null;
  }

  // Project creation triggers  
  if ((msg.includes("create") || msg.includes("new") || msg.includes("make")) && 
      (msg.includes("project"))) {
    return { 
      tool: "eac_project_creator", 
      confidence: 0.9,
      params: { query: message }
    };
  }

  // Project analysis triggers
  if (msg.includes("project") && (msg.includes("structure") || msg.includes("analyze") || msg.includes("overview"))) {
    return { tool: "eac_project_analyze", confidence: 0.9 };
  }

  // Component discovery triggers  
  if (msg.includes("component") || msg.includes("dashboard") || (msg.includes("what") && msg.includes("ui"))) {
    return { tool: "eac_component_finder", confidence: 0.8 };
  }

  // Store analysis triggers
  if (msg.includes("state") || msg.includes("store") || msg.includes("zustand")) {
    return { tool: "eac_store_inspector", confidence: 0.8 };
  }

  // Convex analysis triggers
  if (msg.includes("convex") || msg.includes("database") || msg.includes("schema")) {
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

// Action to send message to Claude and get response
export const sendChatMessage = action({
  args: {
    content: v.string(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      // Store the user message first
      await ctx.runMutation(api.chat.storeChatMessage, {
        role: "user",
        content: args.content,
        sessionId: args.sessionId,
      });

      // Check if message requires MCP analysis
      const mcpIntent = detectMCPIntent(args.content);
      
      if (mcpIntent && mcpIntent.confidence > 0.7) {
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
              role: "assistant",
              content: successMessage,
              sessionId: args.sessionId,
            });
            
            return { 
              mcpTriggered: true, 
              tool: mcpIntent.tool, 
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

      // Regular Claude processing for non-MCP messages
      const recentMessages = await ctx.runQuery(api.chat.getChatMessages, {
        sessionId: args.sessionId,
        limit: 20,
      });

      // Prepare messages for Claude API with MCP awareness
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

**MCP Integration:**
When users ask about project analysis, the system automatically triggers MCP server tools:
- "project structure/analyze" → Deep project analysis
- "components/dashboard" → Component discovery and analysis
- "state/store/zustand" → State management analysis
- "convex/database/schema" → Backend analysis
- "generate/create/scaffold" → Code generation

**Response Style:**
- Be concise and terminal-friendly
- Use markdown formatting for code blocks
- Focus on EAC-specific patterns and best practices
- Provide actionable technical guidance
- Format responses clearly for terminal display

For general questions not requiring MCP analysis, provide helpful guidance about EAC development patterns, React/Next.js best practices, and Convex integration techniques.`;

      // Get response from Claude
      const completion = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: systemPrompt,
        messages: claudeMessages,
      });

      const assistantResponse = completion.content[0]?.type === "text"
        ? completion.content[0].text
        : "I couldn't generate a response.";

      if (!assistantResponse) {
        throw new Error("No response from Claude");
      }

      // Store the assistant's response
      const storedResponse = await ctx.runMutation(api.chat.storeChatMessage, {
        role: "assistant",
        content: assistantResponse,
        sessionId: args.sessionId,
      });

      return storedResponse;

    } catch (error) {
      console.error("Chat error:", error);
      
      // Store error message
      await ctx.runMutation(api.chat.storeChatMessage, {
        role: "system",
        content: `Error: ${error instanceof Error ? error.message : "Failed to get AI response"}`,
        sessionId: args.sessionId,
      });

      throw error;
    }
  },
});
