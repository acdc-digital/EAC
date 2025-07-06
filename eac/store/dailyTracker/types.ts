// Daily Tracker Store Types
// /Users/matthewsimon/Projects/EAC/eac/store/dailyTracker/types.ts

export interface DailyEntry {
  date: number; // Day number (1, 2, 3, etc.)
  hours: number;
  squareFootage: number;
  note: string;
  taskId?: string; // Optional: link to specific task
}

export interface DailyTrackerStore {
  // State
  dailyEntries: DailyEntry[];
  quickEntryDay: number | null;
  
  // Actions
  setQuickEntryDay: (day: number | null) => void;
  updateDailyEntry: (date: number, field: keyof DailyEntry, value: string | number | undefined) => void;
  initializeDailyEntries: (totalDays: number) => void;
  getDailyEntry: (date: number) => DailyEntry | undefined;
  clearAllEntries: () => void;
} 