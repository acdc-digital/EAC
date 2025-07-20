// Terminal Store
// /Users/matthewsimon/Projects/EAC/eac/store/terminal/index.ts

import { create } from 'zustand';
import { TerminalState } from './types';

export const useTerminalStore = create<TerminalState>((set, get) => ({
  isCollapsed: true,
  currentSize: 40,
  lastExpandedSize: 40,

  setCollapsed: (collapsed: boolean) => {
    set({
      isCollapsed: collapsed,
      currentSize: collapsed ? 3 : 40
    });
  },

  setSize: (size: number) => {
    set({ currentSize: size });
  },

  setLastExpandedSize: (size: number) => {
    set({ lastExpandedSize: size });
  },

  toggleCollapse: () => {
    const state = get();
    set({
      isCollapsed: !state.isCollapsed,
      currentSize: state.isCollapsed ? 40 : 3
    });
  }
})); 