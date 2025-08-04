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

  tools: AgentTool[] = [
    {
      id: 'natural-language-creator',
      name: 'Natural Language Creator',
      command: 'create',
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
      
      if (projectDetails.budget) {
        result += `💰 **Budget:** $${projectDetails.budget.toLocaleString()}\n`;
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

      const newFile = await convexMutations.createFile({
        name: fileDetails.fileName,
        content: content,
        type: this.mapToConvexFileType(fileDetails.fileType),
        projectId: 'project-lookup-needed' // Would need project lookup in real implementation
      });

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
      
      result += `💰 **Budget:** $${this.getTemplateBudget(templateDetails.type).toLocaleString()}\n\n`;
      
      if (templateFiles) {
        result += `📄 **Template Files:**\n${templateFiles}\n`;
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
    
    // Extract project name (words after "create", "new", "make", etc.)
    const namePatterns = [
      /(?:create|new|make|start|build|setup)\s+(?:a\s+)?(?:project\s+)?(?:called\s+)?[\"\']?([^\"\']+?)[\"\']?(?:\s+for|\s+with|$)/i,
      /(?:project\s+)?[\"\']([^\"\']+)[\"\']?/i
    ];

    let name = '';
    for (const pattern of namePatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        name = match[1].trim();
        break;
      }
    }

    // If no specific name found, use a default based on content
    if (!name) {
      name = 'New Project';
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
            projectId: (project as any)?.id
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
            projectId: (project as any)?.id
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
