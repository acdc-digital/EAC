# EAC State Management: Zustand + Convex

Last updated: 2025-08-07

## Executive summary

- Source of truth: Convex DB. Zustand stores mirror DB state for UX and performance. Never persist stale local data over DB truth.
- Data flow: Convex functions → React hooks (useQuery/useMutation/useAction) → Zustand stores → UI. One-way sync with explicit events for side-effects.
- Key workflows wired end-to-end: Projects, Files, Terminal Chat/Sessions, Trash, Agents. Each has a primary store, supporting hooks, and Convex functions.
- Persistence: Only minimal UI preferences are persisted. IDs from Convex (project/file convexId) are the bridge; missing IDs are the #1 root cause of drift.
- Troubleshooting: Use the checklists below to localize issues quickly (Store → Hook → Convex). Clear all persisted state via clearAllPersistedState when in doubt.

## Architecture at a glance

- Stores (Zustand)
  - Projects: `eac/store/projects` — DB-mirrored list + UI flags
  - Editor: `eac/store/editor` — folders/files/tabs; bridges local files to DB via convexId
  - Terminal: `eac/store/terminal` — chat messages (local view), sessions, panel UI
  - Agents: `eac/store/agents` — registry-backed tools, executions
  - Sidebar: `eac/store/sidebar` — open sections, active panel (custom Set serialization)

- Hooks (React)
  - Projects: `useProjects`, `useProjectSync`
  - Files: `useFileSync`, `useProjectFileSync`
  - Chat: `useChat`
  - Trash: `useTrashSync`

- Convex (backend)
  - Schema: `eac/convex/schema.ts` (projects, files, chatMessages/chatSessions, deletedProjects/deletedFiles, activityLogs, socialConnections, redditPosts, agentPosts, users)
  - Projects: `eac/convex/projects.ts` (get/create/update/delete, ensure/get system projects, generateProjectNumber)
  - Files: `eac/convex/files.ts` (CRUD + platform fields, instruction/content creation helpers)
  - Trash: `eac/convex/trash.ts` (soft delete snapshots, restore, permanent delete, cleanup)
  - Chat: `eac/convex/chat.ts`, `chatActions.ts` (message store, streaming thinking)

Import alias in app: `import { api } from '@/convex/_generated/api'`

## Data flow and invariants

1. Projects

- Query: `useProjects()` → useQuery(api.projects.getProjects) → `useProjectStore.setProjects`
- Create: `useProjects.createProject` → mutation(api.projects.createProject) → `useProjectStore.addProject`
- Stats: `useProjects` maps api.projects.getProjectStats → `setProjectStats`
- Sidebar sync: `useProjectSync.performFullSync` keeps Editor folders aligned with Convex (by name + convexId)

Invariants

- DB is source of truth; `useProjectStore.projects` should match `getProjects` for the user
- Each Editor project folder representing a DB project must have `convexId` set

2. Files

- Local create: Editor store `createNewFile` emits `window.dispatchEvent('fileCreated', { file, projectId })`
- Sync: `useFileSync` listens and calls `api.files.createFile`, then updates local file with returned `_id` via `updateFileConvexId`
- Bulk reconcile: `useProjectFileSync` emits `requestProjectFileSync` per folder with `convexId` for components to reconcile

Invariants

- Every DB-backed file in Editor must have `file.convexId`
- For social posts, extensions/mime: `.x` → `text/plain`; markdown → `text/markdown`

3. Terminal chat & sessions

- View: `useChat` queries `api.chat.getChatMessages(sessionId)`
- Send: `useChat` → `api.chatActions.sendChatMessageWithStreaming` (streams thinking via backend); also updates `useSessionStore.updateSession`
- Local store: `useChatStore` persists only `sessionId` (partialize) and manages transient thinking content

Invariants

- Session metadata in `useSessionStore` matches latest messages for active session
- Thinking (`role: 'thinking'`) not counted in billable aggregates; present in message stream

4. Trash (Soft delete)

- Move to trash: `useProjects.deleteProject` → `api.trash.deleteProject`
- Local view: `useTrashSync` queries deleted items and writes to Editor `trashItems`
- Restore/permanent delete: Convex trash functions, then Editor store updates

Invariants

- 30-day retention; deleted tables mirror originals; restore re-creates `files` with original timestamps

5. Agents

- Registry-driven: `store/agents/registry.ts` enumerates tools and normalizes slash commands
- Execution: `useAgentStore.executeAgentTool` → `agentRegistry.executeAgent` (may call Convex mutations passed in)
- Safety: Twitter agent strips disallowed mutation helpers (prevents instruction-file creation)

## Module inventory (where things live)

- Zustand stores
  - Projects: `eac/store/projects/index.ts`, `types.ts`
  - Editor: `eac/store/editor/index.ts`, `types.ts`
  - Terminal: `eac/store/terminal/{index,chat,session}.ts`
  - Agents: `eac/store/agents/{index,registry,*.ts}`
  - Sidebar: `eac/store/sidebar/{index,types}.ts`

- Key hooks
  - Projects: `eac/lib/hooks/useProjects.ts`, `useProjectSync.ts`
  - Files: `eac/lib/hooks/useFileSync.ts`, `useProjectFileSync.ts`
  - Chat: `eac/lib/hooks/useChat.ts`
  - Trash: `eac/lib/hooks/useTrashSync.ts`
  - State utils: `eac/lib/utils/stateSync.ts` (sync + clearAllPersistedState)

- Convex
  - Projects: `eac/convex/projects.ts`
  - Files: `eac/convex/files.ts`
  - Trash: `eac/convex/trash.ts`
  - Chat: `eac/convex/chat.ts`, `chatActions.ts`
  - Schema: `eac/convex/schema.ts`

## Persistence & serialization

- Persisted keys (localStorage)
  - sidebar-store (custom Set serialization)
  - session-store (activeSessionId, panel toggles)
  - chat-store (sessionId only)
  - agent-store (activeAgentId, last 50 executions)
  - editor-storage, project-store, etc. (UI and content state; may be reset)

- Golden rules
  - DB is authoritative: never treat persisted local arrays as truth after login
  - Always attach `convexId` to Editor folders/files that represent DB entities
  - Prefer querying fresh (`useQuery`) then hydrating stores rather than optimistic-only updates

Clear everything safely:

```ts
import { clearAllPersistedState } from "@/lib/utils/stateSync";
clearAllPersistedState(); // then reload the app
```

## Key workflows (step-by-step)

### A) Create project and see it in the sidebar

1. UI → `useProjects.createProject()` → Convex `projects.createProject`
2. On success → `useProjectStore.addProject`
3. `useProjectSync.performFullSync` → creates Editor folder with `convexId`
4. Sidebar now shows the new project (folder name === project.name)

If the folder doesn’t appear:

- Check `useProjects.projects` contains the new project
- Check `performFullSync` logs; confirm `createFolder(name, 'project', _id)` called
- Verify folder has `convexId`; without it, file syncing will be skipped

### B) Create a file in a DB-backed project

1. UI → Editor `createNewFile` (folder has `convexId`)
2. Emits `window.dispatchEvent('fileCreated', { file, projectId: folder.convexId })`
3. `useFileSync` listens → calls `files.createFile` → updates local file’s `convexId`
4. Optional components reconcile via `requestProjectFileSync` events

If file exists locally but not in DB:

- Confirm folder has `convexId`
- Ensure `useFileSync` is mounted and `fileCreated` event fired
- Check `files.createFile` params: type/extension/mime/platform mapping

### C) Terminal chat session with streaming

1. `useChat` queries messages for active session ID (from `useSessionStore` or `useChatStore`)
2. Sending → `chatActions.sendChatMessageWithStreaming` streams thinking; UI shows interim thinking text
3. Session metadata updated via `useSessionStore.updateSession`

If session panel looks stale:

- Confirm `useSessionStore.activeSessionId` matches `useChat`’s currentSessionId
- Verify `messages` updates and `updateSession` is called (see logs)

### D) Move project/file to trash and restore

1. Delete project: `useProjects.deleteProject` → `trash.deleteProject` snapshot + delete
2. `useTrashSync` loads deleted items into Editor `trashItems`
3. Restore via `trash.restoreProject`/`trash.restoreFile` → Editor reflects restored items

If trash isn’t populated:

- Ensure user is authenticated (queries use `useConvexAuth` gating)
- Verify `useTrashSync` mounted; check logs

## Troubleshooting matrix (what to say and where to look)

- Symptom: “Project appears in DB but not in sidebar”
  - Language: “Editor folder sync missing convexId link for project; Zustand Editor store not hydrated from Convex list.”
  - Check: `useProjects.projects` contains item; `performFullSync` logs; folder `convexId` present

- Symptom: “File created in UI doesn’t show in DB”
  - Language: “fileCreated event not handled or project folder lacks convexId; useFileSync didn’t persist to Convex.”
  - Check: Browser event log; `useFileSync` mounted; `api.files.createFile` call; extension/mime/platform mapping

- Symptom: “Chat session metadata not updating”
  - Language: “Session aggregation in useSessionStore not receiving message updates; activeSessionId mismatch.”
  - Check: `useSessionStore.activeSessionId` vs `useChat` currentSessionId; `messages` array; `updateSession` calls

- Symptom: “Soft-deleted items not visible”
  - Language: “Trash queries gated by auth; useTrashSync not initializing due to skip conditions.”
  - Check: `useConvexAuth.isAuthenticated` and Clerk `user`; `api.trash.getDeleted*` queries

- Symptom: “Agent executed but no result in terminal”
  - Language: “Agent registry execution completed but terminal didn’t receive feedback; ensure chat storage of outputs or terminal feedback hook invoked.”
  - Check: `useAgentStore.executions`; `addTerminalFeedback` usage; agent tool returns string

## Logging and DevTools

- Action names (for Redux DevTools):
  - Projects: setProjects, addProject, updateProject, removeProject, setStatusFilter, reset, …
  - Editor: openTab, updateFileConvexId, createFolder, moveToTrash, restoreFromTrash, …
  - Terminal/Session: setActiveSession, addSession, updateSession, toggleSessionsPanel, …

- Quick log snippets

```ts
// Compare DB and store counts
console.log(
  "Convex projects vs store",
  projectsQuery?.length,
  useProjectStore.getState().projects.length,
);

// Inspect a folder’s DB linkage
const folder = useEditorStore
  .getState()
  .projectFolders.find((f) => f.name === "My Project");
console.log("Folder convexId", folder?.convexId);
```

## Guardrails and consistency checks (pre‑trial)

- Ensure all Editor folders representing DB projects have `convexId`
- Mount `useProjectSync`, `useFileSync`, `useTrashSync`, `useChat` in relevant pages
- Verify authenticated queries are not skipped (`isAuthenticated` true)
- Validate Convex functions exist/return values for your user (check Convex dashboard)

## Appendix: Simplified mental model

- Think “DB-first.” UI stores cache and orchestrate, but Convex defines reality.
- If something looks wrong, ask: Do we have the Convex ID? Is the sync hook mounted? Did the event fire?
- Resetting local state is cheap. Protect DB truth; hydrate local state from queries.
