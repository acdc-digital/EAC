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

// Agent Store
export { useAgentStore } from './agents';
export type { Agent, AgentExecution, AgentState, AgentTool } from './agents/types';

// History Store
export { useHistoryStore } from './history';
export type { HistoryEntry, HistoryFilter, HistoryStore } from './history/types';

// Error Store
export { reportError, useErrorStore } from './errors';
export type { ErrorRecord } from './errors/types';

// Social Media Store
export { useIsConnecting, useIsPosting, useRedditConnection, useRedditPosts, useSelectedPost, useSocialActions, useSocialConnections, useSocialError, useSocialStore } from './social';
export type { CreateRedditPostArgs, CreateSocialConnectionArgs, RedditPost, SocialConnection, SocialStoreState, UpdateRedditPostArgs } from './social/types';

// Calendar Store
export {
    useAddScheduledPost, useCalendarActions, useCalendarError, useCalendarIsLoading, useCalendarStore, useClearCalendarError, useCurrentMonth, useDeleteScheduledPost, useGetPostsByDate,
    useGetPostsByDateRange, useGetPostsByPlatform, useGetPostsByStatus, useLoadScheduledPosts, useScheduledPosts, useScheduledPostsFromConvex, useSelectedDate, useSetCurrentMonth, useSetScheduledPosts, useSetSelectedDate, useUpdateScheduledPost
} from './calendar';
export type { CalendarStoreState, ScheduledPost } from './calendar/types';

