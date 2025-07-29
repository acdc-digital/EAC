// User Profile Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/user-profile/UserProfile.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { Calendar, Copy, LogOut, Mail, Settings, User } from "lucide-react";

export function UserProfile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="p-6 bg-[#1a1a1a] text-[#cccccc] min-h-full">
        <div className="text-[#858585]">Loading user profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 bg-[#1a1a1a] text-[#cccccc] min-h-full">
        <div className="text-[#858585]">Please sign in to view your profile.</div>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-6 bg-[#1a1a1a] text-[#cccccc] min-h-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-[#007acc] rounded-full flex items-center justify-center text-white text-2xl font-semibold">
          {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress.charAt(0) || "U"}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#cccccc]">
            {user.fullName || "User Profile"}
          </h1>
          <p className="text-[#858585]">
            {user.emailAddresses[0]?.emailAddress}
          </p>
        </div>
      </div>

      <Separator className="bg-[#2d2d2d]" />

      {/* Profile Information */}
      <Card className="bg-[#252526] border-[#454545]">
        <CardHeader>
          <CardTitle className="text-[#cccccc] flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-[#858585]">
            Your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#cccccc]">Full Name</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[#858585]">
                  {user.fullName || "Not provided"}
                </span>
                {user.fullName && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(user.fullName!)}
                    className="h-6 w-6 p-0 text-[#858585] hover:text-[#cccccc]"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#cccccc]">Username</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[#858585]">
                  {user.username || "Not set"}
                </span>
                {user.username && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(user.username!)}
                    className="h-6 w-6 p-0 text-[#858585] hover:text-[#cccccc]"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#cccccc]">Primary Email</label>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-[#858585]" />
                <span className="text-[#858585]">
                  {user.emailAddresses[0]?.emailAddress}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(user.emailAddresses[0]?.emailAddress || "")}
                  className="h-6 w-6 p-0 text-[#858585] hover:text-[#cccccc]"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="mt-1">
                <Badge 
                  variant={user.emailAddresses[0]?.verification?.status === "verified" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {user.emailAddresses[0]?.verification?.status === "verified" ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#cccccc]">Account Created</label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-[#858585]" />
                <span className="text-[#858585]">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card className="bg-[#252526] border-[#454545]">
        <CardHeader>
          <CardTitle className="text-[#cccccc] flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Account Management
          </CardTitle>
          <CardDescription className="text-[#858585]">
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="justify-start bg-[#1a1a1a] border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
              onClick={() => {
                // This would typically open Clerk's user profile modal
                // For now, we'll just log a message
                console.log("Edit profile clicked");
              }}
            >
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>

            <Button
              variant="outline"
              className="justify-start bg-[#1a1a1a] border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
              onClick={() => {
                // This would typically open Clerk's account settings
                console.log("Account settings clicked");
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Account Settings
            </Button>

            <Separator className="bg-[#2d2d2d]" />

            <SignOutButton>
              <Button
                variant="outline"
                className="justify-start bg-[#1a1a1a] border-[#454545] text-red-400 hover:bg-red-900/20 hover:border-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </SignOutButton>
          </div>
        </CardContent>
      </Card>

      {/* Additional Email Addresses */}
      {user.emailAddresses.length > 1 && (
        <Card className="bg-[#252526] border-[#454545]">
          <CardHeader>
            <CardTitle className="text-[#cccccc]">Email Addresses</CardTitle>
            <CardDescription className="text-[#858585]">
              All email addresses associated with your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.emailAddresses.map((email, index) => (
                <div key={email.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#858585]" />
                    <span className="text-[#858585]">{email.emailAddress}</span>
                    {index === 0 && (
                      <Badge variant="outline" className="text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={email.verification?.status === "verified" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {email.verification?.status === "verified" ? "Verified" : "Unverified"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(email.emailAddress)}
                      className="h-6 w-6 p-0 text-[#858585] hover:text-[#cccccc]"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
