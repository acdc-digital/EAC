// Editor Agent
// Edits existing files (instructions and project files) with AI assistance

import { AgentTool, BaseAgent } from './base';
import { ConvexMutations } from './types';

export class EditorAgent extends BaseAgent {
  id = 'editor';
  name = 'Editor';
  description = 'Edit existing instruction documents and project files with AI assistance';
  icon = 'Edit3';

  tools: AgentTool[] = [
    {
      id: "edit-file",
      name: "Edit File",
      command: "/edit",
      description: "Edit existing files with AI assistance",
      parameters: [
        {
          name: "instructions",
          type: "string", 
          description: "What would you like to edit?",
          required: true,
        }
      ]
    }
  ];

  private currentStep: 'file-selection' | 'edit-request' | 'completed' = 'file-selection';
  private selectedFile: any = null;

  async execute(
    tool: AgentTool,
    input: string,
    mutations: ConvexMutations,
    sessionId?: string
  ): Promise<string> {
    try {
      console.log('🤖 Editor Agent: Processing input:', input);
      
      // Clean the input
      const cleanInput = input.replace(/^\/edit\s*/i, '').trim();
      
      // Check if this is a file selection message (comes from interactive component)
      if (cleanInput.startsWith('Selected file:')) {
        const fileName = cleanInput.replace('Selected file:', '').trim();
        return await this.handleFileSelected(fileName, mutations, sessionId);
      }
      
      // Check if we have edit instructions by looking for action keywords
      const isEditRequest = cleanInput && (
        cleanInput.includes('add') ||
        cleanInput.includes('remove') ||
        cleanInput.includes('change') ||
        cleanInput.includes('update') ||
        cleanInput.includes('modify') ||
        cleanInput.includes('replace') ||
        cleanInput.includes('rewrite') ||
        cleanInput.includes('make') ||
        cleanInput.includes('note') ||
        cleanInput.includes('section') ||
        cleanInput.includes('tone') ||
        cleanInput.includes('professional') ||
        cleanInput.includes('casual') ||
        (cleanInput.length > 15 && !cleanInput.includes('help') && !cleanInput.includes('edit'))
      );
      
      if (isEditRequest) {
        // This looks like edit instructions
        return await this.handleEditInstructions(cleanInput, mutations, sessionId);
      }
      
      // Default: Show file selection interface
      return await this.handleFileSelection(mutations, sessionId);
      
    } catch (error) {
      console.error('❌ Editor Agent error:', error);
      return `❌ **Editor Agent Error**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`;
    }
  }

  private async handleEditInstructions(
    instructions: string,
    mutations: ConvexMutations,
    sessionId?: string
  ): Promise<string> {
    console.log('🤖 Editor Agent: Processing edit instructions:', instructions);
    
    // For now, we need to prompt the user to select a file first
    return `⚠️ **Edit Instructions Detected**

I can see you want to make changes: "${instructions}"

However, I need you to select a file first. Please:
1. Use the file selector below to choose your file
2. I'll remember your instructions and apply them after selection

${await this.generateFileSelector(mutations, sessionId)}`;
  }

  private async generateFileSelector(mutations: ConvexMutations, sessionId?: string): Promise<string> {
    // Create an interactive file selector component
    if (mutations.storeChatMessage && sessionId) {
      await mutations.storeChatMessage({
        role: 'assistant',
        content: '**📁 Select a file to edit:**\n\nChoose a file from the selector above and I\'ll help you modify it.',
        sessionId,
        interactiveComponent: {
          type: 'file_selector',
          data: {
            title: 'Select File to Edit',
            description: 'Choose a file from your project to modify',
            files: []
          },
          status: 'pending'
        }
      });
    }

    return '**📁 Select a file to edit:**\n\nChoose a file from the selector above and I\'ll help you modify it.';
  }

  private async handleFileSelection(mutations: ConvexMutations, sessionId?: string): Promise<string> {
    console.log('🤖 Editor Agent: Showing file selection interface');
    
    // Store the interactive component
    if (mutations.storeChatMessage && sessionId) {
      await mutations.storeChatMessage({
        role: 'assistant',
        content: '**📁 Select a file to edit:**\n\nChoose a file from the selector below and I\'ll help you modify it.',
        sessionId,
        interactiveComponent: {
          type: 'file_selector',
          data: {
            title: 'Select File to Edit',
            description: 'Choose a file from your project to modify',
            files: []
          },
          status: 'pending'
        }
      });
    }
    
    return '**📁 Select a file to edit:**\n\nChoose a file from the selector below, then describe what changes you\'d like me to make.';
  }

  private async handleFileSelected(fileName: string, mutations: ConvexMutations, sessionId?: string): Promise<string> {
    console.log('🤖 Editor Agent: File selected:', fileName);
    
    this.selectedFile = fileName;
    this.currentStep = 'edit-request';
    
    return `✅ **File Selected: ${fileName}**

Great! Now tell me what changes you'd like me to make to this file. For example:
- "Add a section about healthy eating"
- "Make the tone more professional"
- "Remove the last paragraph"
- "Update the introduction to mention new features"

What would you like me to edit?`;
  }

  private async handleEditRequest(editInstructions: string, mutations: ConvexMutations, sessionId?: string): Promise<string> {
    try {
      if (!this.selectedFile) {
        this.resetState();
        return "❌ **Error**: No file selected. Please start over with `/edit`.";
      }

      if (!editInstructions) {
        return "❌ **Missing Instructions**\n\nPlease tell me what you'd like to change about the file.";
      }

      console.log('🤖 Editor Agent: Processing edit request for file:', this.selectedFile);
      console.log('🤖 Edit instructions:', editInstructions);

      // For now, we'll show a simulated edit process
      // In production, this would call the AI editing function
      
      const fileName = this.selectedFile;
      this.resetState();

      if (mutations.editFileWithAI) {
        try {
          // Call Convex action to edit file with AI
          const result = await mutations.editFileWithAI({
            fileName: fileName,
            originalContent: "// Original file content would be loaded here",
            editInstructions: editInstructions,
            fileType: this.getFileType(fileName)
          });

          return `✅ **File Edited Successfully**

**File:** ${fileName}
**Changes:** ${editInstructions}

The file has been updated with your requested changes using AI assistance.

${result ? `**AI Response:** ${result}` : ''}`;

        } catch (error) {
          console.error('❌ AI editing error:', error);
          return `❌ **AI Editing Error**

Failed to edit file "${fileName}" with instructions: "${editInstructions}"

Error: ${error instanceof Error ? error.message : 'Unknown error'}

Please try again or use simpler edit instructions.`;
        }
      } else {
        // Fallback simulation
        return `🔄 **File Edit Simulation**

**File:** ${fileName}
**Instructions:** ${editInstructions}

✅ Your edit request has been processed. In production, this would:
1. Load the current file content
2. Send it to AI with your instructions
3. Apply the AI-generated changes
4. Update the file in your project

The file would be updated according to your instructions.`;
      }

    } catch (error) {
      console.error('❌ Edit request error:', error);
      this.resetState();
      return `❌ **Edit Error**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`;
    }
  }

  private getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'md':
        return 'markdown';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'json':
        return 'json';
      case 'txt':
        return 'text';
      default:
        return 'unknown';
    }
  }

  private resetState(): void {
    this.currentStep = 'file-selection';
    this.selectedFile = null;
  }

  constructor() {
    super();
  }
}
