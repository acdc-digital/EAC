# EAC Dashboard - AI Chat Terminal

## Overview

The EAC Dashboard includes an integrated AI chat terminal powered by OpenAI's GPT-4o-mini model. The chat interface uses a terminal-style format with `$ user:` and `$ system:` prompts for an authentic development experience.

## Features

### 🤖 AI Integration

- **OpenAI GPT-4o-mini** for intelligent responses
- **Context-aware** about EAC project structure and technologies
- **Real-time** conversation with Convex backend storage
- **Session management** for conversation continuity

### 💬 Terminal Interface

- **Terminal-style prompts**: `$ user:` and `$ system:`
- **Auto-scroll** to newest messages
- **Auto-focus** input for seamless typing
- **Command suggestions** when typing `/`

### ⚡ Built-in Commands

| Command    | Description                 | Example            |
| ---------- | --------------------------- | ------------------ |
| `/help`    | Show all available commands | `$ user: /help`    |
| `/clear`   | Clear chat history          | `$ user: /clear`   |
| `/project` | Get project structure info  | `$ user: /project` |
| `/files`   | List project files          | `$ user: /files`   |
| `/tech`    | Show tech stack details     | `$ user: /tech`    |
| `/debug`   | Get debugging help          | `$ user: /debug`   |

## Setup

### 1. Environment Configuration

Add your OpenAI API key to `eac/.env.local`:

```env
# OpenAI API Integration for Terminal Chat
OPENAI_API_KEY=your_openai_api_key_here

# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Development Servers

```bash
# Start Convex backend
pnpm convex:dev

# Start Next.js frontend
pnpm dev
```

## Usage

### Accessing the Chat

1. Open your EAC dashboard at `http://localhost:3000`
2. Click the **"AI Chat"** tab in the terminal panel at the bottom
3. Start typing your questions!

### Example Conversations

```bash
$ user: How do I create a new project in EAC?
$ system: To create a new project in the EAC dashboard, you can:

1. Click the "New Project" button in the sidebar
2. Fill in the project details form
3. Set your budget and timeline
4. Save to create the project

The project will be stored in Convex and appear in your dashboard immediately.

$ user: /tech
$ system: Tech Stack Details:

Frontend:
- Next.js 15 (App Router)
- React 18 with TypeScript
- Tailwind CSS v4
- shadcn/ui components

Backend:
- Convex (real-time database)
- OpenAI API integration
- Server actions and mutations
...

$ user: What's the difference between mutations and actions in Convex?
$ system: In Convex, there are key differences between mutations and actions:

**Mutations:**
- Run directly in Convex's database environment
- Can read and write to the database
- Are transactional (all-or-nothing)
- Cannot call external APIs
- Perfect for data operations

**Actions:**
- Run in Node.js environment
- Can call external APIs (like OpenAI)
- Cannot directly access the database
- Must use ctx.runQuery() and ctx.runMutation()
- Perfect for external integrations

In our chat system, we use an action to call OpenAI's API, then use mutations to store the messages in the database.
```

### AI Context

The AI assistant has context about:

- **EAC Project Structure**: Components, state management, routing
- **Technology Stack**: Next.js 15, React, TypeScript, Convex, Tailwind
- **Development Patterns**: Hooks, stores, components organization
- **Common Tasks**: Project creation, file management, debugging

### Command System

Commands are processed locally for instant responses:

- **Local Processing**: Commands like `/help`, `/clear` are handled immediately
- **AI Integration**: Regular questions are sent to OpenAI
- **Smart Routing**: System automatically decides local vs. AI processing

## Architecture

### File Structure

```
eac/
├── app/_components/terminal/
│   ├── terminal.tsx              # Main terminal interface
│   └── _components/
│       └── chatMessages.tsx      # Chat messages display
├── lib/
│   ├── hooks/
│   │   └── useChat.ts           # Chat functionality hook
│   └── chatCommands.ts          # Command definitions
├── store/terminal/
│   └── chat.ts                  # Chat state management
└── convex/
    ├── chat.ts                  # Message storage functions
    ├── chatActions.ts           # OpenAI integration
    └── schema.ts                # Database schema
```

### Data Flow

1. **User Input** → ChatMessages component
2. **Command Check** → Local command handler or OpenAI API
3. **Storage** → Convex database via mutations
4. **Real-time Updates** → Convex queries update UI
5. **Display** → Terminal-style format

### State Management

- **Session Management**: Each chat gets a unique session ID
- **Message Persistence**: All messages stored in Convex database
- **Loading States**: Visual feedback during AI responses
- **Error Handling**: Graceful error messages and recovery

## Customization

### Adding New Commands

Edit `eac/lib/chatCommands.ts`:

```typescript
export const chatCommands: ChatCommand[] = [
  // ... existing commands
  {
    command: "/mycommand",
    description: "Your custom command description",
    example: "$ user: /mycommand"
  }
];

// Add handler in handleCommand function
case '/mycommand':
  return `Your custom response here`;
```

### Modifying AI Context

Edit the system prompt in `convex/chatActions.ts`:

```typescript
{
  role: "system",
  content: `You are an AI assistant for the EAC Financial Dashboard project...

  // Add your custom context here
  `
}
```

### Styling Customization

The chat interface uses VS Code-inspired styling in `chatMessages.tsx`:

- **Colors**: Terminal green (`#4ec9b0`), blue (`#007acc`), etc.
- **Typography**: Monospace font for terminal feel
- **Layout**: Flexbox with scroll handling

## Troubleshooting

### Common Issues

1. **No AI Responses**
   - Check OpenAI API key in `.env.local`
   - Verify Convex backend is running
   - Check browser console for errors

2. **Commands Not Working**
   - Ensure commands start with `/`
   - Check `chatCommands.ts` for available commands
   - Verify local command handling in `useChat.ts`

3. **Messages Not Persisting**
   - Check Convex connection
   - Verify database schema includes `chatMessages` table
   - Ensure session ID generation works

4. **Styling Issues**
   - Check Tailwind CSS classes
   - Verify VS Code color variables
   - Test terminal container sizing

### Debug Mode

Add console logging in development:

```typescript
// In useChat.ts
console.log("Sending message:", content);
console.log("Session ID:", sessionId);
console.log("Is command:", isCommand(content));
```

## Contributing

When adding features to the chat system:

1. **Commands**: Add to `chatCommands.ts` with proper types
2. **Styling**: Maintain VS Code terminal consistency
3. **Error Handling**: Ensure graceful failure modes
4. **Performance**: Consider message limits and cleanup
5. **Documentation**: Update this file with new features

## Future Enhancements

- [ ] **File Upload**: Drag & drop files for analysis
- [ ] **Code Execution**: Run terminal commands through AI
- [ ] **Project Templates**: AI-generated project scaffolding
- [ ] **Voice Input**: Speech-to-text integration
- [ ] **Export Chat**: Save conversations as markdown
- [ ] **Multi-session**: Switch between different chat contexts
