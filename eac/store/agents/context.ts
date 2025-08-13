// Agent Context Store - Cross-Agent Communication and State Management
// /Users/matthewsimon/Projects/eac/eac/store/agents/context.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface AgentMetrics {
  agentId: string;
  agentName: string;
  invocationCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastInvocation?: Date;
  successRate: number;
  errorLog: Array<{
    error: string;
    timestamp: Date;
    input: string;
  }>;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  toolId: string;
  command: string;
  input: string;
  output?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  error?: string;
  timestamp: Date;
  responseTime?: number;
  sessionId?: string;
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  toolId: string;
  command: string;
  input: string;
  dependencies?: string[]; // IDs of steps that must complete first
  status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
  output?: string;
  error?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'pending' | 'running' | 'completed' | 'error' | 'cancelled';
  currentStepIndex: number;
  createdAt: Date;
  completedAt?: Date;
  totalSteps: number;
  completedSteps: number;
}

export interface GlobalContext {
  userId?: string;
  currentProject?: string;
  currentSession?: string;
  userPreferences: {
    preferredAgents: string[];
    defaultSettings: Record<string, any>;
    communicationStyle: 'concise' | 'detailed' | 'technical';
  };
  recentActions: Array<{
    agentId: string;
    action: string;
    timestamp: Date;
    success: boolean;
  }>;
}

export interface AgentContextState {
  // Execution tracking
  executions: AgentExecution[];
  activeExecutions: Map<string, AgentExecution>;
  
  // Metrics and monitoring
  metrics: Map<string, AgentMetrics>;
  systemHealth: {
    overallSuccessRate: number;
    avgResponseTime: number;
    activeAgents: number;
    totalExecutions: number;
    lastHealthCheck: Date;
  };
  
  // Workflow management
  workflows: Map<string, Workflow>;
  activeWorkflows: string[];
  
  // Global context and state
  globalContext: GlobalContext;
  
  // Cross-agent communication
  agentMessages: Array<{
    fromAgent: string;
    toAgent: string;
    message: any;
    timestamp: Date;
    processed: boolean;
  }>;
  
  // Actions
  trackExecution: (execution: Omit<AgentExecution, 'id' | 'timestamp'>) => string;
  updateExecution: (id: string, updates: Partial<AgentExecution>) => void;
  completeExecution: (id: string, output: string, responseTime: number) => void;
  failExecution: (id: string, error: string, responseTime: number) => void;
  
  // Metrics actions
  updateMetrics: (agentId: string, success: boolean, responseTime: number, error?: string) => void;
  getAgentMetrics: (agentId: string) => AgentMetrics | undefined;
  getSystemMetrics: () => any;
  resetMetrics: (agentId?: string) => void;
  
  // Workflow actions
  createWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'currentStepIndex' | 'completedSteps'>) => string;
  startWorkflow: (workflowId: string) => void;
  updateWorkflowStep: (workflowId: string, stepId: string, updates: Partial<WorkflowStep>) => void;
  completeWorkflowStep: (workflowId: string, stepId: string, output: string) => void;
  failWorkflowStep: (workflowId: string, stepId: string, error: string) => void;
  cancelWorkflow: (workflowId: string) => void;
  
  // Context actions
  updateGlobalContext: (updates: Partial<GlobalContext>) => void;
  addRecentAction: (agentId: string, action: string, success: boolean) => void;
  
  // Communication actions
  sendAgentMessage: (fromAgent: string, toAgent: string, message: any) => void;
  getAgentMessages: (agentId: string) => any[];
  markMessageProcessed: (messageIndex: number) => void;
  
  // Utility actions
  cleanup: () => void;
  getExecutionHistory: (agentId?: string, limit?: number) => AgentExecution[];
  getRecentActivity: (limit?: number) => Array<{
    timestamp: Date;
    agent: string;
    action: string;
    status: string;
  }>;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useAgentContextStore = create<AgentContextState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        executions: [],
        activeExecutions: new Map(),
        metrics: new Map(),
        systemHealth: {
          overallSuccessRate: 100,
          avgResponseTime: 0,
          activeAgents: 0,
          totalExecutions: 0,
          lastHealthCheck: new Date(),
        },
        workflows: new Map(),
        activeWorkflows: [],
        globalContext: {
          userPreferences: {
            preferredAgents: [],
            defaultSettings: {},
            communicationStyle: 'detailed',
          },
          recentActions: [],
        },
        agentMessages: [],

        // Execution tracking
        trackExecution: (executionData) => {
          const id = generateId();
          const execution: AgentExecution = {
            ...executionData,
            id,
            timestamp: new Date(),
          };

          set((state) => ({
            executions: [...state.executions, execution],
            activeExecutions: new Map(state.activeExecutions).set(id, execution),
          }));

          return id;
        },

        updateExecution: (id, updates) => {
          set((state) => {
            const executions = state.executions.map((exec) =>
              exec.id === id ? { ...exec, ...updates } : exec
            );
            const activeExecutions = new Map(state.activeExecutions);
            const current = activeExecutions.get(id);
            if (current) {
              activeExecutions.set(id, { ...current, ...updates });
            }

            return { executions, activeExecutions };
          });
        },

        completeExecution: (id, output, responseTime) => {
          const state = get();
          state.updateExecution(id, {
            status: 'completed',
            output,
            responseTime,
          });
          
          // Update metrics
          const execution = state.executions.find(e => e.id === id);
          if (execution) {
            state.updateMetrics(execution.agentId, true, responseTime);
          }

          // Remove from active executions
          set((currentState) => {
            const activeExecutions = new Map(currentState.activeExecutions);
            activeExecutions.delete(id);
            return { activeExecutions };
          });
        },

        failExecution: (id, error, responseTime) => {
          const state = get();
          state.updateExecution(id, {
            status: 'error',
            error,
            responseTime,
          });

          // Update metrics
          const execution = state.executions.find(e => e.id === id);
          if (execution) {
            state.updateMetrics(execution.agentId, false, responseTime, error);
          }

          // Remove from active executions
          set((currentState) => {
            const activeExecutions = new Map(currentState.activeExecutions);
            activeExecutions.delete(id);
            return { activeExecutions };
          });
        },

        // Metrics management
        updateMetrics: (agentId, success, responseTime, error) => {
          set((state) => {
            const metrics = new Map(state.metrics);
            const current = metrics.get(agentId) || {
              agentId,
              agentName: agentId,
              invocationCount: 0,
              successCount: 0,
              errorCount: 0,
              averageResponseTime: 0,
              successRate: 100,
              errorLog: [],
            };

            const newInvocationCount = current.invocationCount + 1;
            const newSuccessCount = success ? current.successCount + 1 : current.successCount;
            const newErrorCount = success ? current.errorCount : current.errorCount + 1;
            
            const updated: AgentMetrics = {
              ...current,
              invocationCount: newInvocationCount,
              successCount: newSuccessCount,
              errorCount: newErrorCount,
              averageResponseTime: (current.averageResponseTime * current.invocationCount + responseTime) / newInvocationCount,
              successRate: (newSuccessCount / newInvocationCount) * 100,
              lastInvocation: new Date(),
              errorLog: error 
                ? [...current.errorLog.slice(-9), { error, timestamp: new Date(), input: '' }]
                : current.errorLog,
            };

            metrics.set(agentId, updated);
            
            // Update system health
            const allMetrics = Array.from(metrics.values());
            const totalExecutions = allMetrics.reduce((sum, m) => sum + m.invocationCount, 0);
            const totalSuccess = allMetrics.reduce((sum, m) => sum + m.successCount, 0);
            const totalResponseTime = allMetrics.reduce((sum, m) => sum + (m.averageResponseTime * m.invocationCount), 0);

            return {
              metrics,
              systemHealth: {
                overallSuccessRate: totalExecutions > 0 ? (totalSuccess / totalExecutions) * 100 : 100,
                avgResponseTime: totalExecutions > 0 ? totalResponseTime / totalExecutions : 0,
                activeAgents: allMetrics.length,
                totalExecutions,
                lastHealthCheck: new Date(),
              },
            };
          });
        },

        getAgentMetrics: (agentId) => {
          return get().metrics.get(agentId);
        },

        getSystemMetrics: () => {
          const state = get();
          const metrics = Array.from(state.metrics.values());
          
          return {
            ...state.systemHealth,
            agentMetrics: metrics,
            recentActivity: state.getRecentActivity(5),
          };
        },

        resetMetrics: (agentId) => {
          set((state) => {
            const metrics = new Map(state.metrics);
            if (agentId) {
              metrics.delete(agentId);
            } else {
              metrics.clear();
            }
            return { metrics };
          });
        },

        // Workflow management
        createWorkflow: (workflowData) => {
          const id = generateId();
          const workflow: Workflow = {
            ...workflowData,
            id,
            createdAt: new Date(),
            currentStepIndex: 0,
            completedSteps: 0,
          };

          set((state) => ({
            workflows: new Map(state.workflows).set(id, workflow),
          }));

          return id;
        },

        startWorkflow: (workflowId) => {
          set((state) => {
            const workflows = new Map(state.workflows);
            const workflow = workflows.get(workflowId);
            if (workflow) {
              workflows.set(workflowId, { ...workflow, status: 'running' });
            }
            return {
              workflows,
              activeWorkflows: [...state.activeWorkflows, workflowId],
            };
          });
        },

        updateWorkflowStep: (workflowId, stepId, updates) => {
          set((state) => {
            const workflows = new Map(state.workflows);
            const workflow = workflows.get(workflowId);
            if (workflow) {
              const steps = workflow.steps.map((step) =>
                step.id === stepId ? { ...step, ...updates } : step
              );
              workflows.set(workflowId, { ...workflow, steps });
            }
            return { workflows };
          });
        },

        completeWorkflowStep: (workflowId, stepId, output) => {
          const state = get();
          state.updateWorkflowStep(workflowId, stepId, {
            status: 'completed',
            output,
          });

          // Check if workflow is complete
          const workflow = state.workflows.get(workflowId);
          if (workflow) {
            const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
            const updatedWorkflow = {
              ...workflow,
              completedSteps,
              status: completedSteps === workflow.totalSteps ? 'completed' as const : workflow.status,
              completedAt: completedSteps === workflow.totalSteps ? new Date() : workflow.completedAt,
            };

            set((currentState) => ({
              workflows: new Map(currentState.workflows).set(workflowId, updatedWorkflow),
              activeWorkflows: updatedWorkflow.status === 'completed' 
                ? currentState.activeWorkflows.filter(id => id !== workflowId)
                : currentState.activeWorkflows,
            }));
          }
        },

        failWorkflowStep: (workflowId, stepId, error) => {
          const state = get();
          state.updateWorkflowStep(workflowId, stepId, {
            status: 'error',
            error,
          });

          // Mark workflow as failed
          set((currentState) => {
            const workflows = new Map(currentState.workflows);
            const workflow = workflows.get(workflowId);
            if (workflow) {
              workflows.set(workflowId, { ...workflow, status: 'error' });
            }
            return {
              workflows,
              activeWorkflows: currentState.activeWorkflows.filter(id => id !== workflowId),
            };
          });
        },

        cancelWorkflow: (workflowId) => {
          set((state) => {
            const workflows = new Map(state.workflows);
            const workflow = workflows.get(workflowId);
            if (workflow) {
              workflows.set(workflowId, { ...workflow, status: 'cancelled' });
            }
            return {
              workflows,
              activeWorkflows: state.activeWorkflows.filter(id => id !== workflowId),
            };
          });
        },

        // Context management
        updateGlobalContext: (updates) => {
          set((state) => ({
            globalContext: { ...state.globalContext, ...updates },
          }));
        },

        addRecentAction: (agentId, action, success) => {
          set((state) => ({
            globalContext: {
              ...state.globalContext,
              recentActions: [
                {
                  agentId,
                  action,
                  timestamp: new Date(),
                  success,
                },
                ...state.globalContext.recentActions.slice(0, 19), // Keep last 20
              ],
            },
          }));
        },

        // Communication
        sendAgentMessage: (fromAgent, toAgent, message) => {
          set((state) => ({
            agentMessages: [
              ...state.agentMessages,
              {
                fromAgent,
                toAgent,
                message,
                timestamp: new Date(),
                processed: false,
              },
            ],
          }));
        },

        getAgentMessages: (agentId) => {
          return get().agentMessages.filter(
            (msg) => msg.toAgent === agentId && !msg.processed
          );
        },

        markMessageProcessed: (messageIndex) => {
          set((state) => ({
            agentMessages: state.agentMessages.map((msg, index) =>
              index === messageIndex ? { ...msg, processed: true } : msg
            ),
          }));
        },

        // Utilities
        cleanup: () => {
          const now = new Date();
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

          set((state) => ({
            executions: state.executions.filter(
              (exec) => exec.timestamp > oneWeekAgo
            ),
            agentMessages: state.agentMessages.filter(
              (msg) => msg.timestamp > oneWeekAgo
            ),
            globalContext: {
              ...state.globalContext,
              recentActions: state.globalContext.recentActions.filter(
                (action) => action.timestamp > oneWeekAgo
              ),
            },
          }));
        },

        getExecutionHistory: (agentId, limit = 50) => {
          const state = get();
          let executions = state.executions;
          
          if (agentId) {
            executions = executions.filter((exec) => exec.agentId === agentId);
          }
          
          return executions
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
        },

        getRecentActivity: (limit = 10) => {
          const state = get();
          return state.globalContext.recentActions
            .slice(0, limit)
            .map((action) => ({
              timestamp: action.timestamp,
              agent: action.agentId,
              action: action.action,
              status: action.success ? 'success' : 'error',
            }));
        },
      }),
      {
        name: 'eac-agent-context-storage',
        partialize: (state) => ({
          metrics: Array.from(state.metrics.entries()),
          systemHealth: state.systemHealth,
          workflows: Array.from(state.workflows.entries()),
          globalContext: state.globalContext,
          executions: state.executions.slice(-100), // Keep last 100 executions
        }),
        // Custom storage to handle Maps
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const parsed = JSON.parse(str);
            
            // Restore Maps from arrays
            if (parsed.state) {
              if (parsed.state.metrics) {
                parsed.state.metrics = new Map(parsed.state.metrics);
              }
              if (parsed.state.workflows) {
                parsed.state.workflows = new Map(parsed.state.workflows);
              }
            }
            
            return parsed;
          },
          setItem: (name, value) => {
            localStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: (name) => {
            localStorage.removeItem(name);
          },
        },
      }
    ),
    { name: 'agent-context-store' }
  )
);
