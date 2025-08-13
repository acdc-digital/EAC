// Enhanced Agent Store with Orchestration and Context Integration
// /Users/matthewsimon/Projects/eac/eac/store/agents/orchestration.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useOnboardingStore } from '../onboarding';
import type { AgentTool, BaseAgent } from './base';
import { useAgentContextStore } from './context';
import { agentRegistry } from './registry';
import type { ConvexMutations } from './types';

export interface OrchestrationState {
  // Post-onboarding guidance
  isPostOnboardingMode: boolean;
  postOnboardingMessage: string | null;
  hasShownPostOnboardingGuidance: boolean;
  
  // Intelligent routing
  lastUserIntent: string | null;
  suggestedAgents: Array<{
    agent: BaseAgent;
    tool: AgentTool;
    confidence: number;
    reason: string;
  }>;
  
  // Workflow orchestration
  isExecutingWorkflow: boolean;
  currentWorkflowId: string | null;
  workflowProgress: {
    currentStep: number;
    totalSteps: number;
    stepName: string;
  } | null;
  
  // Actions
  checkOnboardingCompletion: () => void;
  showPostOnboardingGuidance: () => void;
  dismissPostOnboardingGuidance: () => void;
  analyzeUserIntent: (input: string) => void;
  suggestNextActions: () => string[];
  executeIntelligentRouting: (input: string, mutations: ConvexMutations) => Promise<string>;
  createAndExecuteWorkflow: (goal: string, mutations: ConvexMutations) => Promise<string>;
  reset: () => void;
}

export const useOrchestrationStore = create<OrchestrationState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isPostOnboardingMode: false,
      postOnboardingMessage: null,
      hasShownPostOnboardingGuidance: false,
      lastUserIntent: null,
      suggestedAgents: [],
      isExecutingWorkflow: false,
      currentWorkflowId: null,
      workflowProgress: null,

      /**
       * Check if user just completed onboarding and should see guidance
       */
      checkOnboardingCompletion: () => {
        const onboardingState = useOnboardingStore.getState();
        const currentState = get();
        
        // If user just completed onboarding and hasn't seen guidance yet
        if (
          onboardingState.isOnboardingComplete && 
          !currentState.hasShownPostOnboardingGuidance &&
          onboardingState.currentStep === 'complete'
        ) {
          set({
            isPostOnboardingMode: true,
            postOnboardingMessage: generatePostOnboardingMessage(),
          });
        }
      },

      /**
       * Show post-onboarding guidance with personalized next steps
       */
      showPostOnboardingGuidance: () => {
        set({
          isPostOnboardingMode: true,
          hasShownPostOnboardingGuidance: true,
          postOnboardingMessage: generatePostOnboardingMessage(),
        });
      },

      /**
       * Dismiss post-onboarding guidance
       */
      dismissPostOnboardingGuidance: () => {
        set({
          isPostOnboardingMode: false,
          postOnboardingMessage: null,
          hasShownPostOnboardingGuidance: true,
        });
      },

      /**
       * Analyze user intent and suggest appropriate agents
       */
      analyzeUserIntent: (input: string) => {
        const suggestions = intelligentAgentSuggestion(input);
        set({
          lastUserIntent: input,
          suggestedAgents: suggestions,
        });
      },

      /**
       * Suggest next actions based on user progress
       */
      suggestNextActions: () => {
        const onboardingState = useOnboardingStore.getState();
        const contextStore = useAgentContextStore.getState();
        
        if (!onboardingState.isOnboardingComplete) {
          return [
            "Complete your onboarding with `/onboard [your-website-url]`",
            "Start with creating your first project: `/create-project [project name]`"
          ];
        }

        const recentActivity = contextStore.getRecentActivity(5);
        const hasRecentProjects = recentActivity.some(a => a.agent === 'project-creator');
        const hasRecentContent = recentActivity.some(a => a.agent === 'twitter-post');
        
        const suggestions = [];
        
        if (!hasRecentProjects) {
          suggestions.push("Create your first project: `/create-project [project name]`");
        }
        
        if (!hasRecentContent) {
          suggestions.push("Generate engaging content: `/twitter [content idea]`");
        }
        
        suggestions.push("Set up automated workflows: `/workflow [goal]`");
        suggestions.push("Check system status: `/status`");
        suggestions.push("Get personalized guidance: `/guide`");
        
        return suggestions.slice(0, 3);
      },

      /**
       * Execute intelligent routing based on user input
       */
      executeIntelligentRouting: async (input: string, mutations: ConvexMutations) => {
        const state = get();
        
        // First check if this should trigger the parent orchestrator
        if (shouldUseParentOrchestrator(input)) {
          const contextStore = useAgentContextStore.getState();
          const executionId = contextStore.trackExecution({
            agentId: 'parent-orchestrator',
            toolId: 'routing',
            command: '/route',
            input,
            status: 'running',
          });

          try {
            // Use registry's executeAgent method which handles the parent orchestrator special case
            const result = await agentRegistry.executeAgent(
              'parent-orchestrator',
              'routing',
              input,
              mutations
            );
            contextStore.completeExecution(executionId, result, Date.now());
            return result;
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            contextStore.failExecution(executionId, errorMsg, Date.now());
            throw error;
          }
        }

        // Analyze intent and suggest agents
        state.analyzeUserIntent(input);
        
        // If we have a high-confidence suggestion, route to it
        const bestSuggestion = state.suggestedAgents[0];
        if (bestSuggestion && bestSuggestion.confidence > 0.8) {
          const contextStore = useAgentContextStore.getState();
          const executionId = contextStore.trackExecution({
            agentId: bestSuggestion.agent.id,
            toolId: bestSuggestion.tool.id,
            command: bestSuggestion.tool.command,
            input,
            status: 'running',
          });

          try {
            const result = await bestSuggestion.agent.execute(bestSuggestion.tool, input, mutations);
            contextStore.completeExecution(executionId, result, Date.now());
            return result;
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            contextStore.failExecution(executionId, errorMsg, Date.now());
            throw error;
          }
        }

        // If no clear routing, suggest parent orchestrator
        return `🤖 **Need Help Routing Your Request?**

I'm not sure which agent would be best for: "${input}"

**Suggested next steps:**
- Try \`/guide\` for personalized recommendations  
- Use \`/help [topic]\` for specific guidance
- Check \`/status\` to see all available tools

**Quick suggestions:**
${state.suggestNextActions().map(s => `- ${s}`).join('\n')}`;
      },

      /**
       * Create and execute automated workflows
       */
      createAndExecuteWorkflow: async (goal: string, mutations: ConvexMutations) => {
        const contextStore = useAgentContextStore.getState();
        
        // Create workflow plan
        const workflowPlan = createWorkflowPlan(goal);
        const workflowId = contextStore.createWorkflow({
          name: `Auto-generated: ${goal}`,
          description: `Automated workflow for: ${goal}`,
          steps: workflowPlan.steps,
          status: 'pending',
          totalSteps: workflowPlan.steps.length,
        });

        set({
          isExecutingWorkflow: true,
          currentWorkflowId: workflowId,
          workflowProgress: {
            currentStep: 0,
            totalSteps: workflowPlan.steps.length,
            stepName: workflowPlan.steps[0]?.command || 'Starting...',
          },
        });

        try {
          contextStore.startWorkflow(workflowId);
          
          // Execute steps sequentially
          for (let i = 0; i < workflowPlan.steps.length; i++) {
            const step = workflowPlan.steps[i];
            
            set({
              workflowProgress: {
                currentStep: i + 1,
                totalSteps: workflowPlan.steps.length,
                stepName: step.command,
              },
            });

            const agent = agentRegistry.getAgent(step.agentId);
            const tool = agent?.tools.find(t => t.id === step.toolId);
            
            if (!agent || !tool) {
              throw new Error(`Agent or tool not found: ${step.agentId}/${step.toolId}`);
            }

            const result = await agent.execute(tool, step.input, mutations);
            contextStore.completeWorkflowStep(workflowId, step.id, result);
          }

          set({
            isExecutingWorkflow: false,
            currentWorkflowId: null,
            workflowProgress: null,
          });

          return `✅ **Workflow Completed Successfully!**

${goal}

All steps have been executed. Check your sidebar for the created content and projects.`;

        } catch (error) {
          contextStore.cancelWorkflow(workflowId);
          set({
            isExecutingWorkflow: false,
            currentWorkflowId: null,
            workflowProgress: null,
          });

          const errorMsg = error instanceof Error ? error.message : String(error);
          return `❌ **Workflow Failed**

Error executing workflow for: ${goal}

**Error:** ${errorMsg}

Some steps may have completed successfully. Check your sidebar for any created content.`;
        }
      },

      /**
       * Reset orchestration state
       */
      reset: () => {
        set({
          isPostOnboardingMode: false,
          postOnboardingMessage: null,
          hasShownPostOnboardingGuidance: false,
          lastUserIntent: null,
          suggestedAgents: [],
          isExecutingWorkflow: false,
          currentWorkflowId: null,
          workflowProgress: null,
        });
      },
    }),
    { name: 'orchestration-store' }
  )
);

/**
 * Generate personalized post-onboarding message
 */
function generatePostOnboardingMessage(): string {
  return `🎉 **Welcome to EAC! Your onboarding is complete.**

I'm your EAC Assistant, ready to help you make the most of your personalized workspace.

**🎯 What would you like to do first?**

**Create & Build:**
- \`/create-project [name]\` - Start a new project
- \`/twitter [idea]\` - Create engaging social content
- \`/instructions [topic]\` - Generate custom guidelines

**Automate & Scale:**
- \`/workflow [goal]\` - Create automated processes
- \`/schedule\` - Plan your content calendar
- \`/guide\` - Get personalized recommendations

**Learn & Explore:**
- \`/help [topic]\` - Get intelligent help
- \`/status\` - View system overview

Your brand analysis has been saved to your instructions folder. Try creating some content - I'll use your brand guidelines to make it perfectly on-brand!

What would you like to explore first?`;
}

/**
 * Determine if input should use parent orchestrator
 */
function shouldUseParentOrchestrator(input: string): boolean {
  const orchestratorTriggers = [
    '/guide', '/workflow', '/status', '/help',
    'what should i do', 'what next', 'help me', 'guide me',
    'how do i', 'what can i do', 'show me', 'workflow'
  ];
  
  const inputLower = input.toLowerCase();
  return orchestratorTriggers.some(trigger => inputLower.includes(trigger));
}

/**
 * Determine which orchestrator tool to use
 * Since parent orchestrator now routes intelligently, return a dummy tool
 */
function determineOrchestratorTool(input: string): AgentTool | null {
  const parentAgent = agentRegistry.getAgent('parent-orchestrator');
  if (!parentAgent) return null;

  // Parent orchestrator now routes intelligently, so return a dummy tool
  // The registry will handle the special case for parent-orchestrator
  return {
    id: 'routing',
    name: 'Intelligent Routing',
    command: '/route',
    description: 'Route to appropriate existing agents',
    parameters: []
  };
}

/**
 * Intelligent agent suggestion based on user input
 */
function intelligentAgentSuggestion(input: string): Array<{
  agent: BaseAgent;
  tool: AgentTool;
  confidence: number;
  reason: string;
}> {
  const suggestions: Array<{
    agent: BaseAgent;
    tool: AgentTool;
    confidence: number;
    reason: string;
  }> = [];
  
  const inputLower = input.toLowerCase();
  const availableAgents = agentRegistry.getAllAgents();
  
  // Define scoring rules
  const scoringRules = [
    {
      triggers: ['twitter', 'tweet', 'social', 'post', 'x.com'],
      agentId: 'twitter-post',
      confidence: 0.9,
      reason: 'Social media content creation'
    },
    {
      triggers: ['project', 'create project', 'new project'],
      agentId: 'project-creator',
      confidence: 0.9,
      reason: 'Project structure and setup'
    },
    {
      triggers: ['instructions', 'guidelines', 'brand'],
      agentId: 'instructions',
      confidence: 0.9,
      reason: 'Brand guidelines and instructions'
    },
    {
      triggers: ['schedule', 'calendar', 'timing'],
      agentId: 'scheduling',
      confidence: 0.9,
      reason: 'Content scheduling and timing'
    },
    {
      triggers: ['file', 'create file', 'document'],
      agentId: 'file-creator',
      confidence: 0.8,
      reason: 'File creation and management'
    }
  ];
  
  for (const rule of scoringRules) {
    const matchCount = rule.triggers.filter(trigger => inputLower.includes(trigger)).length;
    if (matchCount > 0) {
      const agent = availableAgents.find(a => a.id === rule.agentId);
      if (agent && agent.tools.length > 0) {
        suggestions.push({
          agent,
          tool: agent.tools[0],
          confidence: rule.confidence * (matchCount / rule.triggers.length),
          reason: rule.reason
        });
      }
    }
  }
  
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Create workflow execution plan
 */
function createWorkflowPlan(goal: string): {
  steps: Array<{
    id: string;
    agentId: string;
    toolId: string;
    command: string;
    input: string;
    status: 'pending';
  }>;
} {
  const goalLower = goal.toLowerCase();
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Social content workflow
  if (goalLower.includes('social') || goalLower.includes('content')) {
    return {
      steps: [
        {
          id: generateId(),
          agentId: 'instructions',
          toolId: 'generate-instructions',
          command: '/instructions',
          input: 'social media content strategy',
          status: 'pending'
        },
        {
          id: generateId(),
          agentId: 'twitter-post',
          toolId: 'create-twitter-post',
          command: '/twitter',
          input: goal,
          status: 'pending'
        }
      ]
    };
  }
  
  // Project setup workflow
  if (goalLower.includes('project')) {
    return {
      steps: [
        {
          id: generateId(),
          agentId: 'project-creator',
          toolId: 'create-project-with-files',
          command: '/create-project',
          input: goal,
          status: 'pending'
        },
        {
          id: generateId(),
          agentId: 'instructions',
          toolId: 'generate-instructions',
          command: '/instructions',
          input: `project documentation for ${goal}`,
          status: 'pending'
        }
      ]
    };
  }
  
  // Generic workflow
  return {
    steps: [
      {
        id: generateId(),
        agentId: 'project-creator',
        toolId: 'create-project-with-files',
        command: '/create-project',
        input: goal,
        status: 'pending'
      }
    ]
  };
}
