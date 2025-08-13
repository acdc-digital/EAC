// Agent Registry
// /Users/matthewsimon/Projects/eac/eac/store/agents/registry.ts

import { BaseAgent } from './base';
import { cmoAgent } from './cmoAgent';
import { directorAgent } from './directorAgent';
import { editorAgent } from './editorAgent';
import { fileCreatorAgent } from './fileCreatorAgent';
import { instructionsAgent } from './instructionsAgent';
import { onboardingAgent } from './onboardingAgent';
import { projectCreatorAgent } from './projectCreatorAgent';
import { schedulingAgent } from './schedulingAgent';

/**
 * Central registry for all available agents
 */
export class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map();
  // Legacy command aliases (to be removed after deprecation window)
  private legacyCommandAliases: Record<string, string> = {
    'create': '/create-project',
    'create-project': '/create-project', // normalize if already partially migrated
    'create-file': '/create-file'
  };

  constructor() {
    console.log('🤖 Agent Registry: Initializing...');
    this.registerAgent(onboardingAgent);
    console.log('🤖 Registered:', onboardingAgent.id, onboardingAgent.name);
    this.registerAgent(instructionsAgent);
    console.log('🤖 Registered:', instructionsAgent.id, instructionsAgent.name);
    this.registerAgent(schedulingAgent);
    console.log('🤖 Registered:', schedulingAgent.id, schedulingAgent.name);
    this.registerAgent(projectCreatorAgent);
    console.log('🤖 Registered:', projectCreatorAgent.id, projectCreatorAgent.name);
    this.registerAgent(fileCreatorAgent);
    console.log('🤖 Registered:', fileCreatorAgent.id, fileCreatorAgent.name);
    this.registerAgent(editorAgent);
    console.log('🤖 Registered:', editorAgent.id, editorAgent.name);
    this.registerAgent(cmoAgent);
    console.log('🤖 Registered:', cmoAgent.id, cmoAgent.name);
    this.registerAgent(directorAgent);
    console.log('🤖 Registered:', directorAgent.id, directorAgent.name);
    console.log('🤖 Total agents registered:', this.agents.size);
  }
  

  /**
   * Register a new agent
   */
  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Get an agent by ID
   */
  getAgent(id: string): BaseAgent | undefined {
    return this.agents.get(id);
  }

  /**
   * Get all available agents
   */
  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get all agent tools (flattened)
   */
  getAllTools() {
    const tools: Array<{ agent: BaseAgent; tool: any }> = [];
    
    for (const agent of this.agents.values()) {
      for (const tool of agent.tools) {
        tools.push({ agent, tool });
      }
    }
    
    return tools;
  }

  /**
   * Find agent by tool command
   */
  findAgentByCommand(command: string): { agent: BaseAgent; tool: any } | undefined {
    // Normalize legacy aliases first
    const normalized = this.legacyCommandAliases[command] || command;
    for (const agent of this.agents.values()) {
      const tool = agent.tools.find(t => t.command === normalized);
      if (tool) return { agent, tool };
    }
    return undefined;
  }

  /**
   * Execute an agent tool
   */
  async executeAgent(
    agentId: string,
    toolId: string,
    input: string,
    convexMutations: any,
    sessionId?: string
  ): Promise<string> {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const tool = agent.tools.find(t => t.id === toolId);
    if (!tool) {
      throw new Error(`Tool not found: ${toolId} for agent ${agentId}`);
    }

    return await agent.execute(tool, input, convexMutations, sessionId);
  }

  /**
   * Execute agent by command (legacy support)
   */
  async executeByCommand(
    command: string,
    input: string,
    convexMutations: any
  ): Promise<string> {
    const result = this.findAgentByCommand(command);
    if (!result) {
      throw new Error(`No agent found for command: ${command}`);
    }

    return await result.agent.execute(result.tool, input, convexMutations);
  }
}

/**
 * Singleton agent registry instance
 */
export const agentRegistry = new AgentRegistry();

/**
 * Legacy support functions for backward compatibility
 */
export async function executeInstructionsAgent(
  input: string,
  convexMutations: any
): Promise<string> {
  return await agentRegistry.executeAgent(
    'instructions',
    'generate-instructions',
    input,
    convexMutations
  );
}

export async function executeTwitterPostAgent(
  input: string,
  convexMutations: any
): Promise<string> {
  return await agentRegistry.executeAgent(
    'twitter-post',
    'create-twitter-post',
    input,
    convexMutations
  );
}

/**
 * Get all available agents for UI display
 */
export function getAvailableAgents() {
  return agentRegistry.getAllAgents().map(agent => {
    // Use the agent's toAgent method which includes disabled state
    const agentData = agent.toAgent(false); // false means not active by default
    console.log(`🔍 Agent ${agent.id} disabled state:`, agentData.disabled, agentData.disabledReason);
    return agentData;
  });
}

/**
 * Get available commands for autocomplete
 */
export function getAvailableCommands(): string[] {
  const commands: string[] = [];
  
  for (const agent of agentRegistry.getAllAgents()) {
    for (const tool of agent.tools) {
      commands.push(tool.command);
    }
  }
  
  return commands;
}

/**
 * Legacy support function for project creator agent
 */
export async function executeProjectCreatorAgent(
  input: string,
  convexMutations: any
): Promise<string> {
  return await agentRegistry.executeAgent(
    'project-creator',
    'create-project-with-files',
    input,
    convexMutations
  );
}

/**
 * Legacy support function for CMO agent
 */
export async function executeCMOAgent(
  input: string,
  convexMutations: any,
  sessionId?: string
): Promise<string> {
  return await agentRegistry.executeAgent(
    'cmo',
    'define-campaign',
    input,
    convexMutations,
    sessionId
  );
}
