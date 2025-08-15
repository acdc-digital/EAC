// Logo Generator Agent
// /Users/matthewsimon/Projects/eac/eac/store/agents/logoGeneratorAgent.ts

import { generateLogoWithImagen, optimizeLogoPrompt } from '@/lib/api/imagen';
import { AgentTool, BaseAgent } from './base';
import { ConvexMutations } from './types';

interface LogoBrief {
  companyName: string;
  productName?: string;
  industry: string;
  businessDescription: string;
  stylePreference: 'minimalist' | 'modern' | 'traditional' | 'playful' | 'elegant' | 'bold';
  colorPreferences: string[];
  logoType: 'text' | 'icon' | 'combination';
  targetAudience: string;
  additionalInstructions?: string;
}

export class LogoGeneratorAgent extends BaseAgent {
  id = 'logo-generator';
  name = 'Logo Generator';
  description = 'AI-powered logo creation and brand identity generation using Google Imagen';
  icon = 'Puzzle';

  // Instance state to track the logo generation process
  private currentBrief: Partial<LogoBrief> = {};
  private currentStep: 'welcome' | 'company' | 'business' | 'style' | 'colors' | 'type' | 'audience' | 'instructions' | 'generate' = 'welcome';

  tools: AgentTool[] = [
    {
      id: 'logo-generation',
      name: 'Logo Generation',
      command: '/logo',
      description: 'Generate professional logos with Google Imagen AI',
      parameters: []
    }
  ];

  constructor() {
    super();
    // Initialize the brief when agent is created
    this.currentBrief = {};
    this.currentStep = 'welcome';
  }

  async execute(
    tool: AgentTool,
    input: string,
    convexMutations: ConvexMutations,
    sessionId?: string
  ): Promise<string> {
    try {
      // For the logo generator, we always use the conversational flow
      // The slash command '/logo' is handled within processInput
      return await this.processInput(input, convexMutations, sessionId || '');
    } catch (error) {
      console.error('Logo Generator Agent error:', error);
      return `❌ **Error in Logo Generation**\n\nSomething went wrong: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  getInitialPrompt(): string {
    this.currentStep = 'welcome';
    return `🎨 **Welcome to the Logo Generator!**

I'll help you create a professional logo using Google's Imagen AI. Let's start by learning about your business.

**What's the name of your company or brand?**

(This will be the primary text in your logo)`;
  }

  async processInput(input: string, convexMutations: ConvexMutations, sessionId: string): Promise<string> {
    const normalizedInput = input.toLowerCase().trim();
    
    // Debug logging
    console.log('🎨 LogoGenerator processInput:', {
      input: normalizedInput,
      currentStep: this.currentStep,
      briefExists: !!this.currentBrief,
      companyName: this.currentBrief?.companyName
    });
    
    // Handle slash commands first
    if (normalizedInput.startsWith('/logo')) {
      return this.handleLogoGeneration(input, convexMutations, sessionId);
    }

    // Handle conversation flow based on current step
    switch (this.currentStep) {
      case 'welcome':
        return this.handleWelcomeStep(input, convexMutations, sessionId);
      
      case 'company':
        return this.handleCompanyStep(input, convexMutations, sessionId);
      
      case 'business':
        return this.handleBusinessStep(input, convexMutations, sessionId);
      
      case 'style':
        return this.handleStyleStep(input, convexMutations, sessionId);
      
      case 'colors':
        return this.handleColorsStep(input, convexMutations, sessionId);
      
      case 'type':
        return this.handleTypeStep(input, convexMutations, sessionId);
      
      case 'audience':
        return this.handleAudienceStep(input, convexMutations, sessionId);
      
      case 'instructions':
        return this.handleInstructionsStep(input, convexMutations, sessionId);
      
      case 'generate':
        return this.handleGenerateStep(input, convexMutations, sessionId);
      
      default:
        return this.getInitialPrompt();
    }
  }

  private async handleWelcomeStep(input: string, convexMutations: ConvexMutations, sessionId: string): Promise<string> {
    if (!this.currentBrief) {
      this.currentBrief = {};
    }
    
    this.currentBrief.companyName = input.trim();
    this.currentStep = 'business';
    
    return `Great! **${input.trim()}** is a wonderful name.

Now, tell me about your business:

**What industry are you in and what does ${input.trim()} do?**

(For example: "We're a sustainable fashion brand that creates eco-friendly clothing" or "We provide cloud-based accounting software for small businesses")`;
  }

  private async handleCompanyStep(input: string, convexMutations: ConvexMutations, sessionId: string): Promise<string> {
    this.currentBrief!.companyName = input.trim();
    this.currentStep = 'business';
    
    return `Perfect! Now let's learn about **${input.trim()}**.

**What industry are you in and what does your business do?**

(Be specific about your products, services, or mission. This helps me understand the right visual direction for your logo.)`;
  }

  private async handleBusinessStep(input: string, convexMutations: ConvexMutations, sessionId: string): Promise<string> {
    this.currentBrief!.businessDescription = input.trim();
    
    // Try to extract industry from the description
    const businessDesc = input.toLowerCase();
    let suggestedIndustry = '';
    
    if (businessDesc.includes('tech') || businessDesc.includes('software') || businessDesc.includes('app')) {
      suggestedIndustry = 'Technology';
    } else if (businessDesc.includes('fashion') || businessDesc.includes('clothing') || businessDesc.includes('apparel')) {
      suggestedIndustry = 'Fashion & Retail';
    } else if (businessDesc.includes('food') || businessDesc.includes('restaurant') || businessDesc.includes('culinary')) {
      suggestedIndustry = 'Food & Beverage';
    } else if (businessDesc.includes('health') || businessDesc.includes('medical') || businessDesc.includes('wellness')) {
      suggestedIndustry = 'Healthcare';
    } else if (businessDesc.includes('finance') || businessDesc.includes('accounting') || businessDesc.includes('banking')) {
      suggestedIndustry = 'Financial Services';
    } else {
      suggestedIndustry = 'Professional Services';
    }
    
    this.currentBrief!.industry = suggestedIndustry;
    this.currentStep = 'style';
    
    return `Excellent! I understand that ${this.currentBrief!.companyName} ${input.trim().toLowerCase()}.

Now, what style direction appeals to you? Choose one:

1. **Minimalist** - Clean, simple, timeless
2. **Modern** - Contemporary, sleek, geometric
3. **Traditional** - Classic, established, trustworthy
4. **Playful** - Fun, creative, approachable
5. **Elegant** - Sophisticated, refined, luxury
6. **Bold** - Strong, impactful, confident

**Type the number or style name you prefer:**`;
  }

  private async handleStyleStep(input: string, convexMutations: ConvexMutations, sessionId: string): Promise<string> {
    const normalizedInput = input.toLowerCase().trim();
    let selectedStyle: LogoBrief['stylePreference'];
    
    // Map input to style preference
    if (normalizedInput.includes('1') || normalizedInput.includes('minimalist')) {
      selectedStyle = 'minimalist';
    } else if (normalizedInput.includes('2') || normalizedInput.includes('modern')) {
      selectedStyle = 'modern';
    } else if (normalizedInput.includes('3') || normalizedInput.includes('traditional')) {
      selectedStyle = 'traditional';
    } else if (normalizedInput.includes('4') || normalizedInput.includes('playful')) {
      selectedStyle = 'playful';
    } else if (normalizedInput.includes('5') || normalizedInput.includes('elegant')) {
      selectedStyle = 'elegant';
    } else if (normalizedInput.includes('6') || normalizedInput.includes('bold')) {
      selectedStyle = 'bold';
    } else {
      return `I didn't understand that style choice. Please choose:

1. **Minimalist** 2. **Modern** 3. **Traditional** 4. **Playful** 5. **Elegant** 6. **Bold**

**Type the number or style name:**`;
    }
    
    this.currentBrief!.stylePreference = selectedStyle;
    this.currentStep = 'colors';
    
    return `Perfect! A **${selectedStyle}** style will work great for ${this.currentBrief!.companyName}.

**What color preferences do you have?**

You can mention:
- Specific colors (blue, green, red, etc.)
- Color themes (corporate, vibrant, earthy, etc.)  
- "No preference" if you want me to suggest colors based on your industry

**Your color preference:**`;
  }

  private async handleColorsStep(input: string, convexMutations: ConvexMutations, sessionId: string): Promise<string> {
    const colorInput = input.trim();
    this.currentBrief!.colorPreferences = [colorInput];
    this.currentStep = 'type';
    
    return `Great color choice! Now, what type of logo do you prefer?

1. **Text-only** - Company name styled beautifully (like Google, Coca-Cola)
2. **Icon-only** - A symbol that represents your brand (like Apple, Nike swoosh)
3. **Combination** - Both text and icon together (like Adidas, McDonald's)

**Type the number or logo type you prefer:**`;
  }

  private async handleTypeStep(input: string, convexMutations: ConvexMutations, sessionId: string): Promise<string> {
    const normalizedInput = input.toLowerCase().trim();
    let logoType: LogoBrief['logoType'];
    
    if (normalizedInput.includes('1') || normalizedInput.includes('text')) {
      logoType = 'text';
    } else if (normalizedInput.includes('2') || normalizedInput.includes('icon')) {
      logoType = 'icon';
    } else if (normalizedInput.includes('3') || normalizedInput.includes('combination')) {
      logoType = 'combination';
    } else {
      return `Please choose a logo type:

1. **Text-only** 2. **Icon-only** 3. **Combination**

**Type the number or logo type:**`;
    }
    
    this.currentBrief!.logoType = logoType;
    this.currentStep = 'audience';
    
    return `Excellent! A **${logoType}** logo will be perfect.

**Who is your target audience?**

(For example: "Young professionals", "Families with children", "Small business owners", "Tech startups", etc. This helps inform the design approach.)`;
  }

  private async handleAudienceStep(input: string, convexMutations: ConvexMutations, sessionId: string): Promise<string> {
    this.currentBrief!.targetAudience = input.trim();
    this.currentStep = 'instructions';
    
    return `Perfect! Understanding your audience helps create the right visual impact.

**Any additional instructions or specific elements you'd like included?**

(Optional - you can mention specific symbols, avoid certain elements, or say "none" to proceed)

**Additional instructions:**`;
  }

  private async handleInstructionsStep(input: string, convexMutations: ConvexMutations, sessionId: string): Promise<string> {
    const instructions = input.trim();
    if (instructions.toLowerCase() !== 'none') {
      this.currentBrief!.additionalInstructions = instructions;
    }
    
    this.currentStep = 'generate';
    
    const brief = this.currentBrief!;
    
    return `🎯 **Logo Brief Complete!**

Here's what I'll create for you:

• **Company:** ${brief.companyName}
• **Business:** ${brief.businessDescription}
• **Industry:** ${brief.industry}
• **Style:** ${brief.stylePreference}
• **Colors:** ${brief.colorPreferences?.[0]}
• **Type:** ${brief.logoType}
• **Audience:** ${brief.targetAudience}
${brief.additionalInstructions ? `• **Special Instructions:** ${brief.additionalInstructions}` : ''}

**Ready to generate your logo?**

Type "yes" to start generation or "edit" if you want to modify anything.`;
  }

  private async handleGenerateStep(input: string, convexMutations: ConvexMutations, sessionId: string): Promise<string> {
    const normalizedInput = input.toLowerCase().trim();
    
    if (normalizedInput.includes('edit') || normalizedInput.includes('modify')) {
      this.currentStep = 'welcome';
      this.currentBrief = {};
      return `No problem! Let's start over with any changes you'd like to make.

**What's the name of your company or brand?**`;
    }
    
    if (normalizedInput.includes('yes') || normalizedInput.includes('generate') || normalizedInput.includes('create')) {
      return this.handleLogoGeneration(input, convexMutations, sessionId);
    }
    
    return `Please type "yes" to generate your logo or "edit" to make changes to your brief.`;
  }

  private async handleLogoGeneration(input: string, convexMutations: ConvexMutations, sessionId?: string): Promise<string> {
    const brief = this.currentBrief;
    
    if (!brief || !brief.companyName) {
      this.currentStep = 'welcome';
      return `I need more information to generate your logo. Let's start with your company name.

**What's the name of your company or brand?**`;
    }

    try {
      // Create optimized Imagen prompt from the brief
      const imagePrompt = optimizeLogoPrompt(
        brief.companyName,
        brief.businessDescription || '',
        brief.stylePreference || 'modern',
        brief.colorPreferences?.[0] || '',
        brief.logoType || 'combination',
        brief.targetAudience || '',
        brief.additionalInstructions
      );
      
      // Start generation process
      const generationResult = await generateLogoWithImagen(imagePrompt);
      
      console.log('🎨 Logo generation result:', {
        success: generationResult.success,
        hasImageUrl: !!generationResult.imageUrl,
        imageUrlLength: generationResult.imageUrl?.length,
        imageUrlPreview: generationResult.imageUrl?.substring(0, 50),
        error: generationResult.error
      });
      
      if (generationResult.success && generationResult.imageUrl) {
        // Store the generated logo in Convex for persistence
        if (sessionId && convexMutations.storeChatMessage) {
          await convexMutations.storeChatMessage({
            role: "assistant",
            content: `🎨 **Logo Generated Successfully!**

Here's your custom logo for **${brief.companyName}**:

![Generated Logo](${generationResult.imageUrl})

**Generation Details:**
• **Style:** ${brief.stylePreference}
• **Type:** ${brief.logoType}
• **Colors:** ${brief.colorPreferences?.[0]}
• **Target Audience:** ${brief.targetAudience}

**Imagen Prompt Used:**
\`${imagePrompt}\`

**What's Next?**
1. **Generate Variation** - Create another version
2. **Export Logo** - Download in different formats
3. **Start New Project** - Create another logo

Type your choice to continue!`,
            sessionId,
            operation: {
              type: "tool_executed",
              details: {
                tool: "logo_generation",
                imageUrl: generationResult.imageUrl,
                imageData: generationResult.imageData,
                prompt: imagePrompt,
                brief: brief
              }
            }
          });
        }
        
        // Reset for next generation
        this.reset();
        
        return `🎨 **Logo Generated Successfully!**

Your custom logo for **${brief.companyName}** has been created and will appear in the Logo Generator tab.

**Generation Details:**
• **Style:** ${brief.stylePreference}
• **Type:** ${brief.logoType}
• **Colors:** ${brief.colorPreferences?.[0]}
• **Target Audience:** ${brief.targetAudience}

The logo is now available in the preview panel. You can:

1. **Generate Variation** - Create another version
2. **Export Logo** - Download in different formats  
3. **Start New Project** - Create another logo

Type your choice to continue!`;
      } else {
        return `❌ **Logo Generation Failed**

Sorry, there was an issue generating your logo: ${generationResult.error || 'Unknown error'}

Please try again or modify your requirements. Type "restart" to begin with a new brief.`;
      }
      
    } catch (error) {
      console.error('❌ Logo generation error:', error);
      return `❌ **Logo Generation Error**

An unexpected error occurred during logo generation. Please try again.

Error: ${error instanceof Error ? error.message : 'Unknown error'}

Type "restart" to begin with a new brief.`;
    }
  }

  private createImagenPrompt(brief: Partial<LogoBrief>): string {
    const {
      companyName,
      businessDescription,
      stylePreference,
      colorPreferences,
      logoType,
      targetAudience,
      additionalInstructions
    } = brief;

    let prompt = `Create a professional logo design for "${companyName}"`;
    
    if (businessDescription) {
      prompt += `, a company that ${businessDescription.toLowerCase()}`;
    }
    
    if (stylePreference) {
      prompt += `. Style: ${stylePreference}`;
    }
    
    if (logoType) {
      if (logoType === 'text') {
        prompt += '. Text-only logo with stylized typography';
      } else if (logoType === 'icon') {
        prompt += '. Icon-only logo, no text, symbolic design';
      } else {
        prompt += '. Combination logo with both text and icon elements';
      }
    }
    
    if (colorPreferences && colorPreferences[0] && colorPreferences[0].toLowerCase() !== 'no preference') {
      prompt += `. Color scheme: ${colorPreferences[0]}`;
    }
    
    if (targetAudience) {
      prompt += `. Target audience: ${targetAudience}`;
    }
    
    if (additionalInstructions) {
      prompt += `. Special requirements: ${additionalInstructions}`;
    }
    
    prompt += '. High quality, professional, scalable vector design, clean background, suitable for business use.';
    
    return prompt;
  }

  // Reset the agent state
  reset(): void {
    this.currentBrief = {};
    this.currentStep = 'welcome';
  }
}

// Export the instantiated agent for registry
export const logoGeneratorAgent = new LogoGeneratorAgent();
