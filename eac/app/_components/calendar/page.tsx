// Enhanced Rolling Calendar Component with Full Post Visibility
// /Users/matthewsimon/Projects/eac/eac/app/_components/calendar/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAddScheduledPost, useGetPostsByDate, useLoadScheduledPosts, useSetSelectedDate } from "@/store";
import { CalendarIcon, ChevronLeft, ChevronRight, Facebook, Instagram, MessageSquare, Plus, Twitter } from "lucide-react";
import { useEffect, useState } from "react";

interface CalendarProps {
  className?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isDisabled: boolean;
  posts: {
    _id: string;
    platform: string;
    title: string;
    content?: string;
    scheduledAt: number;
    status: string;
  }[];
}

export default function CalendarPage({ className }: CalendarProps) {
  // Calculate the rolling window (7 days ago to end of next month)
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<{
    _id: string;
    platform: string;
    title: string;
    content?: string;
    scheduledAt: number;
    status: string;
  } | null>(null);
  
  // Calendar store integration
  const loadScheduledPosts = useLoadScheduledPosts();
  const addScheduledPost = useAddScheduledPost();
  const setCalendarSelectedDate = useSetSelectedDate();
  const getPostsByDate = useGetPostsByDate();

  // Load scheduled posts when component mounts
  useEffect(() => {
    loadScheduledPosts('current-user');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync with calendar store
  useEffect(() => {
    setCalendarSelectedDate(selectedDate);
  }, [selectedDate, setCalendarSelectedDate]);

  // Generate calendar grid for current view
  const generateCalendarDays = (): CalendarDay[] => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Calculate start of calendar grid (include previous month days)
    const startOfGrid = new Date(firstDay);
    startOfGrid.setDate(startOfGrid.getDate() - firstDay.getDay());
    
    // Calculate end of calendar grid (include next month days)
    const endOfGrid = new Date(lastDay);
    endOfGrid.setDate(endOfGrid.getDate() + (6 - lastDay.getDay()));
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startOfGrid);
    
    while (currentDate <= endOfGrid) {
      const dayPosts = getPostsByDate(currentDate);
      const isCurrentMonth = currentDate.getMonth() === currentMonth.getMonth();
      const isToday = currentDate.toDateString() === today.toDateString();
      const isPast = currentDate < today && !isToday;
      const isDisabled = currentDate < sevenDaysAgo;
      
      days.push({
        date: new Date(currentDate),
        isCurrentMonth,
        isToday,
        isPast,
        isDisabled,
        posts: dayPosts
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(today);
  };

  // Demo function to create a sample scheduled post
  const handleSchedulePost = async () => {
    try {
      const targetDate = selectedDate || new Date();
      const samplePost = {
        userId: 'current-user',
        platform: 'reddit' as const,
        title: 'Sample Scheduled Post',
        content: 'This is a sample post created from the calendar.',
        scheduledAt: targetDate.getTime(),
        status: 'scheduled' as const,
        postId: `post_${Date.now()}`,
        fileId: `file_${Date.now()}`,
      };
      
      await addScheduledPost(samplePost);
      alert('Sample post scheduled successfully! Check the calendar.');
    } catch (error) {
      console.error('Failed to schedule sample post:', error);
      alert('Failed to schedule post. Please try again.');
    }
  };

  // Get platform icon component
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return Facebook;
      case 'instagram':
        return Instagram;
      case 'twitter':
        return Twitter;
      case 'reddit':
        return MessageSquare;
      default:
        return MessageSquare;
    }
  };

  // Get status color for posts
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'border-l-blue-500 bg-blue-500/10';
      case 'published':
        return 'border-l-green-500 bg-green-500/10';
      case 'failed':
        return 'border-l-red-500 bg-red-500/10';
      case 'cancelled':
        return 'border-l-gray-500 bg-gray-500/10';
      default:
        return 'border-l-gray-500 bg-gray-500/10';
    }
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`h-full bg-[#1e1e1e] text-[#cccccc] p-6 overflow-auto ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-[#007acc]" />
              <h1 className="text-2xl font-semibold text-[#cccccc]">
                Content Calendar
              </h1>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={goToToday}
                variant="outline"
                className="border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
              >
                Today
              </Button>
              <Button
                onClick={handleSchedulePost}
                className="bg-[#007acc] hover:bg-[#005a9e] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Post
              </Button>
            </div>
          </div>
          
          <p className="text-[#858585]">
            Schedule and manage your social media posts across platforms. 
            Past 7 days shown for context, with full month view ahead.
          </p>
        </div>

        {/* Calendar Navigation */}
        <Card className="bg-[#252526] border-[#454545] mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#cccccc] flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </CardTitle>
              
              <div className="flex gap-2">
                <Button
                  onClick={goToPreviousMonth}
                  variant="outline"
                  size="sm"
                  className="border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={goToNextMonth}
                  variant="outline"
                  size="sm"
                  className="border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="h-10 flex items-center justify-center text-sm font-medium text-[#858585] border-b border-[#454545]"
                >
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const isSelected = day.date.toDateString() === selectedDate.toDateString();
                
                return (
                  <div
                    key={index}
                    className={`
                      relative min-h-[110px] p-2 border border-[#454545] cursor-pointer transition-all
                      ${day.isCurrentMonth ? 'bg-[#1e1e1e]' : 'bg-[#252526] opacity-50'}
                      ${isSelected ? 'bg-[#007acc]/20 border-[#007acc]' : 'hover:bg-[#2a2d2e]'}
                      ${day.isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
                      ${day.isToday ? 'ring-2 ring-[#007acc] ring-offset-2 ring-offset-[#1e1e1e]' : ''}
                    `}
                    onClick={() => !day.isDisabled && setSelectedDate(day.date)}
                  >
                    {/* Day number */}
                    <div className={`text-sm font-semibold mb-2 ${
                      day.isToday ? 'text-[#007acc]' : 
                      day.isPast ? 'text-[#858585]' : 
                      'text-[#cccccc]'
                    }`}>
                      {day.date.getDate()}
                    </div>
                    
                    {/* Posts for this day */}
                    <div className="space-y-0.5">
                      {day.posts.slice(0, 4).map((post) => {
                        const Icon = getPlatformIcon(post.platform);
                        const statusDot = post.status === 'scheduled' ? 'bg-blue-400' :
                                        post.status === 'published' ? 'bg-green-400' :
                                        post.status === 'failed' ? 'bg-red-400' : 'bg-gray-400';
                        const isSelected = selectedPost?._id === post._id;
                        
                        return (
                          <div
                            key={post._id}
                            className={`
                              group relative text-xs p-1.5 rounded border-l-2 
                              bg-[#2d2d2d]/90 hover:bg-[#3d3d3d] transition-all cursor-pointer
                              ${isSelected ? 'border-l-[#007acc] bg-[#007acc]/10' : 'border-l-blue-500 hover:border-l-[#007acc]'} 
                            `}
                            onClick={(e) => {
                              e.stopPropagation(); // Don't trigger day selection
                              setSelectedPost(post);
                              console.log('Post selected:', post.title);
                            }}
                            title={`${post.platform} • ${post.title} • ${post.status}`}
                          >
                            {/* Single compact row */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Icon className="w-3 h-3 flex-shrink-0 text-[#cccccc]" />
                              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot}`} />
                              <span className="truncate font-medium text-[#cccccc] text-[10px] flex-1">
                                {post.title}
                              </span>
                              <span className="text-[#858585] text-[9px] flex-shrink-0">
                                {new Date(post.scheduledAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Show "more posts" indicator */}
                      {day.posts.length > 4 && (
                        <div 
                          className="text-[9px] text-[#858585] text-center py-1 hover:text-[#cccccc] cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(day.date); // Select this day to see all posts
                          }}
                        >
                          +{day.posts.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card className="bg-[#252526] border-[#454545]">
          <CardHeader>
            <CardTitle className="text-[#cccccc] flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              {selectedPost && (
                <span className="text-sm font-normal text-[#858585] ml-auto">
                  • Post selected: {selectedPost.title}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Selected Post Detail */}
            {selectedPost && (
              <div className="mb-6 p-4 bg-[#1e1e1e] rounded-lg border border-[#007acc]/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-[#cccccc]">Selected Post Details</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPost(null)}
                    className="h-6 px-2 text-xs border-[#454545] text-[#858585] hover:bg-[#2d2d2d]"
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = getPlatformIcon(selectedPost.platform);
                      return <Icon className="w-5 h-5 text-[#cccccc]" />;
                    })()}
                    <div>
                      <h5 className="font-medium text-[#cccccc]">{selectedPost.title}</h5>
                      <p className="text-xs text-[#858585] capitalize">
                        {selectedPost.platform} • {selectedPost.status} • {' '}
                        {new Date(selectedPost.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {selectedPost.content && (
                    <div className="bg-[#2d2d2d] p-3 rounded border-l-2 border-[#007acc]">
                      <p className="text-sm text-[#cccccc] leading-relaxed">
                        {selectedPost.content}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-[#007acc] hover:bg-[#005a9e] text-white">
                      Edit Post
                    </Button>
                    <Button size="sm" variant="outline" className="border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]">
                      Duplicate
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {(() => {
              const dayPosts = getPostsByDate(selectedDate);
              
              if (dayPosts.length === 0) {
                return (
                  <div className="text-[#858585] text-center py-8">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No scheduled posts for this date</p>
                    <Button
                      size="sm"
                      className="mt-4 bg-[#007acc] hover:bg-[#005a9e] text-white"
                      onClick={handleSchedulePost}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Post
                    </Button>
                  </div>
                );
              }
              
              // Group posts by status
              const postsByStatus = {
                scheduled: dayPosts.filter(p => p.status === 'scheduled'),
                published: dayPosts.filter(p => p.status === 'published'),
                failed: dayPosts.filter(p => p.status === 'failed'),
                cancelled: dayPosts.filter(p => p.status === 'cancelled'),
              };
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#858585]">
                      {dayPosts.length} post{dayPosts.length !== 1 ? 's' : ''} scheduled
                    </p>
                    <Button
                      size="sm"
                      className="bg-[#007acc] hover:bg-[#005a9e] text-white"
                      onClick={handleSchedulePost}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Post
                    </Button>
                  </div>
                  
                  {/* Status groups */}
                  <div className="space-y-4">
                    {Object.entries(postsByStatus).map(([status, posts]) => (
                      posts.length > 0 && (
                        <div key={status} className="space-y-3">
                          <h4 className="flex items-center gap-2 text-sm font-medium text-[#cccccc] border-b border-[#454545] pb-2">
                            <span className={`inline-block w-3 h-3 rounded-full ${
                              status === 'scheduled' ? 'bg-blue-400' :
                              status === 'published' ? 'bg-green-400' :
                              status === 'failed' ? 'bg-red-400' :
                              'bg-gray-400'
                            }`}></span>
                            {status.charAt(0).toUpperCase() + status.slice(1)} ({posts.length})
                          </h4>
                          
                          <div className="space-y-2">
                            {posts.map((post) => {
                              const Icon = getPlatformIcon(post.platform);
                              return (
                                <div 
                                  key={post._id}
                                  className={`
                                    p-3 rounded-lg border-l-4 bg-[#1e1e1e] hover:bg-[#2a2d2e] transition-colors cursor-pointer
                                    ${getStatusColor(post.status)}
                                  `}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Icon className="w-4 h-4" />
                                      <span className="text-sm font-medium text-[#cccccc] capitalize">
                                        {post.platform}
                                      </span>
                                    </div>
                                    <span className="text-xs text-[#858585]">
                                      {new Date(post.scheduledAt).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                  
                                  <h5 className="text-sm font-medium text-[#cccccc] mb-1">
                                    {post.title}
                                  </h5>
                                  
                                  {post.content && (
                                    <p className="text-xs text-[#858585] line-clamp-2">
                                      {post.content}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}