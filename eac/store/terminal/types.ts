// Terminal Store Types
// /Users/matthewsimon/Projects/EAC/eac/store/terminal/types.ts



export interface TerminalState {
  isCollapsed: boolean;
  currentSize: number;
  lastExpandedSize: number;
  
  setCollapsed: (collapsed: boolean) => void;
  setSize: (size: number) => void;
  setLastExpandedSize: (size: number) => void;
  toggleCollapse: () => void;
} 