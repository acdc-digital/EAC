// X/Twitter Post Editor Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/dashboard/socialPlatforms/xPostEditor.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useXApi } from "@/lib/hooks/useXApi";
import { useEditorStore } from "@/store";
import {
  AtSign,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  ImageIcon,
  MessageCircle,
  Repeat2,
  Users
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface XPostEditorProps {
  fileName: string;
  initialContent?: string;
  onChange?: (content: string) => void;
}

export function XPostEditor({ fileName, onChange }: XPostEditorProps) {
  // Debug: Check if component is mounting
  console.log('🚀 XPostEditor component mounting with fileName:', fileName);
  
  const [postContent, setPostContent] = useState('');
  const [replySettings, setReplySettings] = useState('following'); // Default to 'following' which is valid API value
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isThread, setIsThread] = useState(false);
  const [threadTweets, setThreadTweets] = useState(['']);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState('1440'); // 24 hours in minutes
  const [hasPoll, setHasPoll] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [hasLoadedContent, setHasLoadedContent] = useState(false);

  // Map UI reply settings to Twitter API values
  const mapReplySettingsToAPI = (uiValue: string): 'following' | 'mentionedUsers' | 'subscribers' | 'verified' => {
    switch (uiValue) {
      case 'everyone':
        return 'following'; // Map 'everyone' to 'following' as closest equivalent
      case 'following':
        return 'following';
      case 'mentioned':
        return 'mentionedUsers';
      case 'subscribers':
        return 'subscribers';
      case 'verified':
        return 'verified';
      default:
        return 'following'; // Safe default
    }
  };

  // Get editor store functions
  const { updateFileStatus, updateFileContent, openTabs } = useEditorStore();
  
  // Get X API functions
  const { postTweet, schedulePost, disconnectAccount, isPosting, isScheduling, hasConnection, connectionInfo } = useXApi();

  // Debug what the component is receiving
  console.log('🔍 XPostEditor Debug:', {
    hasConnection,
    connectionInfo,
    hasConnectionBool: !!hasConnection,
    connectionInfoExists: !!connectionInfo,
    isConnectionAndInfo: !!(hasConnection && connectionInfo),
    fileName
  });

  // Use ref to store the onChange callback to avoid infinite loops
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Character count (X allows 280 characters per tweet)
  const maxChars = 280;
  const remainingChars = maxChars - postContent.length;

  // Update parent when content changes
  useEffect(() => {
    const formData = {
      fileName,
      platform: 'x',
      content: {
        text: postContent,
        replySettings,
        scheduledDate,
        scheduledTime,
        isThread,
        threadTweets: isThread ? threadTweets : [postContent],
        mediaCount: mediaFiles.length,
        hasPoll,
        pollOptions: hasPoll ? pollOptions.filter(Boolean) : [],
        pollDuration: hasPoll ? parseInt(pollDuration) : null
      }
    };

    if (onChangeRef.current) {
      onChangeRef.current(JSON.stringify(formData, null, 2));
    }
  }, [postContent, replySettings, scheduledDate, scheduledTime, isThread, threadTweets, mediaFiles, hasPoll, pollOptions, pollDuration, fileName]);

  // Load saved content when component mounts or tab changes - memoized loading
  const loadSavedContent = useCallback(() => {
    console.log('🔍 Content loading effect triggered:', { fileName, hasLoadedContent, tabsCount: openTabs.length });
    
    const currentTab = openTabs.find(tab => tab.name === fileName || tab.filePath.includes(fileName));
    console.log('🔍 Current tab found:', !!currentTab, 'has content:', !!currentTab?.content);
    
    if (currentTab?.content && !hasLoadedContent) {
      try {
        // Check if content is JSON or plain text
        const content = currentTab.content.trim();
        console.log('🔍 Raw content:', { content: content.substring(0, 100) + '...', length: content.length });
        
        let savedData;
        if (content.startsWith('{') && content.endsWith('}')) {
          // Looks like JSON, try to parse it
          savedData = JSON.parse(content);
          console.log('🔍 Parsed JSON data:', { hasText: !!savedData.text, textLength: savedData.text?.length });
        } else {
          // Plain text content, treat as tweet text
          console.log('🔍 Plain text content detected, using as tweet text');
          savedData = { text: content };
        }
        
        if (savedData.text !== undefined) {
          setPostContent(savedData.text || '');
          setReplySettings(savedData.replySettings || 'following');
          setScheduledDate(savedData.scheduledDate || '');
          setScheduledTime(savedData.scheduledTime || '');
          setIsThread(savedData.isThread || false);
          setThreadTweets(savedData.threadTweets || ['']);
          setHasPoll(savedData.hasPoll || false);
          setPollOptions(savedData.pollOptions || ['', '']);
          setPollDuration(savedData.pollDuration || '1440');
          
          setHasLoadedContent(true);
          console.log('📥 Loaded saved content for', fileName);
        }
      } catch (error) {
        console.error('Failed to parse saved content:', error);
        // If parsing fails, treat the raw content as plain text
        const rawText = currentTab.content.trim();
        if (rawText) {
          console.log('🔄 Fallback: Using raw content as tweet text');
          setPostContent(rawText);
          setHasLoadedContent(true);
        }
      }
    } else if (!currentTab?.content) {
      // Reset the flag if there's no content to load
      console.log('🔄 Resetting hasLoadedContent flag - no content found');
      setHasLoadedContent(false);
    }
  }, [fileName, openTabs, hasLoadedContent]);

  useEffect(() => {
    loadSavedContent();
  }, [loadSavedContent]);

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setMediaFiles(prev => [...prev, ...files].slice(0, 4)); // X allows up to 4 media files
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addThreadTweet = () => {
    setThreadTweets(prev => [...prev, '']);
  };

  const updateThreadTweet = (index: number, content: string) => {
    setThreadTweets(prev => prev.map((tweet, i) => i === index ? content : tweet));
  };

  const removeThreadTweet = (index: number) => {
    if (threadTweets.length > 1) {
      setThreadTweets(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Handle scheduling the post
  const handleSchedulePost = async () => {
    if (!scheduledDate || !scheduledTime) {
      console.error('Schedule date and time are required');
      return;
    }

    // Create scheduled date time
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    
    try {
      // Use the real X API to schedule the post
      const result = await schedulePost({
        text: postContent,
        reply_settings: mapReplySettingsToAPI(replySettings),
        media_files: mediaFiles,
        poll: hasPoll ? {
          options: pollOptions.filter(Boolean),
          duration_minutes: parseInt(pollDuration)
        } : undefined,
        is_thread: isThread,
        thread_tweets: isThread ? threadTweets : undefined,
        scheduledFor: scheduledDateTime.toISOString(),
        fileName: fileName
      });

      if (result.success) {
        // Update file status to scheduled
        const currentTab = openTabs.find(tab => tab.name === fileName || tab.filePath.includes(fileName));
        if (currentTab) {
          updateFileStatus(currentTab.id, 'scheduled');
        }

        // Update file content with scheduling info
        const schedulingInfo = `\n\n// SCHEDULED FOR: ${scheduledDateTime.toLocaleString()}\n// STATUS: SCHEDULED\n// API RESULT: ${JSON.stringify(result.data, null, 2)}`;
        if (onChangeRef.current) {
          const updatedContent = `${JSON.stringify({
            fileName,
            platform: 'x',
            content: {
              text: postContent,
              replySettings,
              scheduledDate,
              scheduledTime,
              isThread,
              threadTweets: isThread ? threadTweets : [postContent],
              mediaCount: mediaFiles.length,
              hasPoll,
              pollOptions: hasPoll ? pollOptions.filter(Boolean) : [],
              pollDuration: hasPoll ? parseInt(pollDuration) : null
            },
            timestamp: new Date().toISOString(),
            status: 'scheduled',
            scheduledFor: scheduledDateTime.toISOString(),
            apiResult: result.data
          }, null, 2)}${schedulingInfo}`;
          
          onChangeRef.current(updatedContent);
        }

        // Show success notification
        alert(`✅ Post scheduled successfully for ${scheduledDateTime.toLocaleString()}!\n\n${result.message || 'Your tweet will be posted automatically at the scheduled time.'}`);
        
        console.log('🚀 Post scheduled successfully!', result);
      } else {
        throw new Error(result.error || 'Failed to schedule post');
      }

    } catch (error) {
      console.error('❌ Failed to schedule post:', error);
      alert(`❌ Failed to schedule post:\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  };

  // Handle posting immediately
  const handlePostNow = async () => {
    try {
      // Use the real X API to post immediately
      const result = await postTweet({
        text: postContent,
        reply_settings: mapReplySettingsToAPI(replySettings),
        media_files: mediaFiles,
        poll: hasPoll ? {
          options: pollOptions.filter(Boolean),
          duration_minutes: parseInt(pollDuration)
        } : undefined,
        is_thread: isThread,
        thread_tweets: isThread ? threadTweets : undefined,
      });

      if (result.success) {
        // Update file status to published
        const currentTab = openTabs.find(tab => tab.name === fileName || tab.filePath.includes(fileName));
        if (currentTab) {
          updateFileStatus(currentTab.id, 'complete'); // Use 'complete' since 'published' isn't available
        }

        // Update file content with publish info
        const publishInfo = `\n\n// POSTED TO X: ${new Date().toLocaleString()}\n// STATUS: PUBLISHED\n// TWEET ID: ${result.data?.id || 'N/A'}\n// API RESULT: ${JSON.stringify(result.data, null, 2)}`;
        if (onChangeRef.current) {
          const updatedContent = `${JSON.stringify({
            fileName,
            platform: 'x',
            content: {
              text: postContent,
              replySettings,
              isThread,
              threadTweets: isThread ? threadTweets : [postContent],
              mediaCount: mediaFiles.length,
              hasPoll,
              pollOptions: hasPoll ? pollOptions.filter(Boolean) : [],
              pollDuration: hasPoll ? parseInt(pollDuration) : null
            },
            timestamp: new Date().toISOString(),
            status: 'published',
            postedAt: new Date().toISOString(),
            tweetId: result.data?.id,
            apiResult: result.data
          }, null, 2)}${publishInfo}`;
          
          onChangeRef.current(updatedContent);
        }

        // Show success notification
        const tweetUrl = result.data?.id ? `https://x.com/user/status/${result.data.id}` : '';
        alert(`🚀 ${isThread ? 'Thread' : 'Tweet'} posted successfully!\n\n${result.message || 'Your post is now live on X.'}\n\n${tweetUrl ? `View tweet: ${tweetUrl}` : ''}`);
        
        console.log('✅ Post published successfully!', result);
      } else {
        throw new Error(result.error || 'Failed to post tweet');
      }

    } catch (error) {
      console.error('❌ Failed to post tweet:', error);
      alert(`❌ Failed to post ${isThread ? 'thread' : 'tweet'}:\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  };

  // Handle saving as draft - memoized to prevent re-renders
  const handleSaveDraft = useCallback(async () => {
    setIsSavingDraft(true);
    
    try {
      const currentTab = openTabs.find(tab => tab.name === fileName || tab.filePath.includes(fileName));
      console.log('💾 Saving draft:', { 
        fileName, 
        currentTabFound: !!currentTab, 
        currentTabId: currentTab?.id,
        textLength: postContent.length 
      });
      
      if (currentTab) {
        // Create serialized content to save
        const contentToSave = JSON.stringify({
          text: postContent,
          replySettings,
          scheduledDate,
          scheduledTime,
          isThread,
          threadTweets: isThread ? threadTweets : [postContent],
          hasPoll,
          pollOptions: hasPoll ? pollOptions : [],
          pollDuration: hasPoll ? pollDuration : '1440',
          lastSaved: Date.now()
        });
        
        console.log('💾 Content to save:', { 
          contentLength: contentToSave.length,
          text: postContent.substring(0, 50) + '...' 
        });
        
        // Save content to editor store
        updateFileContent(currentTab.id, contentToSave);
        updateFileStatus(currentTab.id, 'draft');
        
        // Verify it was saved
        const verifyTab = openTabs.find(tab => tab.id === currentTab.id);
        console.log('✅ Verified save:', { 
          tabFound: !!verifyTab, 
          hasContent: !!verifyTab?.content,
          contentLength: verifyTab?.content?.length
        });
        
        console.log('💾 Post content and status saved as draft');
        
        // Show feedback for 1.5 seconds
        setTimeout(() => {
          setIsSavingDraft(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      setIsSavingDraft(false);
    }
  }, [fileName, postContent, replySettings, scheduledDate, scheduledTime, isThread, threadTweets, hasPoll, pollOptions, pollDuration, openTabs, updateFileContent, updateFileStatus]);

  // Handle disconnecting X account
  const handleDisconnect = async () => {
    console.log('🔌 Disconnect button clicked!');
    console.log('🔌 Current hasConnection:', hasConnection);
    console.log('🔌 Current connectionInfo:', connectionInfo);
    
    const confirmDisconnect = window.confirm(
      '⚠️ Are you sure you want to disconnect your X account?\n\nThis will remove your connection and you won\'t be able to post until you reconnect.'
    );
    
    console.log('🔌 User confirmation:', confirmDisconnect);
    
    if (confirmDisconnect) {
      try {
        console.log('🔌 Calling disconnectAccount function...');
        console.log('🔌 disconnectAccount function exists:', typeof disconnectAccount === 'function');
        
        const result = await disconnectAccount();
        console.log('🔌 Disconnect result:', result);
        
        if (result.success) {
          console.log('✅ Disconnect successful, showing success alert');
          alert('✅ X account disconnected successfully!\n\nYou can reconnect in Settings → Social Connections.');
          // Force a page refresh to update the UI state
          console.log('🔄 Forcing page refresh to update connection state...');
          window.location.reload();
        } else {
          console.error('❌ Disconnect failed:', result.error);
          alert(`❌ Failed to disconnect X account:\n\n${result.error}`);
        }
      } catch (error) {
        console.error('❌ Error disconnecting X account:', error);
        console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
        alert(`❌ Error disconnecting X account:\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      }
    } else {
      console.log('🚫 User cancelled disconnect');
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions(prev => [...prev, '']);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    setPollOptions(prev => prev.map((option, i) => i === index ? value : option));
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="h-full bg-[#1e1e1e] text-[#cccccc] overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">𝕏</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold">X (Twitter) Post</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-[#858585]">{fileName}</p>
                {(() => {
                  console.log('🔍 Rendering connection status - hasConnection:', hasConnection, 'connectionInfo:', connectionInfo);
                  return hasConnection && connectionInfo ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs bg-green-900/20 text-green-400 px-2 py-1 rounded">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Connected as {connectionInfo.username}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          console.log('🔥 DISCONNECT BUTTON CLICKED - IMMEDIATE LOG');
                          handleDisconnect();
                        }}
                        className="h-6 px-2 text-xs border-red-600 text-red-400 hover:bg-red-900/20 hover:border-red-500"
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 text-xs bg-red-900/20 text-red-400 px-2 py-1 rounded">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      Not connected
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-black border-black">
            Draft
          </Badge>
        </div>

        {/* Connection Warning */}
        {!hasConnection && (
          <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-yellow-400 mt-0.5">⚠️</div>
              <div>
                <h3 className="text-yellow-400 font-medium text-sm">X Account Not Connected</h3>
                <p className="text-yellow-300 text-xs mt-1">
                  Connect your X account in Settings → Social Connections to enable real posting.
                  You can still compose and save drafts.
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="compose" className="space-y-6">
          <TabsList className="bg-[#2d2d2d] border-[#454545]">
            <TabsTrigger value="compose" className="text-[#cccccc] data-[state=active]:bg-[#007acc] data-[state=active]:text-white">
              Compose
            </TabsTrigger>
            <TabsTrigger value="thread" className="text-[#cccccc] data-[state=active]:bg-[#007acc] data-[state=active]:text-white">
              Thread
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-[#cccccc] data-[state=active]:bg-[#007acc] data-[state=active]:text-white">
              Schedule
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-[#cccccc] data-[state=active]:bg-[#007acc] data-[state=active]:text-white">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6">
            {/* Post Content */}
            <Card className="bg-[#2d2d2d] border-[#454545]">
              <CardHeader>
                <CardTitle className="text-[#cccccc] flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Tweet Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#cccccc]">What&apos;s happening?</Label>
                  <Textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="What's happening?"
                    className="min-h-24 bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585] resize-none"
                    maxLength={maxChars}
                  />
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className={`${remainingChars < 20 ? 'text-red-400' : remainingChars < 50 ? 'text-yellow-400' : 'text-[#858585]'}`}>
                        {remainingChars}
                      </span>
                      <div className={`w-6 h-6 rounded-full border-2 ${remainingChars < 20 ? 'border-red-400' : remainingChars < 50 ? 'border-yellow-400' : 'border-[#1d9bf0]'} flex items-center justify-center`}>
                        <div className={`w-2 h-2 rounded-full ${remainingChars < 20 ? 'bg-red-400' : remainingChars < 50 ? 'bg-yellow-400' : 'bg-[#1d9bf0]'}`} 
                             style={{transform: `scale(${Math.max(0, (maxChars - remainingChars) / maxChars)})`}} />
                      </div>
                    </div>
                    <span className="text-[#858585]">{postContent.length}/{maxChars}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media & Poll */}
            <Card className="bg-[#2d2d2d] border-[#454545]">
              <CardHeader>
                <CardTitle className="text-[#cccccc] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Media & Polls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#cccccc]">Upload Media (Max 4 files)</Label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.gif"
                    onChange={handleMediaUpload}
                    aria-label="Upload media files"
                    className="block w-full text-[#cccccc] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1d9bf0] file:text-white hover:file:bg-[#1a8cd8]"
                  />
                  {mediaFiles.length > 0 && (
                    <div className="space-y-2">
                      {mediaFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-[#1e1e1e] rounded">
                          <span className="text-xs text-[#cccccc]">{file.name}</span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeMedia(index)}
                            className="h-6 px-2 text-xs"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Poll Section */}
                {mediaFiles.length === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="hasPoll"
                        checked={hasPoll}
                        onChange={(e) => setHasPoll(e.target.checked)}
                        className="rounded border-[#454545] bg-[#1e1e1e] text-[#1d9bf0]"
                      />
                      <Label htmlFor="hasPoll" className="text-[#cccccc]">Add a poll</Label>
                    </div>

                    {hasPoll && (
                      <div className="space-y-4 p-4 bg-[#1e1e1e] rounded border border-[#454545]">
                        <div className="space-y-2">
                          <Label className="text-[#cccccc]">Poll Options</Label>
                          {pollOptions.map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updatePollOption(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                className="bg-[#2d2d2d] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                                maxLength={25}
                              />
                              {index >= 2 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removePollOption(index)}
                                  className="border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                          {pollOptions.length < 4 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={addPollOption}
                              className="border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
                            >
                              Add Option
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[#cccccc]">Poll Duration</Label>
                          <Select value={pollDuration} onValueChange={setPollDuration}>
                            <SelectTrigger className="bg-[#2d2d2d] border-[#454545] text-[#cccccc]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#2d2d2d] border-[#454545]">
                              <SelectItem value="60">1 hour</SelectItem>
                              <SelectItem value="360">6 hours</SelectItem>
                              <SelectItem value="720">12 hours</SelectItem>
                              <SelectItem value="1440">1 day</SelectItem>
                              <SelectItem value="4320">3 days</SelectItem>
                              <SelectItem value="10080">7 days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="thread" className="space-y-6">
            <Card className="bg-[#2d2d2d] border-[#454545]">
              <CardHeader>
                <CardTitle className="text-[#cccccc] flex items-center gap-2">
                  <Repeat2 className="w-4 h-4" />
                  Thread Composer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isThread"
                    checked={isThread}
                    onChange={(e) => setIsThread(e.target.checked)}
                    className="rounded border-[#454545] bg-[#1e1e1e] text-[#1d9bf0]"
                  />
                  <Label htmlFor="isThread" className="text-[#cccccc]">Create a thread</Label>
                </div>

                {isThread && (
                  <div className="space-y-4">
                    {threadTweets.map((tweet, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-[#cccccc]">Tweet {index + 1}</Label>
                          {index > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeThreadTweet(index)}
                              className="border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <Textarea
                          value={tweet}
                          onChange={(e) => updateThreadTweet(index, e.target.value)}
                          placeholder={`Tweet ${index + 1} content...`}
                          className="min-h-20 bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585] resize-none"
                          maxLength={maxChars}
                        />
                        <div className="text-xs text-[#858585] text-right">
                          {tweet.length}/{maxChars}
                        </div>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addThreadTweet}
                      className="border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
                    >
                      Add Tweet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card className="bg-[#2d2d2d] border-[#454545]">
              <CardHeader>
                <CardTitle className="text-[#cccccc] flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule Tweet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#cccccc]">Date</Label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#cccccc]">Time</Label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                    />
                  </div>
                </div>
                
                {scheduledDate && scheduledTime && (
                  <div className="p-3 bg-[#1e1e1e] rounded border border-[#454545]">
                    <p className="text-sm text-[#cccccc]">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Scheduled for: {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-[#2d2d2d] border-[#454545]">
              <CardHeader>
                <CardTitle className="text-[#cccccc] flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Reply Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#cccccc]">Who can reply?</Label>
                  <Select value={replySettings} onValueChange={setReplySettings}>
                    <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2d2d2d] border-[#454545]">
                      <SelectItem value="following">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          People you follow
                        </div>
                      </SelectItem>
                      <SelectItem value="mentionedUsers">
                        <div className="flex items-center gap-2">
                          <AtSign className="w-4 h-4" />
                          Only people you mention
                        </div>
                      </SelectItem>
                      <SelectItem value="subscribers">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Subscribers only
                        </div>
                      </SelectItem>
                      <SelectItem value="verified">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Verified accounts only
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-[#454545]">
          {/* Post Now Button */}
          <Button 
            className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white flex-1"
            onClick={handlePostNow}
            disabled={!postContent.trim() || !fileName || isPosting || !hasConnection}
          >
            {isPosting ? 'Posting...' : !hasConnection ? 'Connect X Account' : isThread ? 'Post Thread' : 'Post Tweet'}
          </Button>

          {/* Schedule Button - Only show if date/time are set */}
          {scheduledDate && scheduledTime && (
            <Button 
              className="bg-[#2f3336] hover:bg-[#374151] text-[#e7e9ea] flex-1"
              onClick={handleSchedulePost}
              disabled={!postContent.trim() || !fileName || isScheduling || !hasConnection}
            >
              {isScheduling ? 'Scheduling...' : !hasConnection ? 'Connect X Account' : 'Schedule Post'}
            </Button>
          )}

          <Button 
            variant="outline" 
            className="border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
            onClick={handleSaveDraft}
            disabled={!postContent.trim() || !fileName || isSavingDraft}
          >
            {isSavingDraft ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button variant="outline" className="border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]">
            Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
