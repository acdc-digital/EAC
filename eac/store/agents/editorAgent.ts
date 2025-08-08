// Editor Agent
// Edits existing files (instructions and project files) with AI assistance

import { AgentTool, BaseAgent } from './base';
import { ConvexMutations } from './types';

export class EditorAgent extends BaseAgent {
  id = 'editor';
  name = 'Editor';
  description = 'Edit existing instruction documents and project files with AI assistance';
  icon = '📝';
  
  // Static properties for maintaining state across invocations
  static selectedFile: string | null = null;
  static currentStep: 'file-selection' | 'edit-request' | 'processing' = 'file-selection';
  static instructions: string | null = null;

  tools: AgentTool[] = [
    {
      id: 'edit-file',
      name: 'Edit File',
      command: '/edit',
      description: 'Edit an existing file with AI assistance',
      parameters: [
        {
          name: 'instructions',
          type: 'string',
          description: 'Instructions for how to edit the file',
          required: true,
        },
      ],
    },
  ];

  async execute(
    tool: AgentTool,
    input: string,
    convexMutations: ConvexMutations,
    sessionId?: string
  ): Promise<string> {
    console.log(`🤖 Editor Agent: Processing input: ${input}`);
    console.log(`🔍 Current state - selectedFile: ${EditorAgent.selectedFile}, step: ${EditorAgent.currentStep}`);

    if (tool.id === 'edit-file' || tool.command === '/edit') {
      // Check if we have a selected file and are processing edit instructions
      if (EditorAgent.selectedFile && EditorAgent.currentStep === 'edit-request') {
        console.log(`📝 Editor Agent: Processing edit instructions for file: ${EditorAgent.selectedFile}`);
        EditorAgent.instructions = input;
        EditorAgent.currentStep = 'processing';

        // Process the edit request
        const result = await this.processEdit(EditorAgent.selectedFile, input, convexMutations);
        
        // Reset state
        EditorAgent.selectedFile = null;
        EditorAgent.currentStep = 'file-selection';
        EditorAgent.instructions = null;

        return result;
      } else {
        // Show file selection interface
        console.log('🤖 Editor Agent: Showing file selection interface');
        EditorAgent.currentStep = 'file-selection';
        
        if (sessionId && convexMutations.storeChatMessage) {
          await convexMutations.storeChatMessage({
            role: 'assistant',
            content: '**📁 Select a file to edit:**\n\nChoose a file from the selector below and I\'ll help you modify it.',
            sessionId,
            interactiveComponent: {
              type: 'file_selector',
              status: 'pending',
              data: {
                purpose: 'editing',
                includeDirectories: false
              }
            }
          });
        }

        return '**📁 Select a file to edit:**\n\nChoose a file from the selector below, then describe what changes you\'d like me to make.';
      }
    }

    throw new Error(`Unknown tool: ${tool.id || tool.command}`);
  }

  private async processEdit(filePath: string, instructions: string, convexMutations?: ConvexMutations): Promise<string> {
    console.log('🔧 Editor Agent: Processing edit for file:', filePath, 'with instructions:', instructions);
    
    try {
      // Get the current file content from the editor store
      const { useEditorStore } = await import('@/store/editor');
      const { projectFiles } = useEditorStore.getState();
      
      // Find the file in the project files
      const file = projectFiles.find(f => 
        f.name === filePath || 
        f.filePath === filePath || 
        f.id === filePath
      );
      
      if (!file) {
        return `❌ **Error: File not found**\n\nCould not find file \`${filePath}\` in the project files.`;
      }
      
      const originalContent = file.content || '';
      console.log('📄 Original file content length:', originalContent.length);
      
      // Use AI to edit the file content if available
      if (convexMutations?.editFileWithAI) {
        console.log('🤖 Using AI to edit file content...');
        
        const editedContent = await convexMutations.editFileWithAI({
          fileName: file.name,
          originalContent,
          editInstructions: instructions,
          fileType: file.type
        });
        
        console.log('✨ AI edit completed, new content length:', editedContent.length);
        
        // Update the file content in Convex database if updateFileContent is available
        if (convexMutations?.updateFileContent && file.id) {
          console.log('� Updating file content in database...');
          await convexMutations.updateFileContent({
            fileId: file.id,
            content: editedContent
          });
        }
        
        // Update the local editor store with the new content
        const { updateFileContentInStore, openTabs, updateFileContent } = useEditorStore.getState();
        if (updateFileContentInStore) {
          updateFileContentInStore(file.id, editedContent);
          console.log('✅ Local file content updated in store');
        }
        
        // Also update any open tabs for this file
        const openTab = openTabs.find(tab => tab.id === file.id || tab.name === file.name);
        if (openTab && updateFileContent) {
          updateFileContent(openTab.id, editedContent);
          console.log('✅ Open tab content updated');
        }
        
        return `## ✅ File Edit Completed

**File:** \`${file.name}\`
**Instructions:** ${instructions}

**📋 Changes Applied:**
- Original content: ${originalContent.length} characters
- Updated content: ${editedContent.length} characters
- AI-powered editing completed
- File content updated in both database and editor

**✨ Want to make more edits?** Use \`/edit\` again to select another file.`;
        
      } else {
        // Fallback: Show what would happen without AI editing
        console.log('⚠️ AI editing not available, showing simulation');
        
        return `## ⚠️ File Edit Simulation

**File:** \`${file.name}\`
**Instructions:** ${instructions}

**Current Content Preview:**
\`\`\`
${originalContent.substring(0, 200)}${originalContent.length > 200 ? '...' : ''}
\`\`\`

**Status:** AI editing service not available

**📋 What would happen with full AI integration:**
1. ✅ File found: \`${file.name}\` (${originalContent.length} characters)
2. 🤖 Send content + instructions to AI service
3. ✨ Apply AI-generated improvements
4. 💾 Save updated content to database and editor

**✨ Want to make more edits?** Use \`/edit\` again to select another file.`;
      }
      
    } catch (error) {
      console.error('❌ Error processing file edit:', error);
      
      return `## ❌ File Edit Error

**File:** \`${filePath}\`
**Instructions:** ${instructions}

**Error:** ${error instanceof Error ? error.message : 'Unknown error occurred'}

**Please try again** or contact support if the issue persists.`;
    }
  }

  /**
   * Handle file selection from FileSelector component
   */
  async handleFileSelected(sessionId: string, fileData: any): Promise<void> {
    console.log('🎯 [EditorAgent] File selected:', fileData);
    
    // Store the selected file path
    EditorAgent.selectedFile = fileData.name || fileData.path || fileData.id;
    EditorAgent.currentStep = 'edit-request';
    
    try {
      // Open the file as a tab in the editor dashboard
      const { useEditorStore } = await import('@/store/editor');
      const { projectFiles, openTab } = useEditorStore.getState();
      
      console.log('📂 [EditorAgent] Editor store imported successfully');
      console.log('📂 [EditorAgent] Available project files:', projectFiles.length);
      console.log('📂 [EditorAgent] FileData object:', {
        id: fileData?.id,
        name: fileData?.name, 
        type: fileData?.type,
        hasContent: !!fileData?.content,
        contentLength: fileData?.content?.length || 0,
        filePath: fileData?.filePath,
        hasCreatedAt: !!fileData?.createdAt,
        hasModifiedAt: !!fileData?.modifiedAt || !!fileData?.updatedAt,
        category: fileData?.category,
        icon: fileData?.icon
      });
      
      // Find the file in the project files store which has all required ProjectFile properties
      let fileToOpen = projectFiles.find(file => 
        file.name === fileData.name || 
        file.filePath === fileData.filePath || 
        file.id === fileData.id
      );
      
      if (fileToOpen) {
        console.log('📂 [EditorAgent] Found file in project files store');
        console.log('📂 [EditorAgent] Opening file tab:', fileToOpen.name);
        console.log('📂 [EditorAgent] File details from store:', {
          id: fileToOpen.id,
          name: fileToOpen.name,
          type: fileToOpen.type,
          category: fileToOpen.category,
          hasIcon: !!fileToOpen.icon,
          contentLength: fileToOpen.content?.length || 0,
          hasCreatedAt: !!fileToOpen.createdAt,
          hasModifiedAt: !!fileToOpen.modifiedAt
        });
        
        console.log('📂 [EditorAgent] Calling openTab function...');
        openTab(fileToOpen);
        console.log('✅ [EditorAgent] File tab opened successfully');
      } else {
        console.warn('⚠️ [EditorAgent] Could not find file in project files store');
        console.log('📋 [EditorAgent] Looking for file with:', {
          targetName: fileData.name,
          targetFilePath: fileData.filePath,
          targetId: fileData.id
        });
        console.log('📋 [EditorAgent] Available files in store:', projectFiles.map(f => ({ 
          id: f.id, 
          name: f.name, 
          filePath: f.filePath,
          hasRequiredProps: !!(f.id && f.name && f.icon && f.type && f.category && f.createdAt && f.modifiedAt)
        })));
      }
    } catch (error) {
      console.error('❌ [EditorAgent] Error opening file tab:', error);
      console.error('❌ [EditorAgent] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        errorType: typeof error
      });
    }
    
    console.log('✅ [EditorAgent] Ready for edit instructions');
  }

  constructor() {
    super();
  }
}

// Export an instance of the agent for use in the registry
export const editorAgent = new EditorAgent();

