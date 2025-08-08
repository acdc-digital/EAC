// @ts-nocheck
// Reddit Post Editor Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/dashboard/socialPlatforms/redditPostEditor.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useSocialPost } from "@/lib/hooks/useSocialPost";
import { useAction, useQuery } from "convex/react";
import { AlertCircle, BarChart3, Calendar, Clock, Eye, FileText, Hash, ImageIcon, Link, RefreshCw, Send, TrendingUp, Video } from "lucide-react";
import React, { useEffect, useState } from 'react';

interface RedditPostEditorProps {
  fileName: string;
  onChange?: (content: string) => void;
}

export function RedditPostEditor({ fileName, onChange }: RedditPostEditorProps) {
  // Use the new social post hook
  const {
    post,
    isLoading: postLoading,
    saveContent,
    updatePostStatus,
    schedulePost,
    status,
    isPosted,
    isScheduled,
    isPosting,
    isFailed,
    canPost,
    canSchedule,
    getPlatformData,
  } = useSocialPost({ fileName, fileType: 'reddit' });

  // Get Reddit connection from Convex
  const redditConnections = useQuery(api.reddit.getSocialConnections, {
    userId: 'temp-user-id', // TODO: Replace with actual user ID
    platform: 'reddit'
  });

  const redditConnection = redditConnections?.[0]; // Get the first Reddit connection
  const submitRedditPost = useAction(api.redditApi.submitRedditPost);
  // });
  const fileRecord = null; // Temporarily disabled until function is implemented

  // TODO: Fix social store import
  // const clearError = useSocialStore(state => state.clearError);
  const clearError = () => setError(null); // Temporary fix

  // Convex mutations - temporarily disabled until functions are implemented
  // const createRedditPost = useMutation(api.reddit.createRedditPost);
  // const updateRedditPost = useMutation(api.reddit.updateRedditPost);
  // const cancelScheduledPost = useMutation(api.reddit.cancelScheduledPost);
  // const fetchAnalytics = useMutation(api.reddit.fetchPostAnalytics);
  const createRedditPost = async () => { throw new Error("Function not implemented"); };
  const updateRedditPost = async () => { throw new Error("Function not implemented"); };
  const cancelScheduledPost = async () => { throw new Error("Function not implemented"); };
  const fetchAnalytics = async () => { throw new Error("Function not implemented"); };
  const submitRedditPost = useAction(api.redditApi.submitRedditPost);

  // File-specific form state using custom hook
  const {
    postTitle, setPostTitle,
    postContent, setPostContent,
    postType, setPostType,
    subreddit, setSubreddit,
    flair, setFlair,
    linkUrl, setLinkUrl,
    isNsfw, setIsNsfw,
    isSpoiler, setIsSpoiler,
    sendReplies, setSendReplies,
    scheduledDate, setScheduledDate,
    scheduledTime, setScheduledTime,
    mediaFiles, setMediaFiles,
    loadFromExistingPost,
    getFormData
  } = useRedditPostState(fileName);

  // Additional state for UI controls
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedPostId, setLastCreatedPostId] = useState<string | null>(null);

  // Analytics state
  const [isFetchingAnalytics, setIsFetchingAnalytics] = useState(false);

  // Use ref to store the onChange callback to avoid infinite loops
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Determine if the form should be readonly (post is published)
  const isReadonly = existingPost?.status === 'published';
  const isSubmitted = existingPost?.status === 'published';

  // Character limits
  const titleMaxChars = 300;
  const textMaxChars = 40000;
  const titleRemainingChars = titleMaxChars - postTitle.length;
  const textRemainingChars = textMaxChars - postContent.length;

  // Load existing post data when available (only on initial load)
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  useEffect(() => {
    if (existingPost && !hasLoadedInitialData) {
      // Load existing post data into file-specific state
      loadFromExistingPost({
        postTitle: existingPost.title || '',
        postContent: existingPost.text || '',
        postType: existingPost.kind || 'self',
        subreddit: existingPost.subreddit || '',
        flair: existingPost.flairText || '',
        linkUrl: existingPost.url || '',
        isNsfw: existingPost.nsfw || false,
        isSpoiler: existingPost.spoiler || false,
        sendReplies: existingPost.sendReplies ?? true,
        scheduledDate: '',
        scheduledTime: '',
        mediaFiles: [],
      });

      // Load scheduled time if exists
      if (existingPost.publishAt) {
        const scheduledDateTime = new Date(existingPost.publishAt);
        const date = scheduledDateTime.toISOString().split('T')[0];
        const time = scheduledDateTime.toISOString().split('T')[1].substring(0, 5);
        loadFromExistingPost({
          scheduledDate: date,
          scheduledTime: time,
        });
      }

      setLastCreatedPostId(existingPost._id);
      setHasLoadedInitialData(true);
    }
  }, [existingPost, hasLoadedInitialData, loadFromExistingPost]);

  // Update parent when content changes
  useEffect(() => {
    const formData = {
      fileName,
      platform: 'reddit',
      content: {
        title: postTitle,
        text: postContent,
        postType,
        subreddit,
        flair,
        linkUrl,
        isNsfw,
        isSpoiler,
        sendReplies,
        scheduledDate,
        scheduledTime,
        mediaCount: mediaFiles.length
      },
      timestamp: new Date().toISOString()
    };

    if (onChangeRef.current) {
      onChangeRef.current(JSON.stringify(formData, null, 2));
    }
  }, [postTitle, postContent, postType, subreddit, flair, linkUrl, isNsfw, isSpoiler, sendReplies, scheduledDate, scheduledTime, mediaFiles, fileName]);

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setMediaFiles(prev => [...prev, ...files].slice(0, 1)); // Reddit allows 1 media file per post
  };

  const removeMedia = () => {
    setMediaFiles([]);
  };

  // Auto-save draft when form data changes
  const saveDraft = useCallback(async () => {
    if (!hasLoadedInitialData) return; // Don't save during initial load

    const draftData = getFormData();

    // Only save if there's meaningful content
    if (draftData.title || draftData.text || draftData.subreddit || draftData.url) {
      try {
        if (existingPost) {
          // Update existing post
          await updateRedditPost({
            postId: existingPost._id,
            ...draftData
          });
          
          // Update file status in editor store (auto-save)
          const currentTab = openTabs.find(tab => tab.id === activeTab);
          console.log('🔍 Reddit Editor (Auto-save) - activeTab ID:', activeTab);
          console.log('🔍 Reddit Editor (Auto-save) - Found currentTab:', currentTab);
          
          if (currentTab?.id) {
            const newStatus = draftData.publishAt ? 'scheduled' : 'draft';
            console.log('🔄 Reddit Editor (Auto-save) - Updating file status to:', newStatus, 'for tab:', currentTab.id);
            updateFileStatus(currentTab.id, newStatus);
          }
        } else if (fileRecord && redditConnection) {
          // Create new post
          const newPostId = await createRedditPost({
            ...draftData,
            userId: 'temp-user-id',
            connectionId: redditConnection._id,
            fileId: fileRecord._id
          });
          setLastCreatedPostId(newPostId);
          
          // Update file status in editor store (auto-save create)
          const currentTab = openTabs.find(tab => tab.id === activeTab);
          if (currentTab?.id) {
            const newStatus = draftData.publishAt ? 'scheduled' : 'draft';
            console.log('🔄 Reddit Editor (Auto-save Create) - Updating file status to:', newStatus, 'for tab:', currentTab.id);
            updateFileStatus(currentTab.id, newStatus);
          }
        }
      } catch (error) {
        console.error('Failed to save draft:', error);
        // Don't show alert for draft saves, just log the error
      }
    }
  }, [
    hasLoadedInitialData, getFormData,
    existingPost, fileRecord, redditConnection, updateRedditPost, createRedditPost,
    activeTab, openTabs, updateFileStatus
  ]);  // Debounced auto-save effect
  useEffect(() => {
    if (!hasLoadedInitialData) return; // Don't save during initial load

    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [saveDraft, hasLoadedInitialData]);

  // Handle canceling scheduled post
  const handleCancelScheduling = async () => {
    if (!existingPost || existingPost.status !== 'scheduled') return;

    setIsSubmitting(true);
    try {
      await cancelScheduledPost({
        postId: existingPost._id
      });

      // Clear the scheduling fields
      setScheduledDate('');
      setScheduledTime('');

      alert('Scheduling canceled successfully!');
    } catch (error) {
      console.error('Failed to cancel scheduling:', error);
      alert('Failed to cancel scheduling. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle fetching analytics for published posts
  const handleFetchAnalytics = async () => {
    if (!existingPost || existingPost.status !== 'published') {
      setError('Post must be published to fetch analytics');
      return;
    }

    setIsFetchingAnalytics(true);
    setError(null);

    try {
      await fetchAnalytics({ postId: existingPost._id });
      // The analytics will be updated in the database and reflected in existingPost
      console.log('Analytics fetch initiated successfully');
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics');
    } finally {
      setIsFetchingAnalytics(false);
    }
  };

  // Handle post submission (create new or update existing)
  const handleSubmitPost = async () => {
    if (!redditConnection) {
      alert('Please connect your Reddit account first in Social Connectors.');
      return;
    }

    if (!redditConnection.accessToken) {
      alert('Please authorize your Reddit account in Social Connectors before posting.');
      return;
    }

    if (!postTitle.trim()) {
      alert('Please enter a post title.');
      return;
    }

    if (!subreddit.trim()) {
      alert('Please enter a subreddit.');
      return;
    }

    if (postType === 'self' && !postContent.trim()) {
      alert('Please enter post content for text posts.');
      return;
    }

    if (postType === 'link' && !linkUrl.trim()) {
      alert('Please enter a URL for link posts.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    clearError();

    try {
      const formData = getFormData();
      
      if (formData.publishAt && formData.publishAt <= Date.now()) {
        alert('Scheduled time must be in the future.');
        setIsSubmitting(false);
        return;
      }

      let postId: string;

      if (existingPost) {
        // Update existing post
        await updateRedditPost({
          postId: existingPost._id,
          ...formData
        });

        postId = existingPost._id;
        console.log('Reddit post updated successfully:', postId);
      } else {
        // Create new post
        postId = await createRedditPost({
          userId: 'temp-user-id', // TODO: Replace with actual user ID
          connectionId: redditConnection._id,
          fileId: fileRecord?._id, // Link to the file
          ...formData
        });

        console.log('Reddit post created successfully:', postId);
      }

      // Store the post ID for potential publishing
      setLastCreatedPostId(postId);

      // Sync scheduled post to calendar
      if (formData.publishAt) {
        try {
          await syncPostToCalendar({
            platform: 'reddit',
            title: formData.title,
            content: formData.text,
            scheduledAt: formData.publishAt,
            postId: postId,
            fileId: fileRecord?._id,
            userId: 'temp-user-id', // TODO: Replace with actual user ID
          });
          console.log('Post synced to calendar successfully');
        } catch (calendarError) {
          console.error('Failed to sync post to calendar:', calendarError);
          // Don't fail the main operation if calendar sync fails
        }
      }

      // Update file status in editor store
      const currentTab = openTabs.find(tab => tab.id === activeTab);
      console.log('🔍 Reddit Editor - activeTab ID:', activeTab);
      console.log('🔍 Reddit Editor - Found currentTab:', currentTab);
      console.log('🔍 Reddit Editor - fileName:', fileName);
      
      if (currentTab?.id) {
        const newStatus = formData.publishAt ? 'scheduled' : 'draft';
        console.log('🔄 Reddit Editor - Updating file status to:', newStatus, 'for tab:', currentTab.id);
        updateFileStatus(currentTab.id, newStatus);
      } else {
        console.warn('⚠️ Reddit Editor - No matching tab found for activeTab:', activeTab);
      }

      // Show success message
      if (formData.publishAt) {
        alert(existingPost ? 'Post updated and scheduled successfully!' : 'Post scheduled successfully!');
      } else {
        alert(existingPost ? 'Draft updated successfully!' : 'Draft created successfully!');
      }

      // Keep form data intact for further editing

    } catch (error) {
      console.error('Failed to submit Reddit post:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit post');
      alert('Failed to submit post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle publishing to Reddit
  const handlePublishNow = async () => {
    if (!lastCreatedPostId) {
      alert('No post to publish. Please create a draft first.');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      await submitRedditPost({ postId: lastCreatedPostId });
      
      // Update post status in calendar
      try {
        await updatePostStatusInCalendar(lastCreatedPostId, 'published');
        console.log('Post status updated in calendar successfully');
      } catch (calendarError) {
        console.error('Failed to update post status in calendar:', calendarError);
        // Don't fail the main operation if calendar sync fails
      }
      
      // Update file status in editor store
      const currentTab = openTabs.find(tab => tab.id === activeTab);
      console.log('🔍 Reddit Editor (Publish) - activeTab ID:', activeTab);
      console.log('🔍 Reddit Editor (Publish) - Found currentTab:', currentTab);
      
      if (currentTab?.id) {
        console.log('🔄 Reddit Editor (Publish) - Updating file status to: complete for tab:', currentTab.id);
        updateFileStatus(currentTab.id, 'complete');
      } else {
        console.warn('⚠️ Reddit Editor (Publish) - No matching tab found for activeTab:', activeTab);
      }
      
      alert('Post published to Reddit successfully!');
      setLastCreatedPostId(null); // Clear after successful publish
    } catch (error) {
      console.error('Failed to publish Reddit post:', error);
      setError(error instanceof Error ? error.message : 'Failed to publish to Reddit');
      alert('Failed to publish to Reddit. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!redditConnection) {
      alert('Please connect your Reddit account first in Social Connectors.');
      return;
    }

    if (!redditConnection.accessToken) {
      alert('Please authorize your Reddit account in Social Connectors before saving drafts.');
      return;
    }

    if (!postTitle.trim() || !subreddit.trim()) {
      alert('Please enter at least a title and subreddit to save draft.');
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      await createRedditPost({
        userId: 'temp-user-id', // TODO: Replace with actual user ID
        connectionId: redditConnection._id,
        subreddit: subreddit.trim(),
        title: postTitle.trim(),
        kind: postType,
        text: postType === 'self' ? postContent.trim() : undefined,
        url: postType === 'link' ? linkUrl.trim() : undefined,
        nsfw: isNsfw,
        spoiler: isSpoiler,
        flairText: flair.trim() || undefined,
        sendReplies: sendReplies,
        // No publishAt means it's a draft
      });

      // Update file status in editor store
      const currentTab = openTabs.find(tab => tab.id === activeTab);
      console.log('🔍 Reddit Editor (Draft) - activeTab ID:', activeTab);
      console.log('🔍 Reddit Editor (Draft) - Found currentTab:', currentTab);
      
      if (currentTab?.id) {
        console.log('🔄 Reddit Editor (Draft) - Updating file status to: draft for tab:', currentTab.id);
        updateFileStatus(currentTab.id, 'draft');
      } else {
        console.warn('⚠️ Reddit Editor (Draft) - No matching tab found for activeTab:', activeTab);
      }

      alert('Draft saved successfully!');

    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full bg-[#1e1e1e] text-[#cccccc] overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ff4500] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">r/</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold">Reddit Post</h1>
              <p className="text-sm text-[#858585]">{fileName}</p>
            </div>
          </div>
          <Badge variant="outline" className={
            isSubmitted
              ? "text-green-500 border-green-500 bg-green-500/10"
              : existingPost?.status === 'draft'
                ? "text-yellow-500 border-yellow-500 bg-yellow-500/10"
                : "text-[#ff4500] border-[#ff4500]"
          }>
            {isSubmitted ? 'Submitted' : existingPost?.status === 'draft' ? 'Draft' : 'New Post'}
          </Badge>
        </div>

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
            <TabsTrigger value="preview" className="text-[#cccccc] data-[state=active]:bg-[#007acc] data-[state=active]:text-white">
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              disabled={existingPost?.status !== 'published'}
              className={`${
                existingPost?.status !== 'published'
                  ? 'text-[#555555] cursor-not-allowed opacity-50'
                  : 'text-[#cccccc] data-[state=active]:bg-[#007acc] data-[state=active]:text-white'
              }`}
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6">
            {/* Subreddit & Post Type */}
            <Card className="bg-[#2d2d2d] border-[#454545]">
              <CardHeader>
                <CardTitle className="text-[#cccccc] flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Subreddit & Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#cccccc]">Subreddit</Label>
                    <Input
                      value={subreddit}
                      onChange={(e) => setSubreddit(e.target.value)}
                      placeholder="r/subredditname"
                      className={`bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585] ${isReadonly ? 'opacity-60 cursor-not-allowed' : ''}`}
                      readOnly={isReadonly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#cccccc]">Post Type</Label>
                    <Select value={postType} onValueChange={(value: 'self' | 'link' | 'image' | 'video') => setPostType(value)} disabled={isReadonly}>
                      <SelectTrigger className={`bg-[#1e1e1e] border-[#454545] text-[#cccccc] ${isReadonly ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2d2d2d] border-[#454545]">
                        <SelectItem value="self">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Text Post
                          </div>
                        </SelectItem>
                        <SelectItem value="link">
                          <div className="flex items-center gap-2">
                            <Link className="w-4 h-4" />
                            Link Post
                          </div>
                        </SelectItem>
                        <SelectItem value="image">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Image/Video Post
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#cccccc]">Flair (optional)</Label>
                  <Input
                    value={flair}
                    onChange={(e) => setFlair(e.target.value)}
                    placeholder="Post flair"
                    className={`bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585] ${isReadonly ? 'opacity-60 cursor-not-allowed' : ''}`}
                    readOnly={isReadonly}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Title */}
            <Card className="bg-[#2d2d2d] border-[#454545]">
              <CardHeader>
                <CardTitle className="text-[#cccccc]">Post Title</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#cccccc]">Title *</Label>
                  <Input
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="An interesting title"
                    className={`bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585] ${isReadonly ? 'opacity-60 cursor-not-allowed' : ''}`}
                    maxLength={titleMaxChars}
                    readOnly={isReadonly}
                  />
                  <div className="flex justify-between text-xs text-[#858585]">
                    <span>Characters remaining: {titleRemainingChars}</span>
                    <span>{postTitle.length}/{titleMaxChars}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Based on Post Type */}
            {postType === 'self' && (
              <Card className="bg-[#2d2d2d] border-[#454545]">
                <CardHeader>
                  <CardTitle className="text-[#cccccc]">Text Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[#cccccc]">Text (supports Markdown)</Label>
                    <Textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Write your post content here... You can use **bold**, *italic*, and other Markdown formatting."
                      className={`min-h-48 bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585] resize-none font-mono text-sm ${isReadonly ? 'opacity-60 cursor-not-allowed' : ''}`}
                      maxLength={textMaxChars}
                      readOnly={isReadonly}
                    />
                    <div className="flex justify-between text-xs text-[#858585]">
                      <span>Characters remaining: {textRemainingChars.toLocaleString()}</span>
                      <span>{postContent.length.toLocaleString()}/{textMaxChars.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {postType === 'link' && (
              <Card className="bg-[#2d2d2d] border-[#454545]">
                <CardHeader>
                  <CardTitle className="text-[#cccccc] flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Link Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[#cccccc]">URL *</Label>
                    <Input
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      className={`bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585] ${isReadonly ? 'opacity-60 cursor-not-allowed' : ''}`}
                      type="url"
                      readOnly={isReadonly}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {postType === 'image' && (
              <Card className="bg-[#2d2d2d] border-[#454545]">
                <CardHeader>
                  <CardTitle className="text-[#cccccc] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Media Upload
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[#cccccc]">Upload Image/Video</Label>
                    <input
                      type="file"
                      accept="image/*,video/*,.gif"
                      onChange={handleMediaUpload}
                      aria-label="Upload media file"
                      className="block w-full text-[#cccccc] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ff4500] file:text-white hover:file:bg-[#e03d00]"
                    />
                    {mediaFiles.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-[#1e1e1e] rounded">
                          <span className="text-xs text-[#cccccc]">{mediaFiles[0].name}</span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={removeMedia}
                            className="h-6 px-2 text-xs"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card className="bg-[#2d2d2d] border-[#454545]">
              <CardHeader>
                <CardTitle className="text-[#cccccc] flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule Post
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Show scheduled status if post is scheduled */}
                {existingPost?.publishAt && existingPost.publishAt > Date.now() && (
                  <div className="p-4 bg-[#3a3a3a] border border-[#555555] rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#ff8c00]" />
                        <span className="text-sm font-medium text-[#cccccc]">Post Scheduled</span>
                      </div>
                      <Badge className="bg-[#ff8c00] text-white">
                        {existingPost.status === 'scheduled' ? 'Scheduled' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#cccccc] mb-3">
                      This post is scheduled to be published on: <br />
                      <strong>{new Date(existingPost.publishAt).toLocaleString()}</strong>
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleCancelScheduling}
                      disabled={isSubmitting}
                      className="w-full hover:bg-red-700 dark:hover:bg-red-800"
                    >
                      {isSubmitting ? 'Canceling...' : 'Cancel Scheduling'}
                    </Button>
                  </div>
                )}

                {/* Show scheduling inputs if not scheduled or if canceled */}
                {(!existingPost?.publishAt || existingPost.publishAt <= Date.now()) && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[#cccccc]">Date</Label>
                        <Input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className={`bg-[#1e1e1e] border-[#454545] text-[#cccccc] ${isReadonly ? 'opacity-60 cursor-not-allowed' : ''}`}
                          readOnly={isReadonly}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#cccccc]">Time</Label>
                        <Input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className={`bg-[#1e1e1e] border-[#454545] text-[#cccccc] ${isReadonly ? 'opacity-60 cursor-not-allowed' : ''}`}
                          readOnly={isReadonly}
                        />
                      </div>
                    </div>

                    {scheduledDate && scheduledTime && (
                      <div className="p-3 bg-[#1e1e1e] rounded border border-[#454545]">
                        <p className="text-sm text-[#cccccc]">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Will be scheduled for: {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-[#2d2d2d] border-[#454545]">
              <CardHeader>
                <CardTitle className="text-[#cccccc]">Post Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isNsfw"
                    checked={isNsfw}
                    onChange={(e) => setIsNsfw(e.target.checked)}
                    disabled={isReadonly}
                    className={`rounded border-[#454545] bg-[#1e1e1e] text-[#ff4500] ${isReadonly ? 'opacity-60 cursor-not-allowed' : ''}`}
                    title="NSFW checkbox"
                  />
                  <Label htmlFor="isNsfw" className="text-[#cccccc]">NSFW (Not Safe for Work)</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isSpoiler"
                    checked={isSpoiler}
                    onChange={(e) => setIsSpoiler(e.target.checked)}
                    disabled={isReadonly}
                    className={`rounded border-[#454545] bg-[#1e1e1e] text-[#ff4500] ${isReadonly ? 'opacity-60 cursor-not-allowed' : ''}`}
                    title="Spoiler checkbox"
                  />
                  <Label htmlFor="isSpoiler" className="text-[#cccccc]">Spoiler</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendReplies"
                    checked={sendReplies}
                    onChange={(e) => setSendReplies(e.target.checked)}
                    disabled={isReadonly}
                    className={`rounded border-[#454545] bg-[#1e1e1e] text-[#ff4500] ${isReadonly ? 'opacity-60 cursor-not-allowed' : ''}`}
                    title="Send replies checkbox"
                  />
                  <Label htmlFor="sendReplies" className="text-[#cccccc]">Send me reply notifications</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card className="bg-[#2d2d2d] border-[#454545]">
              <CardHeader>
                <CardTitle className="text-[#cccccc] flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Post Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview Container styled like a Reddit post */}
                <div className="bg-[#1a1a1a] border border-[#454545] rounded-lg overflow-hidden">
                  {/* Reddit post header */}
                  <div className="p-3 border-b border-[#454545]">
                    <div className="flex items-center gap-2 text-sm text-[#858585]">
                      <Hash className="w-4 h-4 text-[#ff4500]" />
                      <span>r/{subreddit || 'subreddit'}</span>
                      <span>•</span>
                      <span>Posted by u/yourredditusername</span>
                      <span>•</span>
                      <span>just now</span>
                    </div>
                  </div>

                  {/* Post content */}
                  <div className="p-4">
                    {/* Post title */}
                    <h3 className="text-[#cccccc] font-medium text-lg mb-3 leading-tight">
                      {postTitle || 'Your post title will appear here'}
                    </h3>

                    {/* Post type specific content */}
                    {postType === 'link' && linkUrl && (
                      <div className="mb-3">
                        <div className="inline-flex items-center gap-2 text-sm text-[#007acc] hover:text-[#005a9e]">
                          <Link className="w-3 h-3" />
                          {linkUrl}
                        </div>
                      </div>
                    )}

                    {/* Media content for image/video posts */}
                    {(postType === 'image' || postType === 'video') && (
                      <div className="mb-3">
                        {mediaFiles.length > 0 ? (
                          <div className="space-y-2">
                            {mediaFiles.map((file, index) => {
                              const fileUrl = URL.createObjectURL(file);
                              const isVideo = file.type.startsWith('video/');

                              return (
                                <div key={index} className="border border-[#454545] rounded-lg overflow-hidden bg-[#1e1e1e]">
                                  {isVideo ? (
                                    <div className="relative">
                                      <video
                                        src={fileUrl}
                                        className="w-full max-h-96 object-contain bg-black"
                                        controls
                                        preload="metadata"
                                      />
                                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                        <Video className="w-3 h-3" />
                                        VIDEO
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <img
                                        src={fileUrl}
                                        alt="Preview"
                                        className="w-full max-h-96 object-contain bg-black"
                                        onLoad={() => URL.revokeObjectURL(fileUrl)}
                                      />
                                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                        <ImageIcon className="w-3 h-3" />
                                        IMAGE
                                      </div>
                                    </div>
                                  )}
                                  <div className="p-2 text-xs text-[#858585] border-t border-[#454545]">
                                    📁 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-8 border-2 border-dashed border-[#454545] rounded-lg text-center">
                            <div className="flex flex-col items-center gap-2 text-[#858585]">
                              {postType === 'image' ? (
                                <ImageIcon className="w-8 h-8" />
                              ) : (
                                <Video className="w-8 h-8" />
                              )}
                              <p className="text-sm">
                                {postType === 'image' ? 'Upload an image to preview' : 'Upload a video to preview'}
                              </p>
                              <p className="text-xs">
                                Go to the Compose tab to add media
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Show URL if provided for image/video posts */}
                        {linkUrl && (
                          <div className="mt-2 text-sm text-[#858585]">
                            <span className="font-medium">External Link:</span> {linkUrl}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Post text content */}
                    {postContent && (
                      <div className="text-[#cccccc] text-sm whitespace-pre-wrap leading-relaxed">
                        {postContent}
                      </div>
                    )}

                    {!postContent && postType === 'self' && (
                      <div className="text-[#858585] italic text-sm">
                        Your post content will appear here
                      </div>
                    )}

                    {/* Flair display */}
                    {flair && (
                      <div className="mt-3">
                        <span className="inline-block px-2 py-1 text-xs bg-[#007acc] text-white rounded">
                          {flair}
                        </span>
                      </div>
                    )}

                    {/* NSFW/Spoiler tags */}
                    <div className="flex gap-2 mt-3">
                      {isNsfw && (
                        <span className="inline-block px-2 py-1 text-xs bg-red-600 text-white rounded font-medium">
                          NSFW
                        </span>
                      )}
                      {isSpoiler && (
                        <span className="inline-block px-2 py-1 text-xs bg-yellow-600 text-white rounded font-medium">
                          SPOILER
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reddit post actions (read-only preview) */}
                  <div className="px-4 pb-3 flex items-center gap-4 text-sm text-[#858585]">
                    <div className="flex items-center gap-1">
                      <span>↑</span>
                      <span>Vote</span>
                      <span>↓</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>💬</span>
                      <span>Comment</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>↗</span>
                      <span>Share</span>
                    </div>
                  </div>
                </div>

                {/* Preview notes */}
                <div className="text-xs text-[#858585] p-3 bg-[#1a1a1a] border border-[#454545] rounded">
                  <p className="mb-1">📝 <strong>Preview Notes:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>This is a mockup of how your post will appear on Reddit</li>
                    <li>Actual appearance may vary slightly based on Reddit&apos;s current design</li>
                    <li>Your username will be your actual Reddit username when posted</li>
                    {(postType === 'image' || postType === 'video') && mediaFiles.length > 0 && (
                      <li className="text-green-500">✅ Media files will be uploaded when the post is submitted</li>
                    )}
                    {!postTitle && <li className="text-yellow-500">⚠️ Add a title in the Compose tab</li>}
                    {!subreddit && <li className="text-yellow-500">⚠️ Select a subreddit in the Compose tab</li>}
                    {(postType === 'image' || postType === 'video') && mediaFiles.length === 0 && (
                      <li className="text-yellow-500">⚠️ Add media files in the Compose tab</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab - Always visible but content varies by post status */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-[#2d2d2d] border-[#454545]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#cccccc] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Post Analytics
                  </CardTitle>
                  {existingPost?.status === 'published' && (
                    <Button
                      onClick={handleFetchAnalytics}
                      disabled={isFetchingAnalytics}
                      className="bg-[#007acc] text-white hover:bg-[#005a9e] text-xs px-3 py-1"
                    >
                      {isFetchingAnalytics ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Refresh
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {existingPost?.status !== 'published' ? (
                  /* Show message for non-published posts */
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-[#454545]" />
                    <div className="text-[#cccccc] text-lg mb-2">Analytics Not Available</div>
                    <div className="text-[#858585] mb-4">
                      Post analytics will be available once the post is published to Reddit.
                    </div>
                    <div className="text-xs text-[#858585]">
                      Current status: <span className="capitalize font-medium">{existingPost?.status || 'New'}</span>
                    </div>
                  </div>
                ) : (
                  /* Show analytics for published posts */
                  <>
                    {existingPost.publishedUrl && (
                      <div className="text-xs text-[#858585]">
                        <strong>Reddit URL:</strong>{' '}
                        <a
                          href={existingPost.publishedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#007acc] hover:underline"
                        >
                          {existingPost.publishedUrl}
                        </a>
                      </div>
                    )}

                    {/* Analytics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Score (Net Upvotes) */}
                    <div className="bg-[#1e1e1e] p-4 rounded border border-[#454545]">
                      <div className="text-2xl font-bold text-[#cccccc]">
                        {existingPost.score !== undefined ? existingPost.score : '--'}
                      </div>
                      <div className="text-xs text-[#858585]">Score</div>
                      <div className="text-xs text-[#858585]">(Net upvotes)</div>
                    </div>

                    {/* Upvote Ratio */}
                    <div className="bg-[#1e1e1e] p-4 rounded border border-[#454545]">
                      <div className="text-2xl font-bold text-[#cccccc]">
                        {existingPost.upvoteRatio !== undefined
                          ? `${Math.round(existingPost.upvoteRatio * 100)}%`
                          : '--'
                        }
                      </div>
                      <div className="text-xs text-[#858585]">Upvote Ratio</div>
                    </div>

                    {/* Comments */}
                    <div className="bg-[#1e1e1e] p-4 rounded border border-[#454545]">
                      <div className="text-2xl font-bold text-[#cccccc]">
                        {existingPost.numComments !== undefined ? existingPost.numComments : '--'}
                      </div>
                      <div className="text-xs text-[#858585]">Comments</div>
                    </div>

                    {/* Awards */}
                    <div className="bg-[#1e1e1e] p-4 rounded border border-[#454545]">
                      <div className="text-2xl font-bold text-[#cccccc]">
                        {existingPost.totalAwardsReceived !== undefined ? existingPost.totalAwardsReceived : '--'}
                      </div>
                      <div className="text-xs text-[#858585]">Awards</div>
                    </div>

                    {/* Upvotes */}
                    {existingPost.upvotes !== undefined && (
                      <div className="bg-[#1e1e1e] p-4 rounded border border-[#454545]">
                        <div className="text-2xl font-bold text-green-400">
                          {existingPost.upvotes}
                        </div>
                        <div className="text-xs text-[#858585]">Upvotes</div>
                      </div>
                    )}

                    {/* Downvotes */}
                    {existingPost.downvotes !== undefined && (
                      <div className="bg-[#1e1e1e] p-4 rounded border border-[#454545]">
                        <div className="text-2xl font-bold text-red-400">
                          {existingPost.downvotes}
                        </div>
                        <div className="text-xs text-[#858585]">Downvotes</div>
                      </div>
                    )}

                    {/* Crossposts */}
                    {existingPost.numCrossposts !== undefined && existingPost.numCrossposts > 0 && (
                      <div className="bg-[#1e1e1e] p-4 rounded border border-[#454545]">
                        <div className="text-2xl font-bold text-[#cccccc]">
                          {existingPost.numCrossposts}
                        </div>
                        <div className="text-xs text-[#858585]">Crossposts</div>
                      </div>
                    )}

                    {/* Views - Always show this section */}
                    <div className="bg-[#1e1e1e] p-4 rounded border border-[#454545]">
                      <div className="text-2xl font-bold text-[#cccccc]">
                        {existingPost.viewCount !== undefined && existingPost.viewCount !== null
                          ? existingPost.viewCount.toLocaleString()
                          : '0'}
                      </div>
                      <div className="text-xs text-[#858585]">Views</div>
                    </div>
                  </div>

                  {/* Last Updated */}
                  {existingPost.lastAnalyticsUpdate && (
                    <div className="text-xs text-[#858585] text-center">
                      Last updated: {new Date(existingPost.lastAnalyticsUpdate).toLocaleString()}
                    </div>
                  )}

                  {/* No Analytics Data Message */}
                  {existingPost.score === undefined && (
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-[#454545]" />
                      <div className="text-[#858585] mb-4">No analytics data available yet</div>
                      <div className="text-xs text-[#858585]">
                        Click &quot;Refresh&quot; above to fetch the latest analytics from Reddit
                      </div>
                    </div>
                  )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>        {/* Connection Status & Error Display */}
        {!redditConnection && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-yellow-500">
              Reddit account not connected. Please connect your account in Social Connectors to post.
            </span>
          </div>
        )}

        {redditConnection && !redditConnection.accessToken && (
          <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-500">
              Reddit account connected but not authenticated. Please authorize your Reddit account in Social Connectors.
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-500">{error}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={clearError}
              className="ml-auto h-6 px-2 text-xs"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-[#454545]">
          {isSubmitted ? (
            <Button
              className="bg-green-600 text-white flex-1 cursor-not-allowed opacity-60"
              disabled
            >
              ✓ Submitted to Reddit
            </Button>
          ) : existingPost?.status === 'scheduled' || (existingPost?.publishAt && existingPost.publishAt > Date.now()) ? (
            <Button
              className="bg-[#4a4a4a] text-[#cccccc] flex-1 cursor-not-allowed opacity-60"
              disabled
            >
              ✓ Scheduled
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSubmitPost}
                className="bg-[#ff4500] hover:bg-[#e03d00] text-white flex-1"
                disabled={
                  !redditConnection ||
                  !redditConnection.accessToken ||
                  isSubmitting ||
                  !postTitle.trim() ||
                  !subreddit.trim() ||
                  (postType === 'link' && !linkUrl.trim()) ||
                  (postType === 'self' && !postContent.trim()) ||
                  isReadonly
                }
              >
                {isSubmitting
                  ? 'Submitting...'
                  : scheduledDate && scheduledTime
                    ? 'Schedule Post'
                    : existingPost ? 'Update Draft' : 'Save Draft'
                }
              </Button>

              {/* Publish to Reddit Button */}
              {lastCreatedPostId && (
                <Button
                  onClick={handlePublishNow}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  disabled={isPublishing || isSubmitting}
                >
                  {isPublishing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Publish to Reddit
                    </>
                  )}
                </Button>
              )}

              {/* Save Draft Button */}
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="bg-transparent border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
                disabled={isSubmitting || !postTitle.trim() || !subreddit.trim() || isReadonly}
              >
                {isSubmitting ? 'Saving...' : 'Save Draft'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
