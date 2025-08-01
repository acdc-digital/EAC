'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useSocialPost } from "@/lib/hooks/useSocialPost";
import { useXApi } from "@/lib/hooks/useXApi";
import { cn } from "@/lib/utils";
import {
  AtSign,
  Calendar,
  Clock,
  Edit3,
  Globe,
  Loader2,
  MessageCircle,
  Send,
  Users
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import MarkdownEditor from './MarkdownEditor';

interface SocialMediaEditorProps {
  fileName: string;
  platform: 'x' | 'instagram' | 'reddit' | 'facebook';
  content: string;
  onChange?: (content: string) => void;
  editable?: boolean;
}

// Simple type for X/Twitter settings with index signature
interface XSettings extends Record<string, unknown> {
  replySettings: "following" | "mentionedUsers" | "subscribers" | "verified";
  scheduledDate: string;
  scheduledTime: string;
}

export function SocialMediaEditor({ fileName, platform, content, onChange, editable = true }: SocialMediaEditorProps) {
  // Use the social post hook - for now, only support twitter
  const fileType = platform === 'x' ? 'twitter' : 'twitter'; // Default to twitter for now
  const {
    post,
    isLoading: postLoading,
    saveContent,
    updatePostStatus,
    schedulePost,
    status,
    canPost,
    canSchedule,
    platformData,
  } = useSocialPost({ fileName, fileType });

  // Get X API functions
  const { postTweet, hasConnection } = useXApi();

  // Platform-specific settings (simplified)
  const [xSettings, setXSettings] = useState<XSettings>({
    replySettings: "following",
    scheduledDate: "",
    scheduledTime: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Use ref to store the onChange callback to avoid infinite loops
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Debounced save for settings
  const debouncedSettings = useDebounce(xSettings, 1000);

  // Load saved platform settings when post data is available
  useEffect(() => {
    if (post && !postLoading && !hasInitialized) {
      try {
        const typed = platformData as Partial<XSettings>;
        setXSettings(prev => ({
          ...prev,
          replySettings: typed.replySettings || "following",
          scheduledDate: typed.scheduledDate || "",
          scheduledTime: typed.scheduledTime || "",
        }));
        setHasInitialized(true);
      } catch (error) {
        console.error('Failed to parse platform data:', error);
        setHasInitialized(true);
      }
    } else if (!post && !postLoading && !hasInitialized) {
      setHasInitialized(true);
    }
  }, [post, postLoading, hasInitialized, platformData]);

  // Auto-save platform settings when they change
  useEffect(() => {
    if (hasInitialized && content && content.trim() !== "") {
      saveContent(content, undefined, xSettings);
    }
  }, [debouncedSettings, hasInitialized, content, saveContent, xSettings]);

  // Get platform-specific configuration
  const getPlatformConfig = () => {
    switch (platform) {
      case 'x':
        return {
          name: 'X/Twitter',
          color: '#1DA1F2',
          maxChars: 280,
          icon: MessageCircle,
        };
      case 'instagram':
        return {
          name: 'Instagram',
          color: '#E4405F',
          maxChars: 2200,
          icon: Globe,
        };
      case 'reddit':
        return {
          name: 'Reddit',
          color: '#FF4500',
          maxChars: 40000,
          icon: MessageCircle,
        };
      case 'facebook':
        return {
          name: 'Facebook',
          color: '#1877F2',
          maxChars: 63206,
          icon: Globe,
        };
      default:
        return {
          name: 'Social Media',
          color: '#666666',
          maxChars: 280,
          icon: MessageCircle,
        };
    }
  };

  const platformConfig = getPlatformConfig();

  // Handle post submission
  const handleSubmit = async () => {
    if (!canPost || !hasConnection) return;

    setIsSubmitting(true);
    await updatePostStatus('posting');

    try {
      if (platform === 'x') {
        const result = await postTweet({
          text: content,
          reply_settings: xSettings.replySettings,
        });

        if (result.success && result.data) {
          await updatePostStatus('posted');
          console.log('✅ X post successful:', result.data);
        } else {
          throw new Error(result.error || 'Failed to post to X');
        }
      } else {
        // Handle other platforms here
        console.log(`Posting to ${platform} not yet implemented`);
        await updatePostStatus('draft');
      }
    } catch (error) {
      console.error(`❌ Failed to post to ${platform}:`, error);
      await updatePostStatus('failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle scheduling
  const handleSchedule = async () => {
    if (!xSettings.scheduledDate || !xSettings.scheduledTime) return;

    const scheduledDateTime = new Date(`${xSettings.scheduledDate}T${xSettings.scheduledTime}`);
    try {
      await schedulePost(scheduledDateTime, content, undefined, xSettings);
      console.log('✅ Post scheduled successfully');
    } catch (error) {
      console.error('❌ Failed to schedule post:', error);
    }
  };

  const renderPlatformSettings = () => {
    if (platform !== 'x') {
      return <div className="text-[#858585]">Settings for {platformConfig.name} coming soon...</div>;
    }

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Who can reply</Label>
          <Select 
            value={xSettings.replySettings} 
            onValueChange={(value: "following" | "mentionedUsers" | "subscribers" | "verified") => 
              setXSettings(prev => ({ ...prev, replySettings: value }))
            }
            disabled={!editable}
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
            </SelectContent>
          </Select>
        </div>

        {/* Scheduling */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Schedule Post</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={xSettings.scheduledDate}
              onChange={(e) => setXSettings(prev => ({ ...prev, scheduledDate: e.target.value }))}
              className="bg-[#2d2d30] border-[#454545] text-[#cccccc]"
              disabled={!editable}
            />
            <Input
              type="time"
              value={xSettings.scheduledTime}
              onChange={(e) => setXSettings(prev => ({ ...prev, scheduledTime: e.target.value }))}
              className="bg-[#2d2d30] border-[#454545] text-[#cccccc]"
              disabled={!editable}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2d2d30]">
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full bg-blue-500" 
            data-platform={platform}
          />
          <span className="text-sm font-medium">{platformConfig.name} Post</span>
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

      {/* Tabs */}
      <Tabs defaultValue="compose" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-[#2d2d30] mx-4 mt-4">
          <TabsTrigger 
            value="compose" 
            className="data-[state=active]:text-white"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Compose
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="data-[state=active]:text-white"
          >
            <AtSign className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger 
            value="preview" 
            className="data-[state=active]:text-white"
          >
            <Globe className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="compose" className="h-full m-0">
            {/* Use MarkdownEditor for content editing with proper persistence */}
            <MarkdownEditor
              content={content}
              onChange={onChange}
              editable={editable}
            />
          </TabsContent>

          <TabsContent value="settings" className="h-full m-4 overflow-auto">
            <div className="space-y-6">
              {renderPlatformSettings()}

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-[#2d2d30]">
                <Button
                  onClick={handleSubmit}
                  disabled={!canPost || !hasConnection || isSubmitting || !content.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post to {platformConfig.name}
                    </>
                  )}
                </Button>

                {xSettings.scheduledDate && xSettings.scheduledTime && (
                  <Button
                    onClick={handleSchedule}
                    disabled={!canSchedule || isSubmitting}
                    variant="outline"
                    className="w-full"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Post
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="h-full m-4 overflow-auto">
            <Card className="bg-[#2d2d30] border-[#454545]">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs text-[#858585]">{platformConfig.name} Preview</span>
                  </div>
                  <div className="bg-[#1e1e1e] p-3 rounded border border-[#454545]">
                    <div className="text-[#cccccc] text-sm whitespace-pre-wrap">
                      {content || `Your ${platformConfig.name.toLowerCase()} post content will appear here...`}
                    </div>
                    {platform === 'x' && (
                      <div className="text-xs text-[#858585] mt-2">
                        {content.length}/{platformConfig.maxChars} characters
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default SocialMediaEditor;
