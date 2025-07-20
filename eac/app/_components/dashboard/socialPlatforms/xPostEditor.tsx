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
import { Calendar, Clock, Globe, Heart, ImageIcon, MessageCircle, Repeat2, Users } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';

interface XPostEditorProps {
  fileName: string;
  initialContent?: string;
  onChange?: (content: string) => void;
}

export function XPostEditor({ fileName, onChange }: XPostEditorProps) {
  const [postContent, setPostContent] = useState('');
  const [replySettings, setReplySettings] = useState('everyone');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isThread, setIsThread] = useState(false);
  const [threadTweets, setThreadTweets] = useState(['']);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState('1440'); // 24 hours in minutes
  const [hasPoll, setHasPoll] = useState(false);

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
      },
      timestamp: new Date().toISOString()
    };

    if (onChangeRef.current) {
      onChangeRef.current(JSON.stringify(formData, null, 2));
    }
  }, [postContent, replySettings, scheduledDate, scheduledTime, isThread, threadTweets, mediaFiles, hasPoll, pollOptions, pollDuration, fileName]);

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
              <p className="text-sm text-[#858585]">{fileName}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-black border-black">
            Draft
          </Badge>
        </div>

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
                      <SelectItem value="everyone">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Everyone
                        </div>
                      </SelectItem>
                      <SelectItem value="following">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          People you follow
                        </div>
                      </SelectItem>
                      <SelectItem value="mentioned">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          Only people you mention
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
          <Button className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white flex-1">
            {scheduledDate && scheduledTime ? 'Schedule Tweet' : isThread ? 'Post Thread' : 'Post Tweet'}
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
