// Instagram Post Editor Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/dashboard/socialPlatforms/instagramPostEditor.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, ImageIcon, Users } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';

interface InstagramPostEditorProps {
  fileName: string;
  onChange?: (content: string) => void;
}

export function InstagramPostEditor({ fileName, onChange }: InstagramPostEditorProps) {
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('feed');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [location, setLocation] = useState('');
  const [altText, setAltText] = useState('');
  const [collaborators, setCollaborators] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [commentSettings, setCommentSettings] = useState('everyone');
  const [hideFromFeed, setHideFromFeed] = useState(false);

  // Use ref to store the onChange callback to avoid infinite loops
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Character count (Instagram allows up to 2,200 characters)
  const maxChars = 2200;
  const remainingChars = maxChars - postContent.length;

  // Update parent when content changes
  useEffect(() => {
    const formData = {
      fileName,
      platform: 'instagram',
      content: {
        text: postContent,
        postType,
        scheduledDate,
        scheduledTime,
        hashtags: hashtags.split(' ').filter(tag => tag.startsWith('#')),
        location,
        altText,
        collaborators: collaborators.split(',').map(user => user.trim()).filter(Boolean),
        mediaCount: mediaFiles.length,
        commentSettings,
        hideFromFeed
      },
      timestamp: new Date().toISOString()
    };

    if (onChangeRef.current) {
      onChangeRef.current(JSON.stringify(formData, null, 2));
    }
  }, [postContent, postType, scheduledDate, scheduledTime, hashtags, location, altText, collaborators, mediaFiles, commentSettings, hideFromFeed, fileName]);

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setMediaFiles(prev => [...prev, ...files].slice(0, 10)); // Instagram allows up to 10 media files for carousel
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full bg-[#1e1e1e] text-[#cccccc] overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#dc2743] rounded-lg flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Instagram Post</h1>
              <p className="text-sm text-[#858585]">{fileName}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[#e4405f] border-[#e4405f]">
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
            {/* Post Type */}
            <Card className="bg-[#2d2d2d] border-[#454545]">
              <CardHeader>
                <CardTitle className="text-[#cccccc]">Post Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={postType} onValueChange={setPostType}>
                  <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2d2d2d] border-[#454545]">
                    <SelectItem value="feed">Feed Post</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="reel">Reel</SelectItem>
                    <SelectItem value="igtv">IGTV</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Media Upload */}
            <Card className="bg-[#2d2d2d] border-[#454545]">
              <CardHeader>
                <CardTitle className="text-[#cccccc] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Media Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#cccccc]">
                    Upload Photos/Videos {postType === 'feed' ? '(Max 10 for carousel)' : '(Max 1)'}
                  </Label>
                  <input
                    type="file"
                    multiple={postType === 'feed'}
                    accept={postType === 'story' ? 'image/*,video/*' : 'image/*,video/*'}
                    onChange={handleMediaUpload}
                    aria-label="Upload media files"
                    className="block w-full text-[#cccccc] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e4405f] file:text-white hover:file:bg-[#d73549]"
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

                <div className="space-y-2">
                  <Label className="text-[#cccccc]">Alt Text (for accessibility)</Label>
                  <Textarea
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe your image for visually impaired users..."
                    className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                    rows={2}
                    maxLength={125}
                  />
                  <div className="text-xs text-[#858585] text-right">
                    {altText.length}/125
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Caption */}
            <Card className="bg-[#2d2d2d] border-[#454545]">
              <CardHeader>
                <CardTitle className="text-[#cccccc]">Caption</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#cccccc]">Write a caption...</Label>
                  <Textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Write your caption here..."
                    className="min-h-32 bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585] resize-none"
                    maxLength={maxChars}
                  />
                  <div className="flex justify-between text-xs text-[#858585]">
                    <span>Characters remaining: {remainingChars.toLocaleString()}</span>
                    <span>{postContent.length.toLocaleString()}/{maxChars.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#cccccc]">Hashtags</Label>
                    <Input
                      value={hashtags}
                      onChange={(e) => setHashtags(e.target.value)}
                      placeholder="#hashtag1 #hashtag2"
                      className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#cccccc]">Location</Label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Add location"
                      className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#cccccc]">Tag Collaborators</Label>
                  <Input
                    value={collaborators}
                    onChange={(e) => setCollaborators(e.target.value)}
                    placeholder="@username1, @username2"
                    className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                  />
                </div>
              </CardContent>
            </Card>
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
                <CardTitle className="text-[#cccccc] flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Post Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#cccccc]">Who can comment?</Label>
                  <Select value={commentSettings} onValueChange={setCommentSettings}>
                    <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2d2d2d] border-[#454545]">
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="followers">People you follow</SelectItem>
                      <SelectItem value="following">People who follow you</SelectItem>
                      <SelectItem value="off">Turn off commenting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hideFromFeed"
                    checked={hideFromFeed}
                    onChange={(e) => setHideFromFeed(e.target.checked)}
                    className="rounded border-[#454545] bg-[#1e1e1e] text-[#e4405f]"
                  />
                  <Label htmlFor="hideFromFeed" className="text-[#cccccc]">Hide from profile grid</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-[#454545]">
          <Button className="bg-[#e4405f] hover:bg-[#d73549] text-white flex-1">
            {scheduledDate && scheduledTime ? 'Schedule Post' : 'Publish Now'}
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
