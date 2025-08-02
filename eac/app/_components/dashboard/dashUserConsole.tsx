// User Console Panel Component
// Displays user information in the sidebar panel instead of a tab

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs';
import { useConvexAuth } from "convex/react";
import {
    AtSign,
    Calendar,
    Copy,
    LogIn,
    Mail,
    Shield,
    User
} from "lucide-react";

export function DashUserConsole() {
  const { user, isLoaded } = useUser();
  const { isAuthenticated } = useConvexAuth();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Show sign-in prompt when not authenticated
  if (!isAuthenticated) {
    return (
      <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
        <div className="p-2">
          <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
            <span>User Console</span>
          </div>

          {/* Sign In Section */}
          <div className="space-y-1 mt-2">
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <div className="p-4 text-center">
                <div className="w-12 h-12 bg-[#007acc]/10 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <User className="w-6 h-6 text-[#007acc]" />
                </div>
                
                <h3 className="text-[#cccccc] font-medium text-sm mb-2">Sign in to continue</h3>
                <p className="text-[#858585] text-xs mb-4 leading-relaxed">
                  Access your personalized dashboard and account settings.
                </p>

                <SignInButton mode="modal">
                  <button className="w-full bg-[#007acc] hover:bg-[#005a9e] text-white border-0 text-xs py-2 px-3 rounded flex items-center justify-center gap-2">
                    <LogIn className="w-3 h-3" />
                    Sign In
                  </button>
                </SignInButton>

                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-center gap-2 text-[10px] text-[#858585]">
                    <Shield className="w-2.5 h-2.5" />
                    <span>Secure authentication</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
        <div className="p-2">
          <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
            <span>User Console</span>
          </div>

          <div className="space-y-1 mt-2">
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <div className="p-4 text-center">
                <div className="text-[#858585] text-xs">Loading user information...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User not found
  if (!user) {
    return (
      <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
        <div className="p-2">
          <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
            <span>User Console</span>
          </div>

          <div className="space-y-1 mt-2">
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <div className="p-4 text-center">
                <div className="text-[#858585] text-xs">User information not available.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get user initial for avatar
  const getUserInitial = () => {
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

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      <div className="p-2">
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>User Console</span>
        </div>

        {/* User Console Sections */}
        <div className="space-y-1 mt-2">
          
          {/* User Profile Section */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <div className="p-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#007acc] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {getUserInitial()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-[#cccccc] truncate">
                    {user.fullName || "User"}
                  </div>
                  <div className="text-[10px] text-[#858585] truncate">
                    {user.emailAddresses[0]?.emailAddress}
                  </div>
                </div>
                <Badge 
                  variant={user.emailAddresses[0]?.verification?.status === "verified" ? "default" : "secondary"}
                  className="text-[10px] h-4 px-1"
                >
                  {user.emailAddresses[0]?.verification?.status === "verified" ? "✓" : "!"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Account Info Section */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <div className="p-2 space-y-2">
              <div className="text-[10px] text-[#858585] uppercase font-medium">Account Details</div>
              
              {/* Email */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <Mail className="w-3 h-3 text-[#858585]" />
                  <span className="text-[10px] text-[#858585] truncate">
                    {user.emailAddresses[0]?.emailAddress}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(user.emailAddresses[0]?.emailAddress || "")}
                  className="h-4 w-4 p-0 text-[#858585] hover:text-[#cccccc]"
                >
                  <Copy className="w-2.5 h-2.5" />
                </Button>
              </div>

              {/* Username if available */}
              {user.username && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <AtSign className="w-3 h-3 text-[#858585]" />
                    <span className="text-[10px] text-[#858585] truncate font-mono">
                      {user.username}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(user.username!)}
                    className="h-4 w-4 p-0 text-[#858585] hover:text-[#cccccc]"
                  >
                    <Copy className="w-2.5 h-2.5" />
                  </Button>
                </div>
              )}

              {/* Member Since */}
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#858585]" />
                <span className="text-[10px] text-[#858585]">
                  Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                  }) : "Unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <div className="p-2 space-y-2">
              <div className="text-[10px] text-[#858585] uppercase font-medium">Quick Actions</div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#858585]">Edit Profile</span>
                <button
                  onClick={() => {
                    console.log("Edit profile clicked");
                  }}
                  className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#858585]">Account Settings</span>
                <button
                  onClick={() => {
                    console.log("Account settings clicked");
                  }}
                  className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                >
                  Settings
                </button>
              </div>
            </div>
          </div>

          {/* Sign Out Section */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <div className="p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#858585]">Sign Out</span>
                <SignOutButton>
                  <button className="text-xs text-red-400 hover:text-red-300 underline-offset-2 hover:underline">
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
