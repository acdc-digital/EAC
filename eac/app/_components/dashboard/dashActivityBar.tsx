// Activity Bar Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashActivityBar.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editor";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import {
    Bug,
    Calendar,
    Edit3,
    FileText,
    Settings,
    Trash2,
    User,
    Users
} from "lucide-react";

interface ActivityBarProps {
  activePanel: string;
  onPanelChange: (panel: string) => void;
}

export function DashActivityBar({ activePanel, onPanelChange }: ActivityBarProps) {
  const { openSpecialTab } = useEditorStore();

  const activityItems = [
    { id: "explorer", icon: FileText, label: "Explorer" },
    { id: "social-connectors", icon: Users, label: "Social Media Connectors" },
    { id: "file-editor", icon: Edit3, label: "File Editor" },
    { id: "calendar", icon: Calendar, label: "Content Calendar" },
    { id: "trash", icon: Trash2, label: "Trash" },
    { id: "debug", icon: Bug, label: "Debug Tools" },
    { id: "profile", icon: User, label: "User Profile" },
  ];

  const handleActivityClick = (id: string) => {
    // Handle profile authentication
    if (id === 'profile') {
      // This will be handled by the profile button render logic
      return;
    }
    
    // For social connectors and file editor, open tabs directly
    if (id === 'social-connectors') {
      openSpecialTab('social-connectors', 'Social Media Connectors', 'social-connect');
      onPanelChange('explorer'); // Reset to explorer panel
      return;
    }
    if (id === 'file-editor') {
      openSpecialTab('file-editor', 'File Editor', 'post-creator');
      onPanelChange('explorer'); // Reset to explorer panel
      return;
    }
    if (id === 'calendar') {
      openSpecialTab('calendar', 'Content Calendar', 'calendar');
      onPanelChange('explorer'); // Reset to explorer panel
      return;
    }
    
    // For other panels, toggle sidebar visibility
    onPanelChange(id);
  };

  return (
    <aside className="w-12 bg-[#181818] border-r border-[#2d2d2d] flex flex-col">
      {/* Activity Icons */}
      <div className="flex flex-col items-center py-2 space-y-1">
        {activityItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          
          // Special handling for profile icon
          if (item.id === 'profile') {
            return (
              <div key={item.id}>
                <Unauthenticated>
                  <SignInButton mode="modal">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-11 h-11 rounded-none hover:bg-[#2d2d2d] border-l-2 border-transparent"
                      title="Sign In"
                    >
                      <Icon className="w-5 h-5 text-[#858585]" />
                    </Button>
                  </SignInButton>
                </Unauthenticated>
                <Authenticated>
                  <UserButton 
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "w-8 h-8 rounded-sm",
                        userButtonPopoverCard: "bg-[#252526] border border-[#454545]",
                        userButtonPopoverActionButton: "text-[#cccccc] hover:bg-[#2a2d2e]",
                        userButtonPopoverActionButtonText: "text-[#cccccc]",
                        userButtonPopoverFooter: "hidden"
                      }
                    }}
                    userProfileMode="modal"
                    afterSignOutUrl="/"
                  />
                </Authenticated>
              </div>
            );
          }
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="icon"
              onClick={() => handleActivityClick(item.id)}
              className={`
                w-11 h-11 rounded-none hover:bg-[#2d2d2d] relative
                ${isActive 
                  ? 'bg-[#2d2d2d] border-l-2 border-[#007acc]' 
                  : 'border-l-2 border-transparent'
                }
              `}
              title={item.label}
            >
              <Icon 
                className={`w-5 h-5 ${
                  isActive ? 'text-[#cccccc]' : 'text-[#858585]'
                }`} 
              />
            </Button>
          );
        })}
      </div>

      {/* Settings at bottom */}
      <div className="mt-auto mb-2 flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          className="w-11 h-11 rounded-none hover:bg-[#2d2d2d]"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-[#858585]" />
        </Button>
      </div>
    </aside>
  );
} 