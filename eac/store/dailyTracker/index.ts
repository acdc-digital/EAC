// Daily Tracker Store
// /Users/matthewsimon/Projects/EAC/eac/store/dailyTracker/index.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DailyTrackerStore, DailyEntry } from './types';

export const useDailyTrackerStore = create<DailyTrackerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      dailyEntries: [],
      quickEntryDay: null,

      // Actions
      setQuickEntryDay: (day: number | null) => {
        set({ quickEntryDay: day });
      },

      updateDailyEntry: (date: number, field: keyof DailyEntry, value: string | number | undefined) => {
        set((state) => {
          const existingEntries = [...state.dailyEntries];
          const existingIndex = existingEntries.findIndex(entry => entry.date === date);
          
          if (existingIndex >= 0) {
            // Update existing entry
            existingEntries[existingIndex] = {
              ...existingEntries[existingIndex],
              [field]: value
            };
          } else {
            // Create new entry with the updated field
            const newEntry: DailyEntry = {
              date,
              hours: field === 'hours' ? (value as number) : 0,
              squareFootage: field === 'squareFootage' ? (value as number) : 0,
              note: field === 'note' ? (value as string) : '',
              taskId: field === 'taskId' ? (value as string | undefined) : undefined
            };
            existingEntries.push(newEntry);
          }
          
          return { dailyEntries: existingEntries };
        });
      },

      initializeDailyEntries: (totalDays: number) => {
        const { dailyEntries } = get();
        const entries: DailyEntry[] = [];
        
        for (let i = 1; i <= totalDays; i++) {
          const existing = dailyEntries.find(e => e.date === i);
          if (existing) {
            entries.push(existing);
          } else {
            entries.push({
              date: i,
              hours: 0,
              squareFootage: 0,
              note: '',
              taskId: undefined
            });
          }
        }
        
        set({ dailyEntries: entries });
      },

      getDailyEntry: (date: number) => {
        const { dailyEntries } = get();
        return dailyEntries.find(entry => entry.date === date);
      },

      clearAllEntries: () => {
        set({ dailyEntries: [], quickEntryDay: null });
      }
    }),
    {
      name: 'daily-tracker-storage',
      version: 1,
    }
  )
);

// Export types for use in components
export type { DailyEntry } from './types'; 