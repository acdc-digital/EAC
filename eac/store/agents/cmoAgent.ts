// CMO Agent - Marketing Campaign Strategy and Planning
// Creates comprehensive marketing campaign plans and strategies

import { AgentTool, BaseAgent } from './base';
import { ConvexMutations } from './types';

interface CampaignData {
  objective?: string;
  targetAudience?: string;
  platforms?: string[];
  contentTypes?: Record<string, string>;
  cadence?: Record<string, string>;
  timeline?: {
    startDate?: string;
    endDate?: string;
    milestones?: string[];
  };
  budget?: string;
  kpis?: string[];
  brandGuidelines?: string;
  competitiveContext?: string;
}

export class CMOAgent extends BaseAgent {
  id = 'cmo';
  name = 'CMO';
  description = 'Marketing campaign strategy and planning with multi-platform recommendations';
  icon = 'TrendingUp';

  tools: AgentTool[] = [
    {
      id: "define-campaign",
      name: "Define Marketing Campaign",
      command: "/cmo",
      description: "Interactive campaign planning with strategic recommendations",
      parameters: [
        {
          name: "campaign_request",
          type: "string",
          description: "Describe your marketing campaign needs or goals",
          required: true,
        }
      ]
    }
  ];

  // Campaign conversation state
  private campaignState: Map<string, {
    data: CampaignData;
    phase: number;
    responses: string[];
    timestamp: number;
  }> = new Map();

  async execute(
    tool: AgentTool,
    input: string,
    mutations: ConvexMutations,
    sessionId?: string
  ): Promise<string> {
    try {
      console.log('🎯 CMO Agent: Starting campaign planning for:', input);
      
      // Clean the input
      const cleanInput = input.replace(/^\/cmo\s*/i, '').trim();
      
      if (!cleanInput) {
        return this.getWelcomeMessage();
      }

      const currentSessionId = sessionId || 'default';
      
      // Check if we're continuing an existing conversation
      if (this.campaignState.has(currentSessionId)) {
        return await this.continueConversation(currentSessionId, cleanInput, mutations);
      } else {
        return await this.startNewConversation(currentSessionId, cleanInput, mutations);
      }

    } catch (error) {
      console.error("❌ CMO Agent execution failed:", error);
      return `❌ **CMO Agent Error**

Failed to process campaign request: "${input}"

Error: ${error instanceof Error ? error.message : 'Unknown error'}

Please try again or start a new campaign planning session.`;
    }
  }

  private getWelcomeMessage(): string {
    return `🎯 **Welcome to the CMO Agent**

I'll help you create a comprehensive marketing campaign strategy with platform-specific recommendations.

**To get started, tell me about your campaign:**
- What are you trying to achieve? (brand awareness, lead generation, product launch, etc.)
- Who is your target audience?
- Which platforms are you considering?

**Example:** \`/cmo I want to launch a new SaaS product targeting small business owners on LinkedIn and Twitter\`

Let's build your campaign strategy together! 🚀`;
  }

  private async startNewConversation(
    sessionId: string, 
    input: string, 
    mutations: ConvexMutations
  ): Promise<string> {
    // Initialize campaign state
    this.campaignState.set(sessionId, {
      data: {},
      phase: 1,
      responses: [input],
      timestamp: Date.now()
    });

    return this.askPhase1Questions(sessionId, input);
  }

  private async continueConversation(
    sessionId: string, 
    input: string, 
    mutations: ConvexMutations
  ): Promise<string> {
    const state = this.campaignState.get(sessionId)!;
    
    // Check for timeout (30 minutes)
    if (Date.now() - state.timestamp > 30 * 60 * 1000) {
      this.campaignState.delete(sessionId);
      return this.getTimeoutMessage();
    }

    state.responses.push(input);
    state.timestamp = Date.now();

    switch (state.phase) {
      case 1:
        return this.processPhase1Response(sessionId, input);
      case 2:
        return this.processPhase2Response(sessionId, input);
      case 3:
        return this.processPhase3Response(sessionId, input);
      case 4:
        return this.processPhase4Response(sessionId, input);
      case 5:
        return await this.processPhase5Response(sessionId, input, mutations);
      default:
        return await this.generateFinalReport(sessionId, mutations);
    }
  }

  private askPhase1Questions(sessionId: string, initialInput: string): string {
    const state = this.campaignState.get(sessionId)!;
    
    // Try to extract initial information from the input
    const extractedInfo = this.extractInitialInfo(initialInput);
    state.data = { ...state.data, ...extractedInfo };

    return `🎯 **Phase 1: Campaign Objectives & Target Audience**

Based on your request: "${initialInput}"

I need to understand your campaign better. Please provide:

**1. Primary Objective** (if not clear from above)
- Brand awareness, lead generation, sales conversion, customer retention, product launch, or other?

**2. Target Audience Details**
- Demographics (age, location, profession, etc.)
- Pain points or needs they have
- Where they spend time online

**3. Success Metrics**
- How will you measure campaign success?
- Any specific goals (e.g., 1000 leads, 20% brand awareness lift)?

Please provide these details so I can move to platform strategy recommendations.`;
  }

  private processPhase1Response(sessionId: string, response: string): string {
    const state = this.campaignState.get(sessionId)!;
    
    // Extract information from response
    const info = this.extractPhase1Info(response);
    state.data = { ...state.data, ...info };
    state.phase = 2;

    return `📱 **Phase 2: Platform Selection & Content Strategy**

Great! Now let's determine the best platforms and content approaches.

**Available Platforms:**
- Facebook (long-form content, community building)
- Instagram (visual content, stories, reels)
- LinkedIn (professional content, B2B focus)
- Twitter/X (real-time engagement, discussions)
- TikTok (short-form video, viral content)
- Reddit (community discussions, authentic engagement)

**Questions:**
1. **Which platforms** are you currently considering or using?
2. **Content preferences** - do you prefer video, images, text, or a mix?
3. **Content resources** - do you have existing content that can be repurposed?
4. **Brand voice** - professional, casual, humorous, educational?

Please share your platform preferences and content approach.`;
  }

  private processPhase2Response(sessionId: string, response: string): string {
    const state = this.campaignState.get(sessionId)!;
    
    const info = this.extractPhase2Info(response);
    state.data = { ...state.data, ...info };
    state.phase = 3;

    return `📅 **Phase 3: Timeline & Posting Strategy**

Perfect! Now let's plan your campaign timeline and posting frequency.

**Questions:**
1. **Campaign Duration**
   - When do you want to start?
   - How long should the campaign run? (4 weeks, 3 months, ongoing?)
   - Any important dates or deadlines?

2. **Posting Frequency** per platform
   - How often can you realistically create and post content?
   - Do you have team members who can help with content creation?

3. **Budget Considerations**
   - Are you planning paid advertising?
   - Budget range for content creation or ads?

Share your timeline preferences and resource availability.`;
  }

  private processPhase3Response(sessionId: string, response: string): string {
    const state = this.campaignState.get(sessionId)!;
    
    const info = this.extractPhase3Info(response);
    state.data = { ...state.data, ...info };
    state.phase = 4;

    return `📊 **Phase 4: Measurement & Brand Guidelines**

Excellent! Let's finalize the measurement strategy and brand consistency.

**Questions:**
1. **Key Performance Indicators (KPIs)**
   - Engagement rate, reach, website traffic, leads, conversions?
   - How often do you want to review performance? (weekly, monthly?)

2. **Brand Guidelines**
   - Do you have existing brand colors, fonts, or voice guidelines?
   - Any messaging that must be consistent across platforms?
   - Topics or approaches to avoid?

3. **Competitive Context**
   - Who are your main competitors?
   - Any competitor campaigns you admire or want to differentiate from?

Share these final details so I can create your comprehensive campaign strategy.`;
  }

  private processPhase4Response(sessionId: string, response: string): string {
    const state = this.campaignState.get(sessionId)!;
    
    const info = this.extractPhase4Info(response);
    state.data = { ...state.data, ...info };
    state.phase = 5;

    return `✅ **Phase 5: Final Review & Report Generation**

Excellent! I now have all the information needed to create your comprehensive marketing campaign strategy.

**Campaign Summary:**
- **Objective:** ${state.data.objective || 'Not specified'}
- **Target Audience:** ${state.data.targetAudience || 'Not specified'}
- **Platforms:** ${state.data.platforms?.join(', ') || 'Not specified'}
- **Timeline:** ${state.data.timeline?.startDate || 'Not specified'} - ${state.data.timeline?.endDate || 'Not specified'}
- **Budget:** ${state.data.budget || 'Not specified'}

**Ready to generate your campaign report?**

Type "**generate report**" to create your comprehensive Marketing Campaign Possibilities Report, or provide any corrections to the summary above.

The report will be saved to your Instructions folder for future reference.`;
  }

  private async processPhase5Response(
    sessionId: string, 
    response: string, 
    mutations: ConvexMutations
  ): Promise<string> {
    const state = this.campaignState.get(sessionId)!;
    
    if (response.toLowerCase().includes('generate report') || response.toLowerCase().includes('create report')) {
      return await this.generateFinalReport(sessionId, mutations);
    } else {
      // Process any final corrections
      const corrections = this.extractCorrections(response);
      state.data = { ...state.data, ...corrections };
      
      return `📝 **Updates Applied**

Your corrections have been noted. 

Type "**generate report**" when you're ready for me to create your comprehensive Marketing Campaign Possibilities Report.`;
    }
  }

  private async generateFinalReport(sessionId: string, mutations: ConvexMutations): Promise<string> {
    const state = this.campaignState.get(sessionId);
    if (!state) {
      return this.getTimeoutMessage();
    }

    try {
      const reportContent = this.createCampaignReport(state.data);
      const fileName = this.generateReportFileName();

      // Save to Instructions folder
      if (mutations.createInstructionFile) {
        await mutations.createInstructionFile({
          name: fileName,
          content: reportContent,
          topic: `Marketing Campaign Strategy: ${state.data.objective || 'Campaign Planning'}`,
        });

        // Clean up session state
        this.campaignState.delete(sessionId);

        return `✅ **Marketing Campaign Report Generated!**

📄 **File:** \`${fileName}\`
📁 **Location:** Instructions system folder
🎯 **Campaign:** ${state.data.objective || 'Marketing Campaign'}

Your comprehensive campaign strategy has been created and saved. The report includes:

- ✅ Platform-specific strategies and content recommendations
- ✅ Posting schedules and content calendars
- ✅ KPI tracking and measurement framework
- ✅ Budget allocation and resource planning
- ✅ Implementation timeline and next steps

The report is now available in your Instructions folder and will be included as context for future AI interactions about your marketing campaigns.

**Ready to execute your campaign strategy!** 🚀

---

**CMO_REPORT_GENERATED_SUCCESS:** ${fileName}`;

      } else {
        // Clean up session state
        this.campaignState.delete(sessionId);
        
        return `📋 **Marketing Campaign Report Generated**

${reportContent}

⚠️ **Note:** The report couldn't be saved automatically. Please use the button below to create an instruction file.

---

**CMO_REPORT_MANUAL_SAVE_NEEDED:** ${fileName}`;
      }

    } catch (error) {
      console.error('❌ Failed to generate campaign report:', error);
      return `❌ **Error Generating Report**

Failed to create your campaign report. Error: ${error instanceof Error ? error.message : 'Unknown error'}

Please try the command again or contact support if the issue persists.`;
    }
  }

  private getTimeoutMessage(): string {
    return `⏰ **Session Timeout**

Your campaign planning session has expired. Don't worry - you can start a new campaign planning session anytime!

Type \`/cmo [your campaign idea]\` to begin a fresh campaign strategy session.`;
  }

  // Information extraction methods
  private extractInitialInfo(input: string): Partial<CampaignData> {
    const data: Partial<CampaignData> = {};
    
    // Extract objective keywords
    const objectiveKeywords = {
      'brand awareness': ['brand awareness', 'awareness', 'visibility', 'recognition'],
      'lead generation': ['lead generation', 'leads', 'prospects', 'capture'],
      'sales conversion': ['sales', 'conversion', 'revenue', 'purchase'],
      'product launch': ['launch', 'new product', 'introduce', 'debut'],
      'customer retention': ['retention', 'loyalty', 'existing customers', 'repeat']
    };

    for (const [objective, keywords] of Object.entries(objectiveKeywords)) {
      if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
        data.objective = objective;
        break;
      }
    }

    // Extract platform mentions
    const platformKeywords = {
      'LinkedIn': ['linkedin', 'linked in'],
      'Facebook': ['facebook', 'fb'],
      'Instagram': ['instagram', 'ig', 'insta'],
      'Twitter/X': ['twitter', 'x.com', ' x '],
      'TikTok': ['tiktok', 'tik tok'],
      'Reddit': ['reddit']
    };

    const platforms: string[] = [];
    for (const [platform, keywords] of Object.entries(platformKeywords)) {
      if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
        platforms.push(platform);
      }
    }
    if (platforms.length > 0) {
      data.platforms = platforms;
    }

    // Extract audience hints
    const audienceKeywords = [
      'small business', 'entrepreneurs', 'professionals', 'developers',
      'students', 'parents', 'millennials', 'gen z', 'b2b', 'b2c'
    ];

    for (const keyword of audienceKeywords) {
      if (input.toLowerCase().includes(keyword)) {
        data.targetAudience = keyword;
        break;
      }
    }

    return data;
  }

  private extractPhase1Info(response: string): Partial<CampaignData> {
    // Similar extraction logic for Phase 1 responses
    return this.extractInitialInfo(response);
  }

  private extractPhase2Info(response: string): Partial<CampaignData> {
    const data: Partial<CampaignData> = {};
    
    // Extract platforms
    const platforms = this.extractInitialInfo(response).platforms || [];
    if (platforms.length > 0) {
      data.platforms = platforms;
    }

    // Extract content type preferences
    const contentTypes: Record<string, string> = {};
    const contentKeywords = {
      'video': ['video', 'videos', 'reels', 'stories'],
      'images': ['images', 'photos', 'graphics', 'visual'],
      'text': ['text', 'articles', 'posts', 'written'],
      'mix': ['mix', 'combination', 'variety', 'all types']
    };

    for (const [type, keywords] of Object.entries(contentKeywords)) {
      if (keywords.some(keyword => response.toLowerCase().includes(keyword))) {
        contentTypes['preferred'] = type;
        break;
      }
    }

    if (Object.keys(contentTypes).length > 0) {
      data.contentTypes = contentTypes;
    }

    return data;
  }

  private extractPhase3Info(response: string): Partial<CampaignData> {
    const data: Partial<CampaignData> = {};

    // Extract timeline information
    const timeline: NonNullable<CampaignData['timeline']> = {};
    
    // Look for date patterns and time references
    const timeKeywords = [
      '4 weeks', '3 months', 'ongoing', 'immediately', 'next month',
      'daily', 'weekly', 'twice a week', '3 times per week'
    ];

    for (const keyword of timeKeywords) {
      if (response.toLowerCase().includes(keyword)) {
        if (keyword.includes('week') || keyword.includes('month')) {
          timeline.endDate = keyword;
        }
        break;
      }
    }

    if (Object.keys(timeline).length > 0) {
      data.timeline = timeline;
    }

    // Extract budget mentions
    if (response.toLowerCase().includes('budget') || response.toLowerCase().includes('$')) {
      const budgetMatch = response.match(/\$[\d,]+/);
      if (budgetMatch) {
        data.budget = budgetMatch[0];
      } else if (response.toLowerCase().includes('no budget') || response.toLowerCase().includes('free')) {
        data.budget = 'Organic only';
      } else {
        data.budget = 'Budget mentioned but amount not specified';
      }
    }

    return data;
  }

  private extractPhase4Info(response: string): Partial<CampaignData> {
    const data: Partial<CampaignData> = {};

    // Extract KPIs
    const kpiKeywords = [
      'engagement', 'reach', 'impressions', 'traffic', 'leads', 
      'conversions', 'sales', 'followers', 'brand awareness'
    ];

    const kpis: string[] = [];
    for (const kpi of kpiKeywords) {
      if (response.toLowerCase().includes(kpi)) {
        kpis.push(kpi);
      }
    }

    if (kpis.length > 0) {
      data.kpis = kpis;
    }

    // Extract brand guidelines mentions
    if (response.toLowerCase().includes('brand') || response.toLowerCase().includes('guideline')) {
      data.brandGuidelines = 'Brand guidelines mentioned';
    }

    // Extract competitive context
    if (response.toLowerCase().includes('competitor') || response.toLowerCase().includes('competition')) {
      data.competitiveContext = 'Competitive context provided';
    }

    return data;
  }

  private extractCorrections(response: string): Partial<CampaignData> {
    // Allow users to make final corrections to any field
    return this.extractInitialInfo(response);
  }

  private createCampaignReport(data: CampaignData): string {
    const timestamp = new Date().toLocaleDateString();
    
    return `# Marketing Campaign Possibilities Report

*Generated on ${timestamp} by EAC CMO Agent*

## Executive Summary

This comprehensive marketing campaign strategy outlines a multi-platform approach designed to achieve your specified objectives through targeted content and strategic platform utilization.

## Campaign Objectives

**Primary Objective:** ${data.objective || 'To be defined'}

**Success Definition:** ${data.kpis?.join(', ') || 'Standard engagement and conversion metrics'}

## Target Audience

**Demographics & Characteristics:** ${data.targetAudience || 'Target audience to be refined'}

**Key Pain Points:** 
- Needs efficient solutions for their business challenges
- Values authentic, helpful content over promotional messaging
- Active on professional and social platforms

## Multi-Platform Strategy

${this.generatePlatformStrategies(data.platforms || ['LinkedIn', 'Twitter/X'])}

## Content Strategy & Messaging

**Content Types:** ${this.getContentTypeRecommendations(data.contentTypes)}

**Brand Voice:** ${data.brandGuidelines || 'Professional yet approachable, focusing on value delivery'}

**Key Messages:**
- Position as industry expert and thought leader
- Emphasize practical solutions and real results
- Build trust through authentic engagement

## Campaign Timeline

**Duration:** ${data.timeline?.startDate || 'To be determined'} - ${data.timeline?.endDate || 'Ongoing'}

**Key Milestones:**
- Week 1-2: Content foundation and initial engagement
- Week 3-4: Community building and relationship development
- Month 2+: Conversion optimization and scaling

## Budget Considerations

**Allocation:** ${data.budget || 'Budget to be determined based on platform performance'}

**Recommended Distribution:**
- 60% Content creation and management
- 30% Paid advertising and promotion
- 10% Analytics and optimization tools

## Key Performance Indicators (KPIs)

**Primary Metrics:**
${(data.kpis || ['engagement rate', 'reach', 'website traffic']).map(kpi => `- ${kpi.charAt(0).toUpperCase() + kpi.slice(1)}`).join('\n')}

**Reporting Frequency:** Weekly performance reviews with monthly strategic assessments

## Implementation Next Steps

1. **Content Calendar Development**
   - Create 30-day content calendar with platform-specific posts
   - Establish content creation workflow and approval process

2. **Platform Setup & Optimization**
   - Optimize profiles across all selected platforms
   - Implement tracking pixels and analytics

3. **Community Engagement Strategy**
   - Identify key influencers and thought leaders
   - Develop engagement guidelines and response templates

4. **Performance Monitoring**
   - Set up analytics dashboards
   - Establish weekly review and optimization process

## Risk Mitigation

- **Content Consistency:** Maintain brand voice across all platforms
- **Resource Management:** Ensure sustainable content creation workflow
- **Platform Changes:** Stay updated on algorithm and feature changes
- **Competitive Response:** Monitor competitor activities and differentiate accordingly

---

*This campaign strategy provides a foundation for successful multi-platform marketing. Regular review and optimization based on performance data will ensure continued success and ROI improvement.*

## Additional Resources

For implementation support and ongoing optimization, consider:
- Platform-specific content templates
- Automation tools for posting and engagement
- Analytics training for team members
- Competitive analysis and monitoring tools

---

**Generated by EAC CMO Agent - Your Strategic Marketing Partner** 🎯`;
  }

  private generatePlatformStrategies(platforms: string[]): string {
    const strategies: Record<string, {
      content: string;
      cadence: string;
      recommendations: string;
    }> = {
      'LinkedIn': {
        content: 'Professional insights, industry analysis, thought leadership articles, company updates, employee spotlights',
        cadence: '3-4 posts per week',
        recommendations: 'Focus on business value, engage in relevant groups, share industry expertise, use LinkedIn native video'
      },
      'Facebook': {
        content: 'Long-form content, community discussions, behind-the-scenes content, customer stories, live Q&A sessions',
        cadence: '4-5 posts per week',
        recommendations: 'Build community through Facebook Groups, use Facebook Live for real-time engagement, share customer success stories'
      },
      'Instagram': {
        content: 'High-quality visuals, Stories, Reels, carousel posts, user-generated content, behind-the-scenes content',
        cadence: 'Daily Stories, 4-5 feed posts per week',
        recommendations: 'Use relevant hashtags, collaborate with micro-influencers, leverage Instagram Shopping features, create engaging Reels'
      },
      'Twitter/X': {
        content: 'Real-time updates, industry commentary, quick tips, thread discussions, engagement with trending topics',
        cadence: 'Multiple posts per day',
        recommendations: 'Engage in Twitter chats, use relevant hashtags, share quick insights, participate in trending conversations'
      },
      'TikTok': {
        content: 'Short-form entertaining videos, educational content, trending challenges, behind-the-scenes glimpses',
        cadence: 'Daily posts',
        recommendations: 'Stay current with trends, use popular sounds, create educational series, collaborate with creators'
      },
      'Reddit': {
        content: 'Valuable discussions, AMAs, helpful resources, authentic community participation',
        cadence: '2-3 posts per week',
        recommendations: 'Understand subreddit rules, provide genuine value, avoid over-promotion, build community relationships'
      }
    };

    return platforms.map(platform => {
      const strategy = strategies[platform];
      if (!strategy) {
        return `### ${platform}\n*Platform strategy to be developed*\n`;
      }

      return `### ${platform}

**Content Type Recommendations:** ${strategy.content}

**Posting Cadence:** ${strategy.cadence}

**Specific Recommendations:** ${strategy.recommendations}

`;
    }).join('\n');
  }

  private getContentTypeRecommendations(contentTypes?: Record<string, string>): string {
    if (!contentTypes || Object.keys(contentTypes).length === 0) {
      return 'Mix of visual and text content optimized for each platform';
    }

    const type = contentTypes.preferred || 'mix';
    const recommendations: Record<string, string> = {
      'video': 'Focus on short-form videos, tutorials, behind-the-scenes content, and live streams',
      'images': 'High-quality graphics, infographics, carousel posts, and visual storytelling',
      'text': 'In-depth articles, thought leadership posts, industry insights, and detailed guides',
      'mix': 'Balanced content approach with platform-specific optimization'
    };

    return recommendations[type] || recommendations['mix'];
  }

  private generateReportFileName(): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `marketing-campaign-strategy-${timestamp}.md`;
  }
}

// Export singleton instance
export const cmoAgent = new CMOAgent();
