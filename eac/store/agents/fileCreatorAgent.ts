// File Creator Agent
// Creates files in existing projects using natural language input with project selection

import { AgentTool, BaseAgent } from './base';
import { ConvexMutations } from './types';

interface FileCreationDetails {
  fileName: string;
  fileType: string;
  projectName?: string;
  content?: string;
  extension: string;
}

interface FileTypeOption {
  type: string;
  extension: string;
  description: string;
  contentTemplate: string;
}

export class FileCreatorAgent extends BaseAgent {
  id = 'file-creator';
  name = 'File Creator';
  description = 'Creates files in existing projects using natural language with project selection';
  icon = 'FilePlus';

  // State to track pending file creation
  private static pendingFileCreation: {
    fileDetails: FileCreationDetails;
    projects: any[];
    timestamp: number;
  } | null = null;

  // Predefined file type options
  private fileTypeOptions: FileTypeOption[] = [
    {
      type: 'markdown',
      extension: '.md',
      description: 'Markdown document for notes, documentation, or content',
      contentTemplate: '# {fileName}\n\nCreated: {date}\n\n## Overview\n\n## Details\n\n## Notes\n'
    },
    {
      type: 'spreadsheet',
      extension: '.xlsx',
      description: 'Excel spreadsheet for budgets, calculations, or data',
      contentTemplate: '# {fileName}\n\n| Item | Value | Notes |\n|------|-------|-------|\n| Example | 0 | Add your data here |\n| Total | 0 | |\n'
    },
    {
      type: 'document',
      extension: '.docx',
      description: 'Word document for reports, proposals, or formal documents',
      contentTemplate: '# {fileName}\n\nDocument created: {date}\n\n## Executive Summary\n\n## Main Content\n\n## Conclusion\n'
    },
    {
      type: 'presentation',
      extension: '.pptx',
      description: 'PowerPoint presentation for meetings or proposals',
      contentTemplate: '# {fileName}\n\nPresentation Outline\n\n## Slide 1: Title\n- {fileName}\n- Date: {date}\n\n## Slide 2: Agenda\n- Topic 1\n- Topic 2\n- Topic 3\n\n## Slide 3: Content\n- Main points\n'
    },
    {
      type: 'plan',
      extension: '.md',
      description: 'Project plan or strategy document',
      contentTemplate: '# {fileName}\n\nProject Plan - {date}\n\n## Objectives\n- Primary goal\n- Secondary goals\n\n## Timeline\n- Phase 1:\n- Phase 2:\n- Phase 3:\n\n## Resources\n- Team members\n- Budget\n- Tools\n\n## Milestones\n- Milestone 1:\n- Milestone 2:\n- Final delivery:\n'
    },
    {
      type: 'notes',
      extension: '.md',
      description: 'Meeting notes or general notes',
      contentTemplate: '# {fileName}\n\nMeeting Notes - {date}\n\n## Attendees\n- \n\n## Agenda\n- \n\n## Discussion Points\n- \n\n## Action Items\n- [ ] \n\n## Next Steps\n- \n'
    },
    {
      type: 'brief',
      extension: '.md',
      description: 'Creative brief or project brief',
      contentTemplate: '# {fileName}\n\nProject Brief - {date}\n\n## Project Overview\n\n## Objectives\n- Primary:\n- Secondary:\n\n## Target Audience\n\n## Key Messages\n\n## Deliverables\n- \n\n## Timeline\n- Start:\n- End:\n\n## Budget\n$\n\n## Success Metrics\n- \n'
    },
    {
      type: 'checklist',
      extension: '.md',
      description: 'Task checklist or process checklist',
      contentTemplate: '# {fileName}\n\nChecklist - {date}\n\n## Pre-Launch\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n\n## Launch\n- [ ] Task 1\n- [ ] Task 2\n\n## Post-Launch\n- [ ] Task 1\n- [ ] Task 2\n\n## Notes\n- \n'
    }
  ];

  tools: AgentTool[] = [
    {
      id: 'natural-language-file-creator',
      name: 'Natural Language File Creator',
      command: 'create-file',
      description: 'Create files in existing projects using natural language with guided project selection',
      parameters: []
    }
  ];

  async execute(
    tool: AgentTool,
    input: string,
    convexMutations: ConvexMutations
  ): Promise<string> {
    console.log('🚀 FileCreatorAgent executing with input:', input);
    
    try {
      return await this.processFileCreationRequest(input, convexMutations);
    } catch (error) {
      console.error('❌ FileCreatorAgent error:', error);
      return `❌ Failed to process request: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * Process natural language requests to create files
   */
  private async processFileCreationRequest(
    input: string,
    convexMutations: ConvexMutations
  ): Promise<string> {
    const normalizedInput = input.toLowerCase().trim();
    console.log('🔍 Processing file creation input:', normalizedInput);

    // Check for pending file creation (project selection response)
    if (FileCreatorAgent.pendingFileCreation) {
      const pendingAge = Date.now() - FileCreatorAgent.pendingFileCreation.timestamp;
      
      // If pending request is less than 5 minutes old, try to handle as project selection
      if (pendingAge < 5 * 60 * 1000) {
        const projectSelectionResult = await this.handleProjectSelection(input, convexMutations);
        if (projectSelectionResult) {
          return projectSelectionResult;
        }
      } else {
        // Clear expired pending request
        FileCreatorAgent.pendingFileCreation = null;
      }
    }

    // Check if this is a help request
    if (this.isHelpRequest(normalizedInput)) {
      return this.getHelpMessage();
    }

    // Check if this is a file type listing request
    if (this.isFileTypeListRequest(normalizedInput)) {
      return this.getFileTypeOptions();
    }

    // Extract file creation details
    const fileDetails = this.extractFileDetails(input);
    
    // If we couldn't extract enough details, provide guidance
    if (!fileDetails.fileName && !fileDetails.fileType) {
      return this.getCreationGuidance();
    }

    // If no project specified, ask for project selection
    if (!fileDetails.projectName) {
      return await this.getProjectSelectionPrompt(fileDetails, convexMutations);
    }

    // Create the file
    return await this.createFile(fileDetails, convexMutations);
  }

  /**
   * Handle project selection response
   */
  private async handleProjectSelection(input: string, convexMutations: ConvexMutations): Promise<string | null> {
    if (!FileCreatorAgent.pendingFileCreation) {
      return null;
    }

    const { fileDetails, projects } = FileCreatorAgent.pendingFileCreation;
    const normalizedInput = input.toLowerCase().trim();

    let selectedProject: any = null;

    // Try to match by number (e.g., "1", "2", "3")
    const numberMatch = input.match(/^\d+$/);
    if (numberMatch) {
      const index = parseInt(numberMatch[0]) - 1;
      if (index >= 0 && index < projects.length) {
        selectedProject = projects[index];
      }
    }

    // Try to match by project name patterns
    if (!selectedProject) {
      const projectSelectionPatterns = [
        /(?:add.*to|put.*in|create.*for|use|select)\s+[\"\']?([^\"\']+?)[\"\']?$/i,
        /^[\"\']?([^\"\']+?)[\"\']?$/i // Just the project name
      ];

      for (const pattern of projectSelectionPatterns) {
        const match = input.match(pattern);
        if (match && match[1]) {
          const projectName = match[1].trim().toLowerCase();
          selectedProject = projects.find((p: any) => 
            p.name.toLowerCase().includes(projectName) || 
            projectName.includes(p.name.toLowerCase())
          );
          if (selectedProject) break;
        }
      }
    }

    if (!selectedProject) {
      // Re-show project selection with error message
      let result = `❌ **Project not found.** Please select from the available projects:\n\n`;
      result += `**📁 Available Projects:**\n`;
      projects.forEach((project: any, index: number) => {
        result += `${index + 1}. **${project.name}**\n`;
      });
      result += `\n**💡 You can:**\n`;
      result += `• Type a number (e.g., "1", "2")\n`;
      result += `• Type the project name (e.g., "${projects[0]?.name}")\n`;
      result += `• Or say "add it to ${projects[0]?.name}"\n`;
      return result;
    }

    // Clear pending state
    FileCreatorAgent.pendingFileCreation = null;

    // Create the file with selected project
    const updatedFileDetails = {
      ...fileDetails,
      projectName: selectedProject.name
    };

    return await this.createFile(updatedFileDetails, convexMutations);
  }

  /**
   * Check if input is requesting help
   */
  private isHelpRequest(input: string): boolean {
    const helpPatterns = [
      /help/,
      /how.*work/,
      /what.*do/,
      /commands/,
      /options/
    ];
    return helpPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Check if input is requesting file type list
   */
  private isFileTypeListRequest(input: string): boolean {
    const listPatterns = [
      /file.*types?/,
      /what.*files?/,
      /list.*files?/,
      /show.*options/,
      /available.*types?/
    ];
    return listPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Extract file creation details from natural language input
   */
  private extractFileDetails(input: string): FileCreationDetails {
    const normalizedInput = input.toLowerCase();
    
    let fileName = '';
    let fileType = '';
    let extension = '.md'; // default
    let projectName = '';

    // Extract file name patterns
    const fileNamePatterns = [
      /(?:create|make|add|generate)\s+(?:a\s+)?(?:new\s+)?(?:file\s+)?(?:called\s+)?[\"\']?([^\"\']+?)[\"\']?(?:\s+(?:for|in|to|as)|\s*$)/i,
      /(?:file\s+)?[\"\']([^\"\']+)[\"\']?/i
    ];

    for (const pattern of fileNamePatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        fileName = match[1].trim();
        break;
      }
    }

    // Clean up fileName by removing file type words
    fileName = fileName.replace(/\b(file|document|spreadsheet|presentation|notes?|plan|brief|checklist)\b/gi, '').trim();

    // Detect file type from input
    for (const option of this.fileTypeOptions) {
      const typePatterns = [
        new RegExp(`\\b${option.type}\\b`, 'i'),
        new RegExp(`\\b${option.description.split(' ')[0]}\\b`, 'i')
      ];
      
      if (option.type === 'spreadsheet' && /\b(excel|xlsx?|budget|financial|calculation)\b/i.test(normalizedInput)) {
        fileType = option.type;
        extension = option.extension;
        break;
      } else if (option.type === 'document' && /\b(document|docx?|report|proposal|word)\b/i.test(normalizedInput)) {
        fileType = option.type;
        extension = option.extension;
        break;
      } else if (option.type === 'presentation' && /\b(presentation|pptx?|slides?|powerpoint)\b/i.test(normalizedInput)) {
        fileType = option.type;
        extension = option.extension;
        break;
      } else if (option.type === 'plan' && /\b(plan|planning|strategy|roadmap)\b/i.test(normalizedInput)) {
        fileType = option.type;
        extension = option.extension;
        break;
      } else if (option.type === 'notes' && /\b(notes?|meeting|minutes)\b/i.test(normalizedInput)) {
        fileType = option.type;
        extension = option.extension;
        break;
      } else if (option.type === 'brief' && /\b(brief|overview|summary)\b/i.test(normalizedInput)) {
        fileType = option.type;
        extension = option.extension;
        break;
      } else if (option.type === 'checklist' && /\b(checklist|tasks?|todo|list)\b/i.test(normalizedInput)) {
        fileType = option.type;
        extension = option.extension;
        break;
      } else if (typePatterns.some(pattern => pattern.test(normalizedInput))) {
        fileType = option.type;
        extension = option.extension;
        break;
      }
    }

    // If no specific type detected, default to markdown
    if (!fileType) {
      fileType = 'markdown';
      extension = '.md';
    }

    // Extract project name (only very explicit project mentions)
    const projectPatterns = [
      /(?:for|in|to)\s+(?:the\s+)?project\s+[\"\']?([^\"\']+?)[\"\']?(?:\s*$)/i,
      /project\s+[\"\']([^\"\']+)[\"\']?/i,
      /in\s+[\"\']([^\"\']+)[\"\']?\s+project/i
    ];

    for (const pattern of projectPatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        projectName = match[1].trim();
        break;
      }
    }

    // Generate default file name if not provided
    if (!fileName) {
      const typeWords = fileType.split(/(?=[A-Z])/).join(' ').toLowerCase();
      fileName = `new-${typeWords}`;
    }

    // Ensure fileName has extension
    if (!fileName.includes('.')) {
      fileName += extension;
    }

    return {
      fileName,
      fileType,
      projectName,
      extension,
      content: ''
    };
  }

  /**
   * Create the file in the specified project
   */
  private async createFile(
    fileDetails: FileCreationDetails,
    convexMutations: ConvexMutations
  ): Promise<string> {
    try {
      if (!convexMutations.createFile) {
        return '❌ File creation is not available. Please check system configuration.';
      }

      if (!convexMutations.getProjects) {
        return '❌ Project lookup is not available. Please check system configuration.';
      }

      // Look up the actual project ID by name
      const projects = await convexMutations.getProjects();
      const targetProject = projects.find((p: any) => 
        p.name.toLowerCase() === fileDetails.projectName?.toLowerCase()
      );

      if (!targetProject) {
        return `❌ **Project Not Found**\n\nCould not find a project named "${fileDetails.projectName}". Please check the project name and try again.\n\n**Available projects:**\n${projects.map((p: any) => `• ${p.name}`).join('\n')}`;
      }

      // Find the file type option for content template
      const fileTypeOption = this.fileTypeOptions.find(option => option.type === fileDetails.fileType);
      
      // Generate content from template
      const content = this.generateFileContent(fileDetails, fileTypeOption);

      // Create the file with the actual project ID
      const newFile = await convexMutations.createFile({
        name: fileDetails.fileName,
        content: content,
        type: this.mapToConvexFileType(fileDetails.fileType),
        projectId: targetProject._id // Use the actual project ID
      });

      let result = `✅ **File Created Successfully!**\n\n`;
      result += `📄 **File Name:** ${fileDetails.fileName}\n`;
      result += `📁 **Project:** ${fileDetails.projectName}\n`;
      result += `🏷️ **Type:** ${fileDetails.fileType}\n`;
      
      if (fileTypeOption) {
        result += `📝 **Description:** ${fileTypeOption.description}\n`;
      }
      
      result += `📅 **Created:** ${new Date().toLocaleDateString()}\n\n`;
      result += `💡 You can now find and edit this file in the sidebar!\n\n`;
      result += `🔧 **Next Steps:**\n`;
      result += `• Open the file to customize the content\n`;
      result += `• Share with team members if needed\n`;
      result += `• Add to your workflow or calendar`;

      return result;
    } catch (error) {
      console.error('❌ File creation failed:', error);
      return `❌ **File creation failed:** ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * Generate file content based on template
   */
  private generateFileContent(fileDetails: FileCreationDetails, fileTypeOption?: FileTypeOption): string {
    if (!fileTypeOption) {
      // Default content if no template found
      return `# ${fileDetails.fileName.replace(/\.[^/.]+$/, "")}\n\nCreated: ${new Date().toLocaleDateString()}\n\nContent goes here...`;
    }

    // Replace template variables
    let content = fileTypeOption.contentTemplate;
    content = content.replace(/\{fileName\}/g, fileDetails.fileName.replace(/\.[^/.]+$/, ""));
    content = content.replace(/\{date\}/g, new Date().toLocaleDateString());
    
    return content;
  }

  /**
   * Map file type to Convex expected type
   */
  private mapToConvexFileType(fileType: string): 'post' | 'campaign' | 'note' | 'document' | 'image' | 'video' | 'other' {
    const typeMap: Record<string, 'post' | 'campaign' | 'note' | 'document' | 'image' | 'video' | 'other'> = {
      markdown: 'note',
      notes: 'note',
      plan: 'note',
      brief: 'note',
      checklist: 'note',
      spreadsheet: 'document',
      document: 'document',
      presentation: 'document'
    };
    return typeMap[fileType] || 'note';
  }

  /**
   * Get creation guidance when details are insufficient
   */
  private getCreationGuidance(): string {
    return `🤖 **File Creator - Let's Get Started!**

I need a bit more information to create your file. Here are some examples:

**📄 Quick Examples:**
• "Create a budget spreadsheet for Marketing Project"
• "Make meeting notes for Development Team"
• "Add a project plan for Q1 Campaign"
• "Generate a presentation for Client Review"

**🎯 What I need:**
1. **File type** (spreadsheet, notes, plan, etc.)
2. **File name** (optional - I'll suggest one)
3. **Project name** (which project to add it to)

**💡 Pro tip:** Just describe what you want! 
Example: "I need a checklist for the product launch project"

Type your request or say "**file types**" to see all available options! 🚀`;
  }

  /**
   * Get project selection prompt when project is not specified
   */
  private async getProjectSelectionPrompt(fileDetails: FileCreationDetails, convexMutations: ConvexMutations): Promise<string> {
    try {
      if (!convexMutations.getProjects) {
        return `🤖 **Almost There! Which Project?**

I'm ready to create your **${fileDetails.fileType}** file: \`${fileDetails.fileName}\`

**📁 Please specify which project to add it to.**

**💡 Tip:** You can say something like:
"Create ${fileDetails.fileName} for [Your Project Name]"`;
      }

      // Fetch available projects
      const projects = await convexMutations.getProjects();
      
      let result = `🤖 **Almost There! Which Project?**\n\n`;
      result += `I'm ready to create your **${fileDetails.fileType}** file: \`${fileDetails.fileName}\`\n\n`;
      result += `**📁 Available Projects:**\n`;
      
      if (projects && projects.length > 0) {
        // Store pending file creation state
        FileCreatorAgent.pendingFileCreation = {
          fileDetails,
          projects,
          timestamp: Date.now()
        };

        projects.forEach((project: any, index: number) => {
          result += `${index + 1}. **${project.name}**\n`;
        });
        
        result += `\n**🎯 Select a project:**\n`;
        result += `• Type a number: **1**, **2**, **3**, etc.\n`;
        result += `• Type the name: **${projects[0]?.name}**\n`;
        result += `• Or say: "**add it to ${projects[0]?.name}**"\n\n`;
        result += `💡 **Next message:** Just type your selection!`;
      } else {
        result += `No projects found. Please create a project first or specify a project name.\n`;
      }

      return result;
      
    } catch (error) {
      console.error('Error fetching projects for selection:', error);
      return `🤖 **Almost There! Which Project?**

I'm ready to create your **${fileDetails.fileType}** file: \`${fileDetails.fileName}\`

**📁 Please specify which project to add it to.**

**💡 Tip:** You can say something like:
"Create ${fileDetails.fileName} for [Your Project Name]"`;
    }
  }

  /**
   * Get available file type options
   */
  private getFileTypeOptions(): string {
    let result = `🤖 **Available File Types**\n\n`;
    
    this.fileTypeOptions.forEach((option, index) => {
      result += `**${index + 1}. ${option.type.charAt(0).toUpperCase() + option.type.slice(1)}** (${option.extension})\n`;
      result += `   ${option.description}\n\n`;
    });

    result += `**💡 Usage Examples:**\n`;
    result += `• "Create a spreadsheet for Budget Planning"\n`;
    result += `• "Make meeting notes for Development Team"\n`;
    result += `• "Add a project plan for Marketing Campaign"\n`;
    result += `• "Generate a brief for Client Presentation"\n\n`;
    
    result += `**🚀 Just describe what you need and I'll handle the rest!**`;

    return result;
  }

  /**
   * Get help message for the agent
   */
  private getHelpMessage(): string {
    return `🤖 **File Creator Agent Help**

I specialize in creating files for your existing projects! Here's how I work:

**📄 Supported File Types:**
• **Spreadsheets** - Budgets, calculations, data tracking
• **Documents** - Reports, proposals, formal documents  
• **Presentations** - Meeting slides, proposals
• **Notes** - Meeting notes, general notes
• **Plans** - Project plans, strategies, roadmaps
• **Briefs** - Creative briefs, project overviews
• **Checklists** - Task lists, process checklists
• **Markdown** - General documentation

**🎯 How to Use:**
1. **Tell me what file you want:** "Create a budget spreadsheet"
2. **Specify the project:** "for Marketing Campaign"
3. **I'll create it with a template!**

**✨ Quick Examples:**
• "Create a meeting notes file for Development Team"
• "Make a project plan for Q1 Launch"
• "Add a budget spreadsheet to Marketing Project" 
• "Generate a presentation for Client Review"

**🔧 Special Commands:**
• Type "**file types**" to see all available options
• Type "**help**" to see this message again

**💡 Pro Tips:**
• I'll suggest file names if you don't provide one
• All files come with helpful templates
• Just describe what you need in plain English!

Ready to create some files? 🚀`;
  }
}

// Export an instance of the agent for use in the registry
export const fileCreatorAgent = new FileCreatorAgent();
