// Edit Schedule Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/editSchedule.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Calendar } from "lucide-react";
import { DailyTracker } from "./_components/dailyTracker";
import { useDailyTrackerStore } from "@/store";
import { WeeklyAnalytics } from "./_components/weeklyAnalytics";

interface Task {
  id: string;
  name: string;
  days: number;
  used: number;
  type: "Day(s)" | "Hour(s)";
  unit: number;
  cost: number;
  burdenRate: number; // as decimal (0.25 for 25%)
}

export function EditSchedule() {
  // Crew size state
  const [crewSize, setCrewSize] = useState<number>(7);
  // Total square footage state
  const [totalSquareFeet, setTotalSquareFeet] = useState<number>(50000);

  // Access daily tracker store
  const { dailyEntries } = useDailyTrackerStore();

  // Initial tasks based on reference image
  const [tasks, setTasks] = useState<Task[]>([
    { id: "job-setup", name: "Job Set-Up", days: 2, used: 0, type: "Day(s)", unit: 2200, cost: 4400, burdenRate: 0.25 },
    { id: "primer", name: "Primer", days: 3, used: 0, type: "Day(s)", unit: 2200, cost: 6600, burdenRate: 0.25 },
    { id: "hot-rubber", name: "Hot Rubber", days: 4, used: 0, type: "Day(s)", unit: 2200, cost: 8800, burdenRate: 0.25 },
    { id: "drainage", name: "Drainage Boards", days: 4, used: 0, type: "Day(s)", unit: 2200, cost: 8800, burdenRate: 0.25 },
    { id: "metal-flashing", name: "Metal Flashing-Steel", days: 5, used: 0, type: "Day(s)", unit: 2200, cost: 11000, burdenRate: 0.25 },
    { id: "details", name: "Details", days: 5, used: 0, type: "Day(s)", unit: 2200, cost: 11000, burdenRate: 0.25 },
    { id: "ballast", name: "Ballast", days: 2, used: 0, type: "Day(s)", unit: 2200, cost: 4400, burdenRate: 0.25 },
  ]);


  const [maxChartDays, setMaxChartDays] = useState(30);

  // Function to calculate used hours per task from daily entries
  const calculateUsedHoursPerTask = () => {
    const taskUsage: { [taskId: string]: number } = {};
    
    // Sum up hours for each task from daily entries
    dailyEntries.forEach(entry => {
      if (entry.taskId && entry.hours > 0) {
        taskUsage[entry.taskId] = (taskUsage[entry.taskId] || 0) + entry.hours;
      }
    });
    
    return taskUsage;
  };

  // Update tasks with calculated used hours
  useEffect(() => {
    const taskUsage = calculateUsedHoursPerTask();
    
    setTasks(prevTasks => 
      prevTasks.map(task => ({
        ...task,
        used: Math.round((taskUsage[task.id] || 0) / (9 * crewSize) * 100) / 100 // Convert hours to days and round to 2 decimal places
      }))
    );
  }, [dailyEntries, crewSize]);

  // Calculate totals
  const totalDays = tasks.reduce((sum, task) => sum + task.days, 0);
  const totalUsed = tasks.reduce((sum, task) => sum + task.used, 0);
  const totalCost = tasks.reduce((sum, task) => sum + task.cost, 0);
  const totalBurden = tasks.reduce((sum, task) => sum + (task.cost * task.burdenRate), 0);
  const totalWithBurden = totalCost + totalBurden;
  
  // Calculate hours (9 hours per day * crew size)
  const totalHours = tasks.reduce((sum, task) => {
    if (task.type === "Day(s)") {
      return sum + (task.days * 9 * crewSize); // crew size * 9 hours
    }
    return sum + task.days; // If already in hours
  }, 0);

  // Update cost when days or unit changes
  const updateTask = (taskId: string, field: keyof Task, value: any) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, [field]: value };
          
          // Recalculate cost if days or unit changes
          if (field === "days" || field === "unit") {
            updatedTask.cost = updatedTask.days * updatedTask.unit;
          }
          
          return updatedTask;
        }
        return task;
      })
    );
  };

  // Add new task
  const addTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: "",
      days: 1,
      used: 0,
      type: "Day(s)",
      unit: 2200,
      cost: 2200,
      burdenRate: 0.25,
    };
    setTasks([...tasks, newTask]);
  };

  // Remove task
  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Calculate chart scale
  useEffect(() => {
    const maxDays = Math.max(...tasks.map(t => Math.max(t.days, t.used)));
    setMaxChartDays(Math.max(30, Math.ceil(maxDays * 1.2))); // Add 20% padding
  }, [tasks]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="h-full bg-[#1a1a1a] text-[#cccccc]">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#cccccc] mb-2">Project Schedule</h1>
          <p className="text-sm text-[#858585]">Track labor tasks, costs, and timeline progress</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Card 1: Estimated Cost & Hours */}
          <div className="bg-[#2d2d2d] border border-[#454545] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#cccccc]">Estimated Budget</h3>
              <div className="text-xs text-[#4ec9b0] flex items-center gap-1">
                <span>📊</span>
                <span>Planned</span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-2xl font-bold text-[#cccccc]">
                  {formatCurrency(totalWithBurden)}
                </div>
                <div className="text-sm text-[#858585]">Total estimated cost</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-[#cccccc]">
                  {totalHours.toLocaleString()} hrs
                </div>
                <div className="text-sm text-[#858585]">Total estimated hours</div>
              </div>
            </div>
          </div>

          {/* Card 2: Actual Cost & Hours */}
          <div className="bg-[#2d2d2d] border border-[#454545] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#cccccc]">Actual Spend</h3>
              <div className="text-xs text-[#007acc] flex items-center gap-1">
                <span>⚡</span>
                <span>In Progress</span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-2xl font-bold text-[#cccccc]">
                  {formatCurrency((() => {
                    const actualHours = dailyEntries.reduce((sum, entry) => sum + entry.hours, 0);
                    const avgHourlyRate = totalWithBurden / totalHours;
                    return actualHours * avgHourlyRate;
                  })())}
                </div>
                <div className="text-sm text-[#858585]">Actual cost to date</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-[#cccccc]">
                  {dailyEntries.reduce((sum, entry) => sum + entry.hours, 0).toLocaleString()} hrs
                </div>
                <div className="text-sm text-[#858585]">Actual hours worked</div>
              </div>
            </div>
          </div>

          {/* Card 3: Square Footage Progress */}
          <div className="bg-[#2d2d2d] border border-[#454545] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#cccccc]">Square Footage</h3>
              <div className="text-xs text-[#ff9500] flex items-center gap-1">
                <span>📏</span>
                <span>Progress</span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={totalSquareFeet}
                    onChange={(e) => setTotalSquareFeet(parseInt(e.target.value) || 1)}
                    className="text-2xl font-bold text-[#cccccc] bg-transparent border-b border-[#454545] focus:border-[#007acc] focus:outline-none w-32"
                    aria-label="Total project square feet"
                  />
                  <span className="text-sm text-[#858585]">sq ft</span>
                </div>
                <div className="text-sm text-[#858585]">Total project sq ft</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-[#cccccc]">
                  {dailyEntries.reduce((sum, entry) => sum + entry.squareFootage, 0).toLocaleString()} sq ft
                </div>
                <div className="text-sm text-[#858585]">Completed to date</div>
                <div className="text-xs text-[#858585] mt-1">
                  {totalSquareFeet > 0 ? ((dailyEntries.reduce((sum, entry) => sum + entry.squareFootage, 0) / totalSquareFeet) * 100).toFixed(1) : '0.0'}% complete
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Crew Size Input */}
        <div className="mb-6 flex items-center gap-3">
          <label htmlFor="crew-size" className="text-sm font-medium text-[#cccccc]">
            Crew Size:
          </label>
          <input
            id="crew-size"
            type="number"
            min="1"
            max="50"
            value={crewSize}
            onChange={(e) => setCrewSize(parseInt(e.target.value) || 1)}
            className="w-20 bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-sm text-[#cccccc] text-center focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
            aria-label="Number of crew members"
          />
          <span className="text-sm text-[#858585]">people (9 hours per day)</span>
        </div>

        {/* Schedule Table */}
        <div className="mb-8">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-[#454545]">
              <thead>
                <tr className="bg-[#2d2d2d]">
                  <th className="border border-[#454545] p-2 text-left text-sm font-medium text-[#cccccc] min-w-[200px] relative">
                    Labour Task
                    <button
                      onClick={addTask}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-[#454545] hover:bg-[#007acc] rounded-sm flex items-center justify-center transition-colors"
                      aria-label="Add new task"
                    >
                      <Plus className="w-4 h-4 text-[#cccccc]" />
                    </button>
                  </th>
                  <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[80px]">
                    Days
                  </th>
                  <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[80px]">
                    Used
                  </th>
                  <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[80px]">
                    Type
                  </th>
                  <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[80px]">
                    Unit
                  </th>
                  <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[100px]">
                    Cost
                  </th>
                  <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[100px]">
                    Burden (25%)
                  </th>
                  <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[80px]">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const burden = task.cost * task.burdenRate;
                  const hours = task.type === "Day(s)" ? task.days * 9 * crewSize : task.days; // crew size * 9 hours
                  
                  return (
                    <tr key={task.id} className="hover:bg-[#252525] group">
                      <td className="border border-[#454545] p-1">
                        <input
                          value={task.name}
                          onChange={(e) => updateTask(task.id, "name", e.target.value)}
                          className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                          aria-label={`Task name: ${task.name}`}
                        />
                      </td>
                      <td className="border border-[#454545] p-1">
                        <input
                          type="number"
                          value={task.days}
                          onChange={(e) => updateTask(task.id, "days", parseInt(e.target.value) || 0)}
                          className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] text-center focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                          aria-label={`Days for ${task.name}`}
                        />
                      </td>
                      <td className="border border-[#454545] p-1">
                        <input
                          type="number"
                          value={task.used}
                          onChange={(e) => updateTask(task.id, "used", parseInt(e.target.value) || 0)}
                          className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] text-center focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                          aria-label={`Used days for ${task.name}`}
                        />
                      </td>
                      <td className="border border-[#454545] p-1">
                        <select
                          value={task.type}
                          onChange={(e) => updateTask(task.id, "type", e.target.value as "Day(s)" | "Hour(s)")}
                          className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                          aria-label={`Type for ${task.name}`}
                        >
                          <option value="Day(s)">Day(s)</option>
                          <option value="Hour(s)">Hour(s)</option>
                        </select>
                      </td>
                      <td className="border border-[#454545] p-1">
                        <input
                          type="number"
                          value={task.unit}
                          onChange={(e) => updateTask(task.id, "unit", parseInt(e.target.value) || 0)}
                          className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] text-center focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                          aria-label={`Unit cost for ${task.name}`}
                        />
                      </td>
                      <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc] bg-[#2a2a2a]">
                        {task.cost.toLocaleString()}
                      </td>
                      <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc] bg-[#2a2a2a]">
                        {burden.toLocaleString()}
                      </td>
                      <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc] bg-[#2a2a2a]">
                        {hours}
                      </td>
                      <td className="border border-[#454545] p-1 text-center">
                        <button
                          onClick={() => removeTask(task.id)}
                          className="w-6 h-6 bg-[#454545] hover:bg-[#ff4444] rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Delete ${task.name} task`}
                        >
                          <X className="w-3 h-3 text-[#cccccc]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}


                {/* Totals row */}
                <tr className="bg-[#2d2d2d]">
                  <td className="border border-[#454545] p-2 text-sm font-medium text-[#cccccc]">
                    Total
                  </td>
                  <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc]">
                    {totalDays}
                  </td>
                  <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc]">
                    {totalUsed}
                  </td>
                  <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc]">
                    Days
                  </td>
                  <td className="border border-[#454545] p-2"></td>
                  <td className="border border-[#454545] p-2 text-center text-sm font-medium text-[#ff4444]">
                    {formatCurrency(totalCost)}
                  </td>
                  <td className="border border-[#454545] p-2 text-center text-sm font-medium text-[#ff4444]">
                    {formatCurrency(totalBurden)}
                  </td>
                  <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc]">
                    {totalHours}
                  </td>
                  <td className="border border-[#454545] p-2"></td>
                </tr>
                
                {/* Summary rows */}
                <tr className="bg-[#252525]">
                  <td colSpan={5} className="border border-[#454545] p-2 text-right text-sm font-medium text-[#cccccc]">
                    Cost
                  </td>
                  <td className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc]">
                    {formatCurrency(totalWithBurden)}
                  </td>
                  <td colSpan={3} className="border border-[#454545] p-2 bg-[#2a2a2a]">
                    <div className="flex justify-between text-xs text-[#cccccc]">
                      <span>Used/Total</span>
                      <span>{totalUsed}/{totalDays}</span>
                    </div>
                  </td>
                </tr>
                <tr className="bg-[#252525]">
                  <td colSpan={5} className="border border-[#454545] p-2 text-right text-sm font-medium text-[#cccccc]">
                    Hours
                  </td>
                  <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc]">
                    {totalHours}
                  </td>
                  <td colSpan={3} className="border border-[#454545] p-2 bg-[#2a2a2a]">
                    <div className="flex justify-between text-xs text-[#cccccc]">
                      <span>Per/Remaining</span>
                      <span>Lab.Rep.</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="border border-[#454545] rounded-lg bg-[#1a1a1a] p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#cccccc] mb-2">Schedule Timeline</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 bg-[#007acc] rounded-sm"></div>
                  <span className="text-[#cccccc]">Estimated</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 bg-[#4ec9b0] rounded-sm"></div>
                  <span className="text-[#cccccc]">Actual (Used)</span>
                </div>
              </div>
              <div className="text-sm text-[#858585]">
                Days: 0 - {maxChartDays}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Chart grid */}
            <div className="relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex">
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 border-l border-[#454545] first:border-l-0"
                  />
                ))}
              </div>

              {/* Task bars */}
              <div className="space-y-4 relative">
                {tasks.map((task) => {
                  const estimatedWidth = Math.max((task.days / maxChartDays) * 100, 2);
                  const actualWidth = Math.max((task.used / maxChartDays) * 100, task.used > 0 ? 2 : 0);
                  
                  return (
                    <div key={task.id} className="space-y-2">
                      <div className="text-sm font-medium text-[#cccccc] truncate">
                        {task.name}
                      </div>
                      
                      {/* Estimated bar */}
                      <div className="relative h-5 bg-[#2d2d2d] rounded-sm border border-[#454545]">
                        <div
                          className="absolute top-0 left-0 h-full bg-[#007acc] rounded-sm flex items-center justify-end pr-2"
                          style={{ width: `${estimatedWidth}%` }}
                        >
                          <span className="text-xs text-white font-medium">
                            {task.days}d
                          </span>
                        </div>
                      </div>
                      
                      {/* Actual bar */}
                      <div className="relative h-5 bg-[#2d2d2d] rounded-sm border border-[#454545]">
                        <div
                          className="absolute top-0 left-0 h-full bg-[#4ec9b0] rounded-sm flex items-center justify-end pr-2"
                          style={{ width: `${actualWidth}%` }}
                        >
                          {task.used > 0 && (
                            <span className="text-xs text-white font-medium">
                              {task.used}d
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scale markers */}
              <div className="flex justify-between mt-4 text-xs text-[#858585]">
                {Array.from({ length: 7 }, (_, i) => (
                  <span key={i}>{Math.round((i * maxChartDays) / 6)}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Tracker */}
        <DailyTracker totalDays={totalDays} tasks={tasks} />

        {/* Weekly Analytics Section */}
        <div className="mt-8">
          <WeeklyAnalytics 
            dailyEntries={dailyEntries} 
            totalDays={totalDays} 
            tasks={tasks}
            crewSize={crewSize}
          />
        </div>

      </div>
    </div>
  );
}