"use node";

import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// --- Anthropic Web Search configuration helpers ---
// Enable/disable globally (default: enabled unless explicitly set to 'false')
const WEB_SEARCH_ENABLED = (process.env.EAC_WEB_SEARCH_ENABLED ?? 'true').toLowerCase() !== 'false';

function csvToList(val?: string): string[] | undefined {
  if (!val) return undefined;
  const list = val
    .split(/[,\n]/)
    .map(s => s.trim())
    .filter(Boolean)
    // Ensure we don't accidentally include schemes
    .map(s => s.replace(/^https?:\/\//i, ''));
  return list.length ? list : undefined;
}

function buildWebSearchToolConfig() {
  if (!WEB_SEARCH_ENABLED) return null;
  const allowed = csvToList(process.env.EAC_WEB_SEARCH_ALLOWED_DOMAINS);
  const blocked = csvToList(process.env.EAC_WEB_SEARCH_BLOCKED_DOMAINS);
  // API requires not supplying both at once
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
    // Parse input and optional parameters (e.g., --audience developers)
    const raw = input.trim();
    if (!raw) {
      return "❌ Please provide instruction content. Example: every time you reply, i want you to tell me a joke first";
    }

    // Extract optional audience parameter
    let audience: string | undefined;
    const audienceMatch = raw.match(/--audience[=\s]+(developers|users|administrators|general)/i);
    if (audienceMatch) {
      audience = audienceMatch[1].toLowerCase();
    }

    // Clean the topic by removing params
    const topic = raw
      .replace(/--audience[=\s]+(developers|users|administrators|general)/gi, '')
      .trim();

    // Initialize fileName - will be set by LLM generation later
    let fileName = 'instruction.md';

    // Build an LLM prompt to generate topic-specific content with a fixed structure
    const today = new Date().toISOString().split('T')[0];
  const structurePrompt = `Act like a world-class teacher and practical coach (clear, energetic, Gary Vee-style urgency without fluff). Create a COMPLETE, ACTIONABLE Markdown instruction document.

If up-to-date knowledge would materially improve accuracy, you MAY perform targeted web searches BEFORE answering. Prefer official docs and reputable sources. Always attribute with inline citations.

Top-level headings MUST be exactly these (you may add subheadings inside them as needed):

# Instructions: {TITLE}

*Generated on ${today}*

## Overview
Summarize the mission in 2–4 sentences. Explain the goal and what success looks like for this topic.

## Prerequisites
- List practical prerequisites (tools, permissions, accounts, inputs) tailored to the topic

## Step-by-Step Instructions

### Step 1: Preparation
- Concrete, topic-specific setup tasks (numbered list). Include any research or planning checklist.

### Step 2: Implementation
- Exact steps (numbered list) with specifics, parameters, and examples. Include short templates/snippets where helpful.

### Step 3: Verification
- Tests and validation steps (numbered list) with measurable acceptance criteria.

## Best Practices
- Key principles tailored to the topic. Include DO and DON'T bullets.
- If the topic is about social posts (e.g., Twitter/X), include rules (character limits, hashtag count, mentions strategy, link/media usage, thread vs single post, publishing cadence, timing windows).
- Include voice & tone guidance and 3–5 hook/CTA patterns.

## Troubleshooting
- 2–4 common issues with concise fixes.

## Additional Resources
- 2–4 resource placeholders (keep as plain text, no links required)

Special requirements:
- Replace {TITLE} with a short, value-forward, non-literal title (6–12 words) that reframes the user prompt into a clear subject. Do NOT echo the user's wording like “create instructions…”. Start with an action verb (e.g., "Craft", "Implement", "Design", "Scale").
- Topic context: "${topic}"
- Audience${audience ? `: ${audience}` : ": general"}
- Be concrete and specific. Prefer bullets and numbered lists. Keep it skimmable and immediately useful.
- Return ONLY the Markdown document—no extra commentary.`;

    let generated = '';
    let thinkingContent = '';
    let sources: Array<{ title: string; url: string; page_age?: string } > = [];
    try {
      const completion = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 4096,
        thinking: { type: "enabled", budget_tokens: 1024 },
        messages: [{ role: "user", content: structurePrompt }],
        ...(WEB_SEARCH_ENABLED ? { tools: [buildWebSearchToolConfig()].filter(Boolean) as any } : {}),
      });

      for (const block of completion.content) {
        if (block.type === "thinking") thinkingContent = block.thinking;
        if (block.type === "text") {
          generated += block.text;
          const anyBlock: any = block as any;
          const cites = Array.isArray(anyBlock.citations) ? anyBlock.citations : [];
          for (const c of cites) {
            if (c && c.type === 'web_search_result_location' && c.url && c.title) {
              sources.push({ title: c.title, url: c.url });
            }
          }
        }
        if (block.type === "web_search_tool_result") {
          const content = Array.isArray(block.content) ? block.content : [];
          for (const item of content) {
            if (item && item.type === 'web_search_result' && item.url && item.title) {
              sources.push({ title: item.title, url: item.url, page_age: (item as any).page_age });
            }
          }
        }
      }
    } catch (llmError) {
      console.error("LLM generation failed, will fallback to template:", llmError);
    }

    // Fallback to baseline template if LLM didn't return content
    if (!generated || !generated.trim()) {
      console.log('📝 Using fallback template for content generation');
      // Build a better non-literal title from the topic
      const normalized = topic
        .replace(/^(create\s+)?instructions?\s+(for|about)\s+/i, '')
        .replace(/^(how\s+to\s+)/i, '')
        .replace(/\bwhich\s+are\s+aimed\s+at\b/i, 'to')
        .replace(/\s+/g, ' ')
        .trim();
      const toTitleCase = (s: string) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
      const title = toTitleCase(normalized || 'Effective Instructions');
      generated = `# Instructions: ${title}

*Generated on ${today}*

## Overview
This document teaches you how to execute: **${normalized || topic}**. It focuses on clear steps, measurable outcomes, and practical tips you can apply immediately.

## Prerequisites
- Ensure required access and tools are available
- Verify environment/versions as applicable

## Step-by-Step Instructions

### Step 1: Preparation
1. Review the current setup
2. Identify dependencies/configuration
3. Prepare necessary resources

### Step 2: Implementation
1. Follow the procedures for ${normalized || topic}
2. Verify outcomes at each step
3. Capture notes/variations

### Step 3: Verification
1. Test results
2. Validate success criteria
3. Document findings

## Best Practices
- DO: Test in development first
- DO: Keep detailed change logs
- DO: Follow security and privacy guidelines
- DON'T: Skip validation or ship unreviewed content

## Troubleshooting
**Issue:** Unexpected error
- Solution: Check logs, validate configuration, retry steps

**Issue:** Missing permissions
- Solution: Request required access and re-run

## Additional Resources
- Internal docs placeholder
- Team playbook placeholder
- Tooling reference placeholder

---
*Generated by EAC Instructions Agent*`;
    }

    // Store thinking if available
    if (thinkingContent) {
      await ctx.runMutation(api.chat.storeChatMessage, {
        role: "thinking",
        content: `📝 Instructions Agent Thinking:\n\n${thinkingContent}`,
        sessionId: undefined,
      });
    }

    // Normalize the H1 heading to be clean and concise (avoid LLM making it verbose)
    const toTitleCase = (s: string) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    const normalizedSubject = topic
      .replace(/^(create\s+)?(new\s+)?instructions?\s+(for|about)\s+/i, '')
      .replace(/^(how\s+to\s+|guide\s+to\s+|steps\s+to\s+)/i, '')
      .replace(/^(write|generate|make|build|design)\s+/i, '')
      .replace(/\bwhich\s+are\s+aimed\s+at\b/gi, 'for')
      .replace(/\s+/g, ' ')
      .trim();
    
    const desiredHeading = `# Instructions: ${toTitleCase(normalizedSubject)}`;
    if (/^#\s+Instructions:\s+/m.test(generated)) {
      generated = generated.replace(/^#\s+Instructions:\s+.*$/m, desiredHeading);
    } else {
      generated = `${desiredHeading}\n\n${generated}`;
    }

    // Generate filename from the clean, normalized subject
    try {
      const filenamePrompt = `Create a short, descriptive filename for an instruction document about: "${normalizedSubject || topic}"

Requirements:
- 3-6 words maximum
- Use hyphens between words (kebab-case)
- No quotes, no file extension, no special characters
- Make it specific and clear

Return ONLY the filename (no extra text).`;
      
      console.log('🎯 Attempting LLM filename generation for topic:', normalizedSubject || topic);
      
      const fnCompletion = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 128,
        messages: [{ role: "user", content: filenamePrompt }],
      });
      
      let filenameText = '';
      for (const block of fnCompletion.content) {
        if (block.type === "text") filenameText += block.text;
      }
      
      console.log('🎯 LLM generated filename text:', filenameText);
      
      // Clean and format the filename
      const cleanFilename = (filenameText || '')
        .replace(/[\r\n]+/g, ' ')
        .replace(/^\"|\"$|^'|'$/g, '')
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .replace(/^-+|-+$/g, '')
        .trim();
      
      if (cleanFilename && cleanFilename.length > 2) {
        fileName = `${cleanFilename}.md`;
        console.log('✅ Using LLM-generated filename:', fileName);
      } else {
        throw new Error('LLM returned invalid filename');
      }
    } catch (e) {
      console.warn('❌ Filename LLM generation failed, using deterministic fallback:', e);
      const fallback = normalizedSubject
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .slice(0, 50);
      fileName = `${fallback || 'instruction'}.md`;
      console.log('📝 Using fallback filename:', fileName);
    }

    // If we have sources from web search, append a Sources section to the markdown
    if (sources.length) {
      const deduped = Array.from(new Map(sources.map(s => [s.url, s])).values()).slice(0, 10);
      const sourcesMd = ['\n\n## Sources', ...deduped.map(s => `- [${s.title}](${s.url})${s.page_age ? ` — ${s.page_age}` : ''}`)].join('\n');
      generated += sourcesMd;
    }

    // Ensure Instructions project exists
    await ctx.runMutation(api.projects.ensureInstructionsProject, {});

    // Create the instruction file
    const file = await ctx.runMutation(api.files.createInstructionFile, {
      name: fileName,
      content: generated,
      topic: topic,
      audience: (audience as any) || "developers",
    });

    return `📝 **Instructions Created Successfully! [SERVER-SIDE]**

**File:** \`${fileName}\`
**Topic:** ${topic}
**Location:** /instructions/${fileName}

The instruction document has been created and saved to your Instructions project. You can now view and edit it in the editor.

**Preview:**
${generated.split('\n').slice(0, 5).join('\n')}...

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
