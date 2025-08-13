// Agent Store - Enhanced with Orchestration Integration
// /Users/matthewsimon/Projects/eac/eac/store/agents/index.ts

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useAgentContextStore } from "./context";
import { useOrchestrationStore } from "./orchestration";
import {
    agentRegistry,
    getAvailableAgents
} from "./registry";
import {
    Agent,
    AgentExecution,
    AgentState,
    ConvexMutations
} from "./types";

// Get initial agents from the registry
const initialAgents: Agent[] = getAvailableAgents();
console.log('🤖 Agent Store: Loaded agents:', initialAgents.map(a => ({ id: a.id, name: a.name, tools: a.tools.length })));

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
        addAgent: (agentData: Omit<Agent, "id">) => {
          const newAgent: Agent = {
            ...agentData,
            id: crypto.randomUUID(),
          };

          set((state) => ({
            agents: [...state.agents, newAgent],
          }));
        },

        updateAgent: (agentId: string, updates: Partial<Agent>) => {
          set((state) => ({
            agents: state.agents.map((agent) =>
              agent.id === agentId ? { ...agent, ...updates } : agent,
            ),
          }));
        },

        removeAgent: (agentId: string) => {
          set((state) => ({
            agents: state.agents.filter((agent) => agent.id !== agentId),
            activeAgentId:
              state.activeAgentId === agentId ? null : state.activeAgentId,
          }));
        },

        setActiveAgent: (agentId: string | null) => {
          set({ activeAgentId: agentId });
        },

        executeAgentTool: async (
          agentId: string,
          toolId: string,
          input: string,
          convexMutations?: ConvexMutations,
          sessionId?: string
        ) => {
          try {
            set({ isLoading: true, error: null });

            const execution: Omit<AgentExecution, 'id' | 'timestamp'> = {
              agentId,
              toolId,
              input,
              status: "pending",
            };

            // Add execution to state
            get().addExecution(execution);

            // Track execution in context store
            const contextStore = useAgentContextStore.getState();
            const executionId = contextStore.trackExecution({
              agentId,
              toolId,
              command: agentRegistry.getAgent(agentId)?.tools.find(t => t.id === toolId)?.command || '',
              input,
              status: "running",
              sessionId,
            });

            let result: string;
            const startTime = Date.now();

            // Use the modular agent registry to execute
            try {
              result = await agentRegistry.executeAgent(
                agentId,
                toolId,
                input,
                convexMutations || {},
                sessionId
              );

              const responseTime = Date.now() - startTime;
              contextStore.completeExecution(executionId, result, responseTime);
              contextStore.addRecentAction(agentId, `${toolId} executed`, true);

            } catch (error) {
              console.error("❌ Agent execution failed:", error);
              const responseTime = Date.now() - startTime;
              const errorMsg = error instanceof Error ? error.message : 'Unknown error';
              
              contextStore.failExecution(executionId, errorMsg, responseTime);
              contextStore.addRecentAction(agentId, `${toolId} failed`, false);
              
              result = `❌ Agent execution failed: ${errorMsg}`;
            }

            // Update execution status
            set((state) => ({
              executions: state.executions.map((exec) =>
                exec.agentId === agentId && exec.status === "pending"
                  ? { ...exec, status: "completed", output: result }
                  : exec,
              ),
              isLoading: false,
            }));

            return result;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            
            set((state) => ({
              executions: state.executions.map((exec) =>
                exec.agentId === agentId && exec.status === "pending"
                  ? { ...exec, status: "error", error: errorMessage }
                  : exec,
              ),
              isLoading: false,
              error: errorMessage,
            }));

            throw error;
          }
        },

        addExecution: (execution: Omit<AgentExecution, 'id' | 'timestamp'>) => {
          const newExecution: AgentExecution = {
            ...execution,
            id: crypto.randomUUID(),
            timestamp: new Date(),
          };

          set((state) => ({
            executions: [newExecution, ...state.executions],
          }));
        },

        deleteAgent: (agentId: string) => {
          set((state) => ({
            agents: state.agents.filter((agent) => agent.id !== agentId),
            activeAgentId:
              state.activeAgentId === agentId ? null : state.activeAgentId,
          }));
        },

        setError: (error: string | null) => {
          set({ error });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        reset: () => {
          const freshAgents = getAvailableAgents();
          console.log('🔄 Agent Store: Reset with fresh agents:', freshAgents.map(a => ({ id: a.id, name: a.name })));
          set({
            agents: freshAgents,
            activeAgentId: null,
            executions: [],
            isLoading: false,
            error: null,
          });
        },

        refreshAgents: () => {
          const freshAgents = getAvailableAgents();
          console.log('🔄 Agent Store: Refreshed agents:', freshAgents.map(a => ({ id: a.id, name: a.name })));
          set({ agents: freshAgents });
          
          // Check for post-onboarding guidance after agent refresh
          const orchestrationStore = useOrchestrationStore.getState();
          orchestrationStore.checkOnboardingCompletion();
        },

        clearError: () => {
          set({ error: null });
        },

        clearExecutions: () => {
          set({ executions: [] });
        },

        // Enhanced orchestration methods
        executeIntelligentRouting: async (
          input: string,
          convexMutations?: ConvexMutations,
          sessionId?: string
        ) => {
          if (!convexMutations) {
            throw new Error('ConvexMutations required for intelligent routing');
          }
          const orchestrationStore = useOrchestrationStore.getState();
          return orchestrationStore.executeIntelligentRouting(
            input,
            convexMutations
          );
        },

        createWorkflow: async (
          goal: string,
          convexMutations?: ConvexMutations,
          sessionId?: string
        ) => {
          if (!convexMutations) {
            throw new Error('ConvexMutations required for workflow creation');
          }
          const orchestrationStore = useOrchestrationStore.getState();
          return orchestrationStore.createAndExecuteWorkflow(
            goal,
            convexMutations
          );
        },

        getPostOnboardingGuidance: () => {
          const orchestrationStore = useOrchestrationStore.getState();
          return {
            shouldShow: orchestrationStore.isPostOnboardingMode,
            message: orchestrationStore.postOnboardingMessage,
            dismiss: orchestrationStore.dismissPostOnboardingGuidance,
          };
        },

        showPostOnboardingGuidance: () => {
          const orchestrationStore = useOrchestrationStore.getState();
          orchestrationStore.showPostOnboardingGuidance();
        },
      }),
      {
        name: "agent-store",
        partialize: (state) => ({
          // Don't persist agents array - always load fresh from registry
          activeAgentId: state.activeAgentId,
          executions: state.executions.slice(0, 50), // Keep only last 50 executions
        }),
      },
    ),
    {
      name: "AgentStore",
    },
  ),
);

// Export the store
export default useAgentStore;

// Re-export for convenience
export { useEditorStore } from "../editor";

// Legacy exports for backward compatibility
export {
    agentRegistry, executeCMOAgent, executeInstructionsAgent,
    executeTwitterPostAgent, getAvailableAgents,
    getAvailableCommands
} from "./registry";

