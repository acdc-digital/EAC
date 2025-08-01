# Twitter Agent Tools

This directory contains modular tools for the Twitter agent functionality, addressing the content quality and code organization issues identified in the chat logs.

## Architecture

The tools follow a singleton pattern with dependency injection to maintain state while being testable and maintainable.

## Components

### `contentGenerator.ts`
**Purpose**: Generate diverse, engaging Twitter content with improved variety

**Key Features**:
- **Topic Detection**: Automatically identifies content themes (tech, business, learning, etc.)
- **Style Extraction**: Determines tone (casual, professional, educational, etc.) 
- **Template Variety**: 10+ unique templates per topic to eliminate repetition
- **Fallback System**: Ensures content generation never fails

**Addresses**: The repetitive "There's so much to explore about..." template issue from chat logs

### `fileNamer.ts`
**Purpose**: Generate unique, meaningful filenames that prevent duplicates

**Key Features**:
- **Meaningful Word Extraction**: Uses content analysis to create descriptive names
- **Duplicate Prevention**: Tracks used names and generates unique variants
- **Intelligent Naming**: Combines topic + style + content keywords
- **Length Control**: Configurable word limits for clean filenames

**Addresses**: The duplicate "theres-much-post.x" filename issue from chat logs

### `projectManager.ts`
**Purpose**: Smart project selection with fallback strategies

**Key Features**:
- **Multi-Strategy Selection**: Explicit → Smart Match → Default → Auto-Create → Fallback
- **Content-Based Matching**: Projects chosen based on content topic and style
- **Auto-Project Creation**: Creates topic-specific projects when appropriate
- **Store Independence**: Works with or without editor store availability

**Addresses**: Intelligent project organization and dependency management

### `index.ts`
**Purpose**: Main entry point combining all tools into a unified workflow

**Key Features**:
- **Unified Interface**: Single function for complete Twitter request processing
- **Type Safety**: Full TypeScript interfaces for all data structures
- **Error Handling**: Comprehensive error management with fallbacks
- **Store Injection**: Dependency injection pattern for editor store access

## Usage

```typescript
import { processTwitterRequest } from './.claude/.tools/twitter';

const result = await processTwitterRequest({
  userInput: "Check out our new dashboard!",
  suggestedProject: "Product Updates",
  schedule: "tomorrow 2pm",
  settings: "followers"
}, editorStore);
```

## Benefits

### Content Quality
- **Eliminates Repetition**: Multiple templates per topic ensure variety
- **Better Engagement**: Content tailored to specific topics and styles
- **Consistent Quality**: Fallback systems ensure reliable output

### Code Organization
- **Modular Architecture**: Single-responsibility principle for each tool
- **Maintainable**: Easy to test, debug, and extend individual components
- **Reusable**: Tools can be used independently or combined
- **Type Safe**: Full TypeScript coverage with comprehensive interfaces

### User Experience
- **Unique Filenames**: No more duplicate file issues
- **Smart Projects**: Automatic project selection based on content
- **Reliable**: Robust error handling and fallback systems

## Integration

The modular tools are integrated into the main Twitter agent at `/eac/store/agents/index.ts` in the `executeTwitterPostAgent` function. The original monolithic approach has been replaced with calls to the modular tools while maintaining backward compatibility.

**Complete Workflow:**
1. **Content Generation**: Uses modular `contentGenerator` with topic detection and template variety
2. **File Naming**: Uses modular `fileNamer` for unique, meaningful filenames  
3. **Project Selection**: Uses modular `projectManager` for smart project creation/selection
4. **File Creation**: Creates .x file with initial content structure
5. **Form Population**: Automatically populates XPostEditor form fields via Convex database
6. **Scheduling/Publishing**: Handles immediate posting or scheduling as requested

## Testing

Each tool can be tested independently:

```typescript
// Test content generation
const content = await contentGenerator.generateContent({
  userInput: "Test content",
  includeHashtags: true
});

// Test file naming
const fileName = fileNamer.generateFileName({
  content: "Test content",
  maxWords: 3
});

// Test project selection (with mocked store)
projectManager.setEditorStore(mockStore);
const project = await projectManager.selectProject({
  contentTopic: "tech",
  userPreferences: { autoCreateProjects: true }
});
```

## Future Enhancements

1. **Analytics Integration**: Track content performance to improve template selection
2. **A/B Testing**: Rotate between template variations to optimize engagement
3. **Content Scheduling**: Advanced scheduling logic with optimal timing
4. **Multi-Platform**: Extend to support other social media platforms
5. **AI Enhancement**: Integration with LLM APIs for even more dynamic content

---

This modular architecture addresses the specific issues identified in the chat logs while providing a foundation for future enhancements and maintaining code quality.
