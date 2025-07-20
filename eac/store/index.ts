// Main Store Exports
// /Users/matthewsimon/Projects/EAC/eac/store/index.ts

export * from './editor';
export type { EditorState, EditorTab, ProjectFile } from './editor/types';
export * from './materials';
export type { MaterialsStore, ManufacturedProduct, MiscMaterial } from './materials/types';
export { useSidebarStore } from './sidebar';
export type { SidebarState } from './sidebar/types';
export { useDailyTrackerStore } from './dailyTracker';
export type { DailyEntry } from './dailyTracker/types';
export * from './terminal';
export type { TerminalState } from './terminal/types';
export { useChatStore } from './terminal/chat';
export type { ChatMessage } from './terminal/chat';