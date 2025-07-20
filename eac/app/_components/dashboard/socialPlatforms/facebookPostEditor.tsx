// Facebook Post Editor Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/dashboard/socialPlatforms/facebookPostEditor.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Globe, Hash, ImageIcon, Lock, UserCheck, Users } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';

interface FacebookPostEditorProps {
  fileName: string;
  initialContent?: string;
  onChange?: (content: string) => void;
}

export function FacebookPostEditor({ fileName, initialContent = '', onChange }: FacebookPostEditorProps) {
  const [postContent, setPostContent] = useState('');
  const [audience, setAudience] = useState('public');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [location, setLocation] = useState('');
  const [taggedUsers, setTaggedUsers] = useState('');
  const [postType, setPostType] = useState('text');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkDescription, setLinkDescription] = useState('');

  // Use ref to store the onChange callback to avoid infinite loops
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Character count (Facebook allows up to 63,206 characters)
  const maxChars = 63206;
  const remainingChars = maxChars - postContent.length;

  // Update parent when content changes
  useEffect(() => {
    const formData = {
      fileName,
      platform: 'facebook',
      content: {
        text: postContent,
        audience,
        scheduledDate,
        scheduledTime,
        hashtags: hashtags.split(' ').filter(tag => tag.startsWith('#')),
        location,
        taggedUsers: taggedUsers.split(',').map(user => user.trim()).filter(Boolean),
        postType,
        linkUrl,
        linkTitle,
        linkDescription,
        mediaCount: mediaFiles.length
      },
      timestamp: new Date().toISOString()
    };

    if (onChangeRef.current) {
      onChangeRef.current(JSON.stringify(formData, null, 2));
    }
  }, [postContent, audience, scheduledDate, scheduledTime, hashtags, location, taggedUsers, postType, mediaFiles, linkUrl, linkTitle, linkDescription, fileName]); // Removed onChange from dependency array

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setMediaFiles(prev => [...prev, ...files].slice(0, 10)); // Facebook allows up to 10 media files
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
            <div className="w-8 h-8 bg-[#1877f2] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">f</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold">Facebook Post</h1>
              <p className="text-sm text-[#858585]">{fileName}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[#1877f2] border-[#1877f2]">
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
            {/* Post Content */}
            <Card className="bg-[#2d2d2d] border-[#454545]">
              <CardHeader>
                <CardTitle className="text-[#cccccc] flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Post Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#cccccc]">What's on your mind?</Label>
                  <Textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Write your Facebook post here..."
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
                      placeholder="City, State"
                      className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#cccccc]">Tag People</Label>
                  <Input
                    value={taggedUsers}
                    onChange={(e) => setTaggedUsers(e.target.value)}
                    placeholder="username1, username2"
                    className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Media Upload */}
            <Card className="bg-[#2d2d2d] border-[#454545]">
              <CardHeader>
                <CardTitle className="text-[#cccccc] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Media & Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#cccccc]">Post Type</Label>
                  <Select value={postType} onValueChange={setPostType}>
                    <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2d2d2d] border-[#454545]">
                      <SelectItem value="text">Text Only</SelectItem>
                      <SelectItem value="photo">Photo</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="album">Photo Album</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {postType !== 'text' && postType !== 'link' && (
                  <div className="space-y-2">
                    <Label className="text-[#cccccc]">Upload Media (Max 10 files)</Label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="block w-full text-[#cccccc] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#007acc] file:text-white hover:file:bg-[#005a9e]"
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
                )}

                {postType === 'link' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[#cccccc]">Link URL</Label>
                      <Input
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#cccccc]">Link Title</Label>
                      <Input
                        value={linkTitle}
                        onChange={(e) => setLinkTitle(e.target.value)}
                        placeholder="Article title"
                        className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#cccccc]">Link Description</Label>
                      <Textarea
                        value={linkDescription}
                        onChange={(e) => setLinkDescription(e.target.value)}
                        placeholder="Brief description of the link"
                        className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585]"
                        rows={3}
                      />
                    </div>
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
                  Audience & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#cccccc]">Who can see this post?</Label>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2d2d2d] border-[#454545]">
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Public
                        </div>
                      </SelectItem>
                      <SelectItem value="friends">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Friends
                        </div>
                      </SelectItem>
                      <SelectItem value="friends_except">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          Friends except...
                        </div>
                      </SelectItem>
                      <SelectItem value="only_me">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Only me
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
          <Button className="bg-[#1877f2] hover:bg-[#166fe5] text-white flex-1">
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
