// Activity Bar Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashActivityBar.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editor";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import {
  Bug,
  Calendar,
  Contact,
  Edit3,
  FileText,
  Settings,
  Trash2,
  User
} from "lucide-react";

interface ActivityBarProps {
  activePanel: string;
  onPanelChange: (panel: string) => void;
}

export function DashActivityBar({ activePanel, onPanelChange }: ActivityBarProps) {
  const { openSpecialTab } = useEditorStore();
  const { user } = useUser();

  // Get the first letter of user's name (fallback to 'U')
  const getUserInitial = () => {
    if (!user) return 'U';
    
    // Try to get first letter from firstName, fullName, or email
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }
    if (user.emailAddresses?.[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  const activityItems = [
    { id: "explorer", icon: FileText, label: "Explorer" },
    { id: "social-connectors", icon: Contact, label: "Social Media Connectors" },
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
                  <button
                    className={`w-11 h-11 rounded-none hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer ${
                      activePanel === 'profile'
                        ? 'bg-[#2d2d2d] border-l-2 border-[#007acc]'
                        : 'border-l-2 border-transparent'
                    }`}
                    onClick={() => {
                      openSpecialTab('user-profile', 'User Profile', 'user-profile');
                      onPanelChange('explorer'); // Reset to explorer panel
                    }}
                    title="User Profile"
                  >
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium ${
                        activePanel === 'profile'
                          ? 'border-[#cccccc] text-[#cccccc]'
                          : 'border-[#858585] text-[#858585]'
                      }`}
                    >
                      {getUserInitial()}
                    </div>
                  </button>
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
                w-9 h-9 rounded-none hover:bg-[#2d2d2d] relative
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