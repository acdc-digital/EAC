// Agent Store
// /Users/matthewsimon/Projects/eac/eac/store/agents/index.ts

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  Agent,
  AgentExecution,
  AgentState,
  AgentTool,
  ConvexMutations,
} from "./types";

// Initial agents - starting with the Instructions agent
const initialAgents: Agent[] = [
  {
    id: "instructions",
    name: "Instructions",
    description: "Generate and maintain project instructions and documentation",
    isActive: false,
    icon: "FileText", // Use string identifier instead of component reference
    tools: [
      {
        id: "generate-instructions",
        name: "Generate Instructions",
        command: "/instructions",
        description: "Create a new instruction document for the project",
        parameters: [
          {
            name: "topic",
            type: "string",
            description: "Topic or area to create instructions for",
            required: true,
          },
          {
            name: "audience",
            type: "select",
            description: "Target audience for the instructions",
            required: false,
            options: ["developers", "users", "administrators", "general"],
          },
        ],
      },
    ],
  },
  {
    id: "twitter-post",
    name: "Twitter Post",
    description:
      "Create, schedule, and post Twitter/X content with full workflow automation",
    isActive: false,
    icon: "Bot", // Use Bot icon for Twitter agent
    tools: [
      {
        id: "create-twitter-post",
        name: "Create Twitter Post",
        command: "/twitter",
        description: "Create and manage a complete Twitter post workflow with automatic form population",
        parameters: [
          {
            name: "content",
            type: "string",
            description: "The content for your Twitter post",
            required: true,
          },
          {
            name: "project",
            type: "string",
            description: "Which project to add the post to (optional)",
            required: false,
          },
          {
            name: "schedule",
            type: "string",
            description:
              'Schedule date/time (e.g., "tomorrow 2pm", "Dec 25 9am")',
            required: false,
          },
          {
            name: "settings",
            type: "select",
            description: "Post settings and reply settings",
            required: false,
            options: [
              "everyone",
              "followers",
              "mentioned-users",
              "verified-accounts",
            ],
          },
        ],
      },
    ],
  },
];

export const useAgentStore = create<AgentState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        agents: initialAgents,
        activeAgentId: null,
        executions: [],
        isLoading: false,
        error: null,

        // Actions
        addAgent: (agentData: Omit<Agent, "id">) => {
          const newAgent: Agent = {
            ...agentData,
            id: crypto.randomUUID(),
          };

          set(
            (state) => ({
              agents: [...state.agents, newAgent],
            }),
            false,
            "addAgent",
          );
        },

        updateAgent: (id: string, updates: Partial<Agent>) => {
          set(
            (state) => ({
              agents: state.agents.map((agent) =>
                agent.id === id ? { ...agent, ...updates } : agent,
              ),
            }),
            false,
            "updateAgent",
          );
        },

        deleteAgent: (id: string) => {
          set(
            (state) => ({
              agents: state.agents.filter((agent) => agent.id !== id),
              activeAgentId:
                state.activeAgentId === id ? null : state.activeAgentId,
            }),
            false,
            "deleteAgent",
          );
        },

        setActiveAgent: (id: string | null) => {
          // First deactivate all agents
          set(
            (state) => ({
              agents: state.agents.map((agent) => ({
                ...agent,
                isActive: false,
              })),
              activeAgentId: id,
            }),
            false,
            "deactivateAllAgents",
          );

          // Then activate the selected agent if provided
          if (id) {
            set(
              (state) => ({
                agents: state.agents.map((agent) =>
                  agent.id === id ? { ...agent, isActive: true } : agent,
                ),
              }),
              false,
              "activateAgent",
            );
          }
        },

        executeAgentTool: async (
          agentId: string,
          toolId: string,
          input: string,
          convexMutations?: ConvexMutations,
        ): Promise<string> => {
          const { agents, addExecution } = get();
          const agent = agents.find((a) => a.id === agentId);
          const tool = agent?.tools.find((t) => t.id === toolId);

          if (!agent || !tool) {
            throw new Error(`Agent or tool not found: ${agentId}/${toolId}`);
          }

          set({ isLoading: true, error: null });

          try {
            // Add execution record
            const executionId = crypto.randomUUID();
            addExecution({
              agentId,
              toolId,
              input,
              status: "pending",
            });

            // Execute the agent tool based on agent type
            let result = "";

            if (agent.id === "instructions") {
              result = await executeInstructionsAgent(
                tool,
                input,
                convexMutations,
              );
            } else if (agent.id === "twitter-post") {
              result = await executeTwitterPostAgent(
                tool,
                input,
                convexMutations,
              );
            } else {
              throw new Error(`Unknown agent type: ${agent.id}`);
            }

            // Update execution with result
            set((state) => ({
              executions: state.executions.map((exec) =>
                exec.id === executionId
                  ? { ...exec, output: result, status: "completed" as const }
                  : exec,
              ),
              isLoading: false,
            }));

            return result;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";

            // Update execution with error
            set((state) => ({
              executions: state.executions.map((exec) =>
                exec.agentId === agentId &&
                exec.toolId === toolId &&
                exec.input === input
                  ? { ...exec, status: "error" as const, error: errorMessage }
                  : exec,
              ),
              isLoading: false,
              error: errorMessage,
            }));

            throw error;
          }
        },

        addExecution: (
          executionData: Omit<AgentExecution, "id" | "timestamp">,
        ) => {
          const execution: AgentExecution = {
            ...executionData,
            id: crypto.randomUUID(),
            timestamp: new Date(),
          };

          set(
            (state) => ({
              executions: [execution, ...state.executions.slice(0, 99)], // Keep last 100 executions
            }),
            false,
            "addExecution",
          );
        },

        clearExecutions: () => {
          set({ executions: [] }, false, "clearExecutions");
        },

        setError: (error: string | null) => {
          set({ error }, false, "setError");
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading }, false, "setLoading");
        },

        reset: () => {
          set(
            {
              agents: initialAgents,
              activeAgentId: null,
              executions: [],
              isLoading: false,
              error: null,
            },
            false,
            "reset",
          );
        },
      }),
      {
        name: "agent-storage",
        version: 3, // Increment version to load new Twitter agent
        partialize: (state) => ({
          agents: state.agents,
          activeAgentId: state.activeAgentId,
          executions: state.executions.slice(0, 50), // Only persist last 50 executions
        }),
        migrate: (persistedState: unknown, version: number) => {
          // If version is different or missing, reset to fresh state
          if (version !== 3) {
            return {
              agents: initialAgents,
              activeAgentId: null,
              executions: [],
            };
          }
          return persistedState;
        },
      },
    ),
    { name: "agent-store" },
  ),
);

// Instructions Agent Tool Execution
async function executeInstructionsAgent(
  tool: AgentTool,
  input: string,
  convexMutations?: ConvexMutations,
): Promise<string> {
  if (tool.id === "generate-instructions") {
    // Clean the input by removing the command and extracting the actual instruction
    let cleanInput = input.trim();

    // Remove the /instructions command if present
    if (cleanInput.startsWith("/instructions")) {
      cleanInput = cleanInput.replace("/instructions", "").trim();
    }

    // Extract audience if specified
    const audienceMatch = cleanInput.match(/audience:\s*(.+?)$/i);
    const audience = audienceMatch?.[1]?.trim() || "all users";

    // Remove audience specification from the instruction content
    const instructionContent = cleanInput
      .replace(/\s+audience:\s*.+$/i, "")
      .trim();

    if (!instructionContent) {
      return `❌ Please provide instruction content. Example: /instructions always say welcome to the EAC`;
    }

    // Generate a brief filename (1-2 words) based on the actual user request
    const briefTitle = generateBriefTitle(instructionContent);
    const filename = briefTitle; // Don't add .md here since createNewFile will add it

    // Create the actual instruction document content
    const documentContent = generateInstructionDocument(
      instructionContent,
      audience,
    );

    try {
      // Try to use Convex mutations if available
      if (convexMutations) {
        // Ensure Instructions project exists
        await convexMutations.ensureInstructionsProject();

        // Create the instruction file in Convex database
        await convexMutations.createInstructionFile({
          name: filename,
          content: documentContent,
          topic: briefTitle,
          audience: audience,
        });

        // Store in local editor for immediate display in the existing Instructions folder
        const { useEditorStore } = await import("@/store");
        const editorStore = useEditorStore.getState();

        // Create file in the Instructions folder using the correct folder ID
        await editorStore.createNewFile(
          filename,
          "markdown",
          "project",
          "instructions-folder",
        );

        // The createNewFile function automatically opens the file, now we need to update its content
        // Find the newly created file and update its content
        const updatedState = useEditorStore.getState();
        const newFile = updatedState.projectFiles.find(
          (file) =>
            file.name === `${filename}.md` &&
            file.folderId === "instructions-folder",
        );

        if (newFile) {
          // Update the file content with our instruction document
          editorStore.updateFileContent(newFile.id, documentContent);
        }

        return `✅ Instructions document created successfully!

**File**: ${filename}.md
**Instruction**: ${instructionContent}
**Audience**: ${audience}
**Location**: Instructions project folder (synced to database)

The instruction has been added to your Instructions folder and will be used as context for all future AI conversations.

**Preview**:
${documentContent.substring(0, 150)}...`;
      } else {
        // Fallback to local creation if Convex mutations not available
        const { useEditorStore } = await import("@/store");
        const editorStore = useEditorStore.getState();

        // Create file in the Instructions folder
        await editorStore.createNewFile(
          filename,
          "markdown",
          "project",
          "instructions-folder",
        );

        // The createNewFile function automatically opens the file, now we need to update its content
        // Find the newly created file and update its content
        const updatedState = useEditorStore.getState();
        const newFile = updatedState.projectFiles.find(
          (file) =>
            file.name === `${filename}.md` &&
            file.folderId === "instructions-folder",
        );

        if (newFile) {
          // Update the file content with our instruction document
          editorStore.updateFileContent(newFile.id, documentContent);
        }

        return `✅ Instructions document created locally!

**File**: ${filename}.md
**Instruction**: ${instructionContent}
**Audience**: ${audience}
**Location**: Instructions project folder

The instruction has been added to your Instructions folder.

**Note**: To enable database sync, use the Instructions agent from a connected component.`;
      }
    } catch (error) {
      console.error("Error creating instruction file:", error);

      return `❌ Failed to create instruction document

**Error**: ${error instanceof Error ? error.message : "Unknown error"}
**Instruction**: ${instructionContent}

Please try again or contact support if the issue persists.`;
    }
  }

  throw new Error(`Unknown tool: ${tool.id}`);
}

// Generate a brief title (1-2 words) from instruction content
function generateBriefTitle(instructionContent: string): string {
  const content = instructionContent.toLowerCase().trim();

  // Extract key action words and concepts to form meaningful titles
  const titleWords: string[] = [];

  // Look for action patterns
  if (content.includes("always say") || content.includes("say")) {
    const sayMatch = content.match(/(?:always\s+)?say\s+["']?([^"'.,!?]+)/i);
    if (sayMatch) {
      const phrase = sayMatch[1].trim().split(" ").slice(0, 2).join("-");
      return phrase.replace(/[^\w-]/g, "").toLowerCase() || "greeting";
    }
    titleWords.push("greeting");
  }

  if (content.includes("welcome")) {
    titleWords.push("welcome");
  }

  if (content.includes("professional") || content.includes("formal")) {
    titleWords.push("professional");
  }

  if (content.includes("friendly") || content.includes("casual")) {
    titleWords.push("friendly");
  }

  if (content.includes("detailed") || content.includes("explain")) {
    titleWords.push("detailed");
  }

  if (content.includes("code") || content.includes("example")) {
    titleWords.push("code");
  }

  if (content.includes("format") || content.includes("style")) {
    titleWords.push("format");
  }

  if (content.includes("response") || content.includes("answer")) {
    titleWords.push("response");
  }

  // If we found meaningful words, use them
  if (titleWords.length > 0) {
    return titleWords.slice(0, 2).join("-");
  }

  // Fallback: extract the most meaningful words from the instruction
  const words = content
    .replace(/[^\w\s]/g, " ")
    .split(" ")
    .filter(
      (word) =>
        word.length > 2 &&
        ![
          "the",
          "and",
          "for",
          "with",
          "that",
          "this",
          "always",
          "never",
          "should",
          "will",
          "can",
          "may",
          "when",
          "where",
          "how",
          "what",
          "why",
        ].includes(word),
    )
    .slice(0, 2);

  if (words.length >= 2) {
    return `${words[0]}-${words[1]}`;
  } else if (words.length === 1) {
    return `${words[0]}-instruction`;
  }

  return "custom-instruction";
}

// Generate the actual instruction document content
function generateInstructionDocument(
  instructionContent: string,
  audience: string,
): string {
  const currentDate = new Date().toLocaleDateString();

  return `# AI Instruction

**Created**: ${currentDate}  
**Audience**: ${audience}  
**Project**: EAC Financial Dashboard

## Instruction

${instructionContent}

## Context

This instruction should be applied to all responses when assisting with the EAC Financial Dashboard project.

## Implementation

The AI assistant should incorporate this instruction into every response, regardless of whether MCP tools or agent tools are being used.

---

*This instruction is automatically loaded as context for all AI conversations.*`;
}

// Twitter Post Agent Tool Execution
async function executeTwitterPostAgent(
  tool: AgentTool,
  input: string,
  convexMutations?: ConvexMutations,
): Promise<string> {
  if (tool.id === "create-twitter-post") {
    // Clean the input by removing the command
    let cleanInput = input.trim();

    // Remove the /twitter command if present
    if (cleanInput.startsWith("/twitter")) {
      cleanInput = cleanInput.replace("/twitter", "").trim();
    }

    if (!cleanInput) {
      return `❌ Please provide content for your Twitter post. Example: /twitter Check out our new dashboard!`;
    }

    try {
      // Import the modular tools
      const { processTwitterRequest } = await import("../../../.claude/.tools/twitter/index");
      const { useEditorStore } = await import("../");
      
      // Parse parameters from input
      const params = parseTwitterParameters(cleanInput);

      // Use the modular tools processor
      const result = await processTwitterRequest(
        {
          userInput: params.content,
          suggestedProject: params.project,
          schedule: params.schedule,
          settings: params.settings
        },
        useEditorStore.getState() // Pass the store state, not the hook
      );

      if (!result.success) {
        return `❌ Error processing Twitter request: ${result.message}`;
      }

      // Step 1: Create project folder if it's a new project
      if (result.project.isNewProject) {
        const { useEditorStore } = await import("../");
        const editorStore = useEditorStore.getState();
        await editorStore.createFolder(result.project.projectName, "project");
      }

      // Step 2: Create the .x file in the selected project
      const fileName = await createTwitterFile(
        result.content.content, 
        result.project.projectName
      );

      // Step 3: Fill form fields and apply default settings
      const formData = prepareTwitterFormData({
        content: result.content.content,
        project: result.project.projectName,
        schedule: params.schedule,
        settings: params.settings
      });

      // Step 3.1: Actually populate the form fields with the processed data
      await fillTwitterFormFieldsWithData(fileName, result.content.content, formData);

      // Step 4: Handle scheduling if requested
      let schedulingResult = "";
      if (params.schedule) {
        schedulingResult = await handleTwitterScheduling(
          fileName,
          params.schedule,
          formData,
        );
      }

      // Step 5: Generate response based on scheduling
      if (params.schedule) {
        return `✅ Twitter post scheduled successfully!

**File**: ${fileName}
**Project**: ${result.project.projectName} ${result.project.isNewProject ? '(New)' : ''}
**Generated Content**: "${result.content.content}"
**Content Style**: ${result.content.style}
**Topic**: ${result.content.detectedTopic}
**Scheduled**: ${params.schedule}
**Settings**: ${params.settings || "Default (Everyone can reply)"}

${schedulingResult}

🎯 **Form fields automatically populated!** The post has been created with improved content variety, scheduled, and the XPostEditor is ready for any final edits.`;
      } else {
        // Post immediately
        const postResult = await postTwitterImmediately(fileName, formData);

        return `✅ Twitter post created and ready!

**File**: ${fileName}
**Project**: ${result.project.projectName} ${result.project.isNewProject ? '(New)' : ''}
**Generated Content**: "${result.content.content}"
**Content Style**: ${result.content.style}
**Topic**: ${result.content.detectedTopic}
**Settings**: ${params.settings || "Default (Everyone can reply)"}

${postResult}

🎯 **Form fields automatically populated!** The post has been created with improved content variety and the XPostEditor is ready for any final edits.`;
      }
    } catch (error) {
      console.error("Error creating Twitter post:", error);

      return `❌ Failed to create Twitter post

**Error**: ${error instanceof Error ? error.message : "Unknown error"}
**Input**: ${cleanInput}

Please try again or create the post manually.`;
    }
  }

  throw new Error(`Unknown tool: ${tool.id}`);
}

// Helper functions for Twitter Post Agent
interface TwitterParams {
  content: string;
  project?: string;
  schedule?: string;
  settings?: string;
}

function parseTwitterParameters(input: string): TwitterParams {
  const params: TwitterParams = {
    content: input,
  };

  // Extract project parameter
  const projectMatch = input.match(/project:\s*([^\s]+)/i);
  if (projectMatch) {
    params.project = projectMatch[1];
    params.content = params.content.replace(projectMatch[0], "").trim();
  }

  // Extract schedule parameter
  const scheduleMatch = input.match(
    /schedule:\s*(.+?)(?:\s+(?:project|settings):|$)/i,
  );
  if (scheduleMatch) {
    params.schedule = scheduleMatch[1];
    params.content = params.content.replace(scheduleMatch[0], "").trim();
  }

  // Extract settings parameter
  const settingsMatch = input.match(/settings:\s*([^\s]+)/i);
  if (settingsMatch) {
    params.settings = settingsMatch[1];
    params.content = params.content.replace(settingsMatch[0], "").trim();
  }

  return params;
}

async function generateTwitterContent(userRequest: string): Promise<string> {
  // Detect if user is requesting content generation vs providing literal content
  const generationKeywords = [
    "create",
    "generate",
    "write",
    "make",
    "post about",
    "tweet about",
    "motivational",
    "inspirational",
    "funny",
    "educational",
    "professional",
    "announcement",
    "update",
    "news",
    "tip",
    "advice",
    "quote",
  ];

  const isContentRequest = generationKeywords.some((keyword) =>
    userRequest.toLowerCase().includes(keyword.toLowerCase()),
  );

  if (!isContentRequest) {
    // User provided literal content, use as-is
    return userRequest;
  }

  // Generate content based on user request
  try {
    const generatedContent = await generateAIContent(userRequest);
    return generatedContent;
  } catch (error) {
    console.error("Failed to generate AI content:", error);
    // Fallback to user's original text
    return userRequest;
  }
}

async function generateAIContent(request: string): Promise<string> {
  const requestLower = request.toLowerCase();
  
  // Extract the topic from the request
  const topic = extractTopicFromRequest(requestLower) || extractGeneralTopic(requestLower);
  
  // Generate content based on the topic
  return generateTopicSpecificContent(topic);
}

// Helper function to extract general topics from any request
function extractGeneralTopic(request: string): string {
  // Look for key topic words in the request
  const topicWords = [
    'japan', 'tourism', 'travel', 'food', 'cooking', 'tech', 'technology',
    'music', 'art', 'business', 'finance', 'health', 'fitness', 'education',
    'learning', 'science', 'nature', 'environment', 'sports', 'gaming',
    'books', 'reading', 'movies', 'photography', 'design', 'fashion',
    'productivity', 'motivation', 'inspiration', 'career', 'startup',
    'innovation', 'creativity', 'lifestyle', 'wellness', 'mindfulness'
  ];
  
  // Find topic words in the request
  const foundTopics = topicWords.filter(topic => 
    request.includes(topic) || request.includes(topic + 's')
  );
  
  // Return the first found topic or 'general' as fallback
  return foundTopics[0] || 'general';
}

// Helper function to extract topic from "post about X" requests
function extractTopicFromRequest(request: string): string {
  // First try to extract from "about X" pattern
  const aboutMatch = request.match(/(?:post|tweet|write|generate|create).*?about\s+([^,\.]+)/i);
  if (aboutMatch) {
    return aboutMatch[1].trim();
  }
  
  // Look for content type patterns
  if (request.includes("announcement")) return "announcement";
  if (request.includes("tip") || request.includes("advice")) return "tip";
  if (request.includes("quote")) return "quote";
  if (request.includes("news")) return "news";
  if (request.includes("update")) return "update";
  
  return '';
}

// Generate content for specific topics
function generateTopicSpecificContent(topic: string): string {
  const topicLower = topic.toLowerCase();
  
  // Generate engaging, topic-specific content
  if (topicLower.includes("japan") || topicLower.includes("tourism") || topicLower.includes("travel")) {
    return "🗾 Japan's breathtaking landscapes blend ancient traditions with modern marvels. From cherry blossoms in Kyoto to neon lights in Tokyo—every moment is magic! #JapanTravel #Tourism #Culture";
  } else if (topicLower.includes("food") || topicLower.includes("cooking")) {
    return "🍽️ Great food brings people together! What's your favorite dish that reminds you of home? Share your culinary adventures! #Food #Cooking #Culture";
  } else if (topicLower.includes("tech") || topicLower.includes("technology")) {
    return "💻 Technology is reshaping our world at lightning speed. Which innovation excites you most about the future? #Technology #Innovation #Future";
  } else if (topicLower.includes("music") || topicLower.includes("art")) {
    return "🎵 Art and music speak the universal language of emotion. What song or artwork moved you recently? #Music #Art #Creativity";
  } else if (topicLower.includes("business") || topicLower.includes("finance")) {
    return "📊 Building something meaningful takes vision, persistence, and the right strategy. What business insight changed your perspective recently? #Business #Strategy #Growth";
  } else if (topicLower.includes("health") || topicLower.includes("fitness") || topicLower.includes("wellness")) {
    return "💪 Your health is your wealth! Small daily choices compound into life-changing results. What healthy habit are you building today? #Health #Wellness #Fitness";
  } else if (topicLower.includes("education") || topicLower.includes("learning")) {
    return "📚 Learning never stops! Every day is an opportunity to discover something new. What fascinating thing did you learn recently? #Learning #Education #Growth";
  } else if (topicLower.includes("environment") || topicLower.includes("nature")) {
    return "🌱 Our planet is incredible! From tiny ecosystems to vast landscapes, nature inspires and sustains us. How do you connect with nature? #Environment #Nature #Sustainability";
  } else if (topicLower.includes("sports") || topicLower.includes("gaming")) {
    return "🎮 Whether it's sports or gaming, competition brings out our best! What game or sport pushes you to improve? #Sports #Gaming #Competition";
  } else if (topicLower.includes("productivity") || topicLower.includes("career")) {
    return "🚀 Great careers are built one productive day at a time. What's your secret to staying focused and motivated? #Productivity #Career #Success";
  } else if (topicLower.includes("creativity") || topicLower.includes("design")) {
    return "🎨 Creativity is the bridge between imagination and reality. What creative project are you excited about right now? #Creativity #Design #Innovation";
  } else if (topicLower.includes("announcement")) {
    return "🎉 Exciting news coming soon! Stay tuned for updates that will make a difference. #Announcement #News #Exciting";
  } else if (topicLower.includes("tip") || topicLower.includes("advice")) {
    return "💡 Here's a game-changing tip: Consistency beats perfection every time. Small daily actions compound into extraordinary results! #Tips #Advice #Success";
  } else if (topicLower.includes("quote")) {
    return '"The only way to do great work is to love what you do." - Steve Jobs ✨ What work are you passionate about today? #Inspiration #Quotes #Motivation';
  } else {
    // Dynamic content generation for any topic
    const topicFormatted = topic.charAt(0).toUpperCase() + topic.slice(1);
    const hashtag = topic.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    
    return `✨ There's so much to explore about ${topicFormatted}! Every topic has fascinating depths waiting to be discovered. What aspect interests you most? #${hashtag} #Discovery #Learning`;
  }
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function selectProjectForTwitterPost(
  suggestedProject?: string,
): Promise<string> {
  // Import editor store to get available projects
  const { useEditorStore } = await import("@/store");
  const editorStore = useEditorStore.getState();
  const { projectFolders } = editorStore;

  // If a specific project was suggested and exists, use it
  if (suggestedProject) {
    const matchingFolder = projectFolders.find(
      (folder) =>
        folder.name.toLowerCase().includes(suggestedProject.toLowerCase()) &&
        folder.name.toLowerCase() !== "instructions",
    );
    if (matchingFolder) {
      return matchingFolder.name;
    }
  }

  // Filter out Instructions folder explicitly (by name and pinned status)
  const regularFolders = projectFolders.filter(
    (folder) =>
      !folder.pinned &&
      folder.name.toLowerCase() !== "instructions" &&
      folder.id !== "instructions-folder",
  );

  // If no regular project folders exist, create a default "Social Media" folder
  if (regularFolders.length === 0) {
    editorStore.createFolder("Social Media", "project");
    return "Social Media";
  }

  // Default to the first available regular project folder
  return regularFolders[0].name;
}

async function createTwitterFile(
  content: string,
  projectName: string,
): Promise<string> {
  const { useEditorStore } = await import("@/store");
  const editorStore = useEditorStore.getState();

  // Generate filename based on content
  const fileName = generateTwitterFileName(content);

  // Find the project folder
  const projectFolder = editorStore.projectFolders.find(
    (folder) => folder.name === projectName,
  );

  if (!projectFolder) {
    throw new Error(`Project folder "${projectName}" not found`);
  }

  // Create the .x file
  await editorStore.createNewFile(fileName, "x", "project", projectFolder.id);

  // Find the newly created file and update its content with initial data
  const newFile = editorStore.projectFiles.find(
    (file) =>
      file.name === `${fileName}.x` && file.folderId === projectFolder.id,
  );

  if (newFile) {
    // Create initial Twitter post content with JSON structure
    const initialContent = createInitialTwitterContent(content);
    editorStore.updateFileContent(newFile.id, initialContent);

    // NOTE: Form field population is now handled in the main workflow
    // with properly processed form data, so we don't duplicate it here
  }

  return `${fileName}.x`;
}

// New function to properly fill Twitter form fields using the useSocialPost system
async function fillTwitterFormFields(
  fileName: string,
  content: string,
  formData?: TwitterParams,
): Promise<void> {
  try {
    // Prepare the platform data that the XPostEditor expects
    const platformData = {
      replySettings: mapTwitterSettingsToAPI(formData?.settings) || "following",
      scheduledDate: formData?.schedule
        ? parseScheduleDateComponent(formData.schedule)
        : "",
      scheduledTime: formData?.schedule
        ? parseScheduleTimeComponent(formData.schedule)
        : "",
      isThread: false,
      threadTweets: [content],
      hasPoll: false,
      pollOptions: ["", ""],
      pollDuration: 1440,
    };

    // Log what we're doing for debugging
    console.log(`📝 Filling Twitter form fields for ${fileName}:`, {
      content: content.substring(0, 50) + "...",
      replySettings: platformData.replySettings,
      scheduledDate: platformData.scheduledDate,
      scheduledTime: platformData.scheduledTime,
      status: formData?.schedule ? "scheduled" : "draft",
    });

    // Use the Convex API directly to save the post data
    // This will make the data available when XPostEditor loads
    try {
      console.log("🔄 Saving Twitter post data to Convex database...");
      
      // Import Convex client to call the mutation directly
      const { ConvexHttpClient } = await import("convex/browser");
      const { api } = await import("@/convex/_generated/api");
      
      // Create Convex client - this should use the same URL as your app
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://pleased-jay-348.convex.cloud";
      const client = new ConvexHttpClient(convexUrl);
      
      // Prepare the mutation data
      const mutationData = {
        fileName: fileName,
        fileType: "twitter" as "twitter",
        content: content,
        title: undefined, // Twitter doesn't use titles
        platformData: JSON.stringify(platformData),
        status: formData?.schedule ? "scheduled" : "draft",
        userId: "temp-user-id", // TODO: Replace with actual user ID when auth is implemented
      };
      
      console.log("📤 Calling upsertPost mutation:", {
        fileName: mutationData.fileName,
        fileType: mutationData.fileType,
        contentLength: mutationData.content.length,
        status: mutationData.status,
      });
      
      // Call the upsertPost mutation to save to database
      const result = await client.mutation(api.socialPosts.upsertPost, mutationData);
      
      console.log("✅ Successfully saved Twitter post to database:", {
        postId: result?._id,
        fileName: result?.fileName,
        status: result?.status,
      });
      
      console.log("🎯 Form fields will now auto-populate when XPostEditor loads!");
      
      
    } catch (convexError) {
      console.warn("⚠️ Could not save to Convex database directly:", convexError);
      console.log("📝 Form data will be loaded from file content when editor opens");
    }

  } catch (error) {
    console.error("❌ Failed to prepare Twitter form fields:", error);
    // Don't throw - the file creation should still succeed
    // The user can manually fill the form if needed
  }
}

// New function that accepts prepared form data
async function fillTwitterFormFieldsWithData(
  fileName: string,
  content: string,
  preparedFormData: any,
): Promise<void> {
  try {
    // Use the already prepared platform data
    const platformData = {
      replySettings: preparedFormData.replySettings,
      scheduledDate: "", // Will be handled by scheduling function
      scheduledTime: "", // Will be handled by scheduling function
      isThread: preparedFormData.isThread,
      threadTweets: preparedFormData.threadTweets,
      hasPoll: preparedFormData.hasPoll,
      pollOptions: preparedFormData.pollOptions,
      pollDuration: preparedFormData.pollDuration,
    };

    // Log what we're doing for debugging
    console.log(`📝 Filling Twitter form fields for ${fileName}:`, {
      content: content.substring(0, 50) + "...",
      replySettings: platformData.replySettings,
      status: "draft",
    });

    // Instead of trying to use Convex directly (which fails in server context),
    // let's create a temporary storage mechanism that the client can pick up
    try {
      // Store the form data in localStorage for the client to pick up
      if (typeof window !== 'undefined') {
        const formDataKey = `twitter-form-${fileName}`;
        const formDataToStore = {
          content: content,
          platformData: platformData,
          timestamp: Date.now(),
          status: 'draft'
        };
        
        localStorage.setItem(formDataKey, JSON.stringify(formDataToStore));
        console.log(`✅ Twitter form data stored in localStorage for ${fileName}`);
      } else {
        // Server-side: We'll let the client handle the data loading
        console.log("📝 Server-side context - form data will be handled by client components");
      }

    } catch (storageError) {
      console.warn("⚠️ Could not store form data:", storageError);
      console.log("📝 Form data will be loaded from file content when editor opens");
    }

  } catch (error) {
    console.error("❌ Failed to prepare Twitter form fields:", error);
  }
}

// Helper functions for form field mapping
function mapTwitterSettingsToAPI(
  settings?: string,
): "following" | "mentionedUsers" | "subscribers" | "verified" {
  if (!settings) return "following";

  switch (settings.toLowerCase()) {
    case "everyone":
      return "following";
    case "followers":
      return "following";
    case "mentioned-users":
      return "mentionedUsers";
    case "verified-accounts":
      return "verified";
    default:
      return "following";
  }
}

function parseScheduleDateComponent(schedule: string): string {
  const date = parseScheduleString(schedule);
  if (!date) return "";

  // Return YYYY-MM-DD format for HTML date input
  return date.toISOString().split("T")[0];
}

function parseScheduleTimeComponent(schedule: string): string {
  const date = parseScheduleString(schedule);
  if (!date) return "";

  // Return HH:MM format for HTML time input
  return date.toTimeString().slice(0, 5);
}

function generateTwitterFileName(content: string): string {
  // Extract meaningful words from the generated content to create filename
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/https?:\/\/[^\s]+/g, "") // Remove URLs
    .replace(/#\w+/g, "") // Remove hashtags
    .split(" ")
    .filter(
      (word) =>
        word.length > 2 &&
        ![
          "the",
          "and",
          "for",
          "with",
          "that",
          "this",
          "are",
          "you",
          "your",
          "can",
          "will",
          "our",
          "today",
          "what",
          "how",
          "when",
          "where",
          "why",
          "isnt",
          "about",
        ].includes(word),
    )
    .slice(0, 3);

  if (words.length >= 2) {
    return `${words[0]}-${words[1]}-post`;
  } else if (words.length === 1) {
    return `${words[0]}-post`;
  }

  // Fallback to date-based naming
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, "");
  return `twitter-post-${timestamp}`;
}

function createInitialTwitterContent(content: string): string {
  const timestamp = new Date().toISOString();

  // Create the structure that XPostEditor expects
  // This should match the structure that useSocialPost creates
  return JSON.stringify(
    {
      fileName: `twitter-post-${Date.now()}.x`,
      platform: "twitter",
      fileType: "twitter",
      content: content, // The main tweet content
      title: undefined, // Twitter doesn't use titles
      platformData: {
        replySettings: "following",
        scheduledDate: "",
        scheduledTime: "",
        isThread: false,
        threadTweets: [content],
        hasPoll: false,
        pollOptions: ["", ""],
        pollDuration: 1440,
      },
      status: "draft",
      timestamp,
      userId: "temp-user-id", // TODO: Replace with actual user ID
    },
    null,
    2,
  );
}

function prepareTwitterFormData(params: TwitterParams) {
  // Map settings parameter to API values
  let replySettings:
    | "following"
    | "mentionedUsers"
    | "subscribers"
    | "verified" = "following";

  if (params.settings) {
    switch (params.settings.toLowerCase()) {
      case "everyone":
        replySettings = "following";
        break;
      case "followers":
        replySettings = "following";
        break;
      case "mentioned-users":
        replySettings = "mentionedUsers";
        break;
      case "verified-accounts":
        replySettings = "verified";
        break;
    }
  }

  return {
    content: params.content,
    replySettings,
    isThread: false,
    threadTweets: [params.content],
    hasPoll: false,
    pollOptions: ["", ""],
    pollDuration: 1440,
  };
}

async function handleTwitterScheduling(
  fileName: string,
  schedule: string,
  formData: any,
): Promise<string> {
  // Parse the schedule string into date/time
  const scheduledDateTime = parseScheduleString(schedule);

  if (!scheduledDateTime) {
    return `⚠️ Could not parse schedule "${schedule}". Post created as draft.`;
  }

  try {
    // Update the file content to include scheduling information
    const { useEditorStore } = await import("@/store");
    const editorStore = useEditorStore.getState();

    // Find the file and update it with scheduling data
    const file = editorStore.projectFiles.find((f) => f.name === fileName);
    if (file) {
      // Parse existing content and add scheduling
      let existingContent;
      try {
        existingContent = JSON.parse(file.content || "{}");
      } catch {
        existingContent = {};
      }

      // Update with scheduling information
      const updatedContent = {
        ...existingContent,
        status: "scheduled",
        platformData: {
          ...existingContent.platformData,
          scheduledDate: scheduledDateTime.toISOString().split("T")[0],
          scheduledTime: scheduledDateTime.toTimeString().slice(0, 5),
        },
        scheduledFor: scheduledDateTime.getTime(),
      };

      // Update file content
      editorStore.updateFileContent(
        file.id,
        JSON.stringify(updatedContent, null, 2),
      );
    }

    return `📅 Scheduled for ${scheduledDateTime.toLocaleString()}`;
  } catch (error) {
    console.error("Failed to update scheduling:", error);
    return `📅 Scheduled for ${scheduledDateTime.toLocaleString()} (file update failed)`;
  }
}

async function postTwitterImmediately(
  fileName: string,
  formData: any,
): Promise<string> {
  // TODO: Integrate with the actual X API posting
  // This would need to use the useXApi hook to post immediately

  return `📝 Post created and ready to publish. Use the "Tweet" button in the editor to post immediately.`;
}

function parseScheduleString(schedule: string): Date | null {
  // Simple schedule parsing - can be enhanced
  const now = new Date();

  // Handle "tomorrow" + time
  if (schedule.toLowerCase().includes("tomorrow")) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeMatch = schedule.match(/(\d{1,2})(am|pm)/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      if (timeMatch[2].toLowerCase() === "pm" && hour !== 12) hour += 12;
      if (timeMatch[2].toLowerCase() === "am" && hour === 12) hour = 0;

      tomorrow.setHours(hour, 0, 0, 0);
      return tomorrow;
    }

    // Default to 9 AM tomorrow
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }

  // Handle specific dates like "Dec 25 9am"
  const dateTimeMatch = schedule.match(
    /(\w{3})\s+(\d{1,2})\s+(\d{1,2})(am|pm)/i,
  );
  if (dateTimeMatch) {
    const month = getMonthNumber(dateTimeMatch[1]);
    const day = parseInt(dateTimeMatch[2]);
    let hour = parseInt(dateTimeMatch[3]);
    const ampm = dateTimeMatch[4].toLowerCase();

    if (ampm === "pm" && hour !== 12) hour += 12;
    if (ampm === "am" && hour === 12) hour = 0;

    const date = new Date(now.getFullYear(), month, day, hour, 0, 0, 0);

    // If the date is in the past, assume next year
    if (date < now) {
      date.setFullYear(date.getFullYear() + 1);
    }

    return date;
  }

  return null;
}

function getMonthNumber(monthAbbr: string): number {
  const months: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  return months[monthAbbr.toLowerCase()] || 0;
}
