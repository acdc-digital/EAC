// History Store Types
// /Users/matthewsimon/Projects/eac/eac/store/history/types.ts

export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: 'success' | 'error' | 'warning' | 'info';
  category: 'social' | 'file' | 'project' | 'connection' | 'debug' | 'system';
  action: string;
  message: string;
  details?: Record<string, unknown>;
  userId?: string;
}

export interface HistoryFilter {
  category?: HistoryEntry['category'];
  type?: HistoryEntry['type'];
  dateRange?: {
    start: number;
    end: number;
  };
  search?: string;
}

export interface HistoryStore {
  entries: HistoryEntry[];
  maxEntries: number;
  filters: HistoryFilter;
  
  // Actions
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  setFilters: (filters: Partial<HistoryFilter>) => void;
  getFilteredEntries: () => HistoryEntry[];
  exportHistory: () => string;
  
  // Bulk operations
  addBulkEntries: (entries: Omit<HistoryEntry, 'id' | 'timestamp'>[]) => void;
  
  // Statistics
  getStats: () => {
    total: number;
    byType: Record<HistoryEntry['type'], number>;
    byCategory: Record<HistoryEntry['category'], number>;
    recentActivity: number; // Last 24h
  };
}
