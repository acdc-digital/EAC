// Main Store Exports
// /Users/matthewsimon/Projects/EAC/eac/store/index.ts

export { useDailyTrackerStore } from './dailyTracker';
export type { DailyEntry } from './dailyTracker/types';
export * from './editor';
export type { EditorState, EditorTab, ProjectFile } from './editor/types';
export * from './materials';
export type { ManufacturedProduct, MaterialsStore, MiscMaterial } from './materials/types';
export { useProjectStore } from './projects';
export type {
  CreateProjectArgs, Project,
  ProjectStats,
  ProjectStatus, ProjectStoreState, UpdateProjectArgs
} from './projects/types';
export { useSidebarStore } from './sidebar';
export type { SidebarState } from './sidebar/types';
export * from './terminal';
export { useChatStore } from './terminal/chat';
export type { ChatMessage } from './terminal/chat';
export type { TerminalState } from './terminal/types';

// Social Media Store
export { useIsConnecting, useIsPosting, useRedditConnection, useRedditPosts, useSelectedPost, useSocialActions, useSocialConnections, useSocialError, useSocialStore } from './social';
export type { CreateRedditPostArgs, CreateSocialConnectionArgs, RedditPost, SocialConnection, SocialStoreState, UpdateRedditPostArgs } from './social/types';

