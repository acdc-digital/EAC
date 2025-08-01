# Twitter Post Agent Documentation

## Overview

The Twitter Post Agent is an intelligent automation tool that creates, schedules, and manages Twitter/X posts with full workflow integration. It combines AI content generation, project organization, and form field auto-population to streamline social media workflows.

## Features

- **AI Content Generation**: Automatically generates engaging Twitter content based on user prompts
- **Project Organization**: Intelligently selects or creates project folders for post management
- **Form Auto-Population**: Saves data to Convex database for automatic form field population in XPostEditor
- **Scheduling Support**: Handles post scheduling with date/time parsing
- **Settings Management**: Configures reply settings and post visibility
- **File Management**: Creates `.x` files with proper JSON structure for editor integration

## Usage

### Basic Command Structure

```
/twitter <content> [parameters]
```

### Parameters

- **`project: <name>`** - Specify which project folder to use
- **`schedule: <datetime>`** - Schedule the post for later
- **`settings: <option>`** - Configure post visibility and reply settings

### Examples

#### Basic Post Creation
```
/twitter Check out our new dashboard feature! 🚀
```

#### Content Generation Request
```
/twitter Create a motivational post about productivity
```

#### Scheduled Post
```
/twitter Great news coming tomorrow! schedule: tomorrow 2pm
```

#### Project-Specific Post
```
/twitter Product update announcement project: marketing
```

#### Full Configuration
```
/twitter Launch day is here! project: product schedule: Dec 25 9am settings: everyone
```

## Automatic Form Population

### Seamless Workflow Integration

The Twitter agent **automatically populates** the XPostEditor form fields as part of every `/twitter` command. There's no need for separate commands or manual form filling.

### What Gets Auto-Populated

✅ **Tweet Content** - The AI-generated or user-provided content  
✅ **Reply Settings** - Based on the `settings` parameter  
✅ **Scheduling Data** - Date and time if `schedule` parameter is used  
✅ **File Metadata** - Proper file name and project association  
✅ **Platform Data** - All Twitter-specific form configurations

## Project Selection Logic

The agent uses a hierarchical decision process to determine where to place the Twitter post:

### 1. User-Specified Project (Highest Priority)
- If `project: <name>` is included, searches for matching project folders
- Uses case-insensitive partial matching
- Excludes the Instructions folder from consideration

### 2. Automatic Selection
- **First Available Project**: Uses the first regular (non-pinned) project folder
- **Auto-Create Folder**: If no projects exist, creates a "Social Media" folder

### 3. Folder Filtering Rules
- Excludes pinned system folders
- Excludes Instructions folder (by name and ID)
- Only considers regular project folders

## Content Generation

### AI-Powered Content Creation

The agent detects content generation requests using keywords:
- `create`, `generate`, `write`, `make`
- `post about`, `tweet about`
- `motivational`, `inspirational`, `funny`
- `educational`, `professional`, `announcement`

### Topic-Specific Templates

The agent includes pre-built templates for popular topics:
- **Travel/Japan**: Cultural and tourism content
- **Technology**: Innovation and future-focused posts
- **Business/Finance**: Strategy and growth insights
- **Health/Wellness**: Fitness and lifestyle tips
- **Education**: Learning and development content
- **Environment**: Nature and sustainability themes

### Dynamic Content Generation

For any topic not covered by templates, the agent:
1. Extracts key topics from the user request
2. Generates engaging content with relevant hashtags
3. Maintains consistent voice and style

## Form Field Integration

### Convex Database Integration

The agent directly saves post data to the Convex database using:
- **ConvexHttpClient**: Browser client for mutation calls
- **socialPosts.upsertPost**: Primary mutation for saving posts
- **Proper Data Structure**: Matches XPostEditor expectations

### Platform Data Structure

```json
{
  "replySettings": "following|mentionedUsers|subscribers|verified",
  "scheduledDate": "YYYY-MM-DD",
  "scheduledTime": "HH:MM",
  "isThread": false,
  "threadTweets": ["content"],
  "hasPoll": false,
  "pollOptions": ["", ""],
  "pollDuration": 1440
}
```

### Auto-Population Workflow

1. **File Creation**: Creates `.x` file in selected project
2. **Database Save**: Calls Convex mutation with proper structure
3. **Form Loading**: XPostEditor automatically loads data via useSocialPost hook
4. **Field Population**: All form fields are pre-filled when editor opens

### Complete Workflow

```
User Input → Content Generation → Project Selection → File Creation → Database Save → Automatic Form Population
```

**Result**: User opens XPostEditor and all fields are already populated and ready to publish!

## Scheduling System

### Supported Formats

- **Relative**: `tomorrow 2pm`, `tomorrow 9am`
- **Specific Dates**: `Dec 25 9am`, `Jan 1 6pm`
- **Default Time**: If no time specified, defaults to 9 AM

### Schedule Processing

1. **Parse Input**: Extracts date and time components
2. **Validate DateTime**: Ensures future dates (adds year if past)
3. **Update Status**: Changes post status to "scheduled"
4. **Store Schedule**: Saves scheduling data in platformData

## Settings Configuration

### Reply Settings Options

- **`everyone`** → `following` (API mapping)
- **`followers`** → `following`
- **`mentioned-users`** → `mentionedUsers`
- **`verified-accounts`** → `verified`

### Default Behavior

- Default reply setting: `following`
- Default post status: `draft` (or `scheduled` if scheduling requested)
- Thread support: Available but defaults to single tweet

## File Naming Logic

### How File Names Are Generated

The agent determines the file name **after** content generation using the `generateTwitterFileName()` function:

#### 1. Content Processing
The agent takes the **generated content** and processes it:
- Converts to lowercase
- Removes special characters, URLs, and hashtags
- Splits into individual words
- Filters out stop words (the, and, for, with, etc.)
- Keeps only words longer than 2 characters

#### 2. Word Selection
From the filtered words, it takes up to 3 meaningful words:
```javascript
// Example: "🚀 Technology is reshaping our world at lightning speed..."
// Processed words: ["technology", "reshaping", "world", "lightning", "speed"]
// Selected: ["technology", "reshaping", "world"]
```

#### 3. File Name Construction
- **2+ words**: `word1-word2-post.x` (e.g., `technology-reshaping-post.x`)
- **1 word**: `word-post.x` (e.g., `productivity-post.x`)  
- **0 words**: Falls back to timestamp: `twitter-post-20250731T143052.x`

#### 4. Timing in Workflow
```
User Input → Content Generation → File Name Creation → File Creation → Form Population
```

The key insight is that the file name is based on the **AI-generated content**, not the user's original input.

### File Content Structure

```json
{
  "fileName": "generated-filename.x",
  "platform": "twitter",
  "fileType": "twitter",
  "content": "main tweet content",
  "title": null,
  "platformData": { /* platform-specific settings */ },
  "status": "draft|scheduled",
  "timestamp": "ISO string",
  "userId": "user-identifier"
}
```

## Error Handling

### Graceful Degradation

- **Database Save Failure**: Creates file locally, logs warning
- **Project Not Found**: Falls back to first available project
- **Schedule Parse Error**: Creates as draft with error message
- **Content Generation Error**: Uses user's original text

### Error Recovery

- Never blocks file creation due to database issues
- Provides clear error messages with suggested actions
- Maintains workflow continuity even with partial failures

## Integration Points

### XPostEditor Component
- Loads data via `useSocialPost` hook
- Auto-populates all form fields
- Provides manual editing capabilities

### Convex Backend
- Uses `socialPosts.upsertPost` mutation
- Maintains data consistency
- Supports real-time updates

### Editor Store
- Creates project files and folders
- Manages file content and metadata
- Handles project organization

## Best Practices

### For Users

1. **Specify Projects**: Use `project: <name>` for better organization
2. **Clear Scheduling**: Use explicit times like "tomorrow 2pm"
3. **Content Requests**: Use descriptive prompts for better AI generation
4. **Review Before Posting**: Always review generated content in the editor

### For Developers

1. **Error Logging**: Monitor Convex save failures
2. **Content Quality**: Enhance AI templates based on usage patterns
3. **Performance**: Consider caching for frequently used content types
4. **User Feedback**: Collect data on project selection accuracy

## Future Enhancements

### Planned Features

- **Smart Project Selection**: AI-based project matching from content analysis
- **User Interaction**: Prompt for project selection when ambiguous
- **Content Templates**: User-customizable content templates
- **Bulk Operations**: Create multiple posts from single command
- **Analytics Integration**: Track post performance and suggestions

### Technical Improvements

- **Real-time Sync**: Live updates between agent and editor
- **Conflict Resolution**: Handle concurrent edits gracefully
- **Enhanced Parsing**: Support more natural language scheduling
- **Content Validation**: Check character limits and Twitter compliance

## Troubleshooting

### Common Issues

**Form Fields Not Auto-Populating**
- Check Convex connection status
- Verify mutation data structure
- Ensure XPostEditor is using latest data

**Posts Going to Wrong Project**
- Use explicit `project: <name>` parameter
- Check project folder names for typos
- Verify non-Instructions folders exist

**Scheduling Not Working**
- Use clear date/time formats
- Check timezone considerations
- Verify future date selection

**Content Generation Issues**
- Use specific, descriptive prompts
- Check for keyword detection
- Fallback to manual content entry

## API Reference

### Main Functions

- `executeTwitterPostAgent()`: Main execution handler with integrated form population
- `selectProjectForTwitterPost()`: Project selection logic
- `fillTwitterFormFields()`: Database integration and automatic form population
- `generateTwitterContent()`: AI content generation
- `parseScheduleString()`: Schedule parsing

### Convex Mutations

- `socialPosts.upsertPost`: Save/update post data
- Parameters: fileName, fileType, content, platformData, status, userId

### Data Types

```typescript
interface TwitterParams {
  content: string;
  project?: string;
  schedule?: string;
  settings?: string;
}
```

## Version History

- **v1.0**: Initial Twitter agent implementation
- **v1.1**: Added AI content generation
- **v1.2**: Integrated Convex database persistence
- **v1.3**: Enhanced form field auto-population
- **v1.4**: Improved project selection logic

---

*This documentation is part of the EAC Financial Dashboard project. For more information, see the main project documentation.*
