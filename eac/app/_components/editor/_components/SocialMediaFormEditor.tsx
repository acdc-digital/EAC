'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/convex/_generated/api'
import { useFiles } from '@/lib/hooks/useFiles'
import { useSocialConnectionSync } from '@/lib/hooks/useSocialConnectionSync'
import { useXApi } from '@/lib/hooks/useXApi'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/store'
import { useTerminalStore } from '@/store/terminal'
import { useAuth } from '@clerk/nextjs'
import { useAction, useMutation, useQuery } from 'convex/react'
import {
  AtSign,
  Calendar,
  CheckCircle,
  Edit3,
  Eye,
  Facebook,
  Globe,
  Instagram,
  MessageCircle,
  Twitter,
  Users
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface SocialMediaFormEditorProps {
  content: string
  onChange?: (content: string) => void
  editable?: boolean
  platform: 'x' | 'twitter' | 'facebook' | 'instagram' | 'reddit'
  fileName: string
}

interface SocialPostData {
  content: string
  settings: {
    replySettings?: string
    audience?: string
    scheduledDate?: string
    scheduledTime?: string
    isThread?: boolean
    threadTweets?: string[]
    hashtags?: string
    location?: string
    taggedUsers?: string
  }
  media: {
    images?: string[]
    videos?: string[]
  }
  analytics?: {
    impressions?: number
    engagements?: number
    likes?: number
    shares?: number
  }
}

// Reddit specific fields captured in UI (not all platforms need these)
interface RedditFields {
  subreddit: string
  title: string
  postType: 'self' | 'link'
  linkUrl?: string
  nsfw: boolean
  spoiler: boolean
  sendReplies: boolean
  flairText?: string
  flairId?: string
}

// Helper: Platform-aware unauthorized guidance text
const getReauthHelpText = (platformKey: string) => {
  const normalized = platformKey === 'x' ? 'twitter' : platformKey;
  const label = normalized === 'reddit'
    ? 'Reddit connection'
    : normalized === 'twitter'
      ? 'X/Twitter connection'
      : 'account';
  return `If this is an Unauthorized error, re-authorize your ${label} in Settings → Social Connections and try again.`;
};

// Parse markdown content into structured data
const parseMarkdownToFormData = (markdownContent: string): SocialPostData => {
  console.log('🔍 parseMarkdownToFormData called with:', {
    contentLength: markdownContent.length,
    contentPreview: markdownContent.substring(0, 300),
    rawContent: markdownContent
  });

  const defaultData: SocialPostData = {
    content: '',
    settings: {
      replySettings: 'following',
      audience: 'public',
      scheduledDate: '',
      scheduledTime: '',
      isThread: false,
      threadTweets: [],
      hashtags: '',
      location: '',
      taggedUsers: ''
    },
    media: {
      images: [],
      videos: []
    },
    analytics: {
      impressions: 0,
      engagements: 0,
      likes: 0,
      shares: 0
    }
  };

  if (!markdownContent || markdownContent.trim() === '') {
    console.log('❌ No markdown content provided');
    return defaultData;
  }

  // Extract content from Post Content section
  const postContentMatch = markdownContent.match(/## Post Content\s*([\s\S]*?)(?=##|$)/);
  console.log('🔍 Post content match:', {
    found: !!postContentMatch,
    matchedContent: postContentMatch?.[1]?.trim(),
    regexUsed: '## Post Content\\s*([\\s\\S]*?)(?=##|$)'
  });
  
  if (postContentMatch) {
    defaultData.content = postContentMatch[1].trim();
    console.log('✅ Extracted content:', defaultData.content);
  } else {
    console.log('❌ No post content section found');
  }

  // Extract settings
  const settingsMatch = markdownContent.match(/## Settings\s*([\s\S]*?)(?=##|$)/);
  if (settingsMatch) {
    const settingsText = settingsMatch[1];
    
    // Parse individual settings
    const replyMatch = settingsText.match(/- Reply Settings:\s*(.+)/);
    if (replyMatch) defaultData.settings.replySettings = replyMatch[1].trim().toLowerCase();
    
    const scheduleMatch = settingsText.match(/- Schedule:\s*(.+)/);
    if (scheduleMatch) {
      const scheduleText = scheduleMatch[1].trim();
      if (scheduleText !== 'Now' && scheduleText.includes(' ')) {
        const [date, time] = scheduleText.split(' ');
        defaultData.settings.scheduledDate = date;
        defaultData.settings.scheduledTime = time;
      }
    }
    
    const threadMatch = settingsText.match(/- Thread:\s*(.+)/);
    if (threadMatch) {
      defaultData.settings.isThread = threadMatch[1].trim().toLowerCase() !== 'single tweet';
    }
  }

  return defaultData;
};

// Convert form data back to markdown
const convertFormDataToMarkdown = (
  data: SocialPostData,
  platform: string,
  fileName: string,
  redditExtra?: RedditFields
): string => {
  console.log('🔧 convertFormDataToMarkdown called:', {
    content: data.content,
    contentLength: data.content?.length || 0,
    platform,
    fileName,
    redditTitle: redditExtra?.title,
    redditSubreddit: redditExtra?.subreddit
  });
  
  const platformName = platform === 'x' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1);

  // Platform-specific settings block
  let settingsBlock = '';
  if (platform === 'reddit') {
    const r = redditExtra;
    settingsBlock = `## Settings
- Title: ${r?.title || fileName.replace(/\.[^/.]+$/, '')}
- Subreddit: ${r?.subreddit || 'r/test'}
- Post Type: ${r?.postType === 'link' ? 'Link' : 'Text'}
${r?.postType === 'link' && r?.linkUrl ? `- Link URL: ${r.linkUrl}` : ''}
- NSFW: ${(r?.nsfw ? 'Yes' : 'No')}
- Spoiler: ${(r?.spoiler ? 'Yes' : 'No')}
- Send Replies: ${(r?.sendReplies !== false ? 'Yes' : 'No')}
${r?.flairText ? `- Flair: ${r.flairText}` : ''}
- Schedule: ${data.settings.scheduledDate && data.settings.scheduledTime ? `${data.settings.scheduledDate} ${data.settings.scheduledTime}` : 'Now'}`.trim();
  } else {
    settingsBlock = `## Settings
- Reply Settings: ${data.settings.replySettings || 'following'}
- Schedule: ${data.settings.scheduledDate && data.settings.scheduledTime ? `${data.settings.scheduledDate} ${data.settings.scheduledTime}` : 'Now'}
- Thread: ${data.settings.isThread ? 'Multi-tweet Thread' : 'Single Tweet'}
${data.settings.hashtags ? `- Hashtags: ${data.settings.hashtags}` : ''}
${data.settings.location ? `- Location: ${data.settings.location}` : ''}
${data.settings.taggedUsers ? `- Tagged Users: ${data.settings.taggedUsers}` : ''}`.trim();
  }

  return `# ${fileName.replace(/\.[^/.]+$/, '')} - ${platformName} Post
Platform: ${platformName}
Created: ${new Date().toLocaleDateString()}

## Post Content
${data.content || 'Write your post content here...'}

${settingsBlock}

## Media
- Images: ${JSON.stringify(data.media.images || [])}
- Videos: ${JSON.stringify(data.media.videos || [])}

## Analytics
- Impressions: ${data.analytics?.impressions || 0}
- Engagements: ${data.analytics?.engagements || 0}
- Likes: ${data.analytics?.likes || 0}
- Shares: ${data.analytics?.shares || 0}`;
};

// Add debugging before function
console.log('🔧 convertFormDataToMarkdown defined');

const SocialMediaFormEditor = ({ content, onChange, editable = true, platform, fileName }: SocialMediaFormEditorProps) => {
  const [formData, setFormData] = useState<SocialPostData>(() => parseMarkdownToFormData(content));
  const [mode, setMode] = useState<'form' | 'preview'>('form');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const normalizedPlatform = (platform === 'x' ? 'twitter' : platform);
  const { userId: authUserId } = useAuth();
  
  // Track when we're updating content from form to prevent parsing loop
  const isUpdatingFromForm = useRef(false);

  // Editor store access
  const { openTabs, updateFileContent, updateFileStatus } = useEditorStore();

  // Files hook to get updateFile mutation
  const { updateFile } = useFiles(null);

  // Get current file status
  const currentTab = openTabs.find(tab => tab.name === fileName);

  // Convex mutations
  const upsertPost = useMutation(api.socialPosts.upsertPost);
  const schedulePost = useMutation(api.socialPosts.schedulePost);
  const createRedditPost = useMutation(api.reddit.createRedditPost);
  const submitRedditPost = useAction(api.redditApi.submitRedditPost);

  // X API integration for actual posting
  const { postTweet, hasConnection } = useXApi();

  // Social connections (to get Reddit connection)
  const { redditConnection, isPlatformConnected } = useSocialConnectionSync();

  // Fetch scheduling data from Convex database
  const agentPosts = useQuery(api.socialPosts.getAllPosts);
  const currentPost = agentPosts?.find((post: any) => post.fileName === fileName);
  
  // Get file status - use Convex as primary source
  const fileStatus = currentPost?.status || 'draft';

  // Debug: Log every render
  console.log('🎨 SocialMediaFormEditor render:', {
    platform,
    fileName,
    contentLength: content.length,
    formDataContent: formData.content,
    mode,
    editable,
    contentPreview: content.substring(0, 200) + '...',
    rawContent: content,
    currentPost: currentPost,
    hasScheduleData: !!currentPost?.scheduledFor
  });

  // Initialize Reddit fields from content (best-effort parsing of markdown Settings)
  const parsedInitialRedditFields = useMemo<RedditFields>(() => {
    const settingsMatch = content.match(/## Settings\s*([\s\S]*?)(?=##|$)/);
    const block = settingsMatch?.[1] ?? '';
    const getLine = (label: string) => {
      const m = block.match(new RegExp(`-\\s*${label}:\\s*(.+)`, 'i'));
      return m?.[1]?.trim();
    };
    const subredditRaw = getLine('Subreddit') || 'r/test';
    const postTypeRaw = (getLine('Post Type') || 'Text').toLowerCase();
    const flair = getLine('Flair');
    const nsfwRaw = (getLine('NSFW') || 'No').toLowerCase();
    return {
      subreddit: subredditRaw,
      title: content.split('\n')[0]?.replace(/^#\s*/, '').replace(/\s*-\s*Reddit Post.*$/, '') || fileName.replace(/\.[^/.]+$/, ''),
      postType: (postTypeRaw.startsWith('link') ? 'link' : 'self') as 'self' | 'link',
      linkUrl: undefined,
      nsfw: nsfwRaw === 'yes' || nsfwRaw === 'true',
      spoiler: false,
      sendReplies: true,
      flairText: flair,
      flairId: undefined,
    };
  }, [content, fileName]);
  const [redditFields, setRedditFields] = useState<RedditFields>(parsedInitialRedditFields);

  // Merge Convex scheduling data with form data
  useEffect(() => {
    if (currentPost?.scheduledFor && currentPost?.status === 'scheduled') {
      console.log('📅 Found scheduled post data in Convex:', {
        fileName,
        scheduledFor: currentPost.scheduledFor,
        status: currentPost.status
      });

      // Convert scheduledFor timestamp to date/time format
      const scheduledDate = new Date(currentPost.scheduledFor);
      const dateString = scheduledDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeString = scheduledDate.toTimeString().slice(0, 5); // HH:MM

      setFormData(prevData => ({
        ...prevData,
        settings: {
          ...prevData.settings,
          scheduledDate: dateString,
          scheduledTime: timeString
        }
      }));
    }
  }, [currentPost, fileName]);

  // Update form data when content prop changes (but not when we're updating from form)
  useEffect(() => {
    if (isUpdatingFromForm.current) {
      isUpdatingFromForm.current = false;
      return;
    }
    
    console.log('📝 SocialMediaFormEditor: Content prop changed from external source', {
      newContentLength: content.length,
      currentFormDataLength: formData.content.length
    });
    
    const newFormData = parseMarkdownToFormData(content);
    setFormData(newFormData);
    // Light refresh of reddit fields if Settings changed drastically
    if (normalizedPlatform === 'reddit') {
      const settingsMatch = content.match(/## Settings\s*([\s\S]*?)(?=##|$)/);
      const block = settingsMatch?.[1] ?? '';
      const getLine = (label: string) => {
        const m = block.match(new RegExp(`-\\s*${label}:\\s*(.+)`, 'i'));
        return m?.[1]?.trim();
      };
      const subredditRaw = getLine('Subreddit');
      const postTypeRaw = getLine('Post Type');
      const flair = getLine('Flair');
      const nsfwRaw = getLine('NSFW');
      if (settingsMatch) {
        // Update only the fields present in the Settings block
        setRedditFields(prev => ({
          ...prev,
          ...(subredditRaw ? { subreddit: subredditRaw } : {}),
          ...(postTypeRaw ? { postType: postTypeRaw.toLowerCase().startsWith('link') ? 'link' : 'self' } : {}),
          ...(flair ? { flairText: flair } : {}),
          ...(nsfwRaw ? { nsfw: nsfwRaw.toLowerCase() === 'yes' || nsfwRaw.toLowerCase() === 'true' } : {}),
        }));
      } else {
        // No Settings block found (likely a fresh template). Reset to parsed defaults
        // to avoid leaking values (e.g., subreddit) from the previously opened tab.
        setRedditFields(parsedInitialRedditFields);
      }
    }
  }, [content]); // Only depend on content prop

  // When switching files, ensure reddit fields are re-initialized for the new file
  useEffect(() => {
    if (normalizedPlatform === 'reddit') {
      setRedditFields(parsedInitialRedditFields);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileName]);

  // Handle form changes and update parent
  const handleFormChange = (updates: Partial<SocialPostData>) => {
    console.log('📝 handleFormChange called:', {
      updates,
      currentFormContent: formData.content,
      updatesContent: updates.content
    });
    
    const newFormData = {
      ...formData,
      ...updates,
      settings: {
        ...formData.settings,
        ...updates.settings
      },
      media: {
        ...formData.media,
        ...updates.media
      }
    };
    
    console.log('📝 New form data:', {
      newContent: newFormData.content,
      newContentLength: newFormData.content?.length || 0
    });
    
    setFormData(newFormData);
    
    // Convert back to markdown and notify parent
    if (onChange) {
      isUpdatingFromForm.current = true; // Prevent parsing loop
      const markdownContent = convertFormDataToMarkdown(newFormData, platform, fileName, platform === 'reddit' ? redditFields : undefined);
      console.log('📝 Calling onChange with markdown:', {
        markdownLength: markdownContent.length,
        containsNewContent: markdownContent.includes(newFormData.content || '')
      });
      onChange(markdownContent);
    }
  };

  // Handle saving draft
  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true);
    
    try {
      console.log('💾 Saving draft:', { fileName, content: formData.content });
      
      const currentTab = openTabs.find(tab => tab.name === fileName || tab.filePath.includes(fileName));
      
      if (currentTab) {
        // Convert form data to markdown format (same as normal form changes)
        const markdownContent = convertFormDataToMarkdown(formData, platform, fileName, platform === 'reddit' ? redditFields : undefined);
        
        // Update file content in editor store
        updateFileContent(currentTab.id, markdownContent);
        updateFileStatus(currentTab.id, 'draft');
        
        console.log('✅ Draft saved successfully as markdown');
      }
      
      // Also save to Convex database
      if (normalizedPlatform === 'twitter' || normalizedPlatform === 'reddit') {
        const markdownContent = convertFormDataToMarkdown(formData, platform, fileName, platform === 'reddit' ? redditFields : undefined);
        const platformData = normalizedPlatform === 'reddit'
          ? JSON.stringify({
              ...formData.settings,
              subreddit: redditFields.subreddit,
              title: redditFields.title,
              postType: redditFields.postType,
              linkUrl: redditFields.linkUrl,
              nsfw: redditFields.nsfw,
              spoiler: redditFields.spoiler,
              sendReplies: redditFields.sendReplies,
              flairText: redditFields.flairText,
              flairId: redditFields.flairId,
              connectionId: redditConnection?._id,
            })
          : JSON.stringify(formData.settings);
        await upsertPost({
          content: markdownContent,
          fileName: fileName,
          fileType: normalizedPlatform,
          status: 'draft',
          platformData,
        });
        
        console.log('✅ Draft saved to database');
      }
      
    } catch (error) {
      console.error('❌ Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  }, [fileName, formData, openTabs, updateFileContent, updateFileStatus, upsertPost, platform]);

  // Handle publishing or scheduling
  const [publishError, setPublishError] = useState<string | null>(null);
  const { pushAlert, setActiveTab, isCollapsed, toggleCollapse } = useTerminalStore();

  // Clear publish error when file changes
  useEffect(() => {
    setPublishError(null);
  }, [fileName]);

  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    setPublishError(null);
    
    try {
      console.log('🚀 Publishing post:', { fileName, content: formData.content });
      
  const isScheduled = formData.settings.scheduledDate && formData.settings.scheduledTime;
  const markdownContent = convertFormDataToMarkdown(formData, platform, fileName, platform === 'reddit' ? redditFields : undefined);
      
      if (isScheduled) {
        // Schedule the post
        const scheduledDateTime = new Date(`${formData.settings.scheduledDate}T${formData.settings.scheduledTime}`);
        
        if (normalizedPlatform === 'twitter' || normalizedPlatform === 'reddit') {
          const platformData = normalizedPlatform === 'reddit'
            ? JSON.stringify({
                ...formData.settings,
                subreddit: redditFields.subreddit,
                title: redditFields.title,
                postType: redditFields.postType,
                linkUrl: redditFields.linkUrl,
                nsfw: redditFields.nsfw,
                spoiler: redditFields.spoiler,
                sendReplies: redditFields.sendReplies,
                flairText: redditFields.flairText,
                flairId: redditFields.flairId,
                connectionId: redditConnection?._id,
              })
            : JSON.stringify(formData.settings);
          await schedulePost({
            content: markdownContent,
            fileName: fileName,
            fileType: normalizedPlatform,
            scheduledFor: scheduledDateTime.getTime(),
            platformData,
          });
        }
        
        console.log('✅ Post scheduled successfully for:', scheduledDateTime);
        
        // Log success to terminal alerts (non-blocking)
        const formattedDate = scheduledDateTime.toLocaleString();
        pushAlert({
          title: 'Post Scheduled',
          message: `This post has been scheduled for ${formattedDate}.`,
          level: 'info',
        });
      } else {
        // Publish immediately to actual platform
        if (normalizedPlatform === 'twitter') {
          // Check if we have a Twitter connection
          if (!hasConnection) {
            throw new Error('No X/Twitter connection found. Please connect your X account in Settings → Social Connections.');
          }

          // Update file status to 'posting' while in progress
          const currentTab = openTabs.find(tab => tab.name === fileName || tab.filePath.includes(fileName));
          if (currentTab) {
            updateFileStatus(currentTab.id, 'posting');
          }

          // First update database status to 'posting'
          await upsertPost({
            content: markdownContent,
            fileName: fileName,
            fileType: normalizedPlatform,
            status: 'posting',
            platformData: JSON.stringify(formData.settings),
          });

          // Actually post to Twitter using the API
          console.log('🐦 About to call postTweet with:', {
            text: formData.content,
            replySettings: formData.settings.replySettings,
            replySettingsType: typeof formData.settings.replySettings,
            allFormDataSettings: formData.settings
          });
          
          // Map reply settings to valid values for X API
          const mapReplySettings = (setting: string | undefined): 'following' | 'mentionedUsers' | 'subscribers' | 'verified' => {
            switch (setting) {
              case 'following':
              case 'mentionedUsers':
              case 'subscribers':
              case 'verified':
                return setting;
              case 'everyone':
              case 'public':
              case undefined:
              case null:
              default:
                return 'following'; // Default fallback
            }
          };
          
          const validReplySettings = mapReplySettings(formData.settings.replySettings);
          console.log('🔄 Mapped reply settings:', {
            original: formData.settings.replySettings,
            mapped: validReplySettings
          });
          
          const tweetResult = await postTweet({
            text: formData.content,
            reply_settings: validReplySettings
          });

          if (tweetResult.success) {
            // Update database with success status
            await upsertPost({
              content: markdownContent,
              fileName: fileName,
              fileType: normalizedPlatform,
              status: 'posted',
              platformData: JSON.stringify(formData.settings),
            });
            console.log('✅ Post published successfully to Twitter:', tweetResult.data);
            
            // Log publish success to terminal alerts (non-blocking)
            pushAlert({
              title: 'Publish Succeeded',
              message: 'This post has been successfully published and is now read-only.',
              level: 'info',
            });
          } else {
            // Update file status to 'failed'
            const currentTab = openTabs.find(tab => tab.name === fileName || tab.filePath.includes(fileName));
            if (currentTab) {
              updateFileStatus(currentTab.id, 'failed');
            }

            // Update database with failed status
            await upsertPost({
              content: markdownContent,
              fileName: fileName,
              fileType: normalizedPlatform,
              status: 'failed',
              platformData: JSON.stringify(formData.settings),
            });
            const message = tweetResult.error || 'Failed to publish to Twitter';
            setPublishError(message);
            pushAlert({
              title: 'Publish Failed',
              message: `Failed to publish post. ${message}\n\nTip: ${getReauthHelpText(platform)}`,
              level: 'error',
            });
            if (!isCollapsed) setActiveTab('alerts');
            return; // Handle error inline; don't throw
          }
        } else if (normalizedPlatform === 'reddit') {
          // Reddit publishing (real API via Convex)
          // Validate connection
          if (!redditConnection?._id) {
            throw new Error('No Reddit connection found. Connect your Reddit account in Settings → Social Connections.');
          }
          if (!isPlatformConnected('reddit')) {
            throw new Error('Reddit connected but not authorized yet. Click Authorize in Settings → Social Connections.');
          }
          // Validate fields
          const cleanSubreddit = (redditFields.subreddit || '').trim();
          const subredditName = cleanSubreddit.replace(/^r\//i, '');
          if (!subredditName) {
            throw new Error('Please select a subreddit (e.g., r/webdev).');
          }
          const title = (redditFields.title || '').trim() || fileName.replace(/\.[^/.]+$/, '');
          if (!title) {
            throw new Error('Please provide a title for your Reddit post.');
          }
          if (redditFields.postType === 'link' && !redditFields.linkUrl) {
            throw new Error('Please provide a link URL for a Link post.');
          }

          // Debug: Log Reddit fields state
          console.log('🔍 Reddit submission debug:', {
            originalRedditFields: redditFields,
            cleanSubreddit,
            subredditName,
            title,
            formDataContent: formData.content,
            postType: redditFields.postType,
            allFieldsReady: !!(subredditName && title && formData.content),
            subredditValidation: {
              original: redditFields.subreddit,
              cleaned: cleanSubreddit,
              final: subredditName,
              isEmpty: !subredditName,
              length: subredditName.length
            }
          });

          // Validation: Ensure all required data is present
          if (!subredditName || subredditName.length === 0) {
            throw new Error(`Subreddit is empty. Please set a valid subreddit like 'r/test' or 'r/testingground4bots'. Current value: "${redditFields.subreddit}"`);
          }
          if (!formData.content || formData.content.trim().length === 0) {
            throw new Error(`Post content is empty. Please enter some content. Current length: ${formData.content.length}`);
          }
          if (!title || title.trim().length === 0) {
            throw new Error(`Post title is empty. Please enter a title. Current value: "${title}"`);
          }

          // Small delay to ensure state is fully synchronized
          console.log('⏳ Waiting 500ms for state synchronization...');
          await new Promise(resolve => setTimeout(resolve, 500));

          // Update UI + DB status to posting
          const currentTab = openTabs.find(tab => tab.name === fileName || tab.filePath.includes(fileName));
          if (currentTab) updateFileStatus(currentTab.id, 'posting');
          await upsertPost({
            content: markdownContent,
            fileName,
            fileType: normalizedPlatform,
            status: 'posting',
            platformData: JSON.stringify({
              ...formData.settings,
              subreddit: cleanSubreddit,
              title,
              postType: redditFields.postType,
              linkUrl: redditFields.linkUrl,
              nsfw: redditFields.nsfw,
              spoiler: redditFields.spoiler,
              sendReplies: redditFields.sendReplies,
              flairText: redditFields.flairText,
              flairId: redditFields.flairId,
              connectionId: redditConnection._id,
            }),
          });

          // Reddit submission - Direct from form data
          console.log('🚀 Submitting Reddit post directly from form data');

          // Ensure we have an authenticated user
          if (!authUserId) {
            throw new Error('You need to be signed in to publish to Reddit.');
          }

          // Prepare Reddit submission data directly from form
          const redditPostData = {
            userId: authUserId,
            connectionId: redditConnection._id,
            subreddit: subredditName, // This should be just the subreddit name without 'r/'
            title: title,
            kind: redditFields.postType,
            text: redditFields.postType === 'self' ? formData.content : undefined,
            url: redditFields.postType === 'link' ? redditFields.linkUrl : undefined,
            nsfw: !!redditFields.nsfw,
            spoiler: !!redditFields.spoiler,
            sendReplies: redditFields.sendReplies !== false,
            flairId: redditFields.flairId,
            flairText: redditFields.flairText,
          };

          console.log('🐛 Direct Reddit submission data:', {
            postData: redditPostData,
            formContent: formData.content,
            contentLength: formData.content.length,
            subredditName,
            title
          });

          // Create Reddit post in Convex
          const createdPostId = await createRedditPost(redditPostData);
          console.log('✅ Reddit post created with ID:', createdPostId);

          // Submit to Reddit API
          const result = await submitRedditPost({ postId: createdPostId });
          console.log('📡 Reddit API result:', result);

          if ((result as any)?.success) {
            await upsertPost({
              content: markdownContent,
              fileName,
              fileType: normalizedPlatform,
              status: 'posted',
              platformData: JSON.stringify({
                subreddit: cleanSubreddit,
                title,
                postType: redditFields.postType,
                linkUrl: redditFields.linkUrl,
              }),
            });
            console.log('✅ Post published successfully to Reddit');
            pushAlert({
              title: 'Publish Succeeded',
              message: `Posted to r/${subredditName}. ${((result as any).url) ? 'View: ' + (result as any).url : ''}`,
              level: 'info',
            });
          } else {
            const rawError = (result as any)?.error || 'Failed to publish to Reddit';
            const message = rawError.includes('SUBREDDIT_NOTALLOWED')
              ? `${rawError} — This subreddit is restricted. Try r/test or change the Subreddit in Settings.`
              : rawError;
            // Update file status to failed
            if (currentTab) updateFileStatus(currentTab.id, 'failed');
            await upsertPost({
              content: markdownContent,
              fileName,
              fileType: normalizedPlatform,
              status: 'failed',
              platformData: JSON.stringify({ subreddit: cleanSubreddit, title }),
            });
            setPublishError(message);
            pushAlert({
              title: 'Publish Failed',
              message: message,
              level: 'error',
            });
            if (!isCollapsed) setActiveTab('alerts');
            return;
          }
        }
      }
      
      // Update file status in editor
      const currentTab = openTabs.find(tab => tab.name === fileName || tab.filePath.includes(fileName));
      if (currentTab) {
        updateFileStatus(currentTab.id, isScheduled ? 'scheduled' : 'posted');
      }
      
    } catch (error) {
      // Avoid console error noise; rely on inline UI and terminal alert
      
  // Update file status to 'failed' on unexpected error
      const currentTab = openTabs.find(tab => tab.name === fileName || tab.filePath.includes(fileName));
      if (currentTab) {
        updateFileStatus(currentTab.id, 'failed');
      }
      
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setPublishError(message);
      // Push alert to terminal alerts tab with guidance
      pushAlert({
        title: 'Publish Failed',
        message: `Failed to publish post. ${message}\n\nTip: ${getReauthHelpText(platform)}`,
        level: 'error',
      });
      // If terminal is expanded and not showing alerts, switch to alerts to surface the log
      if (!isCollapsed) {
        setActiveTab('alerts');
      }
    } finally {
      setIsPublishing(false);
    }
  }, [fileName, formData, schedulePost, upsertPost, platform, openTabs, updateFileStatus, postTweet, hasConnection, pushAlert, setActiveTab, isCollapsed]);

  const getPlatformIcon = () => {
    switch (platform) {
      case 'x':
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getPlatformColor = () => {
    switch (platform) {
      case 'x':
      case 'twitter':
        return 'text-[#1DA1F2] border-[#1DA1F2]';
      case 'facebook':
        return 'text-[#1877f2] border-[#1877f2]';
      case 'instagram':
        return 'text-[#e4405f] border-[#e4405f]';
      default:
        return 'text-[#cccccc] border-[#cccccc]';
    }
  };

  const getStatusBadge = () => {
    const color =
      fileStatus === 'posted' ? 'text-[#4caf50] border-[#4caf50]'
      : fileStatus === 'scheduled' ? 'text-[#fbbc04] border-[#fbbc04]'
      : fileStatus === 'posting' ? 'text-[#8ab4f8] border-[#8ab4f8]'
      : fileStatus === 'failed' ? 'text-[#f28b82] border-[#f28b82]'
      : 'text-[#cccccc] border-[#cccccc]';
    const label = fileStatus.charAt(0).toUpperCase() + fileStatus.slice(1);
    return (
      <Badge variant="outline" className={cn("text-xs", color)}>
        {label}
      </Badge>
    );
  };

  const getCharacterLimit = () => {
    switch (platform) {
      case 'x':
      case 'twitter':
        return 280;
      case 'facebook':
        return 63206;
      case 'instagram':
        return 2200;
      default:
        return 1000;
    }
  };

  const maxChars = getCharacterLimit();
  const remainingChars = maxChars - formData.content.length;

  const renderPreview = () => {
    const markdownContent = convertFormDataToMarkdown(
      formData,
      platform,
      fileName,
      platform === 'reddit' ? redditFields : undefined
    );
    
    return (
      <div className="p-4 text-[#cccccc] text-sm leading-relaxed bg-[#1a1a1a] h-full overflow-auto">
        <h3 className="text-lg font-bold text-[#569cd6] mb-4">Preview</h3>
        <pre className="whitespace-pre-wrap font-mono text-xs bg-[#0e0e0e] p-4 rounded border border-[#2d2d2d]">
          {markdownContent}
        </pre>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-[#2d2d2d] min-h-[35px]">
        <div className="flex items-center gap-2">
          {getPlatformIcon()}
          <span className="text-sm font-medium text-[#cccccc]">
            {platform === 'x' ? 'X/Twitter' : platform.charAt(0).toUpperCase() + platform.slice(1)} Post
          </span>
          {getStatusBadge()}
        </div>
        
        {editable && (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={mode === 'form' ? 'default' : 'outline'}
              onClick={() => setMode('form')}
              className={cn(
                "h-6 px-3 text-xs flex items-center",
                mode === 'form' 
                  ? "bg-[#007acc] text-white hover:bg-[#005a9e]" 
                  : "bg-transparent border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
              )}
            >
              <Edit3 className="w-3 h-3 mr-1" />
              Form
            </Button>
            
            <Button
              size="sm"
              variant={mode === 'preview' ? 'default' : 'outline'}
              onClick={() => setMode('preview')}
              className={cn(
                "h-6 px-3 text-xs flex items-center",
                mode === 'preview' 
                  ? "bg-[#007acc] text-white hover:bg-[#005a9e]" 
                  : "bg-transparent border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
              )}
            >
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
          </div>
        )}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        {mode === 'form' ? (
          <div className="h-full overflow-auto p-6 space-y-6">
            <Tabs defaultValue="compose" className="space-y-6">
              <TabsList className="bg-[#2d2d2d] border-[#454545]">
                <TabsTrigger value="compose" className="text-[#cccccc] data-[state=active]:bg-[#007acc] data-[state=active]:text-white">
                  Compose
                </TabsTrigger>
                <TabsTrigger value="schedule" className="text-[#cccccc] data-[state=active]:bg-[#007acc] data-[state=active]:text-white">
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-[#cccccc] data-[state=active]:bg-[#007acc] data-[state=active]:text-white">
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="compose" className="space-y-6">
                {/* Connection Warning for Twitter */}
                {(platform === 'x' || platform === 'twitter') && !hasConnection && (
                  <Card className="bg-[#2d1b00] border-[#fbbf24]">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-[#fbbf24]">
                        <div className="w-4 h-4">⚠️</div>
                        <span className="font-medium">X Account Not Connected</span>
                      </div>
                      <p className="text-sm text-[#fcd34d] mt-1">
                        Connect your X account in Settings → Social Connections to enable real posting. You can still compose and save drafts.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Scheduling Status Indicator */}
                {currentPost?.status === 'scheduled' && currentPost?.scheduledFor && (
                  <Card className="bg-[#1a3f1a] border-[#4ade80]">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-[#4ade80]">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Scheduled for Publishing</span>
                      </div>
                      <p className="text-sm text-[#90ee90] mt-1">
                        This post will be published on {new Date(currentPost.scheduledFor).toLocaleDateString()} at {new Date(currentPost.scheduledFor).toLocaleTimeString()}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Post Content */}
                <Card className="bg-[#2d2d2d] border-[#454545]">
                  <CardHeader>
                    <CardTitle className="text-[#cccccc] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Post Content
                      </div>
                      {fileStatus === 'posted' && (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Posted
                        </Badge>
                      )}
                      {fileStatus === 'posting' && (
                        <Badge className="bg-blue-600 text-white">
                          Publishing...
                        </Badge>
                      )}
                      {fileStatus === 'scheduled' && (
                        <Badge className="bg-yellow-600 text-white">
                          Scheduled
                        </Badge>
                      )}
                      {fileStatus === 'failed' && (
                        <Badge className="bg-red-600 text-white">
                          Failed
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fileStatus === 'posted' && (
                      <div className="bg-green-900/20 border border-green-600/30 rounded-md p-3 mb-4">
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          This post has been successfully published and is now read-only.
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label className="text-[#cccccc]">
                        {platform === 'x' || platform === 'twitter' 
                          ? "What's happening?" 
                          : "What's on your mind?"
                        }
                      </Label>
                      <Textarea
                        value={formData.content}
                        onChange={(e) => handleFormChange({ content: e.target.value })}
                        disabled={!editable}
                        placeholder={`Write your ${platform === 'x' ? 'tweet' : 'post'} here...`}
                        className="min-h-32 bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585] resize-none"
                        maxLength={maxChars}
                      />
                      <div className="flex justify-between text-xs text-[#858585]">
                        <span>Characters remaining: {remainingChars.toLocaleString()}</span>
                        <span className={remainingChars < 0 ? 'text-red-500' : ''}>
                          {formData.content.length.toLocaleString()}/{maxChars.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Hashtags and Location for Instagram/Facebook */}
                    {(platform === 'instagram' || platform === 'facebook') && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[#cccccc]">Hashtags</Label>
                          <Input
                            value={formData.settings.hashtags || ''}
                            onChange={(e) => handleFormChange({ 
                              settings: { hashtags: e.target.value }
                            })}
                            disabled={!editable}
                            placeholder="#hashtag1 #hashtag2"
                            className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[#cccccc]">Location</Label>
                          <Input
                            value={formData.settings.location || ''}
                            onChange={(e) => handleFormChange({ 
                              settings: { location: e.target.value }
                            })}
                            disabled={!editable}
                            placeholder="Add location"
                            className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Tagged Users */}
                    <div className="space-y-2">
                      <Label className="text-[#cccccc]">Tag People</Label>
                      <Input
                        value={formData.settings.taggedUsers || ''}
                        onChange={(e) => handleFormChange({ 
                          settings: { taggedUsers: e.target.value }
                        })}
                        disabled={!editable}
                        placeholder="@username1, @username2"
                        className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Reddit Specific Fields */}
                {normalizedPlatform === 'reddit' && (
                  <Card className="bg-[#2d2d2d] border-[#454545]">
                    <CardHeader>
                      <CardTitle className="text-[#cccccc] flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Reddit Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[#cccccc]">Subreddit</Label>
                          <Input
                            value={redditFields.subreddit}
                            onChange={(e) => setRedditFields({ ...redditFields, subreddit: e.target.value })}
                            disabled={!editable}
                            placeholder="r/test"
                            className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[#cccccc]">Title</Label>
                          <Input
                            value={redditFields.title}
                            onChange={(e) => setRedditFields({ ...redditFields, title: e.target.value })}
                            disabled={!editable}
                            placeholder="Post title"
                            className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[#cccccc]">Post Type</Label>
                          <Select
                            value={redditFields.postType}
                            onValueChange={(value) => setRedditFields({ ...redditFields, postType: value as 'self' | 'link' })}
                            disabled={!editable}
                          >
                            <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-[#2d2d2d] border-[#454545]">
                              <SelectItem value="self" className="text-[#cccccc]">Text</SelectItem>
                              <SelectItem value="link" className="text-[#cccccc]">Link</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {redditFields.postType === 'link' && (
                          <div className="space-y-2">
                            <Label className="text-[#cccccc]">Link URL</Label>
                            <Input
                              value={redditFields.linkUrl || ''}
                              onChange={(e) => setRedditFields({ ...redditFields, linkUrl: e.target.value })}
                              disabled={!editable}
                              placeholder="https://example.com"
                              className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="nsfw"
                            aria-label="Mark post as NSFW"
                            checked={!!redditFields.nsfw}
                            onChange={(e) => setRedditFields({ ...redditFields, nsfw: e.target.checked })}
                            disabled={!editable}
                            className="rounded border-[#454545] bg-[#1e1e1e] text-[#1DA1F2]"
                          />
                          <Label htmlFor="nsfw" className="text-[#cccccc]">NSFW</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="spoiler"
                            aria-label="Mark post as spoiler"
                            checked={!!redditFields.spoiler}
                            onChange={(e) => setRedditFields({ ...redditFields, spoiler: e.target.checked })}
                            disabled={!editable}
                            className="rounded border-[#454545] bg-[#1e1e1e] text-[#1DA1F2]"
                          />
                          <Label htmlFor="spoiler" className="text-[#cccccc]">Spoiler</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="sendreplies"
                            aria-label="Enable send replies notifications"
                            checked={redditFields.sendReplies !== false}
                            onChange={(e) => setRedditFields({ ...redditFields, sendReplies: e.target.checked })}
                            disabled={!editable}
                            className="rounded border-[#454545] bg-[#1e1e1e] text-[#1DA1F2]"
                          />
                          <Label htmlFor="sendreplies" className="text-[#cccccc]">Send Reply Notifications</Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[#cccccc]">Flair (Text)</Label>
                          <Input
                            value={redditFields.flairText || ''}
                            onChange={(e) => setRedditFields({ ...redditFields, flairText: e.target.value })}
                            disabled={!editable}
                            placeholder="Discussion"
                            className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[#cccccc]">Flair ID (optional)</Label>
                          <Input
                            value={redditFields.flairId || ''}
                            onChange={(e) => setRedditFields({ ...redditFields, flairId: e.target.value })}
                            disabled={!editable}
                            placeholder="t5_flairid"
                            className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="schedule" className="space-y-6">
                {/* Scheduling Status Indicator */}
                {currentPost?.status === 'scheduled' && currentPost?.scheduledFor && (
                  <Card className="bg-[#1a3f1a] border-[#4ade80]">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-[#4ade80]">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Scheduled by Agent</span>
                      </div>
                      <p className="text-sm text-[#90ee90] mt-1">
                        This post is scheduled for {new Date(currentPost.scheduledFor).toLocaleDateString()} at {new Date(currentPost.scheduledFor).toLocaleTimeString()}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-[#2d2d2d] border-[#454545]">
                  <CardHeader>
                    <CardTitle className="text-[#cccccc] flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Schedule Post
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[#cccccc]">Date</Label>
                        <Input
                          type="date"
                          value={formData.settings.scheduledDate || ''}
                          onChange={(e) => handleFormChange({ 
                            settings: { scheduledDate: e.target.value }
                          })}
                          disabled={!editable}
                          className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#cccccc]">Time</Label>
                        <Input
                          type="time"
                          value={formData.settings.scheduledTime || ''}
                          onChange={(e) => handleFormChange({ 
                            settings: { scheduledTime: e.target.value }
                          })}
                          disabled={!editable}
                          className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                {/* Privacy/Audience Settings */}
                <Card className="bg-[#2d2d2d] border-[#454545]">
                  <CardHeader>
                    <CardTitle className="text-[#cccccc] flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {platform === 'x' || platform === 'twitter' ? 'Reply Settings' : 'Audience'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[#cccccc]">
                        {platform === 'x' || platform === 'twitter' ? 'Who can reply?' : 'Who can see this post?'}
                      </Label>
                      <Select 
                        value={formData.settings.replySettings || (platform === 'x' || platform === 'twitter' ? 'following' : 'public')} 
                        onValueChange={(value) => handleFormChange({ 
                          settings: { replySettings: value }
                        })}
                        disabled={!editable}
                      >
                        <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2d2d2d] border-[#454545]">
                          {platform === 'x' || platform === 'twitter' ? (
                            <>
                              <SelectItem value="following" className="text-[#cccccc]">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  People you follow
                                </div>
                              </SelectItem>
                              <SelectItem value="mentionedUsers" className="text-[#cccccc]">
                                <div className="flex items-center gap-2">
                                  <AtSign className="w-4 h-4" />
                                  Only people you mention
                                </div>
                              </SelectItem>
                              <SelectItem value="verified" className="text-[#cccccc]">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4" />
                                  Verified users only
                                </div>
                              </SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="public" className="text-[#cccccc]">
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4" />
                                  Public
                                </div>
                              </SelectItem>
                              <SelectItem value="friends" className="text-[#cccccc]">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Friends
                                </div>
                              </SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Thread option for Twitter */}
                    {(platform === 'x' || platform === 'twitter') && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isThread"
                          aria-label="Enable thread mode for Twitter posts"
                          checked={formData.settings.isThread || false}
                          onChange={(e) => handleFormChange({ 
                            settings: { isThread: e.target.checked }
                          })}
                          className="rounded border-[#454545] bg-[#1e1e1e] text-[#1DA1F2]"
                        />
                        <Label htmlFor="isThread" className="text-[#cccccc]">Create as thread</Label>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-4 border-t border-[#454545]">
              {publishError && (
                <div className="text-xs text-[#f28b82] bg-[#3a1f1f] border border-[#5a2b2b] rounded px-2 py-1 whitespace-pre-wrap">
                  ❌ {publishError}
                  <div className="text-[10px] text-[#ffadad] mt-1">{getReauthHelpText(platform)}</div>
                </div>
              )}
              <div className="flex gap-3">
              <Button 
                onClick={handlePublish}
                disabled={!editable || isPublishing || isSaving || (
                  normalizedPlatform === 'reddit'
                    ? (redditFields.postType === 'self' ? !formData.content.trim() : !(redditFields.linkUrl && redditFields.linkUrl.trim()))
                    : !formData.content.trim()
                )}
                className={cn(
                  "flex-1",
                  platform === 'x' || platform === 'twitter' ? "bg-[#1DA1F2] hover:bg-[#1a8cd8]" :
                  platform === 'facebook' ? "bg-[#1877f2] hover:bg-[#166fe5]" :
                  platform === 'instagram' ? "bg-[#e4405f] hover:bg-[#d73549]" :
                  "bg-[#007acc] hover:bg-[#005a9e]"
                )}
              >
                {isPublishing ? 'Publishing...' : 
                 formData.settings.scheduledDate && formData.settings.scheduledTime ? 'Schedule Post' : 'Publish Now'}
              </Button>
              <Button 
                onClick={handleSaveDraft}
                disabled={!editable || isSaving || isPublishing || (
                  normalizedPlatform === 'reddit'
                    ? (redditFields.postType === 'self' ? !formData.content.trim() : !(redditFields.linkUrl && redditFields.linkUrl.trim()))
                    : !formData.content.trim()
                )}
                variant="outline" 
                className="border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  )
}

export default SocialMediaFormEditor
