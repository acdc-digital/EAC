// Editor General Project Details
// /Users/matthewsimon/Projects/EAC/eac/app/_components/editGenerals.tsx

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, DollarSign, FileText } from "lucide-react";

interface ProjectData {
  // Project Identification
  project: string;
  projectNo: string;
  siteAddress: string;
  contractValue: number;
  squareFeet: number;
  projectedStart: string;
  projectedCompletion: string;
  percentageComplete: number;
  
  // Job Cost
  budgetAmount: number;
  actualCost: number;
  cogsAmount: number;
  marginAmount: number;
  marginPercentage: number;
  
  // Notes
  notes: string;
}

export function EditGenerals() {
  const [projectData, setProjectData] = useState<ProjectData>({
    project: "Wentworth Towers",
    projectNo: "23-054",
    siteAddress: "61 Wentworth Dr, Halifax, NS B3M 4R3",
    contractValue: 469900.00,
    squareFeet: 0,
    projectedStart: "",
    projectedCompletion: "",
    percentageComplete: 98,
    budgetAmount: 469900.00,
    actualCost: 250818.59,
    cogsAmount: 304250.51,
    marginAmount: 165649.49,
    marginPercentage: 35,
    notes: "*colphene-h paid $1.72 more per unit than estimated (PO# 401869) +$825.00 extra"
  });

  const handleInputChange = (field: keyof ProjectData, value: string | number) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  return (
    <div className="space-y-4 p-4">
      {/* Project Identification Section */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" />
            Project Identification
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="project" className="text-xs">Project</Label>
              <Input
                id="project"
                value={projectData.project}
                onChange={(e) => handleInputChange('project', e.target.value)}
                className="font-medium h-8 text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="projectNo" className="text-xs">Project No.</Label>
              <Input
                id="projectNo"
                value={projectData.projectNo}
                onChange={(e) => handleInputChange('projectNo', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-1 md:col-span-2 lg:col-span-1">
              <Label htmlFor="siteAddress" className="text-xs">Site Address</Label>
              <Input
                id="siteAddress"
                value={projectData.siteAddress}
                onChange={(e) => handleInputChange('siteAddress', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="contractValue" className="text-xs">Contract Value</Label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                <Input
                  id="contractValue"
                  type="number"
                  value={projectData.contractValue}
                  onChange={(e) => handleInputChange('contractValue', parseFloat(e.target.value) || 0)}
                  className="pl-7 font-mono h-8 text-sm"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="squareFeet" className="text-xs">Square Feet</Label>
              <Input
                id="squareFeet"
                type="number"
                value={projectData.squareFeet}
                onChange={(e) => handleInputChange('squareFeet', parseInt(e.target.value) || 0)}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="projectedStart" className="text-xs">Projected Start</Label>
              <Input
                id="projectedStart"
                type="date"
                value={projectData.projectedStart}
                onChange={(e) => handleInputChange('projectedStart', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="projectedCompletion" className="text-xs">Projected Completion</Label>
              <Input
                id="projectedCompletion"
                type="date"
                value={projectData.projectedCompletion}
                onChange={(e) => handleInputChange('projectedCompletion', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="percentageComplete" className="text-xs">Percentage Complete</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="percentageComplete"
                  type="number"
                  value={projectData.percentageComplete}
                  onChange={(e) => handleInputChange('percentageComplete', parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                  className="flex-1 h-8 text-sm"
                />
                <Badge variant={projectData.percentageComplete >= 90 ? "default" : "secondary"} className="text-xs h-6">
                  {formatPercentage(projectData.percentageComplete)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Cost Section */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calculator className="w-4 h-4" />
            Job Cost
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label htmlFor="budgetAmount" className="text-xs">Budget ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                <Input
                  id="budgetAmount"
                  type="number"
                  value={projectData.budgetAmount}
                  onChange={(e) => handleInputChange('budgetAmount', parseFloat(e.target.value) || 0)}
                  className="pl-7 font-mono h-8 text-sm"
                  step="0.01"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(projectData.budgetAmount)}
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="actualCost" className="text-xs">Actual</Label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                <Input
                  id="actualCost"
                  type="number"
                  value={projectData.actualCost}
                  onChange={(e) => handleInputChange('actualCost', parseFloat(e.target.value) || 0)}
                  className="pl-7 font-mono h-8 text-sm"
                  step="0.01"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(projectData.actualCost)}
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="cogsAmount" className="text-xs">CoGS</Label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                <Input
                  id="cogsAmount"
                  type="number"
                  value={projectData.cogsAmount}
                  onChange={(e) => handleInputChange('cogsAmount', parseFloat(e.target.value) || 0)}
                  className="pl-7 font-mono h-8 text-sm"
                  step="0.01"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(projectData.cogsAmount)}
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="marginAmount" className="text-xs">Margin</Label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                <Input
                  id="marginAmount"
                  type="number"
                  value={projectData.marginAmount}
                  onChange={(e) => handleInputChange('marginAmount', parseFloat(e.target.value) || 0)}
                  className="pl-7 font-mono h-8 text-sm"
                  step="0.01"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {formatCurrency(projectData.marginAmount)}
                </span>
                <Badge variant={projectData.marginPercentage >= 30 ? "default" : "destructive"} className="text-xs h-5 px-2">
                  {formatPercentage(projectData.marginPercentage)}
                </Badge>
              </div>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          {/* Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Total Budget</div>
              <div className="text-sm font-semibold">{formatCurrency(projectData.budgetAmount)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Total Spent</div>
              <div className="text-sm font-semibold">{formatCurrency(projectData.actualCost)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Remaining</div>
              <div className={`text-sm font-semibold ${
                (projectData.budgetAmount - projectData.actualCost) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatCurrency(projectData.budgetAmount - projectData.actualCost)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

            {/* Notes Section */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            <Label htmlFor="notes" className="text-xs">Project Notes</Label>
            <Textarea
              id="notes"
              value={projectData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional notes or comments about the project..."
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pb-2">
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">
          Save Changes
        </Button>
      </div>
    </div>
  );
}

