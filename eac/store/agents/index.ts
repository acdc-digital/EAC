// Agent Store
// /Users/matthewsimon/Projects/eac/eac/store/agents/index.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Agent, AgentExecution, AgentState, AgentTool, ConvexMutations } from './types';

// Initial agents - starting with the Instructions agent
const initialAgents: Agent[] = [
  {
    id: 'instructions',
    name: 'Instructions',
    description: 'Generate and maintain project instructions and documentation',
    isActive: false,
    icon: '📚',
    tools: [
      {
        id: 'generate-instructions',
        name: 'Generate Instructions',
        command: '/instructions',
        description: 'Create a new instruction document for the project',
        parameters: [
          {
            name: 'topic',
            type: 'string',
            description: 'Topic or area to create instructions for',
            required: true
          },
          {
            name: 'audience',
            type: 'select',
            description: 'Target audience for the instructions',
            required: false,
            options: ['developers', 'users', 'administrators', 'general']
          }
        ]
      }
    ]
  }
];

export const useAgentStore = create<AgentState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        agents: initialAgents,
        activeAgentId: null,
        executions: [],
        isLoading: false,
        error: null,

        // Actions
        addAgent: (agentData: Omit<Agent, 'id'>) => {
          const newAgent: Agent = {
            ...agentData,
            id: crypto.randomUUID(),
          };
          
          set((state) => ({
            agents: [...state.agents, newAgent]
          }), false, 'addAgent');
        },

        updateAgent: (id: string, updates: Partial<Agent>) => {
          set((state) => ({
            agents: state.agents.map(agent =>
              agent.id === id ? { ...agent, ...updates } : agent
            )
          }), false, 'updateAgent');
        },

        deleteAgent: (id: string) => {
          set((state) => ({
            agents: state.agents.filter(agent => agent.id !== id),
            activeAgentId: state.activeAgentId === id ? null : state.activeAgentId
          }), false, 'deleteAgent');
        },

        setActiveAgent: (id: string | null) => {
          // First deactivate all agents
          set((state) => ({
            agents: state.agents.map(agent => ({ ...agent, isActive: false })),
            activeAgentId: id
          }), false, 'deactivateAllAgents');

          // Then activate the selected agent if provided
          if (id) {
            set((state) => ({
              agents: state.agents.map(agent =>
                agent.id === id ? { ...agent, isActive: true } : agent
              )
            }), false, 'activateAgent');
          }
        },

        executeAgentTool: async (agentId: string, toolId: string, input: string, convexMutations?: ConvexMutations): Promise<string> => {
          const { agents, addExecution } = get();
          const agent = agents.find(a => a.id === agentId);
          const tool = agent?.tools.find(t => t.id === toolId);

          if (!agent || !tool) {
            throw new Error(`Agent or tool not found: ${agentId}/${toolId}`);
          }

          set({ isLoading: true, error: null });

          try {
            // Add execution record
            const executionId = crypto.randomUUID();
            addExecution({
              agentId,
              toolId,
              input,
              status: 'pending'
            });

            // Execute the agent tool based on agent type
            let result = '';
            
            if (agent.id === 'instructions') {
              result = await executeInstructionsAgent(tool, input, convexMutations);
            } else {
              throw new Error(`Unknown agent type: ${agent.id}`);
            }

            // Update execution with result
            set((state) => ({
              executions: state.executions.map(exec =>
                exec.id === executionId 
                  ? { ...exec, output: result, status: 'completed' as const }
                  : exec
              ),
              isLoading: false
            }));

            return result;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            // Update execution with error
            set((state) => ({
              executions: state.executions.map(exec =>
                exec.agentId === agentId && exec.toolId === toolId && exec.input === input
                  ? { ...exec, status: 'error' as const, error: errorMessage }
                  : exec
              ),
              isLoading: false,
              error: errorMessage
            }));

            throw error;
          }
        },

        addExecution: (executionData: Omit<AgentExecution, 'id' | 'timestamp'>) => {
          const execution: AgentExecution = {
            ...executionData,
            id: crypto.randomUUID(),
            timestamp: new Date()
          };

          set((state) => ({
            executions: [execution, ...state.executions.slice(0, 99)] // Keep last 100 executions
          }), false, 'addExecution');
        },

        clearExecutions: () => {
          set({ executions: [] }, false, 'clearExecutions');
        },

        setError: (error: string | null) => {
          set({ error }, false, 'setError');
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading }, false, 'setLoading');
        },

        reset: () => {
          set({
            agents: initialAgents,
            activeAgentId: null,
            executions: [],
            isLoading: false,
            error: null
          }, false, 'reset');
        }
      }),
      {
        name: 'agent-storage',
        partialize: (state) => ({
          agents: state.agents,
          activeAgentId: state.activeAgentId,
          executions: state.executions.slice(0, 50) // Only persist last 50 executions
        })
      }
    ),
    { name: 'agent-store' }
  )
);

// Instructions Agent Tool Execution
async function executeInstructionsAgent(tool: AgentTool, input: string, convexMutations?: ConvexMutations): Promise<string> {
  if (tool.id === 'generate-instructions') {
    // Clean the input by removing the command and extracting the actual instruction
    let cleanInput = input.trim();
    
    // Remove the /instructions command if present
    if (cleanInput.startsWith('/instructions')) {
      cleanInput = cleanInput.replace('/instructions', '').trim();
    }
    
    // Extract audience if specified
    const audienceMatch = cleanInput.match(/audience:\s*(.+?)$/i);
    const audience = audienceMatch?.[1]?.trim() || 'all users';
    
    // Remove audience specification from the instruction content
    const instructionContent = cleanInput.replace(/\s+audience:\s*.+$/i, '').trim();
    
    if (!instructionContent) {
      return `❌ Please provide instruction content. Example: /instructions always say welcome to the EAC`;
    }
    
    // Generate a brief filename (1-2 words) based on the actual user request
    const briefTitle = generateBriefTitle(instructionContent);
    const filename = briefTitle; // Don't add .md here since createNewFile will add it
    
    // Create the actual instruction document content
    const documentContent = generateInstructionDocument(instructionContent, audience);
    
    try {
      // Try to use Convex mutations if available
      if (convexMutations) {
        // Ensure Instructions project exists
        await convexMutations.ensureInstructionsProject();
        
        // Create the instruction file in Convex database
        await convexMutations.createInstructionFile({
          name: filename,
          content: documentContent,
          topic: briefTitle,
          audience: audience,
        });
        
        // Store in local editor for immediate display in the existing Instructions folder
        const { useEditorStore } = await import('@/store');
        const editorStore = useEditorStore.getState();
        
        // Create file in the Instructions folder using the correct folder ID
        await editorStore.createNewFile(filename, 'markdown', 'project', 'instructions-folder');
        
        // The createNewFile function automatically opens the file, now we need to update its content
        // Find the newly created file and update its content
        const updatedState = useEditorStore.getState();
        const newFile = updatedState.projectFiles.find(file => 
          file.name === `${filename}.md` && file.folderId === 'instructions-folder'
        );
        
        if (newFile) {
          // Update the file content with our instruction document
          editorStore.updateFileContent(newFile.id, documentContent);
        }
        
        return `✅ Instructions document created successfully!

**File**: ${filename}.md
**Instruction**: ${instructionContent}
**Audience**: ${audience}
**Location**: Instructions project folder (synced to database)

The instruction has been added to your Instructions folder and will be used as context for all future AI conversations.

**Preview**:
${documentContent.substring(0, 150)}...`;
      } else {
        // Fallback to local creation if Convex mutations not available
        const { useEditorStore } = await import('@/store');
        const editorStore = useEditorStore.getState();
        
        // Create file in the Instructions folder
        await editorStore.createNewFile(filename, 'markdown', 'project', 'instructions-folder');
        
        // The createNewFile function automatically opens the file, now we need to update its content
        // Find the newly created file and update its content
        const updatedState = useEditorStore.getState();
        const newFile = updatedState.projectFiles.find(file => 
          file.name === `${filename}.md` && file.folderId === 'instructions-folder'
        );
        
        if (newFile) {
          // Update the file content with our instruction document
          editorStore.updateFileContent(newFile.id, documentContent);
        }
        
        return `✅ Instructions document created locally!

**File**: ${filename}.md
**Instruction**: ${instructionContent}
**Audience**: ${audience}
**Location**: Instructions project folder

The instruction has been added to your Instructions folder.

**Note**: To enable database sync, use the Instructions agent from a connected component.`;
      }
      
    } catch (error) {
      console.error('Error creating instruction file:', error);
      
      return `❌ Failed to create instruction document

**Error**: ${error instanceof Error ? error.message : 'Unknown error'}
**Instruction**: ${instructionContent}

Please try again or contact support if the issue persists.`;
    }
  }

  throw new Error(`Unknown tool: ${tool.id}`);
}

// Generate a brief title (1-2 words) from instruction content
function generateBriefTitle(instructionContent: string): string {
  const content = instructionContent.toLowerCase().trim();
  
  // Extract key action words and concepts to form meaningful titles
  const titleWords: string[] = [];
  
  // Look for action patterns
  if (content.includes('always say') || content.includes('say')) {
    const sayMatch = content.match(/(?:always\s+)?say\s+["']?([^"'.,!?]+)/i);
    if (sayMatch) {
      const phrase = sayMatch[1].trim().split(' ').slice(0, 2).join('-');
      return phrase.replace(/[^\w-]/g, '').toLowerCase() || 'greeting';
    }
    titleWords.push('greeting');
  }
  
  if (content.includes('welcome')) {
    titleWords.push('welcome');
  }
  
  if (content.includes('professional') || content.includes('formal')) {
    titleWords.push('professional');
  }
  
  if (content.includes('friendly') || content.includes('casual')) {
    titleWords.push('friendly');
  }
  
  if (content.includes('detailed') || content.includes('explain')) {
    titleWords.push('detailed');
  }
  
  if (content.includes('code') || content.includes('example')) {
    titleWords.push('code');
  }
  
  if (content.includes('format') || content.includes('style')) {
    titleWords.push('format');
  }
  
  if (content.includes('response') || content.includes('answer')) {
    titleWords.push('response');
  }
  
  // If we found meaningful words, use them
  if (titleWords.length > 0) {
    return titleWords.slice(0, 2).join('-');
  }
  
  // Fallback: extract the most meaningful words from the instruction
  const words = content
    .replace(/[^\w\s]/g, ' ')
    .split(' ')
    .filter(word => 
      word.length > 2 && 
      !['the', 'and', 'for', 'with', 'that', 'this', 'always', 'never', 'should', 'will', 'can', 'may', 'when', 'where', 'how', 'what', 'why'].includes(word)
    )
    .slice(0, 2);
  
  if (words.length >= 2) {
    return `${words[0]}-${words[1]}`;
  } else if (words.length === 1) {
    return `${words[0]}-instruction`;
  }
  
  return 'custom-instruction';
}

// Generate the actual instruction document content
function generateInstructionDocument(instructionContent: string, audience: string): string {
  const currentDate = new Date().toLocaleDateString();
  
  return `# AI Instruction

**Created**: ${currentDate}  
**Audience**: ${audience}  
**Project**: EAC Financial Dashboard

## Instruction

${instructionContent}

## Context

This instruction should be applied to all responses when assisting with the EAC Financial Dashboard project.

## Implementation

The AI assistant should incorporate this instruction into every response, regardless of whether MCP tools or agent tools are being used.

---

*This instruction is automatically loaded as context for all AI conversations.*`;
}
