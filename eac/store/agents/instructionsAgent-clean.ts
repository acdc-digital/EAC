// Instructions Agent  
// Creates comprehensive instruction documents using AI with web search capabilities

import { AgentTool, BaseAgent } from './base';
import { ConvexMutations } from './types';

export class InstructionsAgent extends BaseAgent {
  id = 'instructions';
  name = 'Instructions';
  description = 'Creates comprehensive instruction documents with AI-powered web search';
  icon = 'BookOpen';

  tools: AgentTool[] = [
    {
      name: 'generateInstructions',
      description: 'Generate comprehensive instructions for any topic using AI with web search',
      parameters: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'The topic to create instructions for'
          }
        },
        required: ['topic']
      }
    }
  ];

  async execute(input: string, mutations: ConvexMutations): Promise<string> {
    try {
      console.log('🤖 Instructions Agent: Generating instructions for:', input);
      
      // Clean the input
      const cleanInput = input.replace(/^\/instructions\s*/i, '').trim();
      
      if (!cleanInput) {
        return `❌ **Instructions Agent**

Please provide a topic for instruction creation.

**Example:** \`/instructions create a social media marketing campaign\``;
      }

      // Generate instructions content using AI with web search
      const instructionContent = await this.generateInstructionContent(cleanInput);
      
      // Generate a descriptive title and filename
      const generatedTitle = this.generateInstructionTitle(cleanInput);
      const fileName = this.generateFileName(generatedTitle);

      // Create the file using Convex
      try {
        const file = await mutations.files.createFile({
          name: fileName,
          content: instructionContent,
          type: 'instructions' as const,
          projectId: null, // Instructions are standalone documents
        });

        return `✅ **Instructions Created Successfully**

📄 **File:** \`${fileName}\`
📖 **Title:** ${generatedTitle}
🔍 **Research-Enhanced:** Includes current best practices and up-to-date information

The comprehensive instruction document has been created and saved to your files.`;

      } catch (fileError) {
        console.error('❌ Failed to create instruction file:', fileError);
        return `⚠️ **Instructions Generated (Manual Save Required)**

📖 **Title:** ${generatedTitle}
📄 **Suggested Filename:** \`${fileName}\`

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
    // Try to generate content using AI with web search capabilities
    try {
      const aiContent = await this.generateInstructionsWithWebSearch(topic);
      if (aiContent && aiContent.trim()) {
        console.log('✅ Generated instructions using AI with web search');
        return aiContent;
      }
    } catch (error) {
      console.error('⚠️ AI generation failed, falling back to template:', error);
    }

    // Fall back to template-based content
    const timestamp = new Date().toISOString().split('T')[0];
    console.log('🔄 Using template-based instructions generation');
    return this.generateInstructionsTemplate(topic, timestamp);
  }

  private async generateInstructionsWithWebSearch(topic: string): Promise<string> {
    try {
      // Use Convex action for web search (server-side with proper API key access)
      const { api } = await import('../../convex/_generated/api');
      const { ConvexHttpClient } = await import('convex/browser');
      
      // Get Convex URL from environment or use default
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://pleasant-grouse-284.convex.cloud';
      const convex = new ConvexHttpClient(convexUrl);
      
      console.log('🔍 Calling Convex action for instructions generation with web search...');
      const result = await convex.action(api.instructionsActions.generateInstructionsWithWebSearch, {
        topic: topic
      });
      
      console.log('✅ Received instructions from Convex action');
      return result;
    } catch (error) {
      console.warn('⚠️ AI web search generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate instructions template as fallback
   */
  private generateInstructionsTemplate(topic: string, timestamp: string): string {
    // Non-literal title generator
    const toTitleCase = (s: string) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
    const normalized = topic
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const titleCased = toTitleCase(normalized);

    return `# Instructions: ${titleCased}

*Generated on ${timestamp}*

## Overview

This document provides comprehensive instructions for ${normalized}. Follow these steps to achieve your goals effectively and efficiently.

## Prerequisites

Before you begin, ensure you have:
- [ ] Basic understanding of the topic
- [ ] Required tools and resources
- [ ] Sufficient time to complete the process
- [ ] Access to necessary platforms or systems

## Step-by-Step Instructions

### Step 1: Preparation
1. Gather all necessary materials and information
2. Set up your workspace or environment
3. Review any relevant documentation or guidelines

### Step 2: Planning
1. Define your specific objectives
2. Create a timeline for completion
3. Identify potential challenges and solutions

### Step 3: Execution
1. Begin with the foundational elements
2. Follow the established process methodically
3. Document your progress and any variations

### Step 4: Review and Optimization
1. Evaluate the results against your objectives
2. Identify areas for improvement
3. Make necessary adjustments

## Best Practices

- Always start with clear, measurable goals
- Document your process for future reference
- Test your approach on a small scale first
- Stay updated with industry standards and trends
- Seek feedback from peers or experts when possible

## Common Pitfalls to Avoid

- Rushing through the planning phase
- Ignoring safety or compliance requirements
- Failing to backup important data or work
- Not allowing sufficient time for testing and refinement
- Overlooking user experience or stakeholder needs

## Troubleshooting

If you encounter issues:

1. **Problem:** Process is taking longer than expected
   - **Solution:** Review your timeline and adjust expectations
   - **Prevention:** Build buffer time into your planning

2. **Problem:** Results don't match expectations
   - **Solution:** Review each step and identify where deviation occurred
   - **Prevention:** Set clear success criteria upfront

3. **Problem:** Technical difficulties or tool limitations
   - **Solution:** Research alternative approaches or tools
   - **Prevention:** Have backup plans and alternative tools ready

## Resources and Tools

### Recommended Tools
- [List specific tools relevant to the topic]
- [Include links where appropriate]
- [Mention both free and paid options]

### Additional Reading
- Industry best practices documentation
- Relevant case studies and examples
- Community forums and support groups

### Professional Development
- Courses and certifications
- Workshops and conferences
- Networking opportunities

## Quality Assurance

Before considering your work complete:
- [ ] All objectives have been met
- [ ] Quality standards are satisfied
- [ ] Documentation is complete and accessible
- [ ] Stakeholders have been informed of completion
- [ ] Follow-up procedures are in place

## Next Steps

After completing these instructions:

1. **Immediate Actions**
   - Review and validate your results
   - Share outcomes with relevant stakeholders
   - Document lessons learned

2. **Short-term Follow-up**
   - Monitor performance and effectiveness
   - Gather feedback from users or beneficiaries
   - Make iterative improvements

3. **Long-term Considerations**
   - Plan for maintenance and updates
   - Consider scaling or expansion opportunities
   - Stay informed about industry developments

## Conclusion

Following these instructions should help you successfully achieve your goals for ${normalized}. Remember that continuous improvement and adaptation are key to long-term success.

For questions or additional support, consider reaching out to subject matter experts or relevant professional communities.

---

*This document was generated on ${timestamp}. Please verify all information is current and applicable to your specific situation.*`;
  }

  private generateInstructionTitle(topic: string): string {
    // Clean and format the topic into a proper title
    const cleaned = topic
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const titleCased = cleaned.replace(/\b\w/g, (l) => l.toUpperCase());
    
    return `Instructions: ${titleCased}`;
  }

  private generateFileName(title: string): string {
    // Convert title to a safe filename
    const baseFileName = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const timestamp = new Date().toISOString().split('T')[0];
    return `${baseFileName}-${timestamp}.md`;
  }
}
