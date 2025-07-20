// Social Media Post Creator Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashboard/postCreator.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Facebook, ImageIcon, Instagram, MessageSquare, Send, Twitter } from "lucide-react";
import { useState } from "react";

interface Post {
  id: string;
  content: string;
  platforms: Array<'facebook' | 'instagram' | 'twitter' | 'reddit'>;
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'published';
  createdAt: Date;
}

export function PostCreator() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPost, setCurrentPost] = useState({
    content: '',
    platforms: [] as Array<'facebook' | 'instagram' | 'twitter' | 'reddit'>,
    scheduledFor: '',
  });

  const platforms = [
    { id: 'facebook' as const, name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { id: 'instagram' as const, name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'twitter' as const, name: 'X (Twitter)', icon: Twitter, color: '#1DA1F2' },
    { id: 'reddit' as const, name: 'Reddit', icon: MessageSquare, color: '#FF4500' },
  ];

  const connectedPlatforms: Array<'facebook' | 'instagram' | 'twitter' | 'reddit'> = ['facebook', 'instagram', 'twitter']; // Mock connected platforms

  const togglePlatform = (platformId: 'facebook' | 'instagram' | 'twitter' | 'reddit') => {
    setCurrentPost(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const handleSaveDraft = () => {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      content: currentPost.content,
      platforms: currentPost.platforms,
      scheduledFor: currentPost.scheduledFor ? new Date(currentPost.scheduledFor) : undefined,
      status: 'draft',
      createdAt: new Date(),
    };

    setPosts(prev => [newPost, ...prev]);
    setCurrentPost({ content: '', platforms: [], scheduledFor: '' });
  };

  const handleSchedulePost = () => {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      content: currentPost.content,
      platforms: currentPost.platforms,
      scheduledFor: currentPost.scheduledFor ? new Date(currentPost.scheduledFor) : new Date(),
      status: 'scheduled',
      createdAt: new Date(),
    };

    setPosts(prev => [newPost, ...prev]);
    setCurrentPost({ content: '', platforms: [], scheduledFor: '' });
  };

  const handlePublishNow = () => {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      content: currentPost.content,
      platforms: currentPost.platforms,
      status: 'published',
      createdAt: new Date(),
    };

    setPosts(prev => [newPost, ...prev]);
    setCurrentPost({ content: '', platforms: [], scheduledFor: '' });
  };

  const getStatusColor = (status: Post['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'scheduled': return 'bg-yellow-500';
      case 'published': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full bg-[#1e1e1e] text-[#cccccc] overflow-auto">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Social Media Post Creator</h1>
          <p className="text-[#858585]">
            Create and schedule posts across your connected social media platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post Creation Form */}
          <div className="lg:col-span-2">
            <Card className="bg-[#2d2d2d] border-[#454545] p-6">
              <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
              
              <div className="space-y-4">
                {/* Content Textarea */}
                <div>
                  <Label htmlFor="post-content" className="text-sm text-[#cccccc]">
                    Post Content
                  </Label>
                  <Textarea
                    id="post-content"
                    value={currentPost.content}
                    onChange={(e) => setCurrentPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="What's on your mind?"
                    className="mt-1 bg-[#1e1e1e] border-[#454545] text-[#cccccc] min-h-[120px] resize-none"
                    maxLength={280}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-[#858585]">
                      {currentPost.content.length}/280 characters
                    </span>
                    <Button variant="ghost" size="sm" className="text-[#858585] hover:text-[#cccccc]">
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Add Media
                    </Button>
                  </div>
                </div>

                {/* Platform Selection */}
                <div>
                  <Label className="text-sm text-[#cccccc] mb-3 block">
                    Select Platforms
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      const isConnected = connectedPlatforms.includes(platform.id);
                      const isSelected = currentPost.platforms.includes(platform.id);
                      
                      return (
                        <button
                          key={platform.id}
                          onClick={() => isConnected && togglePlatform(platform.id)}
                          disabled={!isConnected}
                          className={`
                            flex items-center gap-3 p-3 rounded border transition-all
                            ${isSelected 
                              ? 'bg-[#4a9eff]/20 border-[#4a9eff] text-[#cccccc]' 
                              : 'bg-[#1e1e1e] border-[#454545] hover:border-[#6a6a6a]'
                            }
                            ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <Icon className="w-5 h-5" style={{ color: platform.color }} />
                          <span className="text-sm">{platform.name}</span>
                          {!isConnected && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              Not Connected
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Schedule Options */}
                <div>
                  <Label htmlFor="schedule-time" className="text-sm text-[#cccccc]">
                    Schedule (Optional)
                  </Label>
                  <Input
                    id="schedule-time"
                    type="datetime-local"
                    value={currentPost.scheduledFor}
                    onChange={(e) => setCurrentPost(prev => ({ ...prev, scheduledFor: e.target.value }))}
                    className="mt-1 bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveDraft}
                    variant="outline"
                    className="flex-1 bg-transparent border-[#454545] text-[#cccccc] hover:bg-[#3d3d3d]"
                    disabled={!currentPost.content || currentPost.platforms.length === 0}
                  >
                    Save Draft
                  </Button>
                  
                  {currentPost.scheduledFor && (
                    <Button
                      onClick={handleSchedulePost}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                      disabled={!currentPost.content || currentPost.platforms.length === 0}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                  )}
                  
                  <Button
                    onClick={handlePublishNow}
                    className="flex-1 bg-[#4a9eff] hover:bg-[#357abd] text-white"
                    disabled={!currentPost.content || currentPost.platforms.length === 0}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Publish Now
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Posts History */}
          <div>
            <Card className="bg-[#2d2d2d] border-[#454545] p-6 h-fit">
              <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
              
              {posts.length === 0 ? (
                <p className="text-[#858585] text-sm text-center py-8">
                  No posts created yet
                </p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-[#1e1e1e] p-3 rounded border border-[#454545]">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={`${getStatusColor(post.status)} text-white text-xs`}>
                          {post.status}
                        </Badge>
                        <span className="text-xs text-[#858585]">
                          {post.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-[#cccccc] mb-2 line-clamp-3">
                        {post.content}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        {post.platforms.map((platformId) => {
                          const platform = platforms.find(p => p.id === platformId);
                          if (!platform) return null;
                          const Icon = platform.icon;
                          return (
                            <Icon 
                              key={platformId} 
                              className="w-3 h-3" 
                              style={{ color: platform.color }} 
                            />
                          );
                        })}
                      </div>
                      
                      {post.scheduledFor && post.status === 'scheduled' && (
                        <p className="text-xs text-yellow-400 mt-1">
                          Scheduled for: {post.scheduledFor.toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
