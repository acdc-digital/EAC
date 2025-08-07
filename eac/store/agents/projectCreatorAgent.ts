// Project Creator Agent
// Creates projects and files on behalf of users using natural language input

import { AgentTool, BaseAgent } from './base';
import { ConvexMutations } from './types';

interface ProjectDetails {
  name: string;
  description?: string;
  type?: string;
  budget?: number;
  createFiles?: boolean;
}

interface FileDetails {
  fileName: string;
  projectName: string;
  fileType: string;
  content?: string;
}

export class ProjectCreatorAgent extends BaseAgent {
  id = 'project-creator';
  name = 'Project Creator';
  description = 'Creates projects and files on behalf of users using natural language';
  icon = 'FileText';

  // State to track pending project creation
  private static pendingProjectCreation: {
    projectDetails: Partial<ProjectDetails>;
    timestamp: number;
  } | null = null;

  tools: AgentTool[] = [
    {
      id: 'natural-language-creator',
      name: 'Natural Language Creator',
  command: '/create-project',
      description: 'Create projects and files using natural language instructions',
      parameters: []
    }
  ];

  async execute(
    tool: AgentTool,
    input: string,
    convexMutations: ConvexMutations
  ): Promise<string> {
    console.log('🚀 ProjectCreatorAgent executing with input:', input);
    
    try {
      return await this.processNaturalLanguageRequest(input, convexMutations);
    } catch (error) {
      console.error('❌ ProjectCreatorAgent error:', error);
      return `❌ Failed to process request: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * Process natural language requests to create projects and files
   */
  private async processNaturalLanguageRequest(
    input: string,
    convexMutations: ConvexMutations
  ): Promise<string> {
    const normalizedInput = input.toLowerCase().trim();
    console.log('🔍 Processing natural language input:', normalizedInput);
    console.log('🔍 Has pending project creation:', !!ProjectCreatorAgent.pendingProjectCreation);

    // Check for pending project creation (project name input response)
    if (ProjectCreatorAgent.pendingProjectCreation) {
      const pendingAge = Date.now() - ProjectCreatorAgent.pendingProjectCreation.timestamp;
      console.log('⏰ Pending project creation age (ms):', pendingAge);
      
      // If pending request is less than 5 minutes old, try to handle as project name input
      if (pendingAge < 5 * 60 * 1000) {
        console.log('🔄 Trying to handle as project name input...');
        const projectNameResult = await this.handleProjectNameInput(input, convexMutations);
        console.log('📋 Project name input result:', projectNameResult);
        if (projectNameResult) {
          console.log('✅ Returning project name input result');
          return projectNameResult;
        } else {
          console.log('❌ Project name input returned null');
          // Don't continue with normal processing - remind user to use the input
          return `⚠️ **Please use the project name input above** to specify the project name.\n\nI'm still waiting for you to enter a project name.\n\n_To start a new project creation, wait for the current one to complete or cancel it first._`;
        }
      } else {
        // Clear expired pending request
        console.log('⏰ Clearing expired pending request');
        ProjectCreatorAgent.pendingProjectCreation = null;
      }
    }

    // Detect if this is a project creation request
    if (this.isProjectCreationRequest(normalizedInput)) {
      return await this.handleProjectCreation(input, convexMutations);
    }
    
    // Detect if this is a file creation request
    if (this.isFileCreationRequest(normalizedInput)) {
      return await this.handleFileCreation(input, convexMutations);
    }
    
    // Detect if this is a template setup request
    if (this.isTemplateRequest(normalizedInput)) {
      return await this.handleTemplateSetup(input, convexMutations);
    }
    
    // If we can't determine the intent, provide helpful guidance
    return this.getHelpMessage();
  }

  /**
   * Check if input is requesting project creation
   */
  private isProjectCreationRequest(input: string): boolean {
    const projectPatterns = [
      /create.*project/,
      /new.*project/,
      /make.*project/,
      /start.*project/,
      /build.*project/,
      /setup.*project/
    ];
    return projectPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Check if input is requesting file creation
   */
  private isFileCreationRequest(input: string): boolean {
    const filePatterns = [
      /create.*file/,
      /new.*file/,
      /make.*file/,
      /add.*file/,
      /generate.*file/
    ];
    return filePatterns.some(pattern => pattern.test(input));
  }

  /**
   * Check if input is requesting template setup
   */
  private isTemplateRequest(input: string): boolean {
    const templatePatterns = [
      /template/,
      /scaffold/,
      /boilerplate/,
      /starter/,
      /preset/
    ];
    return templatePatterns.some(pattern => pattern.test(input));
  }

  /**
   * Handle project creation from natural language
   */
  private async handleProjectCreation(
    input: string,
    convexMutations: ConvexMutations
  ): Promise<string> {
    try {
      // Extract project details from natural language
      const projectDetails = this.extractProjectDetails(input);
      
      console.log('📊 Extracted project details:', projectDetails);

      // If no specific project name was extracted or it's generic, show the input component
      if (!projectDetails.name || projectDetails.name === '' || projectDetails.name === 'New Project' || projectDetails.name.length < 3) {
        return await this.getProjectNameInputPrompt(projectDetails, convexMutations);
      }

      if (!convexMutations.createProject) {
        return '❌ Project creation is not available. Please check system configuration.';
      }

      // Create the project
      const newProject = await convexMutations.createProject({
        name: projectDetails.name,
        description: projectDetails.description,
        status: 'active' as const,
        budget: projectDetails.budget,
      });

      let result = `✅ **Project Created Successfully!**\n\n`;
      result += `📁 **Project Name:** ${(newProject as any)?.name || projectDetails.name}\n`;
      
      if ((newProject as any)?.projectNumber) {
        result += `🔢 **Project Number:** #${(newProject as any).projectNumber}\n`;
      }
      
      if (projectDetails.description) {
        result += `📝 **Description:** ${projectDetails.description}\n`;
      }
      
      result += `📅 **Created:** ${new Date().toLocaleDateString()}\n`;
      result += `📊 **Status:** Active\n\n`;

      // Create initial files if requested
      if (projectDetails.createFiles && convexMutations.createFile) {
        const fileResults = await this.createInitialFiles(newProject, convexMutations);
        result += `\n📄 **Initial Files Created:**\n${fileResults}`;
      }

      result += `\n🎉 Your project is ready! You can now start adding files and managing your project.`;
      
      return result;
    } catch (error) {
      console.error('❌ Project creation failed:', error);
      return `❌ **Project creation failed:** ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * Handle project name input response
   */
  private async handleProjectNameInput(input: string, convexMutations: ConvexMutations): Promise<string | null> {
    console.log('🎯 Handling project name input with input:', input);
    console.log('📁 Pending project creation:', ProjectCreatorAgent.pendingProjectCreation);
    
    if (!ProjectCreatorAgent.pendingProjectCreation) {
      console.log('❌ No pending project creation found');
      return null;
    }

    const { projectDetails } = ProjectCreatorAgent.pendingProjectCreation;
    const projectName = input.trim();
    console.log('🔍 Project name input:', projectName);

    if (!projectName || projectName.length < 2) {
      return `❌ **Please enter a valid project name**\n\nProject names should be at least 2 characters long.\n\n**Examples:**\n• "Marketing Campaign"\n• "Website Redesign"\n• "Q1 Budget Planning"`;
    }

    // Clear pending state
    ProjectCreatorAgent.pendingProjectCreation = null;
    console.log('✅ Cleared pending project creation');

    // Create the project with the provided name
    const updatedProjectDetails = {
      ...projectDetails,
      name: projectName
    };

    console.log('📄 Creating project with details:', updatedProjectDetails);
    
    if (!convexMutations.createProject) {
      return '❌ Project creation is not available. Please check system configuration.';
    }

    try {
      // Create the project
      const newProject = await convexMutations.createProject({
        name: updatedProjectDetails.name,
        description: updatedProjectDetails.description,
        status: 'active' as const,
        budget: updatedProjectDetails.budget,
      });

      let result = `✅ **Project Created Successfully!**\n\n`;
      result += `📁 **Project Name:** ${(newProject as any)?.name || updatedProjectDetails.name}\n`;
      
      if ((newProject as any)?.projectNumber) {
        result += `🔢 **Project Number:** #${(newProject as any).projectNumber}\n`;
      }
      
      if (updatedProjectDetails.description) {
        result += `📝 **Description:** ${updatedProjectDetails.description}\n`;
      }
      
      result += `📅 **Created:** ${new Date().toLocaleDateString()}\n`;
      result += `📊 **Status:** Active\n\n`;

      // Create initial files if requested
      if (updatedProjectDetails.createFiles && convexMutations.createFile) {
        const fileResults = await this.createInitialFiles(newProject, convexMutations);
        result += `\n📄 **Initial Files Created:**\n${fileResults}`;
      }

      result += `\n🎉 Your project is ready! You can now start adding files and managing your project.`;
      
      console.log('📝 Create project result:', result);
      return result;
    } catch (error) {
      console.error('❌ Project creation failed:', error);
      return `❌ **Project creation failed:** ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * Handle file creation from natural language
   */
  private async handleFileCreation(
    input: string,
    convexMutations: ConvexMutations
  ): Promise<string> {
    try {
      const fileDetails = this.extractFileDetails(input);
      
      if (!fileDetails.fileName) {
        return `❌ **Could not determine file name**\n\nPlease specify what file you want to create.\n\n**Examples:**\n• "Create a budget spreadsheet"\n• "Add a meeting notes file"\n• "Make a project plan document"`;
      }

      if (!fileDetails.projectName) {
        return `❌ **Could not determine project**\n\nPlease specify which project to add the file to.\n\n**Examples:**\n• "Create a budget file for Marketing Campaign"\n• "Add notes to the Development Project"`;
      }

      if (!convexMutations.createFile) {
        return '❌ File creation is not available. Please check system configuration.';
      }

      const content = this.generateFileContent(fileDetails.fileType, fileDetails.fileName);

      // TODO: Need to look up project by name to get the projectId
      // For now, this functionality is incomplete without project lookup
      throw new Error(`File creation requires a valid project. Project "${fileDetails.projectName}" lookup not implemented yet.`);

      let result = `✅ **File Created Successfully!**\n\n`;
      result += `📄 **File Name:** ${fileDetails.fileName}\n`;
      result += `📁 **Project:** ${fileDetails.projectName}\n`;
      result += `🏷️ **Type:** ${fileDetails.fileType}\n`;
      result += `📅 **Created:** ${new Date().toLocaleDateString()}\n\n`;
      result += `💡 You can now find and edit this file in the sidebar!`;

      return result;
    } catch (error) {
      console.error('❌ File creation failed:', error);
      return `❌ **File creation failed:** ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * Handle template setup from natural language
   */
  private async handleTemplateSetup(
    input: string,
    convexMutations: ConvexMutations
  ): Promise<string> {
    try {
      const templateDetails = this.extractTemplateDetails(input);
      
      if (!convexMutations.createProject) {
        return '❌ Project creation is not available. Please check system configuration.';
      }

      const projectName = templateDetails.name || `${templateDetails.type.charAt(0).toUpperCase() + templateDetails.type.slice(1)} Project`;
      
      const newProject = await convexMutations.createProject({
        name: projectName,
        description: this.getTemplateDescription(templateDetails.type),
        status: 'active' as const,
        budget: this.getTemplateBudget(templateDetails.type),
      });

      // Create template-specific files
      let templateFiles = '';
      if (convexMutations.createFile) {
        templateFiles = await this.createTemplateFiles(newProject, templateDetails.type, convexMutations);
      }

      let result = `✅ **Template Applied Successfully!**\n\n`;
      result += `📁 **Project Name:** ${(newProject as any)?.name || projectName}\n`;
      result += `🎨 **Template Type:** ${templateDetails.type.charAt(0).toUpperCase() + templateDetails.type.slice(1)}\n`;
      
      if ((newProject as any)?.projectNumber) {
        result += `🔢 **Project Number:** #${(newProject as any).projectNumber}\n`;
      }
      
      if (templateFiles) {
        result += `\n📄 **Template Files:**\n${templateFiles}\n`;
      } else {
        result += `\n`;
      }
      
      result += `🎉 Your template project is ready to use!`;

      return result;
    } catch (error) {
      console.error('❌ Template setup failed:', error);
      return `❌ **Template setup failed:** ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * Extract project details from natural language input
   */
  private extractProjectDetails(input: string): ProjectDetails {
    const normalizedInput = input.toLowerCase();
    
    // Extract project name - more specific patterns that capture actual project names
    const namePatterns = [
      // Pattern for "create project called [name]" or "create project named [name]"
      /(?:create|new|make|start|build|setup)\s+(?:a\s+)?project\s+(?:called|named)\s+[\"\']?([^\"\']+?)[\"\']?(?:\s+for|\s+with|$)/i,
      // Pattern for quoted names: "project name" or 'project name'
      /[\"\']([^\"\']{2,})[\"\']/, 
      // Pattern for specific project names after "create" (but not generic words)
      /(?:create|new|make|start|build|setup)\s+(?:a\s+)?(?:project\s+)?[\"\']?([a-zA-Z][a-zA-Z0-9\s\-_]{2,})[\"\']?(?:\s+for|\s+with|$)/i
    ];

    let name = '';
    for (const pattern of namePatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        const extractedName = match[1].trim();
        // Reject generic/vague names that should trigger input prompt
        const genericNames = ['project', 'new project', 'a project', 'new', 'it', 'this', 'that', 'one'];
        if (!genericNames.includes(extractedName.toLowerCase()) && extractedName.length > 2) {
          name = extractedName;
          break;
        }
      }
    }

    // If no specific name found, return empty string to trigger input component
    if (!name) {
      name = '';
    }

    // Extract description (words after "for", "about", "to")
    const descriptionMatch = input.match(/(?:for|about|to)\s+(.+)/i);
    const description = descriptionMatch ? descriptionMatch[1].trim() : undefined;

    // Detect project type from keywords
    const typeKeywords = {
      marketing: ['marketing', 'campaign', 'promotion', 'advertising', 'brand'],
      development: ['development', 'dev', 'app', 'website', 'software', 'code'],
      content: ['content', 'blog', 'article', 'writing', 'editorial'],
      financial: ['financial', 'budget', 'finance', 'accounting', 'money'],
      social: ['social', 'instagram', 'twitter', 'facebook', 'media']
    };

    let type: string | undefined;
    for (const [projectType, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => normalizedInput.includes(keyword))) {
        type = projectType;
        break;
      }
    }

    // Extract budget if mentioned
    const budgetMatch = input.match(/\$?([\d,]+)/);
    const budget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, '')) : this.getDefaultBudget(type);

    // Check if user wants initial files
    const createFiles = /(?:with|include)\s+(?:files|documents|templates)/i.test(input);

    return {
      name,
      description,
      type,
      budget,
      createFiles
    };
  }

  /**
   * Extract file details from natural language input
   */
  private extractFileDetails(input: string): FileDetails {
    const normalizedInput = input.toLowerCase();
    
    // Extract file name and type
    let fileName = '';
    let fileType = 'text';

    // Common file patterns
    const filePatterns = [
      { pattern: /(?:spreadsheet|excel|\.xlsx?)/, type: 'spreadsheet', extension: '.xlsx' },
      { pattern: /(?:document|doc|\.docx?)/, type: 'document', extension: '.docx' },
      { pattern: /(?:notes|\.md|markdown)/, type: 'markdown', extension: '.md' },
      { pattern: /(?:plan|planning)/, type: 'document', extension: '.md' },
      { pattern: /(?:budget|financial)/, type: 'spreadsheet', extension: '.xlsx' },
      { pattern: /(?:presentation|\.pptx?)/, type: 'presentation', extension: '.pptx' }
    ];

    for (const { pattern, type, extension } of filePatterns) {
      if (pattern.test(normalizedInput)) {
        fileType = type;
        
        // Extract specific file name if mentioned
        const nameMatch = input.match(/(?:create|add|make)\s+(?:a\s+)?(.+?)(?:\s+for|\s+in|\s+to|$)/i);
        if (nameMatch && nameMatch[1]) {
          fileName = nameMatch[1].trim();
          if (!fileName.includes('.')) {
            fileName += extension;
          }
        } else {
          fileName = `${type}${extension}`;
        }
        break;
      }
    }

    // Extract project name
    const projectMatch = input.match(/(?:for|in|to)\s+(?:the\s+)?(.+?)(?:\s+project)?$/i);
    const projectName = projectMatch ? projectMatch[1].trim() : '';

    return {
      fileName: fileName || 'new-file.txt',
      projectName,
      fileType,
      content: ''
    };
  }

  /**
   * Extract template details from natural language input
   */
  private extractTemplateDetails(input: string): { name?: string; type: string } {
    const normalizedInput = input.toLowerCase();
    
    const templateTypes = ['marketing', 'development', 'content', 'financial', 'social'];
    let type = 'development'; // default

    for (const templateType of templateTypes) {
      if (normalizedInput.includes(templateType)) {
        type = templateType;
        break;
      }
    }

    // Extract custom name if provided
    const nameMatch = input.match(/(?:template|scaffold)\s+(?:for\s+)?(.+)/i);
    const name = nameMatch ? nameMatch[1].trim() : undefined;

    return { name, type };
  }

  /**
   * Get default budget based on project type
   */
  private getDefaultBudget(type?: string): number {
    const budgets = {
      marketing: 5000,
      development: 15000,
      content: 3000,
      financial: 10000,
      social: 2000
    };
    return budgets[type as keyof typeof budgets] || 10000;
  }

  /**
   * Get template budget based on type
   */
  private getTemplateBudget(type: string): number {
    return this.getDefaultBudget(type);
  }

  /**
   * Get template description based on type
   */
  private getTemplateDescription(type: string): string {
    const descriptions = {
      marketing: 'Marketing campaign project with promotional materials and strategy planning',
      development: 'Software development project with technical documentation and milestones',
      content: 'Content creation project with editorial calendar and publishing workflow',
      financial: 'Financial analysis project with budgets, forecasts, and reporting',
      social: 'Social media project with content calendar and engagement strategies'
    };
    return descriptions[type as keyof typeof descriptions] || 'General project template';
  }

  /**
   * Create initial files for a project
   */
  private async createInitialFiles(project: any, convexMutations: ConvexMutations): Promise<string> {
    const files = [
      { 
        name: 'README.md', 
        content: `# ${(project as any)?.name || 'Project'}\n\n${(project as any)?.description || 'Project description'}\n\n## Getting Started\n\nThis project was created using the EAC Project Creator Agent.`, 
        type: 'note' 
      },
      { 
        name: 'project-plan.md', 
        content: `# Project Plan - ${(project as any)?.name || 'Project'}\n\n## Objectives\n\n## Timeline\n\n## Resources\n\n## Milestones\n`, 
        type: 'note' 
      }
    ];

    const results: string[] = [];
    for (const file of files) {
      try {
        if (convexMutations.createFile) {
          await convexMutations.createFile({
            name: file.name,
            content: file.content,
            type: file.type as any,
            projectId: (project as any)?._id
          });
          results.push(`✅ ${file.name}`);
        }
      } catch (error) {
        results.push(`❌ ${file.name} (failed)`);
      }
    }

    return results.join('\n');
  }

  /**
   * Create template-specific files
   */
  private async createTemplateFiles(project: any, templateType: string, convexMutations: ConvexMutations): Promise<string> {
    const templateFiles = this.getTemplateFiles(templateType, (project as any)?.name || 'Project');
    const results: string[] = [];

    for (const file of templateFiles) {
      try {
        if (convexMutations.createFile) {
          await convexMutations.createFile({
            name: file.name,
            content: file.content,
            type: file.type as any,
            projectId: (project as any)?._id
          });
          results.push(`✅ ${file.name}`);
        }
      } catch (error) {
        results.push(`❌ ${file.name} (failed)`);
      }
    }

    return results.join('\n');
  }

  /**
   * Get template files based on type
   */
  private getTemplateFiles(type: string, projectName: string) {
    const templates = {
      marketing: [
        { name: 'campaign-brief.md', content: `# Campaign Brief - ${projectName}\n\n## Objectives\n\n## Target Audience\n\n## Key Messages\n\n## Timeline\n`, type: 'note' },
        { name: 'budget.md', content: `# Budget - ${projectName}\n\n## Campaign Budget\n\n| Item | Amount |\n|------|--------|\n| Total | $0 |\n`, type: 'note' }
      ],
      development: [
        { name: 'README.md', content: `# ${projectName}\n\n## Setup\n\n## Development\n\n## Deployment\n`, type: 'note' },
        { name: 'requirements.md', content: `# Requirements - ${projectName}\n\n## Functional Requirements\n\n## Technical Requirements\n`, type: 'note' }
      ],
      content: [
        { name: 'content-calendar.md', content: `# Content Calendar - ${projectName}\n\n## Editorial Schedule\n\n## Content Topics\n`, type: 'note' },
        { name: 'style-guide.md', content: `# Style Guide - ${projectName}\n\n## Voice & Tone\n\n## Guidelines\n`, type: 'note' }
      ],
      financial: [
        { name: 'budget.md', content: `# Budget - ${projectName}\n\n## Revenue Projections\n\n## Expense Planning\n`, type: 'note' },
        { name: 'forecast.md', content: `# Financial Forecast - ${projectName}\n\n## Revenue Projections\n\n## Expense Planning\n`, type: 'note' }
      ],
      social: [
        { name: 'social-calendar.md', content: `# Social Media Calendar - ${projectName}\n\n## Content Schedule\n\n## Platform Strategy\n`, type: 'note' },
        { name: 'engagement-plan.md', content: `# Engagement Plan - ${projectName}\n\n## Community Guidelines\n\n## Response Templates\n`, type: 'note' }
      ]
    };

    return templates[type as keyof typeof templates] || templates.development;
  }

  /**
   * Generate file content based on type and name
   */
  private generateFileContent(fileType: string, fileName: string): string {
    const baseContent = {
      spreadsheet: `# ${fileName.replace(/\.[^/.]+$/, "")}\n\n| Item | Amount |\n|------|--------|\n| Total | $0 |\n`,
      document: `# ${fileName}\n\nDocument created on ${new Date().toLocaleDateString()}\n\n## Section 1\n\n## Section 2\n`,
      markdown: `# ${fileName.replace(/\.[^/.]+$/, "")}\n\nCreated: ${new Date().toLocaleDateString()}\n\n## Overview\n\n## Details\n`,
      text: `${fileName}\n\nCreated: ${new Date().toLocaleDateString()}\n\nContent goes here...`,
    };

    return baseContent[fileType as keyof typeof baseContent] || baseContent.text;
  }

  /**
   * Map file type to Convex expected type
   */
  private mapToConvexFileType(fileType: string): 'post' | 'campaign' | 'note' | 'document' | 'image' | 'video' | 'other' {
    const typeMap: Record<string, 'post' | 'campaign' | 'note' | 'document' | 'image' | 'video' | 'other'> = {
      text: 'note',
      markdown: 'note',
      spreadsheet: 'document',
      document: 'document',
      presentation: 'document'
    };
    return typeMap[fileType] || 'note';
  }

  /**
   * Get project name input prompt when project name is not specified or generic
   */
  private async getProjectNameInputPrompt(projectDetails: Partial<ProjectDetails>, convexMutations: ConvexMutations): Promise<string> {
    try {
      // Check if there's already a pending project creation
      if (ProjectCreatorAgent.pendingProjectCreation) {
        const pendingAge = Date.now() - ProjectCreatorAgent.pendingProjectCreation.timestamp;
        
        // If pending request is less than 5 minutes old, remind user to use existing input
        if (pendingAge < 5 * 60 * 1000) {
          return `⚠️ **Please use the project name input above** to complete your previous project creation request.\n\nI'm still waiting for you to enter a project name.\n\n_To start a new project creation, wait for the current one to complete or cancel it first._`;
        } else {
          // Clear expired pending request
          ProjectCreatorAgent.pendingProjectCreation = null;
        }
      }

      // Store pending project creation state
      ProjectCreatorAgent.pendingProjectCreation = {
        projectDetails,
        timestamp: Date.now()
      };

      // Store a message with interactive component for project name input
      if (convexMutations.storeChatMessage) {
        await convexMutations.storeChatMessage({
          role: 'assistant' as const,
          content: `🤖 **Project Name Required**

I'm ready to create your new project! Please enter a name for your project using the input below:`,
          processIndicator: {
            type: 'waiting' as const,
            processType: 'project_name_input',
            color: 'green' as const,
          },
          interactiveComponent: {
            type: 'project_selector' as const,
            status: 'pending' as const,
            data: {
              projectDetails,
              projectNameInput: true, // Flag to indicate this is for project name input
              placeholder: projectDetails.type ? `${projectDetails.type.charAt(0).toUpperCase() + projectDetails.type.slice(1)} Project` : "Enter project name...",
            },
          },
        });

        // Return empty string since the interactive component will handle the response
        return "";
      } else {
        // Fallback to text-based input if storeChatMessage is not available
        let result = `🤖 **Project Name Required**\n\n`;
        result += `I'm ready to create your new project!\n\n`;
        
        if (projectDetails.type) {
          result += `**🎯 Project Type:** ${projectDetails.type.charAt(0).toUpperCase() + projectDetails.type.slice(1)}\n`;
        }
        
        if (projectDetails.description) {
          result += `**📝 Description:** ${projectDetails.description}\n`;
        }
        
        if (projectDetails.budget) {
          result += `**💰 Budget:** $${projectDetails.budget.toLocaleString()}\n`;
        }
        
        result += `\n**📝 Please provide a project name:**\n`;
        result += `• Type the project name in your next message\n`;
        result += `• Examples: "Marketing Campaign", "Website Redesign", "Q1 Budget Planning"\n\n`;
        result += `💡 **Next message:** Just type your project name!`;
        
        return result;
      }

    } catch (error) {
      console.error('Error setting up project name input:', error);
      return `🤖 **Project Name Required**

I'm ready to create your new project! Please provide a project name.

**💡 Tip:** You can say something like:
"Marketing Campaign" or "Website Redesign Project"`;
    }
  }

  /**
   * Get help message for the agent
   */
  private getHelpMessage(): string {
    return `🤖 **Project Creator Agent Help**

I can help you create projects and files using natural language! Here are some examples:

**📁 Create Projects:**
• "Create a marketing project for Q1 campaign"
• "Start a new development project called Mobile App"
• "Make a content project with initial files"

**📄 Create Files:**
• "Create a budget spreadsheet for Marketing Project"
• "Add meeting notes to Development Project"
• "Make a project plan document"

**🎨 Use Templates:**
• "Setup a marketing template"
• "Create a development project from template"
• "Apply financial template for Budget Analysis"

Just describe what you want to create and I'll handle the rest! 🚀`;
  }
}

// Export an instance of the agent for use in the registry
export const projectCreatorAgent = new ProjectCreatorAgent();
