# Convex Instructions for GitHub Copilot

This file contains instructions for GitHub Copilot when working with Convex in this project.

## Project Architecture

**Important**: In this monorepo, the Next.js app and Convex backend live under `/eac/`.

- Convex backend: `/eac/convex/`
- Next.js frontend: `/eac/`
- Import path from frontend (tsconfig alias): `import { api } from '@/convex/_generated/api';`

## Database Schema and Functions

### Writing Convex Functions

When writing Convex functions, always follow these patterns:

#### Query Functions

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("desc")
      .take(args.limit ?? 50);

    return messages;
  },
});
```

#### Mutation Functions

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createMessage = mutation({
  args: {
    text: v.string(),
    conversationId: v.id("conversations"),
    authorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      text: args.text,
      conversationId: args.conversationId,
      authorId: args.authorId,
      createdAt: Date.now(),
    });

    return await ctx.db.get(messageId);
  },
});
```

#### Action Functions

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";

export const sendNotification = action({
  args: {
    userId: v.id("users"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Actions can call third-party APIs
    const response = await fetch("https://api.notification-service.com/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: args.userId,
        message: args.message,
      }),
    });

    return response.json();
  },
});
```

### Schema Definition

Always define schemas in `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  conversations: defineTable({
    title: v.string(),
    participants: v.array(v.id("users")),
    createdAt: v.number(),
  }),

  messages: defineTable({
    text: v.string(),
    conversationId: v.id("conversations"),
    authorId: v.id("users"),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),
});
```

### Client-Side Usage

**Note**: When importing from the Next.js app (`/eac/`), use `'../convex/_generated/api'` to reference the root-level Convex functions.

#### Using Queries

```typescript
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

function MessageList({ conversationId }: { conversationId: Id<'conversations'> }) {
  const messages = useQuery(api.messages.getMessages, {
    conversationId,
    limit: 50
  });

  if (messages === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {messages.map((message) => (
        <div key={message._id}>{message.text}</div>
      ))}
    </div>
  );
}
```

#### Using Mutations

```typescript
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

function SendMessage({ conversationId }: { conversationId: Id<'conversations'> }) {
  const createMessage = useMutation(api.messages.createMessage);

  const handleSubmit = async (text: string) => {
    await createMessage({
      text,
      conversationId,
      authorId: 'user_123' as Id<'users'>, // In practice, get from auth
    });
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleSubmit(formData.get('text') as string);
    }}>
      <input name="text" placeholder="Type a message..." />
      <button type="submit">Send</button>
    </form>
  );
}
```

## Best Practices

### Argument Validation

- Always validate function arguments using Convex validators (`v.string()`, `v.number()`, etc.)
- Use `v.optional()` for optional arguments
- Use `v.id('tableName')` for document IDs
- Use `v.array()` for arrays and `v.object()` for nested objects

### Database Queries

- Use indexes for efficient queries: `.withIndex('indexName', (q) => q.eq('field', value))`
- Limit query results with `.take(n)` to avoid performance issues
- Use `.order('asc')` or `.order('desc')` for ordering
- Filter with `.filter((q) => q.eq('field', value))`

### Error Handling

- Use `ConvexError` for user-facing errors:

```typescript
import { ConvexError } from "convex/values";

if (!user) {
  throw new ConvexError("User not found");
}
```

### File Organization

- Keep related functions in the same file (e.g., all message functions in `messages.ts`)
- Use descriptive function names
- Group by feature/domain rather than function type

### Security

- Always validate user permissions in mutations and queries
- Use `ctx.auth.getUserIdentity()` to get the current user
- Validate that users can only access their own data or public data

### Performance

- Use pagination for large datasets
- Create appropriate indexes for your query patterns
- Avoid N+1 queries by batching database calls when possible

### Agent & Token Model Notes

- Slash commands normalized: `/instructions`, `/twitter`, `/create-project`, `/create-file`, `/schedule`.
- `chatMessages` includes `role: 'thinking'` (non-billable), `interactiveComponent`, and `processIndicator` fields.
- `chatSessions` aggregates `totalTokens`, `totalInputTokens`, `totalOutputTokens`, `totalCost`; keep invariants consistent.

### GPT‑5 Ready Guidance

- Keep server functions deterministic and idempotent where possible.
- Validate all inputs with `v.*` and return typed, minimal payloads.
- Do not store or log API secrets; prefer Convex environment variables/KMS.

## Common Patterns

### Pagination

```typescript
export const getMessagesPaginated = query({
  args: {
    conversationId: v.id("conversations"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

### Authentication Check

```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new ConvexError("Not authenticated");
}

const user = await ctx.db
  .query("users")
  .withIndex("by_email", (q) => q.eq("email", identity.email!))
  .unique();

if (!user) {
  throw new ConvexError("User not found");
}
```

### Batch Operations

```typescript
export const createMultipleMessages = mutation({
  args: {
    messages: v.array(
      v.object({
        text: v.string(),
        conversationId: v.id("conversations"),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const messageIds = await Promise.all(
      args.messages.map((msg) =>
        ctx.db.insert("messages", {
          ...msg,
          authorId: "user_123" as Id<"users">,
          createdAt: Date.now(),
        }),
      ),
    );

    return messageIds;
  },
});
```

## Development Workflow

1. **Define Schema First**: Always start with defining your data schema in `convex/schema.ts`
2. **Write Functions**: Create query and mutation functions in separate files by feature
3. **Test Functions**: Use the Convex dashboard to test functions before integrating
4. **Generate Types**: Run `npx convex dev` to regenerate types after schema changes
5. **Client Integration**: Use the generated API in your React components

## Debugging

- Use `console.log()` in Convex functions for debugging
- Check the Convex dashboard for function execution logs
- Use the Convex CLI: `npx convex logs` to see real-time logs
- Test functions individually in the Convex dashboard before client integration

Remember: Convex functions are automatically transactional, so you don't need to worry about partial writes or rollbacks in mutations.
