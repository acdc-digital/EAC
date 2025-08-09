// Campaign Director Agent
// Orchestrates large-scale marketing campaigns with 100+ posts across multiple platforms

import { AgentTool, BaseAgent } from './base';
import { ConvexMutations } from './types';

interface CampaignPost {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  content: string;
  scheduledDate: string;
  scheduledTime: string;
  metadata: {
    week: number;
    dayOfWeek: string;
    campaignPhase: 'awareness' | 'consideration' | 'conversion' | 'retention';
    contentType: 'educational' | 'promotional' | 'engagement' | 'announcement';
    hashtags: string[];
    campaignId?: string;
    batchId?: string;
  };
}

interface CampaignBatch {
  campaignId: string;
  posts: CampaignPost[];
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processedCount: number;
  totalCount: number;
}

interface DirectorSession {
  campaignProjectId?: string; // Project ID for the campaign
  campaignProjectName?: string; // User-provided campaign name
  instructionsFile?: string;
  instructionsContent?: string;
  campaignName?: string;
  campaignGoals?: string;
  platforms?: string[];
  duration?: number; // weeks
  postsPerDay?: number;
  contentStrategy?: string;
  currentStep: 'campaign-name' | 'instructions' | 'campaign-setup' | 'generating' | 'scheduling' | 'complete';
  activeCampaigns: Map<string, CampaignBatch>;
}

export class DirectorAgent extends BaseAgent {
  id = 'director';
  name = 'Campaign Director';
  description = 'Orchestrates large-scale marketing campaigns with 100+ posts across multiple platforms. Integrates instruction files for brand guidelines and generates comprehensive content strategies.';
  icon = '🎬';
  
  private sessions: Map<string, DirectorSession> = new Map();
  private readonly BATCH_SIZE = 10;
  private readonly MAX_CONCURRENT_BATCHES = 3;
  
  tools: AgentTool[] = [
    {
      id: 'orchestrate-campaign',
      name: 'Orchestrate Campaign',
      command: '/director',
      description: 'Create and schedule a complete marketing campaign with 100+ posts across multiple platforms',
      parameters: []
    }
  ];

  async execute(tool: AgentTool, input: string, convexMutations: ConvexMutations, sessionId?: string): Promise<string> {
    console.log('🔥 Director Agent: Execute called with input:', input);
    console.log('🔥 Director Agent: Session ID:', sessionId);
    
    if (!sessionId) {
      return 'Session ID is required for campaign orchestration';
    }

    // Initialize or get session
    const existingSession = this.sessions.has(sessionId);
    console.log('🔥 Director Agent: Existing session found:', existingSession);
    
    if (!this.sessions.has(sessionId)) {
      console.log('🔥 Director Agent: Creating new session');
      this.sessions.set(sessionId, {
        currentStep: 'campaign-name',
        activeCampaigns: new Map()
      });
    }
    
    const session = this.sessions.get(sessionId)!;
    console.log('🔥 Director Agent: Current session step:', session.currentStep);
    console.log('🔥 Director Agent: Has instructions file:', !!session.instructionsFile);
    
    // If session is already complete, return success message
    if (session.currentStep === 'complete') {
      return 'Campaign has been successfully generated and scheduled! Use `/director` to start a new campaign.';
    }

    // Step 1: Request campaign name and create project
    if (session.currentStep === 'campaign-name') {
      // Check if this is a campaign name input
      if (input && input.trim() && !input.includes('Selected file:') && !input.startsWith('/')) {
        const campaignName = input.trim();
        console.log('🔥 Director Agent: Creating campaign project:', campaignName);
        
        try {
          // Create the project using Convex mutations
          const project = await convexMutations.createProject?.({
            name: campaignName,
            description: `Marketing campaign project: ${campaignName}`,
            status: 'active'
          });
          
          if (project) {
            const projectData = project as any;
            session.campaignProjectId = projectData._id || projectData.id || campaignName;
            session.campaignProjectName = campaignName;
            session.currentStep = 'instructions';
            console.log('🔥 Director Agent: Project created, moving to instructions step');
            
            // Continue to instructions step
            if (convexMutations.storeChatMessage) {
              await convexMutations.storeChatMessage({
                role: 'assistant',
                content: `✅ Campaign project "${campaignName}" created successfully!\n\nNow, please select an instructions file that contains your campaign guidelines, brand voice, or marketing strategy.\n\nWhat you can include in your instructions file:\n- Brand voice and tone guidelines\n- Target audience information\n- Campaign objectives and KPIs\n- Content themes and messaging\n- Platform-specific requirements\n- Hashtag strategies\n- Visual guidelines\n\nSelect your instructions file:`,
                sessionId,
                interactiveComponent: {
                  type: 'file_selector',
                  status: 'pending',
                  data: {
                    fileType: 'instructions',
                    filterByExtension: ['.md', '.txt'],
                    placeholder: 'Select campaign instructions file...'
                  }
                }
              });
            }
            return `Campaign project "${campaignName}" created! Please select an instructions file to continue.`;
          } else {
            return 'Failed to create campaign project. Please try again.';
          }
        } catch (error) {
          console.error('🔥 Director Agent: Error creating project:', error);
          return 'Error creating campaign project. Please try again with a different name.';
        }
      } else {
        // Show campaign name input prompt
        if (convexMutations.storeChatMessage) {
          await convexMutations.storeChatMessage({
            role: 'assistant',
            content: '🎬 **Campaign Director Agent**\n\nI will help you orchestrate a comprehensive marketing campaign with 100+ posts across multiple platforms.\n\n**Step 1: Create Campaign Project**\n\nFirst, let\'s create a dedicated project folder for your campaign. This will organize all your generated content, schedules, and assets.\n\nWhat would you like to name your campaign project?',
            sessionId,
            interactiveComponent: {
              type: 'file_name_input',
              status: 'pending',
              data: {
                placeholder: 'Enter campaign name (e.g., "Q4 Product Launch", "Holiday Marketing 2025")',
                fileType: 'project'
              }
            }
          });
        }
        return 'Please enter a name for your campaign project.';
      }
    }

    // Handle file selection input AFTER campaign name step
    if (input.includes('Selected file:') && session.currentStep === 'instructions') {
      console.log('🔥 Director Agent: Processing file selection:', input);
      console.log('🔥 Director Agent: Session step:', session.currentStep);
      
      const fileName = input.replace('Selected file:', '').trim();
      console.log('🔥 Director Agent: Extracted filename:', fileName);
      
      session.instructionsFile = fileName;
      
      // Fetch the file content
      try {
        const files = await convexMutations.getAllFiles?.() || [];
        console.log('🔥 Director Agent: Available files count:', files.length);
        console.log('🔥 Director Agent: Available file names:', files.map((f: any) => f.name));
        
        // Try to find the file with or without extension
        let instructionFile = files.find((f: any) => f.name === fileName);
        if (!instructionFile && !fileName.includes('.')) {
          // Try with .md extension
          instructionFile = files.find((f: any) => f.name === fileName + '.md');
          console.log('🔥 Director Agent: Trying with .md extension:', fileName + '.md');
        }
        console.log('🔥 Director Agent: Found instruction file:', !!instructionFile);
        
        if (instructionFile) {
          session.instructionsContent = instructionFile.content;
          session.instructionsFile = fileName; // Make sure this is set
          session.currentStep = 'complete'; // Set to complete after generation
          console.log('🔥 Director Agent: Updated session step to complete');
          
          // Set default campaign settings based on instructions
          session.campaignName = 'EAC Marketing Campaign';
          session.duration = 4; // weeks
          session.platforms = ['twitter', 'linkedin', 'instagram', 'facebook'];
          session.postsPerDay = 3;
          session.campaignGoals = 'Brand awareness and lead generation based on instructions';
          
          // Immediately generate campaign
          const result = await this.generateCampaign(session, convexMutations, sessionId);
          console.log('🔥 Director Agent: Campaign generation result:', result);
          return result;
        } else {
          console.log('🔥 Director Agent: File not found in files array');
          return `File "${fileName}" not found. Please select a valid instructions file.`;
        }
      } catch (error) {
        console.error('🔥 Director Agent: Error loading instructions file:', error);
        return 'Error loading instructions file. Please try again.';
      }
    }
    
    // Step 1: Request instructions file (only if we haven't processed file selection and not complete)
    if (session.currentStep === 'instructions' && !session.instructionsFile) {
      if (convexMutations.storeChatMessage) {
        await convexMutations.storeChatMessage({
          role: 'assistant',
          content: 'Campaign Director Agent\n\nI will help you orchestrate a comprehensive marketing campaign with 100+ posts across multiple platforms.\n\nStep 1: Select Instructions File\n\nFirst, I need to understand your campaign strategy. Please select an instructions file that contains your campaign guidelines, brand voice, or marketing strategy.\n\nWhat you can include in your instructions file:\n- Brand voice and tone guidelines\n- Target audience information\n- Campaign objectives and KPIs\n- Content themes and messaging\n- Platform-specific requirements\n- Hashtag strategies\n- Visual guidelines\n\nSelect your instructions file:',
          sessionId,
          interactiveComponent: {
            type: 'file_selector',
            status: 'pending',
            data: {
              fileType: 'instructions',
              filterByExtension: ['.md', '.txt'],
              placeholder: 'Select campaign instructions file...'
            }
          }
        });
      }
      return 'Please select an instructions file to get started with your campaign.';
    }
    
    // Handle campaign configuration
    if (session.currentStep === 'campaign-setup') {
      if (input.toLowerCase().includes('generate default campaign') || input.toLowerCase().includes('default')) {
        // Use default campaign settings
        session.campaignName = 'EAC Marketing Campaign';
        session.duration = 4; // weeks
        session.platforms = ['twitter', 'linkedin', 'instagram', 'facebook'];
        session.postsPerDay = 3;
        session.campaignGoals = 'Brand awareness and lead generation';
        session.currentStep = 'generating';
        
        return await this.generateCampaign(session, convexMutations, sessionId);
      } else {
        // Parse custom campaign settings from user input
        return this.parseCampaignSettings(input, session);
      }
    }
    
    // Handle batch generation status updates
    if (input.includes('batch completed') || input.includes('posts generated')) {
      return this.handleBatchCompletion(input, session);
    }
    
    return 'Campaign orchestration in progress. Use /director to start a new campaign.';
  }

  private parseCampaignSettings(input: string, session: DirectorSession): string {
    // Extract campaign settings from user input
    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('name:') || lower.startsWith('1.')) {
        session.campaignName = line.split(':')[1]?.trim() || line.replace(/^1\./, '').trim();
      } else if (lower.includes('duration:') || lower.includes('weeks') || lower.startsWith('2.')) {
        const match = line.match(/(\d+)/);
        if (match) session.duration = parseInt(match[1]);
      } else if (lower.includes('platform') || lower.startsWith('3.')) {
        const platforms = line.toLowerCase().match(/(twitter|linkedin|facebook|instagram)/g);
        if (platforms) session.platforms = platforms;
      } else if (lower.includes('posts per day') || lower.startsWith('4.')) {
        const match = line.match(/(\d+)/);
        if (match) session.postsPerDay = parseInt(match[1]);
      } else if (lower.includes('goals:') || lower.startsWith('5.')) {
        session.campaignGoals = line.split(':')[1]?.trim() || line.replace(/^5\./, '').trim();
      }
    }
    
    // Validate required fields
    if (!session.campaignName || !session.duration || !session.platforms?.length) {
      return 'Please provide all required campaign details:\n\n1. Campaign Name\n2. Duration (weeks)\n3. Platforms\n4. Posts per day\n5. Goals\n\nOr type "generate default campaign" to use standard settings.';
    }
    
    session.currentStep = 'generating';
    return `Campaign Configuration Set:\n\nName: ${session.campaignName}\nDuration: ${session.duration} weeks\nPlatforms: ${session.platforms.join(', ')}\nPosts per day: ${session.postsPerDay}\nGoals: ${session.campaignGoals}\n\nGenerating your comprehensive campaign...`;
  }

  private async generateCampaign(session: DirectorSession, convexMutations: ConvexMutations, sessionId: string): Promise<string> {
    try {
      // Calculate total posts needed
      const totalDays = (session.duration || 4) * 7;
      const postsPerDay = session.postsPerDay || 3;
      const totalPosts = totalDays * postsPerDay;
      const platforms = session.platforms || ['twitter', 'linkedin', 'instagram', 'facebook'];
      
      // Create campaign in database
      let campaignId: string;
      try {
        const campaign = await convexMutations.createCampaign?.({
          name: session.campaignName || 'Generated Campaign',
          description: `Auto-generated campaign: ${session.campaignGoals || 'Marketing campaign'}`,
          platforms,
          totalPosts,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + (session.duration || 4) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          template: session.instructionsContent || ''
        });
        campaignId = campaign?._id || `campaign_${Date.now()}`;
      } catch (error) {
        console.log('Campaign creation not available, using fallback ID');
        campaignId = `campaign_${Date.now()}`;
      }
      
      // Generate posts in batches
      const allPosts = await this.generateBatchesAsync(
        totalPosts,
        platforms,
        session.instructionsContent || '',
        campaignId,
        session.duration || 4
      );
      
      // Create batches for processing
      const batches = this.createBatches(allPosts, campaignId);
      
      // Store batches in session
      batches.forEach(batch => {
        session.activeCampaigns.set(batch.campaignId, batch);
      });

      // Start with progress indicator
      if (convexMutations.storeChatMessage) {
        await convexMutations.storeChatMessage({
          role: 'assistant',
          content: `Campaign Generation Complete!\n\nGenerated ${totalPosts} posts across ${platforms.length} platforms\nOrganized into ${batches.length} processing batches\nStarting content creation and scheduling...\n\nCampaign ID: ${campaignId}\nTotal Posts: ${totalPosts}\nPlatforms: ${platforms.join(', ')}\nDuration: ${session.duration} weeks`,
          sessionId,
          processIndicator: {
            type: 'continuing',
            processType: 'Processing Campaign Batches',
            color: 'blue'
          }
        });
      }

      // Process all batches with progress updates
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`🔥 Director Agent: Processing batch ${i + 1}/${batches.length}`);
        
        // Update progress
        if (convexMutations.storeChatMessage) {
          await convexMutations.storeChatMessage({
            role: 'assistant',
            content: `Processing batch ${i + 1} of ${batches.length}... (${batch.posts.length} posts)`,
            sessionId,
            processIndicator: {
              type: 'continuing',
              processType: `Batch ${i + 1}/${batches.length}`,
              color: 'blue'
            }
          });
        }
        
        await this.processBatch(batch, convexMutations, sessionId, session);
        
        // Small delay between batches to prevent overwhelming the database
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Final success message
      if (convexMutations.storeChatMessage) {
        await convexMutations.storeChatMessage({
          role: 'assistant',
          content: `✅ Campaign Successfully Created!\n\n📊 **Campaign Summary:**\n- **Campaign ID:** ${campaignId}\n- **Total Posts:** ${totalPosts}\n- **Platforms:** ${platforms.join(', ')}\n- **Duration:** ${session.duration} weeks\n- **Batches Processed:** ${batches.length}\n\n🗓️ All posts have been scheduled and saved to the database. Use the social media dashboard to review and manage your campaign.`,
          sessionId
        });
      }

      session.currentStep = 'complete';
      
      return 'Campaign processing completed successfully!';    } catch (error) {
      console.error('Campaign generation error:', error);
      return `Error generating campaign: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private async generateBatchesAsync(
    totalPosts: number,
    platforms: string[],
    instructions: string,
    campaignId: string,
    duration: number
  ): Promise<CampaignPost[]> {
    const posts: CampaignPost[] = [];
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    for (let i = 0; i < totalPosts; i++) {
      const platform = platforms[i % platforms.length] as any;
      const week = Math.floor(i / (totalPosts / duration)) + 1;
      const dayIndex = i % 7;
      const day = days[dayIndex];
      
      // Determine optimal posting time based on platform
      const time = this.getOptimalPostTime(platform, dayIndex);
      
      // Calculate post date
      const startDate = new Date();
      const postDate = new Date(startDate);
      postDate.setDate(startDate.getDate() + Math.floor(i / platforms.length));
      
      // Determine campaign phase based on week
      const phases = ['awareness', 'consideration', 'conversion', 'retention'] as const;
      const phaseIndex = Math.floor((week - 1) / (duration / phases.length));
      const phase = phases[Math.min(phaseIndex, phases.length - 1)];
      
      // Determine content type cyclically
      const contentTypes = ['educational', 'promotional', 'engagement', 'announcement'] as const;
      const contentType = contentTypes[i % contentTypes.length];
      
      // Generate content
      const content = this.generatePlatformContent(platform, phase, contentType, instructions, week, day);
      
      posts.push({
        platform,
        content,
        scheduledDate: postDate.toISOString().split('T')[0],
        scheduledTime: time,
        metadata: {
          week,
          dayOfWeek: day,
          campaignPhase: phase,
          contentType,
          hashtags: this.generateHashtags(platform, phase, contentType),
          campaignId,
          batchId: `batch_${Math.floor(i / this.BATCH_SIZE)}`
        }
      });
    }
    
    return posts;
  }

  private getOptimalPostTime(platform: string, dayIndex: number): string {
    const times = {
      twitter: ['09:00', '12:00', '15:00', '18:00'],
      linkedin: ['08:00', '12:00', '17:00'],
      instagram: ['11:00', '14:00', '17:00', '19:00'],
      facebook: ['09:00', '13:00', '15:00']
    };
    
    const platformTimes = times[platform as keyof typeof times] || times.twitter;
    return platformTimes[dayIndex % platformTimes.length];
  }

  private generatePlatformContent(platform: string, phase: string, contentType: string, instructions: string, week: number, day: string): string {
    const brandVoice = this.extractBrandVoice(instructions);
    const audience = this.extractAudience(instructions);
    
    const content = `${brandVoice} content for ${audience} - Week ${week}, ${day}. Phase: ${phase}, Type: ${contentType}. Platform: ${platform}`;
    
    // Platform-specific formatting
    switch (platform) {
      case 'twitter':
        return content.length > 250 ? content.substring(0, 247) + '...' : content;
      case 'linkedin':
        return `${content}\n\n#LinkedInEngagement #ProfessionalGrowth`;
      case 'instagram':
        return `${content} ✨\n\n#InstagramBusiness #VisualContent`;
      case 'facebook':
        return `${content}\n\nWhat do you think? Share your thoughts below! 👇`;
      default:
        return content;
    }
  }

  private extractBrandVoice(instructions: string): string {
    const voiceKeywords = ['professional', 'friendly', 'innovative', 'trusted', 'expert', 'reliable'];
    const lowerInstructions = instructions.toLowerCase();
    
    for (const keyword of voiceKeywords) {
      if (lowerInstructions.includes(keyword)) {
        return keyword.charAt(0).toUpperCase() + keyword.slice(1);
      }
    }
    return 'Professional';
  }

  private extractAudience(instructions: string): string {
    const audienceKeywords = ['businesses', 'professionals', 'teams', 'companies', 'organizations', 'users'];
    const lowerInstructions = instructions.toLowerCase();
    
    for (const keyword of audienceKeywords) {
      if (lowerInstructions.includes(keyword)) {
        return keyword;
      }
    }
    return 'professionals';
  }

  private generateHashtags(platform: string, phase: string, contentType: string): string[] {
    const baseHashtags = ['marketing', 'business', 'growth'];
    const phaseHashtags = {
      awareness: ['brandawareness', 'introduction'],
      consideration: ['solutions', 'evaluation'],
      conversion: ['getstarted', 'action'],
      retention: ['community', 'success']
    };
    const contentHashtags = {
      educational: ['tips', 'learning'],
      promotional: ['offer', 'featured'],
      engagement: ['discussion', 'question'],
      announcement: ['news', 'update']
    };
    
    return [
      ...baseHashtags,
      ...phaseHashtags[phase as keyof typeof phaseHashtags],
      ...contentHashtags[contentType as keyof typeof contentHashtags]
    ].slice(0, 5);
  }

  private createBatches(posts: CampaignPost[], campaignId: string): CampaignBatch[] {
    const batches: CampaignBatch[] = [];
    
    for (let i = 0; i < posts.length; i += this.BATCH_SIZE) {
      const batchPosts = posts.slice(i, i + this.BATCH_SIZE);
      batches.push({
        campaignId: `${campaignId}_batch_${batches.length}`,
        posts: batchPosts,
        processingStatus: 'pending',
        processedCount: 0,
        totalCount: batchPosts.length
      });
    }
    
    return batches;
  }

  private async processBatch(batch: CampaignBatch, convexMutations: ConvexMutations, sessionId: string, session: DirectorSession): Promise<void> {
    batch.processingStatus = 'processing';
    
    try {
      const postPromises = batch.posts.map(async (post) => {
        try {
          // Check if createFile mutation exists, otherwise fallback to upsertPost
          if (convexMutations.createFile && session.campaignProjectId) {
            await convexMutations.createFile({
              name: `${session.campaignProjectName || 'campaign'}_${post.platform}_week${post.metadata.week}_${post.metadata.dayOfWeek}`,
              type: 'post',
              projectId: session.campaignProjectId,
              content: post.content,
              extension: post.platform,
              platform: post.platform as any,
              postStatus: 'scheduled',
              scheduledAt: new Date(`${post.scheduledDate}T${post.scheduledTime}`).getTime(),
              userId: 'current-user', // Will be replaced with actual user ID by mutation
              path: `/campaigns/${session.campaignProjectName}/${post.platform}/`
            });
          } else {
            // Fallback to upsertPost if createFile not available
            await convexMutations.upsertPost({
              fileName: `${session.campaignProjectName || 'campaign'}_${post.platform}_${post.metadata.week}_${post.metadata.dayOfWeek}_${Date.now()}`,
              fileType: post.platform as any,
              content: post.content,
              title: `${session.campaignProjectName || 'Campaign'} - Week ${post.metadata.week} - ${post.metadata.campaignPhase}`,
              platformData: JSON.stringify({
                scheduledDate: post.scheduledDate,
                scheduledTime: post.scheduledTime,
                hashtags: post.metadata.hashtags,
                campaignId: post.metadata.campaignId,
                batchId: post.metadata.batchId,
                week: post.metadata.week,
                dayOfWeek: post.metadata.dayOfWeek,
                campaignPhase: post.metadata.campaignPhase,
                contentType: post.metadata.contentType,
                projectId: session.campaignProjectId,
                projectName: session.campaignProjectName
              }),
              status: 'scheduled',
              scheduledFor: new Date(`${post.scheduledDate}T${post.scheduledTime}`).getTime()
            });
          }
          
          batch.processedCount++;
          
        } catch (error) {
          console.error('Error processing post:', error);
        }
      });
      
      await Promise.all(postPromises);
      batch.processingStatus = 'completed';
      
    } catch (error) {
      console.error('Batch processing error:', error);
      batch.processingStatus = 'failed';
    }
  }

  private handleBatchCompletion(input: string, session: DirectorSession): string {
    const completedBatches = Array.from(session.activeCampaigns.values())
      .filter(batch => batch.processingStatus === 'completed');
    
    const totalBatches = session.activeCampaigns.size;
    const totalProcessed = completedBatches.reduce((sum, batch) => sum + batch.processedCount, 0);
    
    if (completedBatches.length === totalBatches) {
      session.currentStep = 'complete';
      return `Campaign Complete!\n\nAll ${totalBatches} batches processed successfully.\nTotal posts created: ${totalProcessed}\nCampaign: ${session.campaignName}\n\nYour comprehensive marketing campaign is now scheduled and ready!`;
    }
    
    return `Progress Update:\nCompleted: ${completedBatches.length}/${totalBatches} batches\nPosts processed: ${totalProcessed}\nContinuing campaign generation...`;
  }
}

export const directorAgent = new DirectorAgent();
