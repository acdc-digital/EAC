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
import { useXApi } from '@/lib/hooks/useXApi'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/store'
import { useMutation, useQuery } from 'convex/react'
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
import { useCallback, useEffect, useRef, useState } from 'react'

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
const convertFormDataToMarkdown = (data: SocialPostData, platform: string, fileName: string): string => {
  const platformName = platform === 'x' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1);
  
  return `# ${fileName.replace(/\.[^/.]+$/, "")} - ${platformName} Post
Platform: ${platformName}
Created: ${new Date().toLocaleDateString()}

## Post Content
${data.content || 'Write your post content here...'}

## Settings
- Reply Settings: ${data.settings.replySettings || 'following'}
- Schedule: ${data.settings.scheduledDate && data.settings.scheduledTime ? `${data.settings.scheduledDate} ${data.settings.scheduledTime}` : 'Now'}
- Thread: ${data.settings.isThread ? 'Multi-tweet Thread' : 'Single Tweet'}
${data.settings.hashtags ? `- Hashtags: ${data.settings.hashtags}` : ''}
${data.settings.location ? `- Location: ${data.settings.location}` : ''}
${data.settings.taggedUsers ? `- Tagged Users: ${data.settings.taggedUsers}` : ''}

## Media
- Images: ${JSON.stringify(data.media.images || [])}
- Videos: ${JSON.stringify(data.media.videos || [])}

## Analytics
- Impressions: ${data.analytics?.impressions || 0}
- Engagements: ${data.analytics?.engagements || 0}
- Likes: ${data.analytics?.likes || 0}
- Shares: ${data.analytics?.shares || 0}`;
};

const SocialMediaFormEditor = ({ content, onChange, editable = true, platform, fileName }: SocialMediaFormEditorProps) => {
  const [formData, setFormData] = useState<SocialPostData>(() => parseMarkdownToFormData(content));
  const [mode, setMode] = useState<'form' | 'preview'>('form');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Track when we're updating content from form to prevent parsing loop
  const isUpdatingFromForm = useRef(false);

  // Editor store access
  const { openTabs, updateFileContent, updateFileStatus } = useEditorStore();

  // Convex mutations
  const upsertPost = useMutation(api.socialPosts.upsertPost);
  const schedulePost = useMutation(api.socialPosts.schedulePost);

  // X API integration for actual posting
  const { postTweet, hasConnection } = useXApi();

  // Fetch scheduling data from Convex database
  const agentPosts = useQuery(api.socialPosts.getAllPosts);
  const currentPost = agentPosts?.find((post: any) => post.fileName === fileName);

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
  }, [content]); // Only depend on content prop

  // Handle form changes and update parent
  const handleFormChange = (updates: Partial<SocialPostData>) => {
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
    
    setFormData(newFormData);
    
    // Convert back to markdown and notify parent
    if (onChange) {
      isUpdatingFromForm.current = true; // Prevent parsing loop
      const markdownContent = convertFormDataToMarkdown(newFormData, platform, fileName);
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
        const markdownContent = convertFormDataToMarkdown(formData, platform, fileName);
        
        // Update file content in editor store
        updateFileContent(currentTab.id, markdownContent);
        updateFileStatus(currentTab.id, 'draft');
        
        console.log('✅ Draft saved successfully as markdown');
      }
      
      // Also save to Convex database
      const normalizedPlatform = platform === 'x' ? 'twitter' : platform;
      if (normalizedPlatform === 'twitter' || normalizedPlatform === 'reddit') {
        await upsertPost({
          content: formData.content,
          fileName: fileName,
          fileType: normalizedPlatform,
          status: 'draft',
          platformData: JSON.stringify(formData.settings)
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
  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    
    try {
      console.log('🚀 Publishing post:', { fileName, content: formData.content });
      
      const isScheduled = formData.settings.scheduledDate && formData.settings.scheduledTime;
      const normalizedPlatform = platform === 'x' ? 'twitter' : platform;
      
      if (isScheduled) {
        // Schedule the post
        const scheduledDateTime = new Date(`${formData.settings.scheduledDate}T${formData.settings.scheduledTime}`);
        
        if (normalizedPlatform === 'twitter' || normalizedPlatform === 'reddit') {
          await schedulePost({
            content: formData.content,
            fileName: fileName,
            fileType: normalizedPlatform,
            scheduledFor: scheduledDateTime.getTime(),
            platformData: JSON.stringify(formData.settings)
          });
        }
        
        console.log('✅ Post scheduled successfully for:', scheduledDateTime);
      } else {
        // Publish immediately to actual platform
        if (normalizedPlatform === 'twitter') {
          // Check if we have a Twitter connection
          if (!hasConnection) {
            throw new Error('No X/Twitter connection found. Please connect your X account in Settings → Social Connections.');
          }

          // First update database status to 'posting'
          await upsertPost({
            content: formData.content,
            fileName: fileName,
            fileType: normalizedPlatform,
            status: 'posting',
            platformData: JSON.stringify(formData.settings)
          });

          // Actually post to Twitter using the API
          const tweetResult = await postTweet({
            text: formData.content,
            reply_settings: formData.settings.replySettings as any || 'following'
          });

          if (tweetResult.success) {
            // Update database with success status
            await upsertPost({
              content: formData.content,
              fileName: fileName,
              fileType: normalizedPlatform,
              status: 'posted',
              platformData: JSON.stringify(formData.settings)
            });
            console.log('✅ Post published successfully to Twitter:', tweetResult.data);
          } else {
            // Update database with failed status
            await upsertPost({
              content: formData.content,
              fileName: fileName,
              fileType: normalizedPlatform,
              status: 'failed',
              platformData: JSON.stringify(formData.settings)
            });
            throw new Error(tweetResult.error || 'Failed to publish to Twitter');
          }
        } else if (normalizedPlatform === 'reddit') {
          // Reddit publishing (existing logic)
          await upsertPost({
            content: formData.content,
            fileName: fileName,
            fileType: normalizedPlatform,
            status: 'posted',
            platformData: JSON.stringify(formData.settings)
          });
          console.log('✅ Post published successfully to Reddit');
        }
      }
      
      // Update file status in editor
      const currentTab = openTabs.find(tab => tab.name === fileName || tab.filePath.includes(fileName));
      if (currentTab) {
        updateFileStatus(currentTab.id, isScheduled ? 'scheduled' : 'complete');
      }
      
    } catch (error) {
      console.error('❌ Failed to publish post:', error);
      // Show user-friendly error message
      alert(`❌ Failed to publish post:\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsPublishing(false);
    }
  }, [fileName, formData, schedulePost, upsertPost, platform, openTabs, updateFileStatus, postTweet, hasConnection]);

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
    const markdownContent = convertFormDataToMarkdown(formData, platform, fileName);
    
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
          <Badge variant="outline" className={cn("text-xs", getPlatformColor())}>
            Draft
          </Badge>
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
                    <CardTitle className="text-[#cccccc] flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Post Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                        placeholder="@username1, @username2"
                        className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                      />
                    </div>
                  </CardContent>
                </Card>
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
            <div className="flex gap-3 pt-4 border-t border-[#454545]">
              <Button 
                onClick={handlePublish}
                disabled={isPublishing || isSaving || !formData.content.trim()}
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
                disabled={isSaving || isPublishing || !formData.content.trim()}
                variant="outline" 
                className="border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
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
