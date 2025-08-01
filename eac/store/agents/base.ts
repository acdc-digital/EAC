// Base Agent Types and Interfaces
// /Users/matthewsimon/Projects/eac/eac/store/agents/base.ts

import { ConvexMutations } from './types';

export interface AgentParameter {
  name: string;
  type: "string" | "number" | "boolean" | "select";
  description: string;
  required: boolean;
  options?: string[]; // For select type
  default?: any;
}

export interface AgentTool {
  id: string;
  name: string;
  command: string;
  description: string;
  parameters: AgentParameter[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  icon: string;
  tools: AgentTool[];
}

export interface AgentExecution {
  id: string;
  agentId: string;
  toolId: string;
  input: string;
  output?: string;
  status: "pending" | "running" | "completed" | "error";
  error?: string;
  timestamp: Date;
}

// Base Agent Executor Interface
export interface AgentExecutor {
  id: string;
  name: string;
  description: string;
  icon: string;
  tools: AgentTool[];
  execute: (
    tool: AgentTool,
    input: string,
    convexMutations: ConvexMutations
  ) => Promise<string>;
}

// Base Agent Class
export abstract class BaseAgent implements AgentExecutor {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract icon: string;
  abstract tools: AgentTool[];

  abstract execute(
    tool: AgentTool,
    input: string,
    convexMutations: ConvexMutations
  ): Promise<string>;

  // Helper method to convert to Agent interface
  toAgent(isActive: boolean = false): Agent {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      isActive,
      icon: this.icon,
      tools: this.tools,
    };
  }
}

// Agent State Interface
export interface AgentState {
  agents: Agent[];
  activeAgentId: string | null;
  executions: AgentExecution[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addAgent: (agentData: Omit<Agent, "id">) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  setActiveAgent: (id: string | null) => void;
  executeAgent: (
    agentId: string,
    toolId: string,
    input: string,
    convexMutations: ConvexMutations
  ) => Promise<string>;
  addExecution: (executionData: Omit<AgentExecution, "id" | "timestamp">) => void;
  clearExecutions: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}
