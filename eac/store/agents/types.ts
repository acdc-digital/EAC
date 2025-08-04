// Agent Store Types
// /Users/matthewsimon/Projects/eac/eac/store/agents/types.ts

export interface Agent {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  tools: AgentTool[];
  icon: string; // Use string identifier for icon names (e.g., 'FileText', 'Bot', etc.)
}

export interface AgentTool {
  id: string;
  name: string;
  command: string; // slash command to trigger
  description: string;
  parameters?: AgentToolParameter[];
}

export interface AgentToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  description: string;
  required: boolean;
  options?: string[]; // for select type
}

export interface AgentExecution {
  id: string;
  agentId: string;
  toolId: string;
  timestamp: Date;
  input: string;
  output?: string;
  status: 'pending' | 'completed' | 'error';
  error?: string;
}

export interface ConvexMutations {
  ensureInstructionsProject: () => Promise<unknown>;
  createInstructionFile?: (params: {
    name: string;
    content: string;
    topic?: string;
    audience?: string;
  }) => Promise<unknown>;
  createProject?: (params: {
    name: string;
    description?: string;
    status?: 'active' | 'completed' | 'on-hold';
    budget?: number;
  }) => Promise<unknown>;
  getProjects?: () => Promise<any[]>; // Add getProjects query
  createFile?: (params: {
    name: string;
    type: 'post' | 'campaign' | 'note' | 'document' | 'image' | 'video' | 'other';
    projectId: string;
    content?: string;
    extension?: string;
    platform?: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'reddit' | 'youtube';
    size?: number;
  }) => Promise<unknown>;
  upsertPost: (params: {
    fileName: string;
    fileType: 'reddit' | 'twitter';
    content: string;
    title?: string;
    platformData?: string;
    status?: 'draft' | 'scheduled' | 'posting' | 'posted' | 'failed';
    scheduledFor?: number;
    userId?: string;
  }) => Promise<unknown>;
  createContentCreationFile: (params: {
    name: string;
    content: string;
    type?: 'post' | 'campaign' | 'note' | 'document' | 'other';
    platform?: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'reddit' | 'youtube';
    extension?: string;
  }) => Promise<unknown>;
  getAllPosts: () => Promise<any[]>;
  schedulePost: (params: {
    fileName: string;
    fileType: 'reddit' | 'twitter';
    content: string;
    title?: string;
    platformData?: string;
    scheduledFor: number;
    userId?: string;
  }) => Promise<unknown>;
}

export interface AgentState {
  // State
  agents: Agent[];
  activeAgentId: string | null;
  executions: AgentExecution[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addAgent: (agent: Omit<Agent, 'id'>) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  setActiveAgent: (id: string | null) => void;
  executeAgentTool: (agentId: string, toolId: string, input: string, convexMutations?: ConvexMutations) => Promise<string>;
  addExecution: (execution: Omit<AgentExecution, 'id' | 'timestamp'>) => void;
  clearExecutions: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  refreshAgents: () => void;
}
