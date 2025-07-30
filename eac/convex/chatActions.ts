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

// Action to send message to Claude and get response
export const sendChatMessage = action({
  args: {
    content: v.string(),
    originalContent: v.optional(v.string()), // Add this to check only the user's original message for MCP intent
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      // Store the user message first (store the original content, not the contextual one)
      await ctx.runMutation(api.chat.storeChatMessage, {
        role: "user",
        content: args.originalContent || args.content,
        sessionId: args.sessionId,
      });

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
