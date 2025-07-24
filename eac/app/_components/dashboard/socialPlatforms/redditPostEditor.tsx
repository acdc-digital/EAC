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
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useSocialPost } from "@/lib/hooks/useSocialPost";
import { cn } from "@/lib/utils";
import { useAction, useMutation, useQuery } from "convex/react";
import { AlertCircle, Calendar, CheckCircle, Clock, Eye, FileText, Hash, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from 'react';

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
    platformData,
  } = useSocialPost({ fileName, fileType: 'reddit' });

  // Debug logging for status changes
  useEffect(() => {
    console.log(`📊 Reddit Editor Status Update for ${fileName}:`, {
      status,
      isPosted,
      canPost,
      post: post ? { 
        _id: post._id, 
        status: post.status, 
        fileName: post.fileName,
        postId: post.postId,
        postUrl: post.postUrl 
      } : null
    });
  }, [fileName, status, isPosted, canPost, post]);

  // Get Reddit connection from Convex
  const redditConnections = useQuery(api.reddit.getSocialConnections, {
    userId: 'temp-user-id', // TODO: Replace with actual user ID
    platform: 'reddit'
  });

  const redditConnection = redditConnections?.[0]; // Get the first Reddit connection
  const createRedditPost = useMutation(api.reddit.createRedditPost);
  const submitRedditPost = useAction(api.redditApi.submitRedditPost);

  // Local state for immediate UI updates
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    subreddit: "test",
    postType: "self" as "self" | "link",
    linkUrl: "",
    flairId: null as string | null,
    nsfw: false,
    spoiler: false,
    sendReplies: true,
    scheduledDate: "",
    scheduledTime: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Use ref to store the onChange callback to avoid infinite loops
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Debounced save
  const debouncedFormData = useDebounce(formData, 1000); // 1 second debounce

  // Load saved content when post data is available
  useEffect(() => {
    if (post && !postLoading && !hasInitialized) {
      const typed = platformData as {
        subreddit?: string;
        postType?: "self" | "link";
        linkUrl?: string;
        flairId?: string | null;
        nsfw?: boolean;
        spoiler?: boolean;
        sendReplies?: boolean;
        scheduledDate?: string;
        scheduledTime?: string;
      };
      
      setFormData({
        title: post.title || "",
        content: post.content || "",
        subreddit: typed.subreddit || "test",
        postType: typed.postType || "self",
        linkUrl: typed.linkUrl || "",
        flairId: typed.flairId || null,
        nsfw: typed.nsfw || false,
        spoiler: typed.spoiler || false,
        sendReplies: typed.sendReplies ?? true,
        scheduledDate: typed.scheduledDate || "",
        scheduledTime: typed.scheduledTime || "",
      });
      setHasInitialized(true);
    } else if (!post && !postLoading && !hasInitialized) {
      // No existing post, mark as initialized
      setHasInitialized(true);
    }
  }, [post, postLoading, hasInitialized, platformData]);

  // Auto-save on content change (debounced) - only after initialization
  useEffect(() => {
    // Only save if initialized and there's actual content
    if (hasInitialized && 
        (debouncedFormData.title || debouncedFormData.content) && 
        (debouncedFormData.title !== "" || debouncedFormData.content !== "")) {
      saveContent(
        debouncedFormData.content,
        debouncedFormData.title,
        {
          subreddit: debouncedFormData.subreddit,
          postType: debouncedFormData.postType,
          linkUrl: debouncedFormData.linkUrl,
          flairId: debouncedFormData.flairId,
          nsfw: debouncedFormData.nsfw,
          spoiler: debouncedFormData.spoiler,
          sendReplies: debouncedFormData.sendReplies,
          scheduledDate: debouncedFormData.scheduledDate,
          scheduledTime: debouncedFormData.scheduledTime,
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFormData, hasInitialized]); // saveContent intentionally excluded to prevent infinite loops

  // Update parent component when content changes (but only after initialization)
  useEffect(() => {
    if (onChangeRef.current && hasInitialized) {
      const formJson = {
        fileName,
        platform: 'reddit',
        content: formData,
        status,
      };
      onChangeRef.current(JSON.stringify(formJson, null, 2));
    }
  }, [formData, fileName, status, hasInitialized]); // onChange intentionally excluded to prevent infinite loops

  // Character limits
  const titleMaxChars = 300;
  const textMaxChars = 40000;
  const titleRemainingChars = titleMaxChars - formData.title.length;
  const textRemainingChars = textMaxChars - formData.content.length;

  // Handle post submission
  const handleSubmit = async () => {
    console.log("🐛 handleSubmit called - checking conditions:", {
      canPost,
      redditConnection: !!redditConnection,
      redditConnectionId: redditConnection?._id,
      title: formData.title,
      content: formData.content,
      linkUrl: formData.linkUrl,
      postType: formData.postType,
      isSubmitting
    });
    
    if (!canPost || !redditConnection) {
      console.log("🚫 Submission blocked:", { canPost, hasRedditConnection: !!redditConnection });
      return;
    }

    console.log("🚀 Starting Reddit post submission...");
    setIsSubmitting(true);
    await updatePostStatus('posting');

    try {
      // Step 1: Create the post in the database
      console.log("📝 Creating post in database...");
      const postId = await createRedditPost({
        userId: 'temp-user-id',
        connectionId: redditConnection._id,
        subreddit: formData.subreddit,
        title: formData.title,
        kind: formData.postType,
        text: formData.content || undefined,
        url: formData.linkUrl || undefined,
        nsfw: formData.nsfw,
        spoiler: formData.spoiler,
        sendReplies: formData.sendReplies,
        flairId: formData.flairId || undefined,
      });

      console.log("✅ Post created with ID:", postId);

      // Step 2: Submit the post to Reddit using the post ID
      console.log("🚀 Submitting post to Reddit...");
      const result = await submitRedditPost({
        postId: postId,
      });

      if (result.success && result.url) {
        console.log("✅ Reddit post successful, updating status to 'posted'", {
          fileName,
          result,
          currentStatus: status,
          currentPost: post
        });
        await updatePostStatus('posted', {
          postId: result.redditId,
          postUrl: result.url,
        });
        console.log("✅ Status update completed");
      } else {
        throw new Error('Failed to post');
      }
    } catch (error) {
      await updatePostStatus('failed', {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error("Failed to submit post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle scheduling
  const handleSchedule = async () => {
    if (!canSchedule || !formData.scheduledDate || !formData.scheduledTime || !redditConnection) return;

    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    
    try {
      await schedulePost(
        scheduledDateTime,
        formData.content,
        formData.title,
        {
          subreddit: formData.subreddit,
          postType: formData.postType,
          linkUrl: formData.linkUrl,
          flairId: formData.flairId,
          nsfw: formData.nsfw,
          spoiler: formData.spoiler,
          sendReplies: formData.sendReplies,
          connectionId: redditConnection._id, // Add connection ID for scheduled posting
        }
      );
      setShowScheduler(false);
      console.log("Post scheduled successfully!");
    } catch (error) {
      console.error("Failed to schedule post:", error);
    }
  };

  const isReadonly = isPosted;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2d2d30]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#ff6b35]" />
          <span className="text-sm font-medium">Reddit Post</span>
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
            <TabsTrigger value="compose" className="data-[state=active]:bg-[#007acc] data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#007acc] data-[state=active]:text-white">
              <Hash className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-[#007acc] data-[state=active]:text-white">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-4">
            {/* Title Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                <span className={cn(
                  "text-xs",
                  titleRemainingChars < 50 ? "text-red-400" : "text-[#858585]"
                )}>
                  {titleRemainingChars} characters remaining
                </span>
              </div>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter your Reddit post title..."
                className="bg-[#2d2d30] border-[#454545] text-[#cccccc] placeholder:text-[#858585]"
                disabled={isReadonly}
                maxLength={titleMaxChars}
              />
            </div>

            {/* Content Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content" className="text-sm font-medium">
                  {formData.postType === 'self' ? 'Text Content' : 'Link URL'}
                </Label>
                {formData.postType === 'self' && (
                  <span className={cn(
                    "text-xs",
                    textRemainingChars < 1000 ? "text-red-400" : "text-[#858585]"
                  )}>
                    {textRemainingChars} characters remaining
                  </span>
                )}
              </div>
              {formData.postType === 'self' ? (
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your Reddit post content..."
                  className="bg-[#2d2d30] border-[#454545] text-[#cccccc] placeholder:text-[#858585] min-h-[200px] resize-none"
                  disabled={isReadonly}
                  maxLength={textMaxChars}
                />
              ) : (
                <Input
                  id="content"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                  placeholder="https://example.com"
                  className="bg-[#2d2d30] border-[#454545] text-[#cccccc] placeholder:text-[#858585]"
                  disabled={isReadonly}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            {/* Subreddit Selection */}
            <div className="space-y-2">
              <Label htmlFor="subreddit" className="text-sm font-medium">Subreddit</Label>
              <Input
                id="subreddit"
                value={formData.subreddit}
                onChange={(e) => setFormData(prev => ({ ...prev, subreddit: e.target.value }))}
                placeholder="subreddit name (without r/)"
                className="bg-[#2d2d30] border-[#454545] text-[#cccccc] placeholder:text-[#858585]"
                disabled={isReadonly}
              />
            </div>

            {/* Post Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Post Type</Label>
              <Select 
                value={formData.postType} 
                onValueChange={(value: "self" | "link") => setFormData(prev => ({ ...prev, postType: value }))}
                disabled={isReadonly}
              >
                <SelectTrigger className="bg-[#2d2d30] border-[#454545] text-[#cccccc]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2d2d30] border-[#454545]">
                  <SelectItem value="self" className="text-[#cccccc] hover:bg-[#383838]">
                    Text Post
                  </SelectItem>
                  <SelectItem value="link" className="text-[#cccccc] hover:bg-[#383838]">
                    Link Post
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="nsfw"
                  checked={formData.nsfw}
                  onChange={(e) => setFormData(prev => ({ ...prev, nsfw: e.target.checked }))}
                  className="w-4 h-4 text-[#007acc] bg-[#2d2d30] border-[#454545] rounded focus:ring-[#007acc]"
                  disabled={isReadonly}
                />
                <Label htmlFor="nsfw" className="text-sm text-[#cccccc]">NSFW</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="spoiler"
                  checked={formData.spoiler}
                  onChange={(e) => setFormData(prev => ({ ...prev, spoiler: e.target.checked }))}
                  className="w-4 h-4 text-[#007acc] bg-[#2d2d30] border-[#454545] rounded focus:ring-[#007acc]"
                  disabled={isReadonly}
                />
                <Label htmlFor="spoiler" className="text-sm text-[#cccccc]">Spoiler</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendReplies"
                  checked={formData.sendReplies}
                  onChange={(e) => setFormData(prev => ({ ...prev, sendReplies: e.target.checked }))}
                  className="w-4 h-4 text-[#007acc] bg-[#2d2d30] border-[#454545] rounded focus:ring-[#007acc]"
                  disabled={isReadonly}
                />
                <Label htmlFor="sendReplies" className="text-sm text-[#cccccc]">Send reply notifications</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card className="bg-[#2d2d30] border-[#454545]">
              <CardHeader>
                <CardTitle className="text-[#cccccc] text-base">{formData.title || "Post Title"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[#cccccc] text-sm whitespace-pre-wrap">
                  {formData.postType === 'self' 
                    ? (formData.content || "Post content will appear here...")
                    : (formData.linkUrl || "Link URL will appear here...")
                  }
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-4 border-t border-[#2d2d30]">
        <Button
          onClick={() => {
            console.log("🔴 Post Now button clicked!");
            console.log("🔍 Button state:", {
              canPost,
              isSubmitting,
              title: formData.title,
              content: formData.content,
              linkUrl: formData.linkUrl,
              postType: formData.postType,
              redditConnection: !!redditConnection,
              disabled: !canPost || 
                isSubmitting || 
                !formData.title || 
                (formData.postType === 'self' ? !formData.content : !formData.linkUrl)
            });
            handleSubmit();
          }}
          disabled={
            !canPost || 
            isSubmitting || 
            !formData.title || 
            (formData.postType === 'self' ? !formData.content : !formData.linkUrl)
          }
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
              Post Now
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
            <h3 className="text-lg font-medium text-[#cccccc] mb-4">Schedule Post</h3>
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
