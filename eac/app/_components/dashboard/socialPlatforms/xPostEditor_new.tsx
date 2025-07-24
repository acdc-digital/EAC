// X/Twitter Post Editor Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/dashboard/socialPlatforms/xPostEditor.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useSocialPost } from "@/lib/hooks/useSocialPost";
import { useXApi } from "@/lib/hooks/useXApi";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AtSign,
  Calendar,
  CheckCircle,
  Clock,
  Globe,
  Loader2,
  MessageCircle,
  Send,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";

interface XPostEditorProps {
  fileName: string;
  onChange?: (content: string) => void;
}

export function XPostEditor({ fileName, onChange }: XPostEditorProps) {
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
  } = useSocialPost({ fileName, fileType: 'twitter' });

  // Get X API functions
  const { postTweet, hasConnection, connectionInfo } = useXApi();

  // Local state for immediate UI updates
  const [formData, setFormData] = useState({
    content: "",
    replySettings: "following" as "following" | "mentionedUsers" | "subscribers" | "verified",
    scheduledDate: "",
    scheduledTime: "",
    isThread: false,
    threadTweets: [""],
    hasPoll: false,
    pollOptions: ["", ""],
    pollDuration: 1440, // 24 hours in minutes
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);

  // Debounced save
  const debouncedFormData = useDebounce(formData, 1000); // 1 second debounce

  // Load saved content when post data is available
  useEffect(() => {
    if (post && !postLoading) {
      try {
        const platformData = getPlatformData() as {
          replySettings?: "following" | "mentionedUsers" | "subscribers" | "verified";
          scheduledDate?: string;
          scheduledTime?: string;
          isThread?: boolean;
          threadTweets?: string[];
          hasPoll?: boolean;
          pollOptions?: string[];
          pollDuration?: number;
        };
        setFormData({
          content: post.content || "",
          replySettings: platformData.replySettings || "following",
          scheduledDate: platformData.scheduledDate || "",
          scheduledTime: platformData.scheduledTime || "",
          isThread: platformData.isThread || false,
          threadTweets: platformData.threadTweets || [""],
          hasPoll: platformData.hasPoll || false,
          pollOptions: platformData.pollOptions || ["", ""],
          pollDuration: platformData.pollDuration || 1440,
        });
      } catch (error) {
        console.error('Failed to parse platform data:', error);
      }
    }
  }, [post, postLoading, getPlatformData]);

  // Auto-save on content change (debounced)
  useEffect(() => {
    if (debouncedFormData.content) {
      saveContent(
        debouncedFormData.content,
        undefined, // No title for Twitter
        {
          replySettings: debouncedFormData.replySettings,
          scheduledDate: debouncedFormData.scheduledDate,
          scheduledTime: debouncedFormData.scheduledTime,
          isThread: debouncedFormData.isThread,
          threadTweets: debouncedFormData.threadTweets,
          hasPoll: debouncedFormData.hasPoll,
          pollOptions: debouncedFormData.pollOptions,
          pollDuration: debouncedFormData.pollDuration,
        }
      );
    }
  }, [debouncedFormData, saveContent]);

  // Update parent component when content changes
  useEffect(() => {
    if (onChange) {
      const formJson = {
        fileName,
        platform: 'twitter',
        content: formData,
        timestamp: new Date().toISOString(),
        status,
      };
      onChange(JSON.stringify(formJson, null, 2));
    }
  }, [formData, fileName, status, onChange]);

  // Character count (X allows 280 characters per tweet)
  const maxChars = 280;
  const remainingChars = maxChars - formData.content.length;

  // Handle post submission
  const handleSubmit = async () => {
    if (!canPost || !hasConnection) return;

    setIsSubmitting(true);
    await updatePostStatus('posting');

    try {
      const result = await postTweet({
        text: formData.content,
        reply_settings: formData.replySettings,
        // Add other parameters as needed
      });

      if (result.success && result.data) {
        await updatePostStatus('posted', {
          postId: result.data.id,
          postUrl: `https://twitter.com/user/status/${result.data.id}`,
        });
        console.log("Tweet posted successfully!");
      } else {
        throw new Error(result.error || 'Failed to post tweet');
      }
    } catch (error) {
      await updatePostStatus('failed', {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error("Failed to post tweet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle scheduling
  const handleSchedule = async () => {
    if (!canSchedule || !formData.scheduledDate || !formData.scheduledTime) return;

    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    
    try {
      await schedulePost(
        scheduledDateTime,
        formData.content,
        undefined, // No title for Twitter
        {
          replySettings: formData.replySettings,
          isThread: formData.isThread,
          threadTweets: formData.threadTweets,
          hasPoll: formData.hasPoll,
          pollOptions: formData.pollOptions,
          pollDuration: formData.pollDuration,
        }
      );
      setShowScheduler(false);
      console.log("Tweet scheduled successfully!");
    } catch (error) {
      console.error("Failed to schedule tweet:", error);
    }
  };

  const isReadonly = isPosted;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2d2d30]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#1DA1F2]" />
          <span className="text-sm font-medium">X/Twitter Post</span>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              status === 'posted' && "border-green-600 text-green-600",
              status === 'scheduled' && "border-blue-600 text-blue-600",
              status === 'posting' && "border-yellow-600 text-yellow-600",
              status === 'failed' && "border-red-600 text-red-600",
              status === 'draft' && "border-gray-600 text-gray-600"
            )}
          >
            {status}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#858585]">
          <Clock className="w-3 h-3" />
          Auto-saving...
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#2d2d30]">
            <TabsTrigger value="compose" className="data-[state=active]:bg-[#1DA1F2] data-[state=active]:text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#1DA1F2] data-[state=active]:text-white">
              <AtSign className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-[#1DA1F2] data-[state=active]:text-white">
              <Globe className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-4">
            {/* Content Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content" className="text-sm font-medium">Tweet Content</Label>
                <span className={cn(
                  "text-xs",
                  remainingChars < 50 ? "text-red-400" : "text-[#858585]"
                )}>
                  {remainingChars} characters remaining
                </span>
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="What's happening?"
                className="bg-[#2d2d30] border-[#454545] text-[#cccccc] placeholder:text-[#858585] min-h-[150px] resize-none"
                disabled={isReadonly}
                maxLength={maxChars}
              />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            {/* Reply Settings */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Who can reply</Label>
              <Select 
                value={formData.replySettings} 
                onValueChange={(value: "following" | "mentionedUsers" | "subscribers" | "verified") => 
                  setFormData(prev => ({ ...prev, replySettings: value }))
                }
                disabled={isReadonly}
              >
                <SelectTrigger className="bg-[#2d2d30] border-[#454545] text-[#cccccc]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2d2d30] border-[#454545]">
                  <SelectItem value="following" className="text-[#cccccc] hover:bg-[#383838]">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      People you follow
                    </div>
                  </SelectItem>
                  <SelectItem value="mentionedUsers" className="text-[#cccccc] hover:bg-[#383838]">
                    <div className="flex items-center gap-2">
                      <AtSign className="w-4 h-4" />
                      Only mentioned users
                    </div>
                  </SelectItem>
                  <SelectItem value="subscribers" className="text-[#cccccc] hover:bg-[#383838]">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Subscribers
                    </div>
                  </SelectItem>
                  <SelectItem value="verified" className="text-[#cccccc] hover:bg-[#383838]">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Verified users only
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Thread Option */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isThread"
                checked={formData.isThread}
                onChange={(e) => setFormData(prev => ({ ...prev, isThread: e.target.checked }))}
                className="w-4 h-4 text-[#1DA1F2] bg-[#2d2d30] border-[#454545] rounded focus:ring-[#1DA1F2]"
                disabled={isReadonly}
              />
              <Label htmlFor="isThread" className="text-sm text-[#cccccc]">Create as thread</Label>
            </div>

            {/* Poll Option */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasPoll"
                checked={formData.hasPoll}
                onChange={(e) => setFormData(prev => ({ ...prev, hasPoll: e.target.checked }))}
                className="w-4 h-4 text-[#1DA1F2] bg-[#2d2d30] border-[#454545] rounded focus:ring-[#1DA1F2]"
                disabled={isReadonly}
              />
              <Label htmlFor="hasPoll" className="text-sm text-[#cccccc]">Add poll</Label>
            </div>

            {/* Poll Options */}
            {formData.hasPoll && (
              <div className="space-y-2 pl-6">
                <Label className="text-sm font-medium">Poll Options</Label>
                {formData.pollOptions.map((option, index) => (
                  <Input
                    key={index}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...formData.pollOptions];
                      newOptions[index] = e.target.value;
                      setFormData(prev => ({ ...prev, pollOptions: newOptions }));
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="bg-[#2d2d30] border-[#454545] text-[#cccccc] placeholder:text-[#858585]"
                    disabled={isReadonly}
                  />
                ))}
                <div className="space-y-2">
                  <Label className="text-sm text-[#cccccc]">Poll duration (hours)</Label>
                  <Input
                    type="number"
                    value={formData.pollDuration / 60}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      pollDuration: parseInt(e.target.value) * 60 
                    }))}
                    min={1}
                    max={168}
                    className="bg-[#2d2d30] border-[#454545] text-[#cccccc]"
                    disabled={isReadonly}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card className="bg-[#2d2d30] border-[#454545]">
              <CardContent className="p-4">
                <div className="text-[#cccccc] text-sm whitespace-pre-wrap">
                  {formData.content || "Your tweet will appear here..."}
                </div>
                {formData.hasPoll && (
                  <div className="mt-3 space-y-2">
                    {formData.pollOptions.filter(Boolean).map((option, index) => (
                      <div key={index} className="p-2 bg-[#1e1e1e] border border-[#454545] rounded">
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-4 border-t border-[#2d2d30]">
        <Button
          onClick={handleSubmit}
          disabled={!canPost || isSubmitting || !formData.content || !hasConnection}
          className={cn(
            "flex-1",
            isPosted && "bg-green-600 hover:bg-green-700",
            isPosting && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : isPosted ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Posted
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Tweet
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowScheduler(true)}
          disabled={!canSchedule}
          className={cn(
            isScheduled && "border-blue-600 text-blue-600"
          )}
        >
          {isScheduled ? (
            <>
              <Clock className="mr-2 h-4 w-4" />
              Scheduled
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </>
          )}
        </Button>
      </div>

      {/* Show status message */}
      {status === 'failed' && post?.errorMessage && (
        <div className="px-4 pb-2">
          <div className="flex items-center p-3 text-sm text-red-300 bg-red-900/20 border border-red-800 rounded">
            <AlertCircle className="h-4 w-4 mr-2" />
            {post.errorMessage}
          </div>
        </div>
      )}

      {/* Scheduler Modal */}
      {showScheduler && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2d2d30] border border-[#454545] rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-[#cccccc] mb-4">Schedule Tweet</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="scheduleDate" className="text-sm text-[#cccccc]">Date</Label>
                <Input
                  id="scheduleDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                />
              </div>
              <div>
                <Label htmlFor="scheduleTime" className="text-sm text-[#cccccc]">Time</Label>
                <Input
                  id="scheduleTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleSchedule} className="flex-1">
                Schedule
              </Button>
              <Button variant="outline" onClick={() => setShowScheduler(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
