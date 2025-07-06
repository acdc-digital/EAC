// Daily Tracker Component Extension
// Component for tracking daily progress with calendar-style blocks
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dailyTracker.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Square, FileText, CalendarDays } from "lucide-react";
import { useDailyTrackerStore, DailyEntry } from "@/store";

interface Task {
  id: string;
  name: string;
}

interface DailyTrackerProps {
  totalDays: number;
  tasks: Task[];
}

export function DailyTracker({ totalDays, tasks }: DailyTrackerProps) {
  const {
    dailyEntries,
    quickEntryDay,
    setQuickEntryDay,
    updateDailyEntry,
    initializeDailyEntries
  } = useDailyTrackerStore();

  // Date management state - initialize with today's date without time
  const today = new Date();
  const [startDate, setStartDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [currentViewMonth, setCurrentViewMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

  // Calculate totals from daily entries
  const dailyTotals = {
    hours: dailyEntries.reduce((sum, entry) => sum + entry.hours, 0),
    squareFootage: dailyEntries.reduce((sum, entry) => sum + entry.squareFootage, 0),
    daysWithEntry: dailyEntries.filter(entry => entry.hours > 0 || entry.squareFootage > 0 || entry.note.trim() !== '').length,
  };

  // Initialize entries when total days change
  useEffect(() => {
    initializeDailyEntries(totalDays);
  }, [totalDays, initializeDailyEntries]);

  // Helper functions for date calculations
  const getDateForDay = (dayNumber: number): Date => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayNumber - 1);
    return date;
  };

  const getDayNumberForDate = (date: Date): number => {
    // Use date-only comparison to avoid timezone issues
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const currentDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffTime = currentDateOnly.getTime() - startDateOnly.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const isDateInCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentViewMonth.getMonth() && 
           date.getFullYear() === currentViewMonth.getFullYear();
  };

  const getCalendarDays = (): Array<{ date: Date; dayNumber: number; isCurrentMonth: boolean }> => {
    // Find the first day of the week that contains the start date
    const startOfWeek = new Date(startDate);
    startOfWeek.setDate(startOfWeek.getDate() - startDate.getDay());
    
    // Find the last day of the project
    const lastProjectDay = getDateForDay(totalDays);
    
    const days = [];
    const currentDate = new Date(startOfWeek);
    
    // Generate days from start of week until the last project day
    while (currentDate <= lastProjectDay) {
      const dayNumber = getDayNumberForDate(currentDate);
      const isValidProjectDay = dayNumber >= 1 && dayNumber <= totalDays;
      const isCurrentMonth = isDateInCurrentMonth(currentDate);
      
      if (isValidProjectDay) {
        days.push({
          date: new Date(currentDate),
          dayNumber,
          isCurrentMonth
        });
      } else {
        days.push({
          date: new Date(currentDate),
          dayNumber: -1, // Invalid day
          isCurrentMonth
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Daily Tracker Section Component
  const DailyTrackerSection = () => (
    <Card className="mt-6 bg-[#1a1a1a] border-[#454545]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-[#cccccc]">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#007acc]" />
            <span>Daily Progress Tracker</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#858585]">
            <span>Total Days: <span className="text-[#cccccc]">{totalDays}</span></span>
            <span>Days Tracked: <span className="text-[#cccccc]">{dailyTotals.daysWithEntry}</span></span>
            <span>Total Hours: <span className="text-[#cccccc]">{dailyTotals.hours}</span></span>
            <span>Total SF: <span className="text-[#cccccc]">{dailyTotals.squareFootage.toLocaleString()}</span></span>
          </div>
        </CardTitle>
        
        {/* Date Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#858585]" />
              <span className="text-sm text-[#858585]">Start Date:</span>
              <Input
                type="date"
                value={startDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  // Create date using local timezone to avoid timezone shifts
                  const [year, month, day] = e.target.value.split('-').map(Number);
                  const newDate = new Date(year, month - 1, day);
                  setStartDate(newDate);
                  setCurrentViewMonth(newDate);
                }}
                className="h-8 w-40 bg-[#2d2d2d] border-[#454545] text-[#cccccc]"
              />
            </div>
            <div className="text-sm text-[#858585]">
              Project: {formatDate(startDate)} - {formatDate(getDateForDay(totalDays))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#cccccc]">
              Project Calendar
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-[#858585] p-2">
              {day}
            </div>
          ))}
          
          {/* Calendar day blocks */}
          {getCalendarDays().map((calendarDay, index) => {
            const { date, dayNumber, isCurrentMonth } = calendarDay;
            const isValidDay = dayNumber >= 1 && dayNumber <= totalDays;
            
            if (!isValidDay) {
              return (
                <div
                  key={index}
                  className="border rounded-lg p-2 min-h-[100px] bg-[#1a1a1a] border-[#2d2d2d] opacity-30"
                >
                  <div className="text-xs text-[#454545]">
                    {date.getDate()}
                  </div>
                </div>
              );
            }
            
            const entry = dailyEntries.find(e => e.date === dayNumber) || {
              date: dayNumber,
              hours: 0,
              squareFootage: 0,
              note: '',
            };
            
            const hasData = entry.hours > 0 || entry.squareFootage > 0 || entry.note.trim() !== '';
            const isComplete = entry.hours >= 56; // 7 crew * 8 hours
            
            return (
              <div
                key={index}
                onClick={() => {
                  setQuickEntryDay(dayNumber);
                }}
                className={`
                  border rounded-lg p-2 min-h-[100px] cursor-pointer transition-all
                  ${!isCurrentMonth ? 'opacity-40' : ''}
                  ${hasData 
                    ? isComplete 
                      ? 'bg-green-900/30 border-green-500/50 hover:bg-green-900/50' 
                      : 'bg-blue-900/30 border-blue-500/50 hover:bg-blue-900/50'
                    : 'bg-[#2d2d2d] border-[#454545] hover:bg-[#3d3d3d]'
                  }
                `}
              >
                <div className="text-xs text-[#858585] mb-1">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-sm font-semibold mb-1 text-[#cccccc]">Day {dayNumber}</div>
                {hasData && (
                  <div className="space-y-1 text-xs">
                    {entry.hours > 0 && (
                      <div className="text-[#858585] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {entry.hours}h
                      </div>
                    )}
                    {entry.squareFootage > 0 && (
                      <div className="text-[#858585] flex items-center gap-1">
                        <Square className="w-3 h-3" />
                        {entry.squareFootage.toLocaleString()} SF
                      </div>
                    )}
                    {entry.note && (
                      <div className="text-[#858585] flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span className="truncate" title={entry.note}>
                          {entry.note}
                        </span>
                      </div>
                    )}
                    {entry.taskId && (
                      <div className="text-[#858585] flex items-center gap-1">
                        <span className="w-3 h-3 text-center text-[10px] font-bold">T</span>
                        <span className="truncate" title={tasks.find(t => t.id === entry.taskId)?.name || 'Unknown Task'}>
                          {tasks.find(t => t.id === entry.taskId)?.name || 'Unknown Task'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Entry Form */}
        <div className="p-4 bg-[#2d2d2d] rounded-lg border border-[#454545]">
          <h4 className="font-medium mb-3 text-[#cccccc]">Quick Entry</h4>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#cccccc]">Day</label>
              <Input
                type="number"
                min="1"
                max={totalDays}
                placeholder="Day #"
                className="h-8 bg-[#1a1a1a] border-[#454545] text-[#cccccc] placeholder:text-[#858585]"
                value={quickEntryDay || ''}
                onChange={(e) => setQuickEntryDay(parseInt(e.target.value) || null)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#cccccc]">Hours</label>
              <Input
                type="number"
                placeholder="Hours worked"
                className="h-8 bg-[#1a1a1a] border-[#454545] text-[#cccccc] placeholder:text-[#858585]"
                disabled={!quickEntryDay}
                value={quickEntryDay ? (dailyEntries.find(e => e.date === quickEntryDay)?.hours || '') : ''}
                onChange={(e) => quickEntryDay && updateDailyEntry(quickEntryDay, 'hours', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#cccccc]">Square Footage</label>
              <Input
                type="number"
                placeholder="SF completed"
                className="h-8 bg-[#1a1a1a] border-[#454545] text-[#cccccc] placeholder:text-[#858585]"
                disabled={!quickEntryDay}
                value={quickEntryDay ? (dailyEntries.find(e => e.date === quickEntryDay)?.squareFootage || '') : ''}
                onChange={(e) => quickEntryDay && updateDailyEntry(quickEntryDay, 'squareFootage', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#cccccc]">Note</label>
              <Input
                type="text"
                placeholder="Task/notes"
                className="h-8 bg-[#1a1a1a] border-[#454545] text-[#cccccc] placeholder:text-[#858585]"
                disabled={!quickEntryDay}
                value={quickEntryDay ? (dailyEntries.find(e => e.date === quickEntryDay)?.note || '') : ''}
                onChange={(e) => quickEntryDay && updateDailyEntry(quickEntryDay, 'note', e.target.value)}
              />
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-medium mb-1 text-[#cccccc]">Primary Task</label>
              <Select 
                value={quickEntryDay ? (dailyEntries.find(e => e.date === quickEntryDay)?.taskId || 'none') : 'none'} 
                onValueChange={(value) => quickEntryDay && updateDailyEntry(quickEntryDay, 'taskId', value === 'none' ? undefined : value)}
                disabled={!quickEntryDay}
              >
                <SelectTrigger className="h-8 bg-[#1a1a1a] border-[#454545] text-[#cccccc] w-full max-w-full">
                  <SelectValue placeholder="Select task" className="truncate overflow-hidden text-ellipsis whitespace-nowrap" />
                </SelectTrigger>
                <SelectContent className="bg-[#2d2d2d] border-[#454545]">
                  <SelectItem value="none" className="text-[#cccccc]">No specific task</SelectItem>
                  {tasks.map(task => (
                    <SelectItem key={task.id} value={task.id} className="text-[#cccccc] truncate" title={task.name}>
                      {task.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );



  return (
    <>
      {DailyTrackerSection()}
    </>
  );
}

// Export the interfaces and types for use in other components
export type { DailyEntry, Task }; 