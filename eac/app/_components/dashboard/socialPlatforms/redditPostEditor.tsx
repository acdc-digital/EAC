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
import { useAction, useMutation, useQuery } from "convex/react";
import { AlertCircle, Calendar, Clock, FileText, Hash, ImageIcon, Link, Send } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';

interface RedditPostEditorProps {
  fileName: string;
  onChange?: (content: string) => void;
}

export function RedditPostEditor({ fileName, onChange }: RedditPostEditorProps) {
  // Get Reddit connection from Convex
  const redditConnections = useQuery(api.reddit.getSocialConnections, {
    userId: 'temp-user-id', // TODO: Replace with actual user ID
    platform: 'reddit'
  });
  
  const redditConnection = redditConnections?.[0]; // Get the first Reddit connection
  
  // Get existing Reddit post for this file (if any)
  const existingPost = useQuery(api.reddit.getRedditPostByFileName, {
    fileName: fileName
  });
  
  // Get the file record to link the post to it
  const fileRecord = useQuery(api.files.getFileByName, {
    name: fileName
  });
  
  // TODO: Fix social store import
  // const clearError = useSocialStore(state => state.clearError);
  const clearError = () => setError(null); // Temporary fix
  
  // Convex mutations
  const createRedditPost = useMutation(api.reddit.createRedditPost);
  const submitRedditPost = useAction(api.redditApi.submitRedditPost);
  
  // Form state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'self' | 'link' | 'image' | 'video'>('self');
  const [subreddit, setSubreddit] = useState('');
  const [flair, setFlair] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isNsfw, setIsNsfw] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [sendReplies, setSendReplies] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedPostId, setLastCreatedPostId] = useState<string | null>(null);

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

  // Load existing post data when available
  useEffect(() => {
    if (existingPost) {
      setPostTitle(existingPost.title || '');
      setPostContent(existingPost.text || '');
      setPostType(existingPost.kind || 'self');
      setSubreddit(existingPost.subreddit || '');
      setFlair(existingPost.flairText || '');
      setLinkUrl(existingPost.url || '');
      setIsNsfw(existingPost.nsfw || false);
      setIsSpoiler(existingPost.spoiler || false);
      setSendReplies(existingPost.sendReplies ?? true);
      setLastCreatedPostId(existingPost._id);
    }
  }, [existingPost]);

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

  // Handle post submission
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
      let publishAt: number | undefined;
      if (scheduledDate && scheduledTime) {
        publishAt = new Date(`${scheduledDate}T${scheduledTime}`).getTime();
        if (publishAt <= Date.now()) {
          alert('Scheduled time must be in the future.');
          setIsSubmitting(false);
          return;
        }
      }

      // Call Convex mutation directly
      const postId = await createRedditPost({
        userId: 'temp-user-id', // TODO: Replace with actual user ID
        connectionId: redditConnection._id,
        fileId: fileRecord?._id, // Link to the file
        subreddit: subreddit.trim(),
        title: postTitle.trim(),
        kind: postType,
        text: postType === 'self' ? postContent.trim() : undefined,
        url: postType === 'link' ? linkUrl.trim() : undefined,
        nsfw: isNsfw,
        spoiler: isSpoiler,
        flairText: flair.trim() || undefined,
        sendReplies: sendReplies,
        publishAt: publishAt,
      });

      console.log('Reddit post created successfully:', postId);
      
      // Store the post ID for potential publishing
      setLastCreatedPostId(postId);
      
      // Reset form or show success message
      alert(publishAt ? 'Post scheduled successfully!' : 'Post created successfully!');
      
      // Reset form
      setPostTitle('');
      setPostContent('');
      setSubreddit('');
      setFlair('');
      setLinkUrl('');
      setScheduledDate('');
      setScheduledTime('');
      
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
        </Tabs>

        {/* Connection Status & Error Display */}
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
