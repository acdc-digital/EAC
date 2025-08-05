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

  // State to track pending file name input
  private static pendingFileNameInput: {
    fileDetails: FileCreationDetails;
    timestamp: number;
  } | null = null;

  // State to track pending file type selection
  private static pendingFileTypeInput: {
    timestamp: number;
  } | null = null;

  // Predefined file type options - currently only X/Twitter is available
  private fileTypeOptions: FileTypeOption[] = [
    {
      type: 'x',
      extension: '.x',
      description: 'X (Twitter) Social Media Post',
      contentTemplate: '# {fileName} - X (Twitter) Post\nPlatform: X (Twitter)\nCreated: {date}\n\n## Post Content\n\n\n## Settings\n- Reply Settings: following\n- Schedule: Now\n- Thread: Single Tweet\n\n## Media\n- Images: []\n- Videos: []\n\n## Analytics\n- Impressions: 0\n- Engagements: 0\n- Likes: 0\n- Shares: 0'
    }
    // Future file types will be added here as they become available
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
    console.log('🔍 Has pending file creation:', !!FileCreatorAgent.pendingFileCreation);
    console.log('🔍 Has pending file name input:', !!FileCreatorAgent.pendingFileNameInput);
    console.log('🔍 Has pending file type input:', !!FileCreatorAgent.pendingFileTypeInput);

    // Check for pending file creation (project selection response)
    if (FileCreatorAgent.pendingFileCreation) {
      const pendingAge = Date.now() - FileCreatorAgent.pendingFileCreation.timestamp;
      console.log('⏰ Pending file creation age (ms):', pendingAge);
      
      // If pending request is less than 5 minutes old, try to handle as project selection
      if (pendingAge < 5 * 60 * 1000) {
        console.log('🔄 Trying to handle as project selection...');
        const projectSelectionResult = await this.handleProjectSelection(input, convexMutations);
        console.log('📋 Project selection result:', projectSelectionResult);
        console.log('📏 Project selection result length:', projectSelectionResult?.length || 0);
        if (projectSelectionResult) {
          console.log('✅ Returning project selection result');
          return projectSelectionResult;
        } else {
          console.log('❌ Project selection returned null');
          // Don't continue with normal processing - remind user to use the selector
          return `⚠️ **Please use the project selector above** to choose which project to add your file to.\n\nI'm still waiting for you to select a project for: **${FileCreatorAgent.pendingFileCreation.fileDetails.fileName}**\n\nClick the "Add to Project" button after selecting a project from the dropdown.`;
        }
      } else {
        // Clear expired pending request
        console.log('⏰ Clearing expired pending request');
        FileCreatorAgent.pendingFileCreation = null;
      }
    }

    // Check for pending file name input
    if (FileCreatorAgent.pendingFileNameInput) {
      const pendingAge = Date.now() - FileCreatorAgent.pendingFileNameInput.timestamp;
      console.log('⏰ Pending file name input age (ms):', pendingAge);
      
      // If pending request is less than 5 minutes old, try to handle as file name input
      if (pendingAge < 5 * 60 * 1000) {
        console.log('🔄 Trying to handle as file name input...');
        const fileNameResult = await this.handleFileNameInput(input, convexMutations);
        if (fileNameResult) {
          console.log('✅ Returning file name input result');
          return fileNameResult;
        } else {
          console.log('❌ File name input returned null - continuing silently');
          return "";
        }
      } else {
        // Clear expired pending request
        console.log('⏰ Clearing expired file name input request');
        FileCreatorAgent.pendingFileNameInput = null;
      }
    }

    // Check for pending file type input
    if (FileCreatorAgent.pendingFileTypeInput) {
      const pendingAge = Date.now() - FileCreatorAgent.pendingFileTypeInput.timestamp;
      console.log('⏰ Pending file type input age (ms):', pendingAge);
      
      // If pending request is less than 5 minutes old, try to handle as file type input
      if (pendingAge < 5 * 60 * 1000) {
        console.log('🔄 Trying to handle as file type input...');
        const fileTypeResult = await this.handleFileTypeInput(input, convexMutations);
        if (fileTypeResult) {
          console.log('✅ Returning file type input result');
          return fileTypeResult;
        } else {
          console.log('❌ File type input returned null - continuing silently');
          return "";
        }
      } else {
        // Clear expired pending request
        console.log('⏰ Clearing expired file type input request');
        FileCreatorAgent.pendingFileTypeInput = null;
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

    // NEW WORKFLOW: Start with file type selection for new file creation requests
    // Check if this is a new file creation request (no existing workflow state)
    if (this.isNewFileCreationRequest(normalizedInput)) {
      console.log('🆕 Detected new file creation request - starting with file type selection');
      
      // ✨ ADD THINKING/CHAIN OF THOUGHT STEP
      if (convexMutations.storeChatMessage) {
        await convexMutations.storeChatMessage({
          role: 'thinking',
          content: `Analyzing file creation request: "${input}"

I need to help the user create a new file. Let me think through this:

1. The user wants to create a new file
2. I should first determine what type of file they want to create
3. Available file types include:
   - X (Twitter) posts (.x extension)
   - Markdown files (.md extension)  
   - Other social media formats (coming soon)

4. After file type selection, I'll need to:
   - Get the project/folder location
   - Get the file name
   - Create the file with appropriate content

Starting with file type selection to guide the user through the process systematically.`
        });
      }
      
      return await this.getFileTypeSelectionPrompt(convexMutations);
    }

    // LEGACY WORKFLOW: Continue with old logic for compatibility (only for non-new-file requests)
    // Extract file creation details
    const fileDetails = this.extractFileDetails(input);
    console.log('🔍 File Creator Debug - Extracted details:', {
      fileName: fileDetails.fileName,
      fileType: fileDetails.fileType,
      isGeneric: this.isGenericFileName(fileDetails.fileName || ''),
      input: input.substring(0, 50)
    });
    
    // If no specific file name was extracted or it's generic, show the input component
    if (!fileDetails.fileName || this.isGenericFileName(fileDetails.fileName)) {
      console.log('📝 Triggering file name input prompt');
      return await this.getFileNameInputPrompt(fileDetails, convexMutations);
    }
    
    // If we couldn't extract enough details, provide guidance
    if (!fileDetails.fileType) {
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
    console.log('🎯 Handling project selection with input:', input);
    console.log('📁 Pending file creation:', FileCreatorAgent.pendingFileCreation);
    
    if (!FileCreatorAgent.pendingFileCreation) {
      console.log('❌ No pending file creation found');
      return null;
    }

    const { fileDetails, projects } = FileCreatorAgent.pendingFileCreation;
    const normalizedInput = input.toLowerCase().trim();
    console.log('📂 Available projects:', projects.map((p: any) => p.name));
    console.log('🔍 Normalized input:', normalizedInput);

    // ✨ ADD THINKING FOR PROJECT SELECTION PROCESSING
    if (convexMutations.storeChatMessage) {
      await convexMutations.storeChatMessage({
        role: 'thinking',
        content: `Processing project selection: "${input}"

The user is selecting which project to add their file to. Let me analyze:

1. User input: "${input}"
2. Normalized input: "${normalizedInput}"
3. Available projects: ${projects.map((p: any) => `"${p.name}"`).join(', ')}
4. File details: ${fileDetails.fileName} (${fileDetails.fileType})

I'll try to match their input in these ways:
- Check if it's a number (1, 2, 3...) referring to project position
- Check if it contains a project name or partial match
- Use fuzzy matching to find the best project match

This will help me determine which project they want to add their file to.`
      });
    }

    let selectedProject: any = null;

    // Try to match by number (e.g., "1", "2", "3")
    const numberMatch = input.match(/^\d+$/);
    if (numberMatch) {
      const index = parseInt(numberMatch[0]) - 1;
      if (index >= 0 && index < projects.length) {
        selectedProject = projects[index];
        console.log('🔢 Selected project by number:', selectedProject.name);
      }
    }

    // Try to match by project name patterns
    if (!selectedProject) {
      const projectSelectionPatterns = [
        /(?:add.*to|put.*in|create.*for|use|select)\s+[\"\']?([^\"\']+?)[\"\']?$/i,
        /^[\"\']?([^\"\']+?)[\"\']?$/i // Just the project name
      ];

      console.log('🔍 Trying project name patterns...');
      for (const pattern of projectSelectionPatterns) {
        const match = input.match(pattern);
        console.log(`🔍 Pattern ${pattern} matched:`, match);
        if (match && match[1]) {
          const projectName = match[1].trim().toLowerCase();
          console.log('🔍 Trying to match project name:', projectName);
          selectedProject = projects.find((p: any) => 
            p.name.toLowerCase().includes(projectName) || 
            projectName.includes(p.name.toLowerCase())
          );
          if (selectedProject) {
            console.log('📛 Selected project by name:', selectedProject.name);
            break;
          } else {
            console.log('❌ No project matched for name:', projectName);
          }
        }
      }
    }

    console.log('🎯 Final selected project:', selectedProject?.name || 'None');

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
      console.log('❌ Project not found, returning selection message');
      return result;
    }

    // Clear pending state
    FileCreatorAgent.pendingFileCreation = null;
    console.log('✅ Cleared pending file creation');

    // Create the file with selected project
    const updatedFileDetails = {
      ...fileDetails,
      projectName: selectedProject.name
    };

    console.log('📄 Creating file with details:', updatedFileDetails);
    console.log('🔧 Convex mutations available:', {
      createFile: !!convexMutations.createFile,
      getProjects: !!convexMutations.getProjects,
    });
    
    const result = await this.createFile(updatedFileDetails, convexMutations);
    console.log('📝 Create file result:', result);
    console.log('📏 Create file result length:', result?.length || 0);
    console.log('🎯 Create file result preview:', result?.substring(0, 200) + '...');
    
    return result;
  }

  /**
   * Handle file name input response
   */
  private async handleFileNameInput(input: string, convexMutations: ConvexMutations): Promise<string | null> {
    console.log('🎯 Handling file name input with input:', input);
    console.log('📁 Pending file name input:', FileCreatorAgent.pendingFileNameInput);
    
    if (!FileCreatorAgent.pendingFileNameInput) {
      console.log('❌ No pending file name input found');
      return null;
    }

    const { fileDetails } = FileCreatorAgent.pendingFileNameInput;
    const fileName = input.trim();
    console.log('🔍 File name input:', fileName);

    // ✨ ADD THINKING FOR FILE NAME PROCESSING
    if (convexMutations.storeChatMessage) {
      await convexMutations.storeChatMessage({
        role: 'thinking',
        content: `Processing file name input: "${input}"

The user has provided a file name. Let me validate and process it:

1. Raw input: "${input}"
2. Trimmed input: "${fileName}"
3. Length validation: ${fileName.length} characters
4. Minimum required: 2 characters
5. Current file type: ${fileDetails.fileType || 'unspecified'}
6. Extension: ${fileDetails.extension || 'unspecified'}

Validation status: ${fileName.length >= 2 ? 'VALID' : 'INVALID - too short'}

Next steps after validation:
- If valid: proceed to project selection
- If invalid: request a better file name
- Then: create the file in the selected project`
      });
    }

    if (!fileName || fileName.length < 2) {
      return `❌ **Please enter a valid file name**\n\nFile names should be at least 2 characters long.\n\n**Examples:**\n• "Budget Report"\n• "Meeting Notes"\n• "Project Plan"`;
    }

    // Clear pending state
    FileCreatorAgent.pendingFileNameInput = null;
    console.log('✅ Cleared pending file name input');

    // Update the file details with the provided name
    const updatedFileDetails = {
      ...fileDetails,
      fileName: fileName
    };

    console.log('📄 Updated file details with name:', updatedFileDetails);

    // Now check if we need project selection
    if (!updatedFileDetails.projectName) {
      return await this.getProjectSelectionPrompt(updatedFileDetails, convexMutations);
    }

    // If we have both file name and project, create the file
    return await this.createFile(updatedFileDetails, convexMutations);
  }

  /**
   * Handle file type input response
   */
  private async handleFileTypeInput(input: string, convexMutations: ConvexMutations): Promise<string | null> {
    console.log('🎯 Handling file type input with input:', input);
    console.log('📁 Pending file type input:', FileCreatorAgent.pendingFileTypeInput);
    
    if (!FileCreatorAgent.pendingFileTypeInput) {
      console.log('❌ No pending file type input found');
      return null;
    }

    const normalizedInput = input.toLowerCase().trim();
    console.log('🔍 File type input:', normalizedInput);

    // ✨ ADD THINKING FOR FILE TYPE PROCESSING
    if (convexMutations.storeChatMessage) {
      await convexMutations.storeChatMessage({
        role: 'thinking',
        content: `Processing file type selection: "${input}"

The user has indicated their file type preference. Let me analyze:

1. Input received: "${input}"
2. Normalized input: "${normalizedInput}"
3. Checking against supported file types:
   - X/Twitter posts (keywords: x, twitter) → .x extension
   - Markdown files → .md extension
   - Other formats (coming soon)

Based on the input, I'll determine the appropriate file type and proceed to the next step of the creation process.`
      });
    }

    // For now, only support x/twitter type
    if (normalizedInput.includes('x') || normalizedInput.includes('twitter')) {
      // Clear pending state
      FileCreatorAgent.pendingFileTypeInput = null;
      console.log('✅ Cleared pending file type input');

      // Create file details with the selected type
      const fileDetails: FileCreationDetails = {
        fileName: '',
        fileType: 'x',
        extension: '.x'
      };

      console.log('📄 Created file details with type:', fileDetails);

      // Now proceed to file name input
      return await this.getFileNameInputPrompt(fileDetails, convexMutations);
    } else {
      return `❌ **Please select a valid file type**\n\nCurrently available:\n• **X (Twitter)** - for social media posts\n\nMore file types coming soon!`;
    }
  }

  /**
   * Check if input is a new file creation request
   */
  private isNewFileCreationRequest(input: string): boolean {
    const normalizedInput = input.toLowerCase().trim();
    const newFilePatterns = [
      /^create.*new.*file$/,
      /^create.*file$/,
      /^new.*file$/,
      /^make.*new.*file$/,
      /^add.*new.*file$/,
      /^generate.*new.*file$/,
      /^start.*new.*file$/
    ];
    
    return newFilePatterns.some(pattern => pattern.test(normalizedInput));
  }

  /**
   * Get file type selection prompt for new file creation
   */
  private async getFileTypeSelectionPrompt(convexMutations: ConvexMutations): Promise<string> {
    try {
      // Check if there's already a pending file type input
      if (FileCreatorAgent.pendingFileTypeInput) {
        const pendingAge = Date.now() - FileCreatorAgent.pendingFileTypeInput.timestamp;
        // If pending request is less than 5 minutes old, return empty (don't create duplicate inputs)
        if (pendingAge < 5 * 60 * 1000) {
          return "";
        } else {
          // Clear expired pending request
          FileCreatorAgent.pendingFileTypeInput = null;
        }
      }

      // Store pending file type input state
      FileCreatorAgent.pendingFileTypeInput = {
        timestamp: Date.now()
      };

      // Store a message with interactive component for file type selection
      if (convexMutations.storeChatMessage) {
        await convexMutations.storeChatMessage({
          role: 'assistant',
          content: `🤖 **File Type Selection**\n\nPlease select the type of file you want to create:`,
          processIndicator: {
            type: 'waiting',
            processType: 'file_type_selection',
            color: 'green'
          },
          interactiveComponent: {
            type: 'file_type_selector',
            status: 'pending',
            data: {}
          }
        });
        
        // Return empty string since the interactive component will handle the response
        return "";
      } else {
        // Fallback to text-based input if storeChatMessage is not available
        let result = `🤖 **File Type Selection**\n\n`;
        result += `Please select the type of file you want to create:\n\n`;
        result += `**📁 Available File Types:**\n`;
        this.fileTypeOptions.forEach((option, index) => {
          result += `${index + 1}. **${option.description}** (${option.extension})\n`;
        });
        result += `\n**💡 Next message:** Just type the file type you want!`;
        return result;
      }
    } catch (error) {
      console.error('Error setting up file type selection:', error);
      return `🤖 **File Type Selection**\n\nLet's create a new file! Please specify what type of file you want to create.\n\n**💡 Currently available:** X (Twitter) posts`;
    }
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
   * Check if a file name is generic and should trigger input prompt
   */
  private isGenericFileName(fileName: string): boolean {
    const normalizedName = fileName.toLowerCase().trim();
    
    // Remove common extensions to check the base name
    const baseName = normalizedName.replace(/\.(md|docx?|xlsx?|pptx?|txt|pdf)$/i, '');
    
    const genericNames = [
      'file', 'new file', 'a file', 'new', 'document', 'new document', 
      'notes', 'new notes', 'plan', 'new plan', 'spreadsheet', 
      'new spreadsheet', 'presentation', 'new presentation'
    ];
    
    // Check for auto-generated generic patterns like "new-markdown", "new-document", etc.
    const autoGeneratedPatterns = [
      /^new-[a-z]+$/,           // new-markdown, new-document, etc.
      /^untitled-?\d*$/,        // untitled, untitled-1, etc.
      /^document-?\d*$/,        // document, document-1, etc.
      /^file-?\d*$/,            // file, file-1, etc.
    ];
    
    const isAutoGenerated = autoGeneratedPatterns.some(pattern => pattern.test(baseName));
    const isInGenericList = genericNames.includes(baseName);
    
    return isInGenericList || isAutoGenerated || fileName.length < 2;
  }

  /**
   * Get file name input prompt when file name is not specified or generic
   */
  private async getFileNameInputPrompt(
    fileDetails: FileCreationDetails, 
    convexMutations: ConvexMutations
  ): Promise<string> {
    try {
      // Check if there's already a pending file name input
      if (FileCreatorAgent.pendingFileNameInput) {
        const pendingAge = Date.now() - FileCreatorAgent.pendingFileNameInput.timestamp;
        // If pending request is less than 5 minutes old, return empty (don't create duplicate inputs)
        if (pendingAge < 5 * 60 * 1000) {
          return "";
        } else {
          // Clear expired pending request
          FileCreatorAgent.pendingFileNameInput = null;
        }
      }

      // Store pending file name input state
      FileCreatorAgent.pendingFileNameInput = {
        fileDetails,
        timestamp: Date.now()
      };

      // Store a message with interactive component for file name input
      if (convexMutations.storeChatMessage) {
        await convexMutations.storeChatMessage({
          role: 'assistant',
          content: `🤖 **File Name Required**\n\nI'm ready to create your new ${fileDetails.fileType || 'file'}! Please enter a name for your file using the input below:`,
          processIndicator: {
            type: 'waiting',
            processType: 'file_name_input',
            color: 'green'
          },
          interactiveComponent: {
            type: 'file_name_input',
            status: 'pending',
            data: {
              fileType: fileDetails.fileType || 'file',
              placeholder: fileDetails.fileType ? `Enter ${fileDetails.fileType} name...` : "Enter file name...",
              fileDetails
            }
          }
        });
        
        // Return empty string since the interactive component will handle the response
        return "";
      } else {
        // Fallback to text-based input if storeChatMessage is not available
        let result = `🤖 **File Name Required**\n\n`;
        result += `I'm ready to create your new ${fileDetails.fileType || 'file'}!\n\n`;
        if (fileDetails.fileType) {
          result += `**📁 File Type:** ${fileDetails.fileType}\n`;
        }
        result += `\n**📝 Please provide a file name:**\n`;
        result += `• Type the file name in your next message\n`;
        result += `• Examples: "Budget Report", "Meeting Notes", "Project Plan"\n\n`;
        result += `💡 **Next message:** Just type your file name!`;
        return result;
      }
    } catch (error) {
      console.error('Error setting up file name input:', error);
      return `🤖 **File Name Required**\n\nI'm ready to create your new file! Please provide a file name.\n\n**💡 Tip:** You can say something like:\n"Budget Report" or "Meeting Notes"`;
    }
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

    // Extract file name patterns - more specific patterns that capture actual file names
    const fileNamePatterns = [
      // Pattern for "create file called [name]" or "create file named [name]"
      /(?:create|make|add|generate)\s+(?:a\s+)?(?:new\s+)?(?:file|document)\s+(?:called|named)\s+[\"\']?([^\"\']+?)[\"\']?(?:\s+(?:for|in|to|as)|\s*$)/i,
      // Pattern for quoted names: "file name" or 'file name'
      /[\"\']([^\"\']{2,})[\"\']/, 
      // Pattern for specific file names (must be at least 4 chars and not start with generic words)
      /(?:create|make|add|generate)\s+(?:a\s+)?[\"\']?([a-zA-Z][a-zA-Z0-9\s\-_]{3,})[\"\']?(?:\s+(?:file|document|for|in|to|as)|\s*$)/i
    ];

    for (const pattern of fileNamePatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        const extractedName = match[1].trim();
        
        // Reject generic/vague names that should trigger input prompt
        const genericNames = ['file', 'new file', 'a file', 'new', 'document', 'new document', 'notes', 'new notes', 'plan', 'new plan', 'spreadsheet', 'new spreadsheet', 'presentation', 'new presentation'];
        const genericStarters = ['new', 'file', 'document', 'a', 'an', 'the'];
        
        // Check if name is in generic list or starts with generic words
        const startsWithGeneric = genericStarters.some(starter => 
          extractedName.toLowerCase().startsWith(starter.toLowerCase() + ' ') || 
          extractedName.toLowerCase() === starter.toLowerCase()
        );
        
        const isInGenericList = genericNames.includes(extractedName.toLowerCase());
        
        if (!isInGenericList && 
            !startsWithGeneric && 
            extractedName.length > 2) {
          fileName = extractedName;
          break;
        }
      }
    }

    // Clean up fileName by removing file type words ONLY if we have a fileName
    if (fileName) {
      fileName = fileName.replace(/\b(file|document|spreadsheet|presentation|notes?|plan|brief|checklist)\b/gi, '').trim();
      
      // If cleanup removed everything, reset fileName to empty
      if (!fileName || fileName.length < 2) {
        fileName = '';
      }
    }

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
      x: 'post', // X/Twitter posts
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
      // Check if there's already a pending file creation
      if (FileCreatorAgent.pendingFileCreation) {
        const pendingAge = Date.now() - FileCreatorAgent.pendingFileCreation.timestamp;
        
        // If pending request is less than 5 minutes old, remind user to use existing selector
        if (pendingAge < 5 * 60 * 1000) {
          return `⚠️ **Please use the project selector above** to complete your previous file creation request.\n\nI'm still waiting for you to select a project for: **${FileCreatorAgent.pendingFileCreation.fileDetails.fileName}**\n\nClick the "Add to Project" button after selecting a project from the dropdown.\n\n_To start a new file creation, wait for the current one to complete or cancel it first._`;
        } else {
          // Clear expired pending request
          FileCreatorAgent.pendingFileCreation = null;
        }
      }

      if (!convexMutations.getProjects) {
        return `🤖 **Almost There! Which Project?**

I'm ready to create your **${fileDetails.fileType}** file: \`${fileDetails.fileName}\`

**📁 Please specify which project to add it to.**

**💡 Tip:** You can say something like:
"Create ${fileDetails.fileName} for [Your Project Name]"`;
      }

      // Fetch available projects
      const projects = await convexMutations.getProjects();
      
      if (projects && projects.length > 0) {
        // Store pending file creation state
        FileCreatorAgent.pendingFileCreation = {
          fileDetails,
          projects,
          timestamp: Date.now()
        };

        // Store a message with interactive component for project selection
        if (convexMutations.storeChatMessage) {
          await convexMutations.storeChatMessage({
            role: 'assistant' as const,
            content: `🤖 **Project Selection Required**

I'm ready to create your **${fileDetails.fileType}** file: \`${fileDetails.fileName}\`

Please select which project to add it to using the selector below:`,
            processIndicator: {
              type: 'waiting' as const,
              processType: 'project_selection',
              color: 'green' as const,
            },
            interactiveComponent: {
              type: 'project_selector' as const,
              status: 'pending' as const,
              data: {
                fileDetails,
                projects,
              },
            },
          });

          // Return empty string since the interactive component will handle the response
          return "";
        } else {
          // Fallback to text-based selection if storeChatMessage is not available
          let result = `🤖 **Almost There! Which Project?**\n\n`;
          result += `I'm ready to create your **${fileDetails.fileType}** file: \`${fileDetails.fileName}\`\n\n`;
          result += `**📁 Available Projects:**\n`;
          
          projects.forEach((project: any, index: number) => {
            result += `${index + 1}. **${project.name}**\n`;
          });
          
          result += `\n**🎯 Select a project:**\n`;
          result += `• Type a number: **1**, **2**, **3**, etc.\n`;
          result += `• Type the name: **${projects[0]?.name}**\n`;
          result += `• Or say: "**add it to ${projects[0]?.name}**"\n\n`;
          result += `💡 **Next message:** Just type your selection!`;
          
          return result;
        }
      } else {
        return `🤖 **No Projects Found**

I'm ready to create your **${fileDetails.fileType}** file: \`${fileDetails.fileName}\`

**📁 No projects found.** Please create a project first or specify a project name.

**💡 Tip:** You can say something like:
"Create ${fileDetails.fileName} for [Your Project Name]"`;
      }

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
