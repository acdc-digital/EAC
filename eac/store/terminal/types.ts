// Terminal Store Types
// /Users/matthewsimon/Projects/EAC/eac/store/terminal/types.ts

export interface TerminalState {
  isCollapsed: boolean;
  currentSize: number;
  lastExpandedSize: number;
  activeTab: string;
  alerts: Array<{ id: string; title: string; message: string; level: 'info'|'warning'|'error'; timestamp: number }>;
  
  setCollapsed: (collapsed: boolean) => void;
  setSize: (size: number) => void;
  setLastExpandedSize: (size: number) => void;
  toggleCollapse: () => void;
  setActiveTab: (tab: string) => void;
  pushAlert: (alert: { title: string; message: string; level?: 'info'|'warning'|'error' }) => void;
  clearAlerts: () => void;
} 