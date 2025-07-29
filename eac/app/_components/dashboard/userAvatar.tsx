"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { Authenticated, Unauthenticated } from "convex/react";
import { LogIn, User } from "lucide-react";

export function UserAvatar() {
  const { user } = useUser();

  return (
    <div className="flex flex-col items-center">
      <Unauthenticated>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-11 h-11 rounded-none hover:bg-[#2d2d2d] border-l-2 border-transparent"
              title="Sign In"
            >
              <User className="w-5 h-5 text-[#858585]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            side="right" 
            className="w-48 bg-[#252526] border border-[#454545] ml-2"
          >
            <DropdownMenuLabel className="text-[#cccccc] text-xs">
              Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#454545]" />
            <DropdownMenuItem asChild>
              <SignInButton mode="modal">
                <div className="flex items-center gap-2 text-xs text-[#cccccc] hover:bg-[#2a2d2e] w-full cursor-pointer">
                  <LogIn className="w-3 h-3" />
                  Sign In
                </div>
              </SignInButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Unauthenticated>
      
      <Authenticated>
        <div className="flex flex-col items-center">
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
          {user && (
            <span className="text-[8px] text-[#858585] mt-1 max-w-[40px] truncate">
              {user.firstName || user.username || 'User'}
            </span>
          )}
        </div>
      </Authenticated>
    </div>
  );
}
