// Error store types
// /Users/matthewsimon/Projects/eac/eac/store/errors/types.ts

export type ErrorSeverity = 'info' | 'warn' | 'error';

export interface ErrorRecord {
  id: string;
  timestamp: number; // Date.now()
  source?: string; // e.g., 'useProjects', 'dashDebug/manualSync', 'window.onerror'
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  data?: unknown;
}

export interface ErrorStoreState {
  errors: ErrorRecord[];
  // actions
  logError: (entry: Omit<ErrorRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}
