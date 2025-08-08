// Error store implementation
// /Users/matthewsimon/Projects/eac/eac/store/errors/index.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { ErrorRecord, ErrorStoreState } from './types';

function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

export const useErrorStore = create<ErrorStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        errors: [],
        logError: (entry) => {
          const record: ErrorRecord = {
            id: entry.id ?? uuid(),
            timestamp: entry.timestamp ?? Date.now(),
            source: entry.source,
            message: entry.message,
            stack: entry.stack,
            severity: entry.severity ?? 'error',
            data: entry.data,
          };
          set((state) => ({ errors: [record, ...state.errors].slice(0, 200) }), false, 'errors/logError');
        },
        removeError: (id) => set((state) => ({ errors: state.errors.filter(e => e.id !== id) }), false, 'errors/removeError'),
        clearErrors: () => set({ errors: [] }, false, 'errors/clearErrors'),
      }),
      {
        name: 'error-store',
        partialize: (state) => ({ errors: state.errors }),
      }
    )
  )
);

// Convenience helper to capture exceptions uniformly
export function reportError(source: string, err: unknown, severity: ErrorRecord['severity'] = 'error', data?: unknown) {
  let message = 'Unknown error';
  let stack: string | undefined;
  if (err instanceof Error) {
    message = err.message;
    stack = err.stack;
  } else if (typeof err === 'string') {
    message = err;
  } else {
    try {
      message = JSON.stringify(err);
    } catch {
      message = String(err);
    }
  }
  useErrorStore.getState().logError({ source, message, stack, severity, data });
}
