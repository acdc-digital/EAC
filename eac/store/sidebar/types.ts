// Sidebar Store Types
// /Users/matthewsimon/Projects/EAC/eac/store/sidebar/types.ts

export interface SidebarState {
  // UI State
  openSections: Set<string>;
  activePanel: string;
  
  // Actions
  toggleSection: (sectionId: string) => void;
  setActivePanel: (panel: string) => void;
  collapseAllSections: () => void;
  reset: () => void;
} 