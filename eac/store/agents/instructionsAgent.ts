// Instructions Agent
// /Users/matthewsimon/Projects/eac/eac/store/agents/instructionsAgent.ts

import { AgentTool, BaseAgent, ConvexMutations } from './base';

export class InstructionsAgent extends BaseAgent {
  id = "instructions";
  name = "Instructions";
  description = "Generate and maintain project instructions and documentation";
  icon = "FileText";
  
  tools: AgentTool[] = [
    {
      id: "generate-instructions",
      name: "Generate Instructions",
      command: "/instructions",
      description: "Create a new instruction document for the project",
      parameters: [
        {
          name: "topic",
          type: "string",
          description: "Topic or area to create instructions for",
          required: true,
        },
        {
          name: "audience",
          type: "select",
          description: "Target audience for the instructions",
          required: false,
          options: ["developers", "users", "administrators", "general"],
        },
      ],
    },
  ];

  async execute(
    tool: AgentTool,
    input: string,
    convexMutations: ConvexMutations
  ): Promise<string> {
    const { createFile, ensureInstructionsProject } = convexMutations;

    if (tool.id === "generate-instructions") {
      return await this.generateInstructions(input, createFile, ensureInstructionsProject);
    }

    throw new Error(`Unknown tool: ${tool.id}`);
  }

  private async generateInstructions(
    input: string,
    createFile: any,
    ensureInstructionsProject: any
  ): Promise<string> {
    try {
      console.log(`📝 Instructions Agent: Processing request: "${input}"`);

      // Clean the input by removing the command
      let cleanInput = input.trim();
      // Remove the /instructions command if present
      if (cleanInput.startsWith("/instructions")) {
        cleanInput = cleanInput.replace("/instructions", "").trim();
      }

      if (!cleanInput) {
        return "❌ Please specify what you'd like instructions for. Example: /instructions How to set up the development environment";
      }

      // Generate instruction content
      const instructionContent = await this.generateInstructionContent(cleanInput);

      // Create filename based on the topic
      const fileName = this.generateFileName(cleanInput);

      // Create the instruction file in Convex
      try {
        // First ensure the Instructions project exists
        await ensureInstructionsProject();
        
        const file = await createFile({
          name: fileName,
          content: instructionContent,
          topic: cleanInput,
          audience: "developers", // Default audience
        });

        console.log(`✅ Created instruction file: ${fileName}`);

        return `📝 **Instructions Created Successfully!**

**File:** \`${fileName}\`
**Topic:** ${cleanInput}
**Location:** /instructions/${fileName}

The instruction document has been created and saved to your Instructions project. You can now view and edit it in the editor.

**Preview:**
${instructionContent.split('\n').slice(0, 5).join('\n')}...

*Open the file in the editor to see the complete instructions.*`;

      } catch (convexError) {
        console.error("❌ Convex file creation failed:", convexError);
        return `⚠️ **Instruction Generated (Local Only)**

I've generated the instruction content, but couldn't save it to the database. Here's the content:

**File:** \`${fileName}\`
**Topic:** ${cleanInput}

---

${instructionContent}

---

*Please manually create this file or check your database connection.*`;
      }

    } catch (error) {
      console.error("❌ Instructions generation failed:", error);
      return `❌ **Error Creating Instructions**

Failed to generate instructions for: "${input}"

Error: ${error instanceof Error ? error.message : 'Unknown error'}

Please try again or check the system logs for more details.`;
    }
  }

  private async generateInstructionContent(topic: string): Promise<string> {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Check if the topic includes a request for jokes
    const shouldIncludeJoke = topic.toLowerCase().includes('joke') || 
                             topic.toLowerCase().includes('tell me a joke') ||
                             topic.toLowerCase().includes('every time you reply');
    
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
    
    // Generate comprehensive instruction content
    const content = `# Instructions: ${topic}

*Generated on ${timestamp}*

${jokeSection}## Overview
This document provides comprehensive instructions for: **${topic}**

## Prerequisites
- [ ] Ensure you have the necessary permissions
- [ ] Verify system requirements are met
- [ ] Check for any dependencies

## Step-by-Step Instructions

### Step 1: Preparation
1. Review the current setup
2. Backup any existing configuration
3. Prepare the necessary tools and resources

### Step 2: Implementation
1. Follow the specific procedures for ${topic}
2. Monitor progress and verify each step
3. Document any deviations or issues

### Step 3: Verification
1. Test the implementation
2. Validate the results
3. Confirm everything is working as expected

## Best Practices
- Always test in a development environment first
- Keep detailed logs of all changes
- Follow security guidelines
- Document any customizations

## Troubleshooting

### Common Issues
**Issue 1: [Describe common issue]**
- *Solution:* [Provide solution steps]

**Issue 2: [Describe another issue]**
- *Solution:* [Provide solution steps]

### Getting Help
- Check the documentation
- Review system logs
- Contact the support team if needed

## Additional Resources
- [Link to related documentation]
- [Link to video tutorials]
- [Link to community resources]

---

*Last updated: ${timestamp}*
*Next review: [Schedule regular review]*`;

    return content;
  }

  private generateFileName(topic: string): string {
    // Convert topic to a valid filename
    const cleanTopic = topic
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .substring(0, 50); // Limit length

    const timestamp = new Date().toISOString().split('T')[0];
    return `${cleanTopic}-${timestamp}.md`;
  }
}

// Export singleton instance
export const instructionsAgent = new InstructionsAgent();
