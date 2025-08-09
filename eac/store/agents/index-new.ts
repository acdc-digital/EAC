// @ts-nocheck
// Agent Store - Refactored to use Modular Architecture
// /Users/matthewsimon/Projects/eac/eac/store/agents/index-new.ts

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
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

            let result: string;

            // Use the modular agent registry to execute
            try {
              result = await agentRegistry.executeAgent(
                agentId,
                toolId,
                input,
                convexMutations || {},
              );
            } catch (error) {
              console.error("❌ Agent execution failed:", error);
              result = `❌ Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
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
          set({
            agents: getAvailableAgents(),
            activeAgentId: null,
            executions: [],
            isLoading: false,
            error: null,
          });
        },

        clearError: () => {
          set({ error: null });
        },

        clearExecutions: () => {
          set({ executions: [] });
        },
      }),
      {
        name: "agent-store",
        partialize: (state) => ({
          agents: state.agents,
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

