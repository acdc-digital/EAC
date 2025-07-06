// Sidebar Store
// /Users/matthewsimon/Projects/EAC/eac/store/sidebar/index.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { SidebarState } from './types';

export const useSidebarStore = create<SidebarState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        openSections: new Set<string>(),
        activePanel: 'explorer',

        // Actions
        toggleSection: (sectionId: string) => {
          set((state) => {
            const newSet = new Set(state.openSections);
            if (newSet.has(sectionId)) {
              newSet.delete(sectionId);
            } else {
              newSet.add(sectionId);
            }
            return { openSections: newSet };
          });
        },

        setActivePanel: (panel: string) => {
          set({ activePanel: panel });
        },

        reset: () => {
          set({
            openSections: new Set<string>(),
            activePanel: 'explorer',
          });
        },
      }),
      {
        name: 'sidebar-storage',
        // Custom storage to handle Set serialization
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const { state } = JSON.parse(str);
            return {
              state: {
                ...state,
                openSections: new Set(state.openSections || []),
              },
            };
          },
          setItem: (name, value) => {
            const { state } = value as { state: SidebarState };
            const serialized = JSON.stringify({
              state: {
                ...state,
                openSections: Array.from(state.openSections),
              },
            });
            localStorage.setItem(name, serialized);
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
      }
    ),
    { name: 'sidebar-store' }
  )
); 