"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();

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
    return selectedDate?.getDate() === day &&
           selectedDate?.getMonth() === currentDate.getMonth() &&
           selectedDate?.getFullYear() === currentDate.getFullYear();
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
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
                      
                      {/* Placeholder for scheduled posts indicators */}
                      <div className="flex-1 flex flex-col gap-1">
                        {/* Example scheduled posts - these will come from your data later */}
                        {day === 15 && (
                          <div className="w-full h-1.5 bg-blue-500 rounded-sm opacity-60" title="Facebook post scheduled" />
                        )}
                        {day === 20 && (
                          <>
                            <div className="w-full h-1.5 bg-pink-500 rounded-sm opacity-60" title="Instagram post scheduled" />
                            <div className="w-full h-1.5 bg-blue-400 rounded-sm opacity-60" title="Twitter post scheduled" />
                          </>
                        )}
                        {day === 25 && (
                          <div className="w-full h-1.5 bg-orange-500 rounded-sm opacity-60" title="Reddit post scheduled" />
                        )}
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
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[#858585] text-center py-8">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No scheduled posts for this date</p>
                <Button
                  size="sm"
                  className="mt-4 bg-[#007acc] hover:bg-[#005a9e] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Post
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
