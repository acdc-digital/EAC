// Weekly Analytics Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/weeklyAnalytics.tsx

"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Square, TrendingUp, Users, Target } from "lucide-react";
import { DailyEntry } from "@/store/dailyTracker/types";

interface Task {
  id: string;
  name: string;
  days: number;
  used: number;
  type: "Day(s)" | "Hour(s)";
  unit: number;
  cost: number;
  burdenRate: number;
}

interface WeeklyAnalyticsProps {
  dailyEntries: DailyEntry[];
  totalDays: number;
  tasks: Task[];
  crewSize: number;
}

interface WeekSummary {
  weekNumber: number;
  startDay: number;
  endDay: number;
  totalHours: number;
  totalSquareFootage: number;
  workingDays: number;
  averageHoursPerDay: number;
  averageSquareFootagePerDay: number;
  taskBreakdown: { [taskId: string]: { hours: number; squareFootage: number } };
}

export function WeeklyAnalytics({ dailyEntries, totalDays, tasks, crewSize }: WeeklyAnalyticsProps) {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  // Calculate all weeks in the project
  const weeks = useMemo(() => {
    const weeksList: WeekSummary[] = [];
    const totalWeeks = Math.ceil(totalDays / 7);

    for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
      const startDay = (weekNum - 1) * 7 + 1;
      const endDay = Math.min(weekNum * 7, totalDays);
      
      // Get daily entries for this week
      const weekEntries = dailyEntries.filter(entry => 
        entry.date >= startDay && entry.date <= endDay
      );

      // Calculate totals
      const totalHours = weekEntries.reduce((sum, entry) => sum + entry.hours, 0);
      const totalSquareFootage = weekEntries.reduce((sum, entry) => sum + entry.squareFootage, 0);
      const workingDays = weekEntries.filter(entry => entry.hours > 0).length;
      const averageHoursPerDay = workingDays > 0 ? totalHours / workingDays : 0;
      const averageSquareFootagePerDay = workingDays > 0 ? totalSquareFootage / workingDays : 0;

      // Calculate task breakdown
      const taskBreakdown: { [taskId: string]: { hours: number; squareFootage: number } } = {};
      weekEntries.forEach(entry => {
        if (entry.taskId) {
          if (!taskBreakdown[entry.taskId]) {
            taskBreakdown[entry.taskId] = { hours: 0, squareFootage: 0 };
          }
          taskBreakdown[entry.taskId].hours += entry.hours;
          taskBreakdown[entry.taskId].squareFootage += entry.squareFootage;
        }
      });

      weeksList.push({
        weekNumber: weekNum,
        startDay,
        endDay,
        totalHours,
        totalSquareFootage,
        workingDays,
        averageHoursPerDay,
        averageSquareFootagePerDay,
        taskBreakdown
      });
    }

    return weeksList;
  }, [dailyEntries, totalDays]);

  // Get current week data
  const currentWeek = weeks.find(week => week.weekNumber === selectedWeek) || weeks[0];

  // Calculate efficiency metrics
  const maxPossibleHours = 7 * 9 * crewSize; // 7 days * 9 hours * crew size
  const efficiency = currentWeek ? (currentWeek.totalHours / maxPossibleHours) * 100 : 0;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate estimated cost for the week
  const estimatedWeeklyCost = useMemo(() => {
    if (!currentWeek) return 0;
    
    const totalProjectHours = tasks.reduce((sum, task) => {
      return sum + (task.type === "Day(s)" ? task.days * 9 * crewSize : task.days);
    }, 0);
    
    const totalProjectCost = tasks.reduce((sum, task) => sum + task.cost + (task.cost * task.burdenRate), 0);
    const avgHourlyRate = totalProjectHours > 0 ? totalProjectCost / totalProjectHours : 0;
    
    return currentWeek.totalHours * avgHourlyRate;
  }, [currentWeek, tasks, crewSize]);

  return (
    <Card className="bg-[#1a1a1a] border-[#2d2d2d]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-[#cccccc]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#007acc]" />
            <span>Weekly Activity Summary</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#858585]">Select Week:</span>
            <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
              <SelectTrigger className="w-48 bg-[#2d2d2d] border-[#454545] text-[#cccccc]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2d2d2d] border-[#454545]">
                {weeks.map(week => (
                  <SelectItem 
                    key={week.weekNumber} 
                    value={week.weekNumber.toString()}
                    className="text-[#cccccc] hover:bg-[#454545]"
                  >
                    Week {week.weekNumber} (Days {week.startDay}-{week.endDay})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentWeek ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Hours Card */}
            <div className="bg-[#2d2d2d] border border-[#454545] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#007acc]" />
                  <span className="text-sm font-medium text-[#cccccc]">Total Hours</span>
                </div>
                <div className="text-xs text-[#007acc]">Week {selectedWeek}</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-[#cccccc]">
                  {currentWeek.totalHours.toLocaleString()}
                </div>
                <div className="text-sm text-[#858585]">
                  Avg: {currentWeek.averageHoursPerDay.toFixed(1)} hrs/day
                </div>
                <div className="text-xs text-[#858585]">
                  {currentWeek.workingDays} working days
                </div>
              </div>
            </div>

            {/* Total Square Footage Card */}
            <div className="bg-[#2d2d2d] border border-[#454545] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4 text-[#4ec9b0]" />
                  <span className="text-sm font-medium text-[#cccccc]">Square Footage</span>
                </div>
                <div className="text-xs text-[#4ec9b0]">Completed</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-[#cccccc]">
                  {currentWeek.totalSquareFootage.toLocaleString()}
                </div>
                <div className="text-sm text-[#858585]">
                  Avg: {currentWeek.averageSquareFootagePerDay.toFixed(0)} sq ft/day
                </div>
                <div className="text-xs text-[#858585]">
                  sq ft this week
                </div>
              </div>
            </div>

            {/* Crew Efficiency Card */}
            <div className="bg-[#2d2d2d] border border-[#454545] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#fbbf24]" />
                  <span className="text-sm font-medium text-[#cccccc]">Crew Efficiency</span>
                </div>
                <div className="text-xs text-[#fbbf24]">Performance</div>
              </div>
              <div className="space-y-1">
                <div className={`text-2xl font-bold ${efficiency >= 80 ? 'text-[#4ec9b0]' : efficiency >= 60 ? 'text-[#fbbf24]' : 'text-[#ef4444]'}`}>
                  {efficiency.toFixed(1)}%
                </div>
                <div className="text-sm text-[#858585]">
                  {currentWeek.totalHours} / {maxPossibleHours} hrs
                </div>
                <div className="text-xs text-[#858585]">
                  {crewSize} crew members
                </div>
              </div>
            </div>

            {/* Estimated Cost Card */}
            <div className="bg-[#2d2d2d] border border-[#454545] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#8b5cf6]" />
                  <span className="text-sm font-medium text-[#cccccc]">Estimated Cost</span>
                </div>
                <div className="text-xs text-[#8b5cf6]">Week Total</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-[#cccccc]">
                  {formatCurrency(estimatedWeeklyCost)}
                </div>
                <div className="text-sm text-[#858585]">
                  Based on project rates
                </div>
                <div className="text-xs text-[#858585]">
                  Labor + burden
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-[#858585]">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No weekly data available</p>
            <p className="text-sm mt-2">Start tracking daily entries to see weekly analytics</p>
          </div>
        )}

        {/* Task Breakdown */}
        {currentWeek && Object.keys(currentWeek.taskBreakdown).length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-[#cccccc] mb-4">Task Breakdown - Week {selectedWeek}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(currentWeek.taskBreakdown).map(([taskId, breakdown]) => {
                const task = tasks.find(t => t.id === taskId);
                if (!task) return null;

                return (
                  <div key={taskId} className="bg-[#2d2d2d] border border-[#454545] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#cccccc] truncate">{task.name}</span>
                      <span className="text-xs text-[#858585]">Task</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-[#007acc] font-medium">{breakdown.hours} hrs</div>
                        <div className="text-[#858585] text-xs">Hours worked</div>
                      </div>
                      <div>
                        <div className="text-[#4ec9b0] font-medium">{breakdown.squareFootage.toLocaleString()} sq ft</div>
                        <div className="text-[#858585] text-xs">Area completed</div>
                      </div>
                      <div>
                        <div className="text-[#fbbf24] font-medium">
                          {breakdown.hours > 0 ? (breakdown.squareFootage / breakdown.hours).toFixed(1) : '0.0'} sq ft/hr
                        </div>
                        <div className="text-[#858585] text-xs">Productivity rate</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 