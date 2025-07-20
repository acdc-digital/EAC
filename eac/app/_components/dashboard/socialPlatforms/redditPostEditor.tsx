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
import { Calendar, Clock, FileText, Hash, ImageIcon, Link } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';

interface RedditPostEditorProps {
  fileName: string;
  onChange?: (content: string) => void;
}

export function RedditPostEditor({ fileName, onChange }: RedditPostEditorProps) {
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('text');
  const [subreddit, setSubreddit] = useState('');
  const [flair, setFlair] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isNsfw, setIsNsfw] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [sendReplies, setSendReplies] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  // Use ref to store the onChange callback to avoid infinite loops
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Character limits
  const titleMaxChars = 300;
  const textMaxChars = 40000;
  const titleRemainingChars = titleMaxChars - postTitle.length;
  const textRemainingChars = textMaxChars - postContent.length;

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
          <Badge variant="outline" className="text-[#ff4500] border-[#ff4500]">
            Draft
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
                      className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#cccccc]">Post Type</Label>
                    <Select value={postType} onValueChange={setPostType}>
                      <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2d2d2d] border-[#454545]">
                        <SelectItem value="text">
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
                    className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
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
                    className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                    maxLength={titleMaxChars}
                  />
                  <div className="flex justify-between text-xs text-[#858585]">
                    <span>Characters remaining: {titleRemainingChars}</span>
                    <span>{postTitle.length}/{titleMaxChars}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Based on Post Type */}
            {postType === 'text' && (
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
                      className="min-h-48 bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585] resize-none font-mono text-sm"
                      maxLength={textMaxChars}
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
                      className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                      type="url"
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
                <CardTitle className="text-[#cccccc]">Post Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isNsfw"
                    checked={isNsfw}
                    onChange={(e) => setIsNsfw(e.target.checked)}
                    className="rounded border-[#454545] bg-[#1e1e1e] text-[#ff4500]"
                  />
                  <Label htmlFor="isNsfw" className="text-[#cccccc]">NSFW (Not Safe for Work)</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isSpoiler"
                    checked={isSpoiler}
                    onChange={(e) => setIsSpoiler(e.target.checked)}
                    className="rounded border-[#454545] bg-[#1e1e1e] text-[#ff4500]"
                  />
                  <Label htmlFor="isSpoiler" className="text-[#cccccc]">Spoiler</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendReplies"
                    checked={sendReplies}
                    onChange={(e) => setSendReplies(e.target.checked)}
                    className="rounded border-[#454545] bg-[#1e1e1e] text-[#ff4500]"
                  />
                  <Label htmlFor="sendReplies" className="text-[#cccccc]">Send me reply notifications</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-[#454545]">
          <Button 
            className="bg-[#ff4500] hover:bg-[#e03d00] text-white flex-1"
            disabled={!postTitle.trim() || (postType === 'link' && !linkUrl.trim())}
          >
            {scheduledDate && scheduledTime ? 'Schedule Post' : 'Submit Post'}
          </Button>
          <Button variant="outline" className="border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]">
            Save Draft
          </Button>
          <Button variant="outline" className="border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]">
            Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
