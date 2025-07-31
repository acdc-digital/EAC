"use client";

import { SignInButton } from '@clerk/nextjs';
import { LogIn, Shield, User } from 'lucide-react';

export function SignInTab() {
  return (
    <div className="h-full w-full bg-[#1e1e1e] flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-md bg-[#3c3c3c] border-2 border-[#565656] rounded-lg p-8 shadow-2xl ring-1 ring-white/50">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#0e639c] rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#ffffff] mb-2">
            Welcome to EAC Dashboard
          </h1>
          <p className="text-[#969696]">
            Sign in to access your projects, social media management, and financial tools.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-[#ffffff] text-sm">
            <User className="w-4 h-4 text-[#0e639c]" />
            <span>Secure authentication with Clerk</span>
          </div>
          <div className="flex items-center space-x-3 text-[#ffffff] text-sm">
            <LogIn className="w-4 h-4 text-[#0e639c]" />
            <span>Access your personalized dashboard</span>
          </div>
        </div>

        <div className="mt-8">
          <SignInButton mode="modal">
            <button className="w-full bg-[#007acc] hover:bg-[#005a9e] text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
              <LogIn className="w-5 h-5" />
              <span>Sign In to Continue</span>
            </button>
          </SignInButton>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#858585]">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
