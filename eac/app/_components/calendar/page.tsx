"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAddScheduledPost, useCalendarStore, useGetPostsByDate, useLoadScheduledPosts, useScheduledPosts, useSetSelectedDate } from "@/store";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface CalendarProps {
  className?: string;
}

// Get days in month
const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

// Get first day of month (0 = Sunday, 1 = Monday, etc.)
const getFirstDayOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage({ className }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Calendar store integration using individual hooks for stable references
  const scheduledPosts = useScheduledPosts();
  const selectedDate = useCalendarStore(state => state.selectedDate);
  const loadScheduledPosts = useLoadScheduledPosts();
  const addScheduledPost = useAddScheduledPost();
  const setSelectedDate = useSetSelectedDate();
  const getPostsByDate = useGetPostsByDate();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();

  // Load scheduled posts when component mounts
  useEffect(() => {
    // For now, using a mock userId - this should come from your auth system
    loadScheduledPosts('current-user');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    
    // Handle case where selectedDate might be serialized as string
    const date = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) return false;
    
    return date.getDate() === day &&
           date.getMonth() === currentDate.getMonth() &&
           date.getFullYear() === currentDate.getFullYear();
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  // Get posts for a specific day
  const getPostsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return getPostsByDate(date);
  };

  // Demo function to create a sample scheduled post
  const handleSchedulePost = async () => {
    try {
      const samplePost = {
        userId: 'current-user',
        platform: 'reddit' as const,
        title: 'Sample Scheduled Post',
        content: 'This is a sample post created from the calendar.',
        scheduledAt: Date.now() + (24 * 60 * 60 * 1000), // Tomorrow
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

  // Get platform color for post indicators
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return 'bg-blue-500';
      case 'instagram':
        return 'bg-pink-500';
      case 'twitter':
      case 'x':
        return 'bg-blue-400';
      case 'reddit':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Generate calendar days array
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className={`h-full bg-[#1e1e1e] text-[#cccccc] p-6 overflow-auto ${className}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-[#007acc]" />
              <h1 className="text-2xl font-semibold text-[#cccccc]">
                Content Calendar
              </h1>
            </div>
            <Button
              size="sm"
              className="bg-[#007acc] hover:bg-[#005a9e] text-white"
              onClick={() => handleSchedulePost()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Post
            </Button>
          </div>
          <p className="text-[#858585] text-sm">
            Manage and schedule your social media posts across all platforms
          </p>
        </div>

        {/* Calendar Navigation */}
        <Card className="mb-6 bg-[#252526] border-[#454545]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('prev')}
                className="h-8 w-8 text-[#cccccc] hover:bg-[#2d2d2d]"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <CardTitle className="text-xl text-[#cccccc]">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('next')}
                className="h-8 w-8 text-[#cccccc] hover:bg-[#2d2d2d]"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Week headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="h-10 flex items-center justify-center text-sm font-medium text-[#858585]"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`
                    h-16 border border-[#454545] rounded-md p-1 cursor-pointer transition-colors
                    ${day ? 'hover:bg-[#2d2d2d]' : ''}
                    ${day && isToday(day) ? 'bg-[#007acc]/20 border-[#007acc]' : ''}
                    ${day && isSelected(day) ? 'bg-[#2d2d2d] border-[#cccccc]' : ''}
                  `}
                  onClick={() => day && handleDateClick(day)}
                >
                  {day && (
                    <div className="h-full flex flex-col">
                      <span className={`
                        text-sm font-medium mb-1
                        ${isToday(day) ? 'text-[#007acc]' : 'text-[#cccccc]'}
                      `}>
                        {day}
                      </span>
                      
                      {/* Dynamic scheduled posts indicators */}
                      <div className="flex-1 flex flex-col gap-1">
                        {getPostsForDay(day).map((post) => (
                          <div 
                            key={post._id}
                            className={`w-full h-1.5 rounded-sm opacity-60 ${getPlatformColor(post.platform)}`}
                            title={`${post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} post: ${post.title} (${new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        {selectedDate && (
          <Card className="bg-[#252526] border-[#454545]">
            <CardHeader>
              <CardTitle className="text-[#cccccc] flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {(() => {
                  const date = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
                  return date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const date = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
                const dayPosts = getPostsByDate(date);
                if (dayPosts.length === 0) {
                  return (
                    <div className="text-[#858585] text-center py-8">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No scheduled posts for this date</p>
                      <Button
                        size="sm"
                        className="mt-4 bg-[#007acc] hover:bg-[#005a9e] text-white"
                        onClick={() => handleSchedulePost()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Post
                      </Button>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#858585]">
                        {dayPosts.length} post{dayPosts.length !== 1 ? 's' : ''} scheduled
                      </p>
                      <Button
                        size="sm"
                        className="bg-[#007acc] hover:bg-[#005a9e] text-white"
                        onClick={() => handleSchedulePost()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Post
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {dayPosts.map((post) => (
                        <div 
                          key={post._id}
                          className="flex items-center gap-3 p-3 bg-[#1e1e1e] rounded-lg border border-[#454545]"
                        >
                          <div className={`w-3 h-3 rounded-full ${getPlatformColor(post.platform).replace('bg-', 'bg-')}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-[#cccccc] capitalize">
                                {post.platform}
                              </span>
                              <span className="text-xs text-[#858585]">
                                {new Date(post.scheduledAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-[#cccccc] truncate">
                              {post.title}
                            </p>
                            {post.content && (
                              <p className="text-xs text-[#858585] mt-1 line-clamp-2">
                                {post.content}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-1 text-xs rounded ${
                              post.status === 'scheduled' 
                                ? 'bg-blue-900/30 text-blue-400 border border-blue-500/20'
                                : post.status === 'published'
                                ? 'bg-green-900/30 text-green-400 border border-green-500/20'
                                : post.status === 'failed'
                                ? 'bg-red-900/30 text-red-400 border border-red-500/20'
                                : 'bg-gray-900/30 text-gray-400 border border-gray-500/20'
                            }`}>
                              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
