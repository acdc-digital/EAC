// Terminal Store
// /Users/matthewsimon/Projects/EAC/eac/store/terminal/index.ts

import { create } from 'zustand';
import { TerminalState } from './types';

export const useTerminalStore = create<TerminalState>((set, get) => ({
  isCollapsed: true,
  currentSize: 2.5, // Start with smaller collapsed size
  lastExpandedSize: 40,
  activeTab: 'terminal',

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
  }
}));

// Export session store
export { useSessionStore } from './session';
export type { ChatSession } from './session';
