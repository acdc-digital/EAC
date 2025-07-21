// EAC Financial Dashboard Overview
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashOverview.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useProjects } from "@/lib/hooks/useProjects";
import { useEditorStore } from "@/store";
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Target,
    TrendingUp,
    Users
} from "lucide-react";
import React, { useState } from "react";
import { FilesDatabase } from "./filesDatabase";

export function DashOverview() {
  const { createProject } = useProjects();
  const { createFolder } = useEditorStore();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateProject = async () => {
    if (newProjectName.trim()) {
      setIsCreatingProject(true);
      
      try {
        // Create folder in the local editor store
        createFolder(newProjectName.trim(), 'project');
        
        // Also create a project in the Convex database
        const newProject = await createProject({
          name: newProjectName.trim(),
          status: 'active',
        });
        
        console.log('Project created in database:', newProject);
        
        // Close dialog and reset form
        setIsDialogOpen(false);
        setNewProjectName('');
      } catch (error) {
        console.error('Failed to create project in database:', error);
        // You could add error toast here if desired
      } finally {
        setIsCreatingProject(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateProject();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsDialogOpen(false);
      setNewProjectName('');
    }
  };
  const metrics = [
    {
      title: "Monthly Revenue",
      value: "$47,382.50",
      change: "+12.3%",
      trend: "up",
      icon: DollarSign,
      color: "text-[#4ec9b0]"
    },
    {
      title: "Active Projects",
      value: "23",
      change: "+2",
      trend: "up", 
      icon: Target,
      color: "text-[#007acc]"
    },
    {
      title: "Team Members",
      value: "18",
      change: "+3",
      trend: "up",
      icon: Users,
      color: "text-[#c586c0]"
    },
    {
      title: "Growth Rate",
      value: "18.7%",
      change: "+5.2%",
      trend: "up",
      icon: TrendingUp,
      color: "text-[#dcdcaa]"
    }
  ];

  const projects = [
    {
      name: "Q4 Budget Analysis",
      progress: 85,
      status: "On Track",
      deadline: "Dec 31, 2024",
      statusColor: "text-[#4ec9b0]",
      icon: CheckCircle
    },
    {
      name: "Marketing ROI Report",
      progress: 65,
      status: "In Progress",
      deadline: "Jan 15, 2025",
      statusColor: "text-[#dcdcaa]",
      icon: Clock
    },
    {
      name: "Revenue Forecast",
      progress: 30,
      status: "Behind",
      deadline: "Jan 10, 2025",
      statusColor: "text-[#ce9178]",
      icon: AlertTriangle
    }
  ];

  const recentActivity = [
    {
      time: "2 hours ago",
      action: "Budget report updated",
      user: "Sarah Johnson",
      type: "update"
    },
    {
      time: "4 hours ago",
      action: "New expense entry added",
      user: "Mike Chen",
      type: "create"
    },
    {
      time: "6 hours ago",
      action: "Project milestone completed",
      user: "Anna Davis",
      type: "complete"
    },
    {
      time: "8 hours ago",
      action: "Financial review scheduled",
      user: "System",
      type: "schedule"
    }
  ];

  return (
    <div className="p-6 bg-[#1a1a1a] text-[#cccccc] min-h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#cccccc] mb-2">
          Financial Dashboard Overview
        </h1>
        <p className="text-[#858585] text-sm">
          Real-time insights into your financial performance and project status
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-[#2d2d2d] border-[#454545] hover:bg-[#333333] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#cccccc]">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#cccccc] mb-1">
                {metric.value}
              </div>
              <p className="text-xs text-[#858585]">
                <span className="text-[#4ec9b0]">{metric.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projects and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <Card className="bg-[#2d2d2d] border-[#454545]">
          <CardHeader>
            <CardTitle className="text-[#cccccc] flex items-center gap-2">
              <Target className="h-5 w-5 text-[#007acc]" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <project.icon className={`h-4 w-4 ${project.statusColor}`} />
                      <span className="text-sm font-medium text-[#cccccc]">
                        {project.name}
                      </span>
                    </div>
                    <span className={`text-xs ${project.statusColor}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#858585]">
                    <Calendar className="h-3 w-3" />
                    <span>{project.deadline}</span>
                    <span className="ml-auto">{project.progress}%</span>
                  </div>
                  <Progress 
                    value={project.progress} 
                    className="h-2 bg-[#454545]"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-[#2d2d2d] border-[#454545]">
          <CardHeader>
            <CardTitle className="text-[#cccccc] flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#dcdcaa]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#007acc] rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#cccccc] font-medium">
                      {activity.action}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#858585] mt-1">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <Card className="bg-[#2d2d2d] border-[#454545]">
          <CardHeader>
            <CardTitle className="text-[#cccccc]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="p-3 bg-[#454545] hover:bg-[#555555] rounded-lg text-left transition-colors">
                <div className="text-[#4ec9b0] font-medium mb-1">New Report</div>
                <div className="text-xs text-[#858585]">Generate financial report</div>
              </button>
              <button className="p-3 bg-[#454545] hover:bg-[#555555] rounded-lg text-left transition-colors">
                <div className="text-[#007acc] font-medium mb-1">Add Expense</div>
                <div className="text-xs text-[#858585]">Record new expense</div>
              </button>
              <button
                className="p-3 bg-[#454545] hover:bg-[#555555] rounded-lg text-left transition-colors"
                onClick={() => setIsDialogOpen(true)}
              >
                <div className="text-[#c586c0] font-medium mb-1">Create Project</div>
                <div className="text-xs text-[#858585]">Start new project</div>
              </button>
              <button className="p-3 bg-[#454545] hover:bg-[#555555] rounded-lg text-left transition-colors">
                <div className="text-[#dcdcaa] font-medium mb-1">View Analytics</div>
                <div className="text-xs text-[#858585]">Open analytics dashboard</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Files Database Section */}
      <div className="mt-8">
        <FilesDatabase />
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setNewProjectName('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter a name for your new project. This will create both a local folder and a database entry.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-name" className="text-right">
                Project Name
              </Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="col-span-3"
                placeholder="Enter project name..."
                disabled={isCreatingProject}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setNewProjectName('');
              }}
              disabled={isCreatingProject}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={isCreatingProject || !newProjectName.trim()}
            >
              {isCreatingProject ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}