// Edit Percent Complete Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/editPercentComplete.tsx

"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";

interface Column {
  id: string;
  name: string;
  sf: number; // Square footage or units
}

interface Task {
  id: string;
  name: string;
}

interface PercentData {
  [taskId: string]: {
    [columnId: string]: number;
  };
}

export function EditPercentComplete() {
  // Initial columns based on your image
  const [columns, setColumns] = useState<Column[]>([
    { id: "podium", name: "Podium", sf: 13123 },
    { id: "l1", name: "L1", sf: 555 },
    { id: "l19", name: "L19", sf: 6416 },
    { id: "l20", name: "L20", sf: 2522 },
    { id: "l21", name: "L21", sf: 818 },
    { id: "metal", name: "Metal", sf: 1035 },
  ]);

  // Initial tasks based on your image
  const [tasks, setTasks] = useState<Task[]>([
    { id: "job-setup", name: "Job Setup" },
    { id: "primer", name: "Primer" },
    { id: "hot-rubber", name: "Hot Rubber" },
    { id: "drainage-boards", name: "Drainage Boards" },
    { id: "ballast", name: "Ballast" },
    { id: "detail-work", name: "Detail Work" },
  ]);

  // Percentage complete data - matching your reference image
  const [percentData, setPercentData] = useState<PercentData>({
    "job-setup": { podium: 100, l1: 100, l19: 100, l20: 100, l21: 100, metal: 0 },
    "primer": { podium: 81, l1: 100, l19: 100, l20: 100, l21: 100, metal: 0 },
    "hot-rubber": { podium: 81, l1: 100, l19: 100, l20: 100, l21: 100, metal: 0 },
    "drainage-boards": { podium: 81, l1: 100, l19: 100, l20: 100, l21: 100, metal: 0 },
    "ballast": { podium: 81, l1: 100, l19: 100, l20: 100, l21: 100, metal: 0 },
    "detail-work": { podium: 81, l1: 100, l19: 100, l20: 100, l21: 100, metal: 0 },
  });

  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnSF, setNewColumnSF] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Calculate total SF
  const totalSF = columns.reduce((sum, col) => sum + col.sf, 0);

  // Calculate weighted average for each task
  const calculateTaskAverage = (taskId: string) => {
    let weightedSum = 0;
    let totalWeight = 0;

    columns.forEach(col => {
      const percent = percentData[taskId]?.[col.id] || 0;
      weightedSum += (percent * col.sf) / 100;
      totalWeight += col.sf;
    });

    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;
  };

  // Calculate total complete for each column
  const calculateColumnComplete = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return 0;

    const avgPercent = calculateColumnAverage(columnId);
    return Math.round((column.sf * avgPercent) / 100);
  };

  // Calculate average percentage for a column
  const calculateColumnAverage = (columnId: string) => {
    const validTasks = tasks.filter(task => percentData[task.id]?.[columnId] !== undefined);
    if (validTasks.length === 0) return 0;

    const sum = validTasks.reduce((acc, task) => acc + (percentData[task.id][columnId] || 0), 0);
    return Math.round(sum / validTasks.length);
  };

  // Calculate overall weighted average
  const calculateOverallAverage = () => {
    let weightedSum = 0;
    let totalWeight = 0;

    columns.forEach(col => {
      const avgPercent = calculateColumnAverage(col.id);
      weightedSum += (avgPercent * col.sf) / 100;
      totalWeight += col.sf;
    });

    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;
  };

  // Calculate total complete SF
  const calculateTotalComplete = () => {
    return columns.reduce((sum, col) => sum + calculateColumnComplete(col.id), 0);
  };

  // Handle percent change
  const handlePercentChange = (taskId: string, columnId: string, value: string) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    setPercentData(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [columnId]: numValue
      }
    }));
  };

  // Add new column
  const addColumn = () => {
    if (newColumnName && newColumnSF) {
      const newCol: Column = {
        id: `col-${Date.now()}`,
        name: newColumnName,
        sf: parseInt(newColumnSF) || 0
      };
      setColumns([...columns, newCol]);
      
      // Initialize percent data for new column
      const updatedPercentData = { ...percentData };
      tasks.forEach(task => {
        if (!updatedPercentData[task.id]) {
          updatedPercentData[task.id] = {};
        }
        updatedPercentData[task.id][newCol.id] = 0;
      });
      setPercentData(updatedPercentData);
      
      setNewColumnName("");
      setNewColumnSF("");
      setShowColumnForm(false);
    }
  };

  // Add new task
  const addTask = () => {
    if (newTaskName) {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        name: newTaskName
      };
      setTasks([...tasks, newTask]);
      
      // Initialize percent data for new task
      const newTaskData: { [columnId: string]: number } = {};
      columns.forEach(col => {
        newTaskData[col.id] = 0;
      });
      setPercentData({
        ...percentData,
        [newTask.id]: newTaskData
      });
      
      setNewTaskName("");
      setShowTaskForm(false);
    }
  };

  // Remove column
  const removeColumn = (columnId: string) => {
    setColumns(columns.filter(col => col.id !== columnId));
    
    // Remove column data from percentData
    const updatedPercentData = { ...percentData };
    Object.keys(updatedPercentData).forEach(taskId => {
      delete updatedPercentData[taskId][columnId];
    });
    setPercentData(updatedPercentData);
  };

  // Remove task
  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    
    // Remove task from percentData
    const updatedPercentData = { ...percentData };
    delete updatedPercentData[taskId];
    setPercentData(updatedPercentData);
  };

  return (
    <div className="h-full bg-[#1a1a1a] text-[#cccccc]">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#cccccc] mb-2">Percent Complete Tracking</h1>
          <p className="text-sm text-[#858585]">Track construction progress across different areas and tasks</p>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-[#454545]">
            {/* Header Row 1 - Areas */}
            <thead>
              <tr className="bg-[#2d2d2d]">
                <th className="border border-[#454545] p-2 text-left text-sm font-medium text-[#cccccc] w-32">
                  Task
                </th>
                {columns.map(col => (
                  <th key={col.id} className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-24 relative group">
                    <div className="flex items-center justify-center">
                      <span className="font-medium text-[#cccccc]">{col.name}</span>
                      <button
                        onClick={() => removeColumn(col.id)}
                        className="absolute top-1 right-1 w-4 h-4 bg-[#454545] hover:bg-[#ff4444] rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Delete ${col.name} column`}
                      >
                        <X className="w-3 h-3 text-[#cccccc]" />
                      </button>
                    </div>
                  </th>
                ))}
                <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-16">
                  <button
                    onClick={() => setShowColumnForm(true)}
                    className="w-6 h-6 bg-[#454545] hover:bg-[#007acc] rounded-sm flex items-center justify-center transition-colors"
                    aria-label="Add new column"
                  >
                    <Plus className="w-4 h-4 text-[#cccccc]" />
                  </button>
                </th>
                <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-20">
                  Total
                </th>
                <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-20">
                  Complete
                </th>
              </tr>

              {/* Header Row 2 - Square Footage */}
              <tr className="bg-[#252525]">
                <th className="border border-[#454545] p-2 text-left text-xs text-[#858585]">
                  SF
                </th>
                {columns.map(col => (
                  <th key={col.id} className="border border-[#454545] p-2 text-center text-xs text-[#cccccc]">
                    {col.sf.toLocaleString()}
                  </th>
                ))}
                <th className="border border-[#454545] p-2"></th>
                <th className="border border-[#454545] p-2 text-center text-xs text-[#cccccc]">
                  {totalSF.toLocaleString()}
                </th>
                <th className="border border-[#454545] p-2 text-center text-xs text-[#cccccc]">
                  Complete
                </th>
              </tr>

              {/* Header Row 3 - Percent Complete Labels */}
              <tr className="bg-[#007acc]">
                <th className="border border-[#454545] p-2 text-left text-xs font-medium text-white">
                  SF
                </th>
                {columns.map(col => (
                  <th key={col.id} className="border border-[#454545] p-2 text-center text-xs font-medium text-white">
                    % Complete
                  </th>
                ))}
                <th className="border border-[#454545] p-2"></th>
                <th className="border border-[#454545] p-2 text-center text-xs font-medium text-white">
                  Total
                </th>
                <th className="border border-[#454545] p-2 text-center text-xs font-medium text-white">
                  Complete
                </th>
              </tr>
            </thead>

            {/* Task Rows */}
            <tbody>
              {tasks.map((task) => {
                const taskAverage = calculateTaskAverage(task.id);
                const taskComplete = Math.round((totalSF * taskAverage) / 100);
                return (
                  <tr key={task.id} className="hover:bg-[#252525] group">
                    <td className="border border-[#454545] p-2 text-sm text-[#cccccc] bg-[#2a2a2a] relative">
                      {task.name}
                      <button
                        onClick={() => removeTask(task.id)}
                        className="absolute top-1 right-1 w-4 h-4 bg-[#454545] hover:bg-[#ff4444] rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Delete ${task.name} task`}
                      >
                        <X className="w-3 h-3 text-[#cccccc]" />
                      </button>
                    </td>
                    {columns.map((col) => (
                      <td key={col.id} className="border border-[#454545] p-1 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={percentData[task.id]?.[col.id] || 0}
                          onChange={(e) => handlePercentChange(task.id, col.id, e.target.value)}
                          className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] text-center focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                          aria-label={`Percentage complete for ${task.name} in ${col.name}`}
                        />
                      </td>
                    ))}
                    <td className="border border-[#454545] p-2"></td>
                    <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc] bg-[#2a2a2a]">
                      {taskComplete.toLocaleString()}
                    </td>
                    <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc] bg-[#2a2a2a]">
                      {taskAverage}%
                    </td>
                  </tr>
                );
              })}

              {/* Add Task Row */}
              <tr className="hover:bg-[#252525]">
                <td className="border border-[#454545] p-2 text-center bg-[#2a2a2a]">
                  <button
                    onClick={() => setShowTaskForm(true)}
                    className="w-6 h-6 bg-[#454545] hover:bg-[#007acc] rounded-sm flex items-center justify-center transition-colors mx-auto"
                    aria-label="Add new task"
                  >
                    <Plus className="w-4 h-4 text-[#cccccc]" />
                  </button>
                </td>
                {columns.map((col) => (
                  <td key={col.id} className="border border-[#454545] p-2"></td>
                ))}
                <td className="border border-[#454545] p-2"></td>
                <td className="border border-[#454545] p-2"></td>
                <td className="border border-[#454545] p-2"></td>
              </tr>
            </tbody>

            {/* Summary Rows */}
            <tfoot>
              <tr className="bg-[#2d2d2d]">
                <td className="border border-[#454545] p-2 text-sm font-medium text-[#cccccc]">
                  Total %
                </td>
                {columns.map((col) => (
                  <td key={col.id} className="border border-[#454545] p-2 text-center text-sm text-[#cccccc]">
                    {calculateColumnAverage(col.id)}
                  </td>
                ))}
                <td className="border border-[#454545] p-2"></td>
                <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc]">
                  0
                </td>
                <td className="border border-[#454545] p-2"></td>
              </tr>

              <tr className="bg-[#252525]">
                <td className="border border-[#454545] p-2 text-sm font-medium text-[#cccccc]">
                  Total Complete
                </td>
                {columns.map((col) => (
                  <td key={col.id} className="border border-[#454545] p-2 text-center text-sm text-[#cccccc]">
                    {calculateColumnComplete(col.id).toLocaleString()}
                  </td>
                ))}
                <td className="border border-[#454545] p-2"></td>
                <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc]">
                  {calculateTotalComplete().toLocaleString()}
                </td>
                <td className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc]">
                  {calculateOverallAverage()}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Add Column Form */}
        {showColumnForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] border border-[#454545] rounded-lg p-6 w-96">
              <h2 className="text-lg font-semibold text-[#cccccc] mb-4">Add New Column</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#cccccc] mb-1">
                    Column Name
                  </label>
                  <input
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    className="w-full bg-[#2d2d2d] border border-[#454545] rounded px-3 py-2 text-[#cccccc] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                    placeholder="Enter column name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addColumn();
                      if (e.key === 'Escape') setShowColumnForm(false);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#cccccc] mb-1">
                    Square Footage
                  </label>
                  <input
                    type="number"
                    value={newColumnSF}
                    onChange={(e) => setNewColumnSF(e.target.value)}
                    className="w-full bg-[#2d2d2d] border border-[#454545] rounded px-3 py-2 text-[#cccccc] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                    placeholder="Enter square footage"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addColumn();
                      if (e.key === 'Escape') setShowColumnForm(false);
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowColumnForm(false);
                    setNewColumnName('');
                    setNewColumnSF('');
                  }}
                  className="px-4 py-2 text-[#cccccc] hover:bg-[#2d2d2d] rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addColumn}
                  className="px-4 py-2 bg-[#007acc] text-white rounded hover:bg-[#005a9e] transition-colors"
                >
                  Add Column
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Task Form */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] border border-[#454545] rounded-lg p-6 w-96">
              <h2 className="text-lg font-semibold text-[#cccccc] mb-4">Add New Task</h2>
              <div>
                <label className="block text-sm font-medium text-[#cccccc] mb-1">
                  Task Name
                </label>
                <input
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full bg-[#2d2d2d] border border-[#454545] rounded px-3 py-2 text-[#cccccc] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                  placeholder="Enter task name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addTask();
                    if (e.key === 'Escape') setShowTaskForm(false);
                  }}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowTaskForm(false);
                    setNewTaskName('');
                  }}
                  className="px-4 py-2 text-[#cccccc] hover:bg-[#2d2d2d] rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addTask}
                  className="px-4 py-2 bg-[#007acc] text-white rounded hover:bg-[#005a9e] transition-colors"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}