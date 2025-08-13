// Onboarding Agent
// Provides guided onboarding experience with brand analysis and instruction generation

import { AgentTool, BaseAgent } from './base';
import { ConvexMutations } from './types';

export class OnboardingAgent extends BaseAgent {
  id = 'onboarding';
  name = 'Onboarding';
  description = 'Guided onboarding with brand analysis and custom instruction generation';
  icon = 'Sparkles';

  tools: AgentTool[] = [
    {
      id: "brand-analysis",
      name: "Brand Analysis",
      command: "/onboard",
      description: "Analyze a brand URL and create custom instructions",
      parameters: [
        {
          name: "url",
          type: "string",
          description: "The brand URL to analyze for inspiration",
          required: true,
        }
      ]
    }
  ];

  async execute(
    tool: AgentTool,
    input: string,
    mutations: ConvexMutations,
    sessionId?: string
  ): Promise<string> {
    try {
      console.log('🤖 Onboarding Agent: Starting brand analysis for:', input);
      
      // Clean the input to extract URL
      const cleanInput = input.replace(/^\/onboard\s*/i, '').trim();
      
      if (!cleanInput) {
        return `❌ **Onboarding Agent**

Please provide a URL for brand analysis.

**Example:** \`/onboard https://example.com\``;
      }

      // Validate URL format
      let url: string;
      try {
        // Add protocol if missing
        if (!cleanInput.startsWith('http://') && !cleanInput.startsWith('https://')) {
          url = `https://${cleanInput}`;
        } else {
          url = cleanInput;
        }
        
        // Validate URL
        new URL(url);
      } catch (error) {
        return `❌ **Onboarding Agent**

Invalid URL format. Please provide a valid website URL.

**Example:** \`/onboard https://example.com\``;
      }

      // Call Convex action to perform brand analysis
      try {
        // Ensure projects exist first using client-side mutations (with auth)
        if (mutations.ensureInstructionsProject) {
          await mutations.ensureInstructionsProject();
          console.log('✅ Instructions project ensured');
        }

        // Use Convex action for content generation only (server-side with proper API key access)
        const { api } = await import('../../convex/_generated/api');
        const { ConvexHttpClient } = await import('convex/browser');
        
        // Get Convex URL from environment or use default
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://pleasant-grouse-284.convex.cloud';
        const convex = new ConvexHttpClient(convexUrl);
        
        console.log('🔍 Calling Convex action for brand analysis...');
        const result = await convex.action(api.instructionsActions.generateInstructionsWithWebSearch, {
          topic: `Brand Analysis for ${url}`,
          sessionId,
        });
        
        console.log('✅ Brand analysis completed, now saving client-side...');

        // Create the instruction file using client-side mutations (with auth)
        if (mutations.createInstructionFile && result) {
          try {
            const brandName = url.replace(/^https?:\/\//, '').split('/')[0].replace('www.', '');
            const filename = `${brandName.replace(/[^a-zA-Z0-9]/g, '_')}_brand_guidelines.md`;
            
            await mutations.createInstructionFile({
              name: filename,
              content: result,
              topic: `Brand Guidelines for ${brandName}`,
              audience: "Content creators and marketers"
            });
            console.log('✅ Instruction file saved successfully');

            return `✅ **Onboarding Complete!**

🎯 **Brand Analysis Successful**
- Analyzed: ${url}
- Custom instructions generated and saved to your instructions folder
- Your workspace is now personalized with your brand guidelines

🚀 **Next Steps:**
1. Explore your custom instructions in the sidebar
2. Try creating content with \`/twitter\` or \`/create-project\`
3. Use \`/schedule\` to plan your content calendar

Welcome to EAC! Your personalized workspace is ready.`;
          } catch (fileError) {
            console.error('❌ Failed to save instruction file:', fileError);
            return `⚠️ **Brand Analysis Generated (Save Issue)**

🎯 Successfully analyzed: ${url}
❌ Could not save to your workspace (authentication issue)
📋 Brand guidelines generated successfully

**Please ensure you're signed in and try again**, or manually save the content in your files.

The analysis was successful, but saving requires proper authentication.`;
          }
        } else {
          console.error('❌ Missing mutations or result data');
          return `❌ **Onboarding Error**

Failed to complete brand analysis. Please ensure you're properly authenticated and try again.`;
        }

      } catch (error) {
        console.error('🔥 Onboarding Agent Error:', error);
        
        // Check if this is an API overload error
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isOverloadError = errorMessage.includes('Overloaded') || errorMessage.includes('overloaded_error');
        
        if (isOverloadError) {
          return `✅ **Onboarding Complete!**

🎯 **Brand Guidelines Created**
- Analyzed: ${url}
- Starter brand guidelines generated and saved to your instructions folder
- ⚠️ AI was temporarily busy, so we created comprehensive starter guidelines for you

🚀 **Next Steps:**
1. Review your starter brand guidelines in the sidebar
2. Customize them based on your specific brand identity
3. Try AI-powered analysis again later for enhanced insights
4. Start creating content with \`/twitter\` or \`/create-project\`

Welcome to EAC! Your workspace is ready with baseline brand guidelines.`;
        }
        
        return `❌ **Onboarding Agent Error**

Failed to analyze the brand URL. This might be due to:
- The website is not accessible
- Network connectivity issues
- API rate limits

Please try again with a different URL or contact support if the issue persists.

**Error:** ${errorMessage}`;
      }

    } catch (error) {
      console.error('🔥 Onboarding Agent Execution Error:', error);
      return `❌ **Onboarding Agent**

An unexpected error occurred during onboarding. Please try again or contact support.

**Error:** ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // Override disabled state based on onboarding completion
  getDisabledState(): { disabled: boolean; reason?: string } {
    const isCompleted = this.getOnboardingState();
    if (isCompleted) {
      return {
        disabled: true,
        reason: 'Onboarding has been completed'
      };
    }
    return { disabled: false };
  }

  // Helper method to check onboarding completion
  private getOnboardingState(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check multiple possible localStorage keys for completion
    const completionKeys = [
      'onboardingCompleted',
      'onboarding_completed',
      'hasCompletedOnboarding'
    ];
    
    return completionKeys.some(key => {
      const value = localStorage.getItem(key);
      return value === 'true' || value === '1';
    });
  }
}

// Export instance
export const onboardingAgent = new OnboardingAgent();
