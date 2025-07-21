// Chat Commands Helper
// /Users/matthewsimon/Projects/eac/eac/lib/chatCommands.ts

export interface ChatCommand {
  command: string;
  description: string;
  example: string;
}

export const chatCommands: ChatCommand[] = [
  {
    command: "/help",
    description: "Show available commands and natural language examples",
    example: "$ user: /help"
  },
  {
    command: "/clear",
    description: "Clear chat history",
    example: "$ user: /clear"
  },
  {
    command: "/project",
    description: "Get project structure (or ask: 'analyze the project structure')",
    example: "$ user: /project"
  },
  {
    command: "/components",
    description: "List components (or ask: 'what components do we have?')",
    example: "$ user: /components"
  },
  {
    command: "/stores",
    description: "Analyze state stores (or ask: 'how is state management organized?')",
    example: "$ user: /stores"
  },
  {
    command: "/convex",
    description: "Convex database info (or ask: 'show me the database schema')",
    example: "$ user: /convex"
  },
  {
    command: "/generate",
    description: "Generate code (or ask: 'create a new analytics component')",
    example: "$ user: /generate ComponentName"
  }
];

export function isCommand(message: string): boolean {
  return message.startsWith('/');
}

export function parseCommand(message: string): { command: string; args: string[] } {
  const parts = message.split(' ');
  const command = parts[0];
  const args = parts.slice(1);
  
  return { command, args };
}

export function getCommandHelp(): string {
  return `Available Commands:

${chatCommands.map(cmd => `${cmd.command} - ${cmd.description}
  Example: ${cmd.example}`).join('\n\n')}

**Natural Language Examples:**
- "What's the project structure?"
- "Show me all dashboard components"
- "How is state management organized?"
- "Analyze the Convex database schema"
- "Generate a new analytics component"
- "What components use the editor store?"
- "How do components connect to Convex?"

You can use either commands or natural language - the AI will understand both!`;
}

export function handleCommand(command: string): string | null {
  switch (command) {
    case '/help':
      return getCommandHelp();
      
    case '/project':
      return `EAC Dashboard Project Structure:

📁 Frontend: Next.js 15 with App Router
📁 Backend: Convex real-time database
📁 State: Zustand with persistence
📁 UI: Tailwind CSS v4 + shadcn/ui
📁 Editor: Tiptap rich text editing
📁 Chat: OpenAI GPT-4o-mini integration

Key Directories:
- eac/app/_components/ - React components
- eac/store/ - Zustand stores  
- convex/ - Backend functions and schema
- eac/lib/ - Utilities and hooks`;

    case '/tech':
      return `Tech Stack Details:

Frontend:
- Next.js 15 (App Router)
- React 18 with TypeScript
- Tailwind CSS v4
- shadcn/ui components

Backend:
- Convex (real-time database)
- OpenAI API integration
- Server actions and mutations

State Management:
- Zustand for client state
- Convex queries for server state
- Local storage persistence

Development:
- pnpm workspace
- TypeScript strict mode
- ESLint + Prettier`;

    case '/files':
      return `File Organization:

📁 Components:
- Dashboard components in app/_components/dashboard/
- Editor components in app/_components/editor/
- Terminal/Chat in app/_components/terminal/

📁 State Management:
- store/projects/ - Project data
- store/editor/ - Editor state
- store/terminal/ - Chat state

📁 Backend:
- convex/schema.ts - Database schema
- convex/projects.ts - Project functions
- convex/chat.ts - Chat functions

📁 Configuration:
- tsconfig.json - TypeScript config
- tailwind.config.js - Styling
- convex.json - Backend config`;

    case '/clear':
      return null; // This will be handled by the component to actually clear messages
      
    default:
      return null;
  }
}
