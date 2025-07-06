// Terminal Store Types
// /Users/matthewsimon/Projects/EAC/eac/store/terminal/types.ts

import { ImperativePanelHandle } from "react-resizable-panels";

export interface TerminalState {
  isCollapsed: boolean;
  currentSize: number;
  lastExpandedSize: number;
  panelRef: React.RefObject<ImperativePanelHandle | null> | null;
  isResizing: boolean;
  
  setCollapsed: (collapsed: boolean) => void;
  setSize: (size: number) => void;
  setLastExpandedSize: (size: number) => void;
  setPanelRef: (ref: React.RefObject<ImperativePanelHandle | null>) => void;
  toggleCollapse: () => void;
} 