// Terminal Store
// /Users/matthewsimon/Projects/EAC/eac/store/terminal/index.ts

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { TerminalState } from './types';

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set, get) => ({
  isCollapsed: true,
  currentSize: 2.5, // Start with smaller collapsed size
  lastExpandedSize: 40,
  activeTab: 'terminal',
  alerts: [],

  setCollapsed: (collapsed: boolean) => {
    const state = get();
    set({
      isCollapsed: collapsed,
      currentSize: collapsed ? 2.5 : (state.lastExpandedSize || 40)
    });
  },

  setSize: (size: number) => {
    const state = get();
    // Only update lastExpandedSize if we're not collapsed
    if (!state.isCollapsed && size > 10) {
      set({ 
        currentSize: size,
        lastExpandedSize: size
      });
    } else {
      set({ currentSize: size });
    }
  },

  setLastExpandedSize: (size: number) => {
    set({ lastExpandedSize: size });
  },

  toggleCollapse: () => {
    const state = get();
    const newCollapsed = !state.isCollapsed;
    set({
      isCollapsed: newCollapsed,
      currentSize: newCollapsed ? 2.5 : (state.lastExpandedSize || 40)
    });
  },

      setActiveTab: (tab: string) => {
        set({ activeTab: tab });
      },

      pushAlert: ({ title, message, level = 'error' }) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        set((state) => ({
          alerts: [
            { id, title, message, level, timestamp: Date.now() },
            ...state.alerts,
          ].slice(0, 100), // cap
          activeTab: state.isCollapsed ? state.activeTab : state.activeTab,
        }));
      },

      clearAlerts: () => {
        set({ alerts: [] });
      }
    }),
    {
      name: 'terminal-store',
      partialize: (state) => ({ alerts: state.alerts }),
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : undefined as any)),
    }
  )
);