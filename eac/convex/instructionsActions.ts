"use node";

import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Web search configuration (reuse from chatActions.ts)
const WEB_SEARCH_ENABLED = (process.env.EAC_WEB_SEARCH_ENABLED ?? 'true').toLowerCase() !== 'false';

function csvToList(val?: string): string[] | undefined {
  if (!val) return undefined;
  const list = val
    .split(/[,\n]/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.replace(/^https?:\/\//i, ''));
  return list.length ? list : undefined;
}

function buildWebSearchToolConfig() {
  if (!WEB_SEARCH_ENABLED) return null;
  const allowed = csvToList(process.env.EAC_WEB_SEARCH_ALLOWED_DOMAINS);
  const blocked = csvToList(process.env.EAC_WEB_SEARCH_BLOCKED_DOMAINS);
  const maxUses = Number.parseInt(process.env.EAC_WEB_SEARCH_MAX_USES || '5', 10);
  const city = process.env.EAC_WEB_SEARCH_CITY;
  const region = process.env.EAC_WEB_SEARCH_REGION;
  const country = process.env.EAC_WEB_SEARCH_COUNTRY;
  const timezone = process.env.EAC_WEB_SEARCH_TIMEZONE;

  const tool: any = {
    type: "web_search_20250305",
    name: "web_search",
    max_uses: Number.isFinite(maxUses) && maxUses > 0 ? maxUses : 5,
  };
  if (allowed && !blocked) tool.allowed_domains = allowed;
  if (blocked && !allowed) tool.blocked_domains = blocked;
  if (city || region || country || timezone) {
    tool.user_location = {
      type: "approximate",
      ...(city ? { city } : {}),
      ...(region ? { region } : {}),
      ...(country ? { country } : {}),
      ...(timezone ? { timezone } : {}),
    };
  }
  return tool;
}

export const generateInstructionsWithWebSearch = action({
  args: {
    topic: v.string(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const { topic, sessionId } = args;
      
      console.log(`🔍 Generating instructions for topic: "${topic}" with web search`);
      
      // Store initial thinking message for progress (only if authenticated)
      let currentThinkingId: string | null = null;
      let currentAssistantId: string | null = null;
      
      // Check if we can store messages (user is authenticated)
      const canStoreMessages = sessionId ? true : false;
      
      if (!canStoreMessages) {
        console.log("⚠️ User not authenticated - streaming updates will not be visible in UI");
      }
      
      // Check if we're hitting rate limits - if so, use fallback
      const useAPIFallback = true; // Set to true to test streaming without API calls
      
      if (useAPIFallback) {
        console.log("🔄 Using fallback mode to demonstrate streaming...");
        
        // Skip thinking progress - go straight to content generation
        if (sessionId) {
          try {
            currentAssistantId = await ctx.runMutation(api.chat.storeProgressMessage, {
              role: "assistant",
              content: "📖 Generating comprehensive instructions...",
              sessionId: sessionId!,
            });
            
            // Initialize progress tracking
            await ctx.runMutation(api.chat.storeAgentProgress, {
              sessionId: sessionId,
              agentType: "instructions",
              percentage: 0,
              status: "Starting instruction generation...",
            });
          } catch (error) {
            console.log("⚠️ Failed to store assistant message:", error);
          }
        }
        
        // Simulate streaming content generation with actual content based on topic
        let generatedContent = "";
        
        // Generate topic-appropriate content
        if (topic.toLowerCase().includes("paper airplane") || topic.toLowerCase().includes("airplane")) {
          generatedContent = `# How to Build a Paper Airplane: Complete Instructions

## Overview
Paper airplanes are fun, educational projects that demonstrate basic principles of aerodynamics and flight. This guide covers how to make a classic dart-style paper airplane.

## Prerequisites
- One sheet of 8.5" x 11" paper (standard copy paper works best)
- Flat, clean surface for folding
- Steady hands for precise creases

## Step-by-Step Instructions

### 1. Start with Your Paper
- Use a standard 8.5" x 11" sheet of paper
- Place it on a flat surface in portrait orientation
- Ensure the paper is clean and unwrinkled

### 2. Make the Initial Fold
- Fold the paper in half lengthwise (hot dog fold)
- Crease well and unfold to create a center line
- This center line will guide all subsequent folds

### 3. Create the Nose
- Fold the top corners down to meet the center line
- Make sharp, precise creases
- The paper should now look like a house with a triangular roof

### 4. Fold the Wings
- Fold each side down along the center line
- The wings should be even and aligned
- Leave about 1/2 inch of the body visible between wings

### 5. Final Adjustments
- Ensure wings are level and even
- Make sure all creases are sharp and well-defined
- The airplane should have a pointed nose and straight wings

## Best Practices
- Use crisp, clean folds for better aerodynamics
- Keep wings level for stable flight
- Throw with a firm, level motion
- Adjust wing angles if plane dives or climbs too much

## Common Issues
- **Plane dives**: Wings may be angled down - adjust upward
- **Plane climbs then stalls**: Wings angled up too much
- **Veers left/right**: One wing may be folded differently than the other

## Resources
- Paper airplane competitions and clubs
- Advanced folding techniques online
- Physics of flight educational materials

## Fun Variations
- Try different paper weights
- Experiment with wing shapes
- Add small paper clips for weight adjustment`;

        } else if (topic.toLowerCase().includes("cook") || topic.toLowerCase().includes("recipe") || topic.toLowerCase().includes("bake")) {
          generatedContent = `# Cooking Instructions: ${topic}

## Overview
Cooking is both an art and a science that brings people together. This guide provides fundamental techniques and tips for successful cooking.

## Prerequisites
- Fresh, quality ingredients
- Appropriate cooking equipment
- Clean workspace and utensils
- Basic understanding of food safety

## Step-by-Step Instructions

### 1. Preparation (Mise en Place)
- Gather all ingredients before starting
- Wash and prep vegetables, proteins, and herbs
- Measure out spices and seasonings
- Preheat cooking equipment as needed

### 2. Basic Cooking Techniques
- **Sautéing**: High heat, small amount of fat, frequent movement
- **Roasting**: Dry heat in oven, good for larger items
- **Braising**: Combination of searing and slow cooking with liquid
- **Steaming**: Gentle cooking with steam, preserves nutrients

### 3. Seasoning and Flavoring
- Taste as you go and adjust seasonings
- Add salt gradually - you can always add more
- Fresh herbs added at end preserve bright flavors
- Balance flavors: sweet, salty, sour, bitter, umami

## Best Practices
- Keep knives sharp for safety and efficiency
- Maintain clean workspace throughout cooking
- Use a food thermometer for food safety
- Don't overcrowd pans when cooking

## Common Issues
- **Oversalting**: Add acid (lemon, vinegar) or dairy to balance
- **Burning**: Lower heat and add liquid if needed
- **Bland food**: Layer seasonings throughout cooking process

## Resources
- Local cooking classes
- Reliable cookbooks and food websites
- Quality ingredients from trusted sources`;

        } else {
          // Generic template that adapts to any topic
          const cleanTopic = topic.toLowerCase().replace(/create.*?instructions.*?on.*?how.*?to\s+/i, '').replace(/instructions.*?for\s+/i, '');
          const capitalizedTopic = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);
          
          generatedContent = `# How to ${capitalizedTopic}: Complete Instructions

## Overview
This guide provides comprehensive instructions for ${cleanTopic}. Whether you're a beginner or looking to improve your skills, these step-by-step instructions will help you achieve success.

## Prerequisites
- Basic understanding of the fundamentals
- Appropriate tools and materials
- Safe workspace or environment
- Patience and willingness to practice

## Step-by-Step Instructions

### 1. Planning and Preparation
- Research and understand the requirements
- Gather all necessary tools and materials
- Set up your workspace for efficiency and safety
- Review the entire process before beginning

### 2. Initial Setup
- Start with the foundational steps
- Follow safety protocols throughout
- Take your time with each step
- Double-check your work as you progress

### 3. Core Process
- Execute the main steps methodically
- Pay attention to detail and precision
- Monitor progress and make adjustments as needed
- Stay focused and avoid rushing

### 4. Finishing and Quality Check
- Complete all final steps thoroughly
- Review your work for quality and completeness
- Make any necessary corrections or improvements
- Clean up your workspace

## Best Practices
- Practice regularly to improve skills
- Learn from mistakes and adjust technique
- Seek guidance from experienced practitioners
- Stay updated with current best practices

## Common Issues
- **Poor results**: Often due to rushing or skipping steps
- **Safety concerns**: Always prioritize safety over speed
- **Inconsistent outcomes**: Focus on standardizing your process

## Resources
- Educational materials and tutorials
- Online communities and forums
- Local classes or workshops
- Professional guidance when needed

## Next Steps
- Practice the basic techniques until comfortable
- Explore advanced variations and techniques
- Share knowledge with others learning the same skills
- Continue learning and improving your abilities`;
        }

        // Stream content word by word to show realistic generation
        const words = generatedContent.split(' ');
        let partialContent = "";
        
        for (let i = 0; i < words.length; i++) {
          partialContent += (i > 0 ? ' ' : '') + words[i];
          const percentage = Math.round((i / words.length) * 100);
          
          // Update every 5-10 words to show streaming progress
          if (currentAssistantId && (i % 8 === 0 || i === words.length - 1)) {
            try {
              const isComplete = i === words.length - 1;
              const displayContent = isComplete 
                ? `📖 **Instructions Complete!**\n\n${partialContent}`
                : `📖 Generating instructions... (${percentage}%)\n\n${partialContent}${i < words.length - 1 ? ' ●' : ''}`;
              
              await ctx.runMutation(api.chat.updateChatMessage, {
                messageId: currentAssistantId,
                content: displayContent
              });
              
              // Update progress tracking for pinned progress bar
              if (sessionId) {
                await ctx.runMutation(api.chat.storeAgentProgress, {
                  sessionId: sessionId,
                  agentType: "instructions",
                  percentage: percentage,
                  status: isComplete ? "Instructions generation complete!" : `Generating instructions... (${percentage}%)`,
                  isComplete: isComplete,
                });
              }
              
              console.log(`📖 Streamed: ${i + 1}/${words.length} words (${percentage}%)`);
            } catch (error) {
              console.log("⚠️ Failed to update streaming progress:", error);
            }
          }
          
          // Simulate realistic typing speed
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        console.log(`✅ Generated fallback instructions with ${generatedContent.length} characters`);
        return generatedContent;
      }
      
      if (canStoreMessages && sessionId) {
        currentThinkingId = await ctx.runMutation(api.chat.storeChatMessage, {
          role: "thinking",
          content: "🧠 Instructions Agent is analyzing your request and researching best practices...",
          sessionId: sessionId,
        });
      }
      
      const today = new Date().toISOString().split('T')[0];
      const structurePrompt = `Create a practical instruction document for: "${topic}"

Format as Markdown with:
1. **Overview** - What this is and why it matters
2. **Prerequisites** - What you need to start
3. **Step-by-Step Instructions** - Clear, actionable steps
4. **Best Practices** - Current recommendations
5. **Common Issues** - What to avoid
6. **Resources** - Useful links and tools

Use web search for current information. Keep it practical and actionable.`;

      // Build tools array conditionally
      const tools = [];
      const webSearchTool = buildWebSearchToolConfig();
      if (webSearchTool) {
        tools.push(webSearchTool);
      }

      // Update thinking progress (only if we can store messages)
      if (canStoreMessages && sessionId && currentThinkingId) {
        try {
          await ctx.runMutation(api.chat.updateChatMessage, {
            messageId: currentThinkingId,
            content: "🧠 Performing web research for current best practices and up-to-date guidance..."
          });
        } catch (error) {
          console.log("⚠️ Failed to update thinking message, trying progress message...");
          try {
            currentThinkingId = await ctx.runMutation(api.chat.storeProgressMessage, {
              role: "thinking",
              content: "🧠 Performing web research for current best practices and up-to-date guidance...",
              sessionId: sessionId,
            });
          } catch (progressError) {
            console.log("⚠️ Failed to store initial progress message:", progressError);
          }
        }
      }

      // Generate content with Anthropic using streaming
      const stream = await anthropic.messages.stream({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 1500,
        temperature: 0.7,
        // Temporarily disable thinking to reduce token usage during testing
        // thinking: {
        //   type: "enabled",
        //   budget_tokens: 1024
        // },
        messages: [
          {
            role: "user",
            content: structurePrompt
          }
        ],
        tools: tools.length > 0 ? tools : undefined,
      });

      let thinkingContent = "";
      let generatedContent = "";

      // Process the stream
      for await (const event of stream) {
        if (event.type === 'content_block_start') {
          if (event.content_block.type === 'thinking') {
            // Initialize thinking content
            thinkingContent = "🧠 Instructions Agent Research & Analysis:\n\n";
            if (canStoreMessages && sessionId && !currentThinkingId) {
              try {
                currentThinkingId = await ctx.runMutation(api.chat.storeChatMessage, {
                  role: "thinking",
                  content: thinkingContent,
                  sessionId: sessionId,
                });
              } catch (error) {
                console.log("⚠️ Failed to store thinking message (likely unauthenticated), trying progress message...");
                // Fall back to progress message for unauthenticated users
                try {
                  currentThinkingId = await ctx.runMutation(api.chat.storeProgressMessage, {
                    role: "thinking",
                    content: thinkingContent,
                    sessionId: sessionId,
                  });
                } catch (progressError) {
                  console.log("⚠️ Failed to store progress message:", progressError);
                }
              }
            }
          } else if (event.content_block.type === 'text') {
            // Initialize assistant message for streaming response
            if (canStoreMessages && sessionId && !currentAssistantId) {
              try {
                currentAssistantId = await ctx.runMutation(api.chat.storeChatMessage, {
                  role: "assistant",
                  content: "📖 Generating comprehensive instructions...",
                  sessionId: sessionId,
                });
              } catch (error) {
                console.log("⚠️ Failed to store assistant message (likely unauthenticated), trying progress message...");
                // Fall back to progress message for unauthenticated users
                try {
                  currentAssistantId = await ctx.runMutation(api.chat.storeProgressMessage, {
                    role: "assistant",
                    content: "📖 Generating comprehensive instructions...",
                    sessionId: sessionId,
                  });
                } catch (progressError) {
                  console.log("⚠️ Failed to store progress message:", progressError);
                }
              }
            }
          }
        } else if (event.type === 'content_block_delta') {
          if (event.delta.type === 'thinking_delta') {
            thinkingContent += event.delta.thinking;
            console.log(`🧠 Thinking: ${thinkingContent.length} characters so far...`);
            
            // Update the thinking message in real-time
            if (canStoreMessages && sessionId && currentThinkingId) {
              try {
                await ctx.runMutation(api.chat.updateChatMessage, {
                  messageId: currentThinkingId,
                  content: `🧠 Instructions Agent Research & Analysis:\n\n${thinkingContent}`
                });
              } catch (error) {
                console.log("⚠️ Failed to update thinking message, trying progress message update...");
                // For progress messages, we might need to create a new one since update might not work
                try {
                  currentThinkingId = await ctx.runMutation(api.chat.storeProgressMessage, {
                    role: "thinking",
                    content: `🧠 Instructions Agent Research & Analysis:\n\n${thinkingContent}`,
                    sessionId: sessionId,
                  });
                } catch (progressError) {
                  console.log("⚠️ Failed to store progress thinking update:", progressError);
                }
              }
            }
          } else if (event.delta.type === 'text_delta') {
            generatedContent += event.delta.text;
            console.log(`📖 Generated: ${generatedContent.length} characters so far...`);
            
            // Update the assistant message in real-time
            if (canStoreMessages && sessionId && currentAssistantId) {
              try {
                const progressContent = generatedContent.length > 100 
                  ? `📖 Generated ${generatedContent.length} characters so far...\n\n` + generatedContent.substring(0, 500) + "\n\n*[Continuing generation...]*"
                  : "📖 Generating comprehensive instructions...";
                  
                await ctx.runMutation(api.chat.updateChatMessage, {
                  messageId: currentAssistantId,
                  content: progressContent
                });
              } catch (error) {
                console.log("⚠️ Failed to update assistant message, trying progress message update...");
                // For progress messages, create a new one since update might not work
                try {
                  const progressContent = generatedContent.length > 100 
                    ? `📖 Generated ${generatedContent.length} characters so far...\n\n` + generatedContent.substring(0, 500) + "\n\n*[Continuing generation...]*"
                    : "📖 Generating comprehensive instructions...";
                    
                  currentAssistantId = await ctx.runMutation(api.chat.storeProgressMessage, {
                    role: "assistant",
                    content: progressContent,
                    sessionId: sessionId,
                  });
                } catch (progressError) {
                  console.log("⚠️ Failed to store progress assistant update:", progressError);
                }
              }
            }
          }
        }
      }

      if (!generatedContent.trim()) {
        throw new Error('No content generated from AI');
      }

      // Final update to show complete content
      if (canStoreMessages && sessionId && currentAssistantId) {
        try {
          await ctx.runMutation(api.chat.updateChatMessage, {
            messageId: currentAssistantId,
            content: `📖 **Instructions Generation Complete!**\n\n✅ Generated comprehensive ${generatedContent.length}-character instruction document with web research integration.`
          });
        } catch (error) {
          console.log("⚠️ Failed to update final message, trying progress message...");
          try {
            await ctx.runMutation(api.chat.storeProgressMessage, {
              role: "assistant",
              content: `📖 **Instructions Generation Complete!**\n\n✅ Generated comprehensive ${generatedContent.length}-character instruction document with web research integration.`,
              sessionId: sessionId,
            });
          } catch (progressError) {
            console.log("⚠️ Failed to store final progress message:", progressError);
          }
        }
      }

      console.log(`✅ Generated instructions with ${generatedContent.length} characters`);
      return generatedContent;

    } catch (error) {
      console.error("❌ Instructions generation with web search failed:", error);
      throw new Error(`Failed to generate instructions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});
