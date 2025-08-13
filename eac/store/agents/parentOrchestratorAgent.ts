// Parent Orchestrator Agent
// /Users/matthewsimon/Projects/eac/eac/store/agents/parentOrchestratorAgent.ts

import { useOnboardingStore } from '../onboarding';
import { AgentTool, BaseAgent } from './base';
import { agentRegistry } from './registry';
import { ConvexMutations } from './types';

export interface RoutingContext {
  userIntent: string;
  userHistory: string[];
  currentProject?: string;
  recentAgentActions: Array<{
    agentId: string;
    toolId: string;
    timestamp: Date;
    success: boolean;
  }>;
}

export interface AgentChain {
  steps: Array<{
    agentId: string;
    toolId: string;
    context: any;
  }>;
  currentStep: number;
  completed: boolean;
}

export class ParentOrchestratorAgent extends BaseAgent {
  id = 'parent-orchestrator';
  name = 'EAC Assistant';
  description = 'Your intelligent routing system that analyzes requests and connects you to the right agents and tools.';
  icon = 'Bot';
  
  // No custom tools - this agent only routes to existing agents
  tools: AgentTool[] = [];

  /**
   * Main execution method that handles intelligent routing
   * This agent doesn't have its own tools - it routes to existing agents
   */
  async execute(
    tool: AgentTool,
    input: string,
    mutations: ConvexMutations,
    sessionId?: string
  ): Promise<string> {
    // This should never be called since we have no tools
    // But if it is, route the input intelligently
    return await this.handleIntelligentRouting(input, mutations, sessionId);
  }

  /**
   * Primary method: Analyze user input and route to appropriate existing agent
   */
  async handleIntelligentRouting(
    input: string,
    mutations: ConvexMutations,
    sessionId?: string
  ): Promise<string> {
    try {
      console.log(`🎯 Parent Orchestrator: Analyzing input for routing:`, input);

      // Analyze user intent and find best matching agent
      const routingResult = await this.intelligentRouting(input, mutations);
      
      if (!routingResult) {
        return await this.handleUnknownIntent(input, mutations, sessionId);
      }

      const { agent, tool, confidence, reasoning } = routingResult;

      // High confidence - execute directly
      if (confidence >= 0.8) {
        console.log(`🎯 Parent Orchestrator: High confidence (${Math.round(confidence * 100)}%) routing to ${agent.name}`);
        
        try {
          // Execute the recommended agent directly
          const result = await agent.execute(tool, input, mutations, sessionId);
          return result;
        } catch (error) {
          console.error(`❌ Failed to execute ${agent.name}:`, error);
          // Fallback to suggestion if execution fails
          return `🎯 **Smart Routing**

Based on your request "${input}", I recommend using the **${agent.name}**.

**Quick Start:** \`${tool.command} ${input}\`

**What this does:** ${tool.description}

**Confidence:** ${Math.round(confidence * 100)}% match

**Note:** Automatic execution failed, please run the command manually.`;
        }
      }

      // Medium confidence - provide options
      if (confidence >= 0.5) {
        const alternatives = await this.getAlternativeAgents(input, mutations);
        
        return `🤔 **Multiple Options Available**

For "${input}", I suggest:

**Primary Recommendation:** **${agent.name}**
- Command: \`${tool.command} ${input}\`
- ${tool.description}
- Confidence: ${Math.round(confidence * 100)}%

**Alternative Options:**
${alternatives.slice(0, 2).map(alt => 
  `- **${alt.agent.name}**: \`${alt.tool.command}\` (${Math.round(alt.confidence * 100)}%)`
).join('\n')}

Which approach would you prefer?`;
      }

      // Low confidence - provide guidance
      return await this.handleLowConfidenceRouting(input, mutations, sessionId);

    } catch (error) {
      console.error('🔥 Parent Orchestrator Routing Error:', error);
      return await this.handleRoutingError(input, error, mutations, sessionId);
    }
  }

  /**
   * Intelligent routing system to match user intent with appropriate agents
   */
  private async intelligentRouting(
    userIntent: string,
    mutations: ConvexMutations
  ): Promise<{ agent: BaseAgent; tool: AgentTool; confidence: number; reasoning: string } | null> {
    const availableAgents = agentRegistry.getAllAgents();
    const intent = userIntent.toLowerCase();
    
    // Define routing rules with scoring
    const routingRules = [
      {
        triggers: ['twitter', 'tweet', 'social media', 'post', 'x.com', 'content'],
        agentId: 'twitter-post',
        score: 10,
        reasoning: 'Creating social media content'
      },
      {
        triggers: ['project', 'create project', 'new project', 'folder'],
        agentId: 'project-creator', 
        score: 10,
        reasoning: 'Creating a new project structure'
      },
      {
        triggers: ['instructions', 'guidelines', 'brand guide', 'rules'],
        agentId: 'instructions',
        score: 10,
        reasoning: 'Generating custom instructions and guidelines'
      },
      {
        triggers: ['schedule', 'calendar', 'plan', 'timing'],
        agentId: 'scheduling',
        score: 10,
        reasoning: 'Planning and scheduling content'
      },
      {
        triggers: ['file', 'create file', 'new file', 'document', 'help me create a file'],
        agentId: 'file-creator',
        score: 10,
        reasoning: 'Creating files within existing projects'
      },
      {
        triggers: ['campaign', 'marketing', 'strategy', 'cmo'],
        agentId: 'cmo',
        score: 10,
        reasoning: 'Marketing strategy and campaign planning'
      },
      {
        triggers: ['analyze', 'review', 'feedback', 'edit'],
        agentId: 'editor',
        score: 8,
        reasoning: 'Content editing and analysis'
      }
    ];

    // Score each agent based on triggers
    let bestMatch: { agent: BaseAgent; tool: AgentTool; score: number; reasoning: string } | null = null;
    
    for (const rule of routingRules) {
      const matchScore = rule.triggers.reduce((score, trigger) => {
        return intent.includes(trigger) ? score + rule.score : score;
      }, 0);
      
      if (matchScore > 0) {
        const agent = availableAgents.find(a => a.id === rule.agentId);
        if (agent && agent.tools.length > 0) {
          const tool = agent.tools[0]; // Use primary tool
          
          if (!bestMatch || matchScore > bestMatch.score) {
            bestMatch = { agent, tool, score: matchScore, reasoning: rule.reasoning };
          }
        }
      }
    }
    
    if (!bestMatch) return null;
    
    // Calculate confidence based on score and specificity
    const maxPossibleScore = Math.max(...routingRules.map(r => r.score));
    const confidence = Math.min(bestMatch.score / maxPossibleScore, 1.0);
    
    return {
      agent: bestMatch.agent,
      tool: bestMatch.tool,
      confidence,
      reasoning: bestMatch.reasoning
    };
  }

  /**
   * Handle unknown intents with helpful suggestions
   */
  private async handleUnknownIntent(
    input: string,
    mutations: ConvexMutations,
    sessionId?: string
  ): Promise<string> {
    const availableAgents = agentRegistry.getAllAgents().filter(a => !a.getDisabledState().disabled);
    
    return `🤔 **I'm not sure how to help with that**

I couldn't find a specific agent for "${input}".

**Available options:**
${availableAgents.slice(0, 4).map(agent => 
  `- **${agent.name}**: \`${agent.tools[0]?.command || agent.id}\``
).join('\n')}

**Try being more specific:**
- "create a file" → File Creator
- "twitter post" → Twitter Agent  
- "new project" → Project Creator
- "brand guidelines" → Instructions Agent

What would you like to do?`;
  }

  /**
   * Get alternative agents for ambiguous requests
   */
  private async getAlternativeAgents(
    input: string,
    mutations: ConvexMutations
  ): Promise<Array<{ agent: BaseAgent; tool: AgentTool; confidence: number }>> {
    const availableAgents = agentRegistry.getAllAgents();
    const alternatives: Array<{ agent: BaseAgent; tool: AgentTool; confidence: number }> = [];
    
    // Simple scoring for alternatives
    for (const agent of availableAgents) {
      if (agent.tools.length > 0) {
        const tool = agent.tools[0];
        const score = this.calculateRelevanceScore(input, agent, tool);
        if (score > 0.3) {
          alternatives.push({ agent, tool, confidence: score });
        }
      }
    }
    
    return alternatives.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate relevance score for agent/tool combination
   */
  private calculateRelevanceScore(input: string, agent: BaseAgent, tool: AgentTool): number {
    const keywords = input.toLowerCase().split(' ');
    const agentKeywords = [...agent.name.toLowerCase().split(' '), 
                          ...agent.description.toLowerCase().split(' '),
                          ...tool.description.toLowerCase().split(' ')];
    
    const matches = keywords.filter(keyword => 
      agentKeywords.some(agentKeyword => agentKeyword.includes(keyword))
    );
    
    return matches.length / keywords.length;
  }

  /**
   * Handle low confidence routing scenarios
   */
  private async handleLowConfidenceRouting(
    input: string,
    mutations: ConvexMutations,
    sessionId?: string
  ): Promise<string> {
    const availableAgents = agentRegistry.getAllAgents().filter(a => !a.getDisabledState().disabled);
    
    return `🎯 **Let me help you find the right tool**

For "${input}", here are your best options:

**Most Popular:**
${availableAgents.slice(0, 3).map(agent => 
  `- **${agent.name}**: \`${agent.tools[0]?.command || agent.id}\` - ${agent.description}`
).join('\n')}

**Quick Commands:**
- \`/create-project [name]\` - Start a new project
- \`/twitter [idea]\` - Create social content
- \`/create-file [description]\` - Create files

Which sounds closest to what you need?`;
  }

  /**
   * Handle routing errors gracefully
   */
  private async handleRoutingError(
    input: string,
    error: unknown,
    mutations: ConvexMutations,
    sessionId?: string
  ): Promise<string> {
    console.error('Routing error:', error);
    
    const availableAgents = agentRegistry.getAllAgents().filter(a => !a.getDisabledState().disabled);
    
    return `❌ **Routing System Temporarily Unavailable**

I encountered an issue while analyzing your request "${input}".

**Available direct commands:**
${availableAgents.slice(0, 4).map(agent => 
  `- \`${agent.tools[0]?.command || agent.id}\` - ${agent.name}`
).join('\n')}

**Quick fix:** Try using a direct command like \`/create-project\` or \`/twitter\`

The error has been logged and will be fixed soon.`;
  }

  /**
   * Override disabled state - always available after onboarding
   */
  getDisabledState(): { disabled: boolean; reason?: string } {
    const onboardingState = useOnboardingStore.getState();
    
    if (!onboardingState.isOnboardingComplete) {
      return {
        disabled: true,
        reason: "Complete onboarding first to access the EAC Assistant"
      };
    }
    
    return { disabled: false };
  }
}

// Export singleton instance
export const parentOrchestratorAgent = new ParentOrchestratorAgent();
