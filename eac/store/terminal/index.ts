// Terminal Store
// /Users/matthewsimon/Projects/EAC/eac/store/terminal/index.ts

import { create } from 'zustand';
import { TerminalState } from './types';

export const useTerminalStore = create<TerminalState>((set, get) => ({
  isCollapsed: true,
  currentSize: 5,
  lastExpandedSize: 45,

  setCollapsed: (collapsed: boolean) => {
    const state = get();
    console.log('setCollapsed called:', { collapsed, currentLastExpandedSize: state.lastExpandedSize });
    set({
      isCollapsed: collapsed,
      currentSize: collapsed ? 5 : state.lastExpandedSize
    });
  },

  setSize: (size: number) => {
    const state = get();
    console.log('setSize called:', { size, isCollapsed: state.isCollapsed, currentLastExpandedSize: state.lastExpandedSize });

    // Only update lastExpandedSize if:
    // 1. Terminal is expanded
    // 2. Size is reasonable (>= 15 to avoid small fluctuations)
    // 3. Size is significantly different from current lastExpandedSize (>5% difference)
    const sizeDifference = Math.abs(size - state.lastExpandedSize);
    const percentDifference = (sizeDifference / state.lastExpandedSize) * 100;
    const shouldUpdateLastExpandedSize = !state.isCollapsed &&
                                        size >= 15 &&
                                        percentDifference > 5;

    console.log('Size difference:', sizeDifference, 'Percent difference:', percentDifference.toFixed(1) + '%', 'Should update:', shouldUpdateLastExpandedSize);
    set({
      currentSize: size,
      lastExpandedSize: shouldUpdateLastExpandedSize ? size : state.lastExpandedSize
    });
  },

  setLastExpandedSize: (size: number) => {
    console.log('setLastExpandedSize called:', size);
    set({ lastExpandedSize: size });
  },

  toggleCollapse: () => {
    const state = get();

    if (state.isCollapsed) {
      // Expanding - use the saved lastExpandedSize
      console.log('Expanding terminal to:', state.lastExpandedSize);
      set({
        isCollapsed: false,
        currentSize: state.lastExpandedSize
      });
    } else {
      // Collapsing - save current size if it's reasonable
      const currentSize = state.currentSize;
      const sizeToSave = currentSize >= 15 ? currentSize : state.lastExpandedSize;
      console.log('Collapsing terminal, saving size:', sizeToSave);
      set({
        isCollapsed: true,
        currentSize: 5,
        lastExpandedSize: sizeToSave
      });
    }
  }
})); 