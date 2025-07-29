// History Store
// /Users/matthewsimon/Projects/eac/eac/store/history/index.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { HistoryEntry, HistoryStore } from './types';

export const useHistoryStore = create<HistoryStore>()(
  devtools(
    persist(
      (set, get) => ({
        entries: [],
        maxEntries: 1000, // Keep last 1000 entries
        filters: {},
        
        addEntry: (entry) => {
          const newEntry: HistoryEntry = {
            ...entry,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
          };
          
          set((state) => ({
            entries: [newEntry, ...state.entries].slice(0, state.maxEntries),
          }));

          // Log to console in development
          if (process.env.NODE_ENV === 'development') {
            const icon = {
              success: '✅',
              error: '❌', 
              warning: '⚠️',
              info: 'ℹ️'
            }[entry.type];
            
            console.log(`${icon} [${entry.category.toUpperCase()}] ${entry.message}`, entry.details || '');
          }
        },
        
        addBulkEntries: (entries) => {
          const newEntries: HistoryEntry[] = entries.map(entry => ({
            ...entry,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
          }));
          
          set((state) => ({
            entries: [...newEntries, ...state.entries].slice(0, state.maxEntries),
          }));
        },
        
        clearHistory: () => set({ entries: [] }),
        
        setFilters: (newFilters) => {
          set((state) => ({
            filters: { ...state.filters, ...newFilters }
          }));
        },
        
        getFilteredEntries: () => {
          const { entries, filters } = get();
          
          return entries.filter((entry) => {
            // Filter by category
            if (filters.category && entry.category !== filters.category) {
              return false;
            }
            
            // Filter by type
            if (filters.type && entry.type !== filters.type) {
              return false;
            }
            
            // Filter by date range
            if (filters.dateRange) {
              const { start, end } = filters.dateRange;
              if (entry.timestamp < start || entry.timestamp > end) {
                return false;
              }
            }
            
            // Filter by search term
            if (filters.search) {
              const searchTerm = filters.search.toLowerCase();
              const searchableText = `${entry.message} ${entry.action} ${JSON.stringify(entry.details || {})}`.toLowerCase();
              if (!searchableText.includes(searchTerm)) {
                return false;
              }
            }
            
            return true;
          });
        },
        
        exportHistory: () => {
          const { entries } = get();
          return JSON.stringify(entries, null, 2);
        },
        
        getStats: () => {
          const { entries } = get();
          const now = Date.now();
          const oneDayAgo = now - (24 * 60 * 60 * 1000);
          
          const stats = {
            total: entries.length,
            byType: {
              success: 0,
              error: 0,
              warning: 0,
              info: 0,
            },
            byCategory: {
              social: 0,
              file: 0,
              project: 0,
              connection: 0,
              debug: 0,
              system: 0,
            },
            recentActivity: 0,
          };
          
          entries.forEach((entry) => {
            stats.byType[entry.type]++;
            stats.byCategory[entry.category]++;
            
            if (entry.timestamp >= oneDayAgo) {
              stats.recentActivity++;
            }
          });
          
          return stats;
        },
      }),
      {
        name: 'history-storage',
        partialize: (state) => ({ 
          entries: state.entries.slice(0, 100) // Only persist last 100 entries
        }),
        onRehydrateStorage: () => (state) => {
          // Add a system startup log when the store is rehydrated
          if (state) {
            state.addEntry({
              type: 'info',
              category: 'system',
              action: 'session_started',
              message: 'EAC Dashboard session started',
              details: { timestamp: new Date().toISOString() }
            });
          }
        },
      }
    ),
    { name: 'history-store' }
  )
);

// Export types for convenience
export type { HistoryEntry, HistoryFilter, HistoryStore } from './types';
