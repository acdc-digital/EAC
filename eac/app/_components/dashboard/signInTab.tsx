"use client";

import { SignInButton } from '@clerk/nextjs';
import { ArrowRight, Lock, LogIn, Shield, Sparkles, User } from 'lucide-react';
import { useState } from 'react';

export function SignInTab() {
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    {
      icon: User,
      title: "Secure Authentication",
      description: "Protected by Clerk's enterprise-grade security"
    },
    {
      icon: Sparkles,
      title: "Personalized Dashboard",
      description: "Access your projects and tools in one place"
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your data is encrypted and secure"
    }
  ];

  return (
    <div className="h-full w-full bg-gradient-to-br from-[#1e1e1e] to-[#2d2d2d] flex items-center justify-center overflow-hidden relative p-6">
      {/* Animated background pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Main content - Better sizing for dashboard */}
      <div className="w-full max-w-lg relative z-10">
        {/* Card with glassmorphism effect */}
        <div className="bg-[#3c3c3c]/90 backdrop-blur-lg border border-[#565656]/50 rounded-xl p-6 shadow-2xl transition-shadow duration-300">
          {/* Logo and header */}
          <div className="text-center mb-6">
            <div className="relative inline-flex mb-4">
              <div className="relative w-16 h-16 bg-gradient-to-br from-[#0e639c] to-[#007acc] rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:rotate-3">
                <Shield className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#c9c9c9]">
              Welcome to EAC Dashboard
            </h1>
            <p className="text-[#c9c9c9] text-sm leading-relaxed">
              Your command center for projects, social media, and financial tools.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-[#0e639c]/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-[#0e639c]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium text-sm mb-0.5">
                    {feature.title}
                  </h3>
                  <p className="text-[#999999] text-xs leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Sign in button */}
          <SignInButton 
            mode="modal"
          >
            <button 
              onClick={() => setIsLoading(true)}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#007acc] to-[#0e639c] hover:from-[#005a9e] hover:to-[#0a4d7a] text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden active:scale-[0.98]"
              aria-label="Sign in to EAC Dashboard"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                  <span className="relative z-10">Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10">Sign In to Continue</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 relative z-10" />
                </>
              )}
            </button>
          </SignInButton>

          {/* Footer */}
          <div className="mt-6 space-y-3">
            {/* Terms and privacy */}
            <p className="text-xs text-[#999999] text-center">
              By signing in, you agree to our{' '}
              <a 
                href="/terms" 
                className="text-[#007acc] hover:text-[#005a9e] hover:underline underline-offset-2 transition-all duration-200"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a 
                href="/privacy" 
                className="text-[#007acc] hover:text-[#005a9e] hover:underline underline-offset-2 transition-all duration-200"
              >
                Privacy Policy
              </a>
            </p>

            {/* Alternative sign in */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#565656]/30" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-[#3c3c3c]/90 text-[#999999] rounded-full">
                  New to EAC?
                </span>
              </div>
            </div>

            <SignInButton mode="modal">
              <button className="w-full text-[#007acc] hover:text-[#005a9e] text-sm font-medium transition-all duration-200 hover:scale-[1.02] transform py-2 hover:bg-[#007acc]/5 rounded-lg">
                Create an account
              </button>
            </SignInButton>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-[#666666]">
          <div className="flex items-center space-x-1.5 hover:text-[#888888] transition-colors duration-200 cursor-pointer group">
            <Lock className="w-3 h-3 group-hover:text-[#007acc] transition-colors" />
            <span>SSL Secured</span>
          </div>
          <div className="w-px h-3 bg-[#565656]/30" />
          <div className="flex items-center space-x-1.5 hover:text-[#888888] transition-colors duration-200 cursor-pointer group">
            <Shield className="w-3 h-3 group-hover:text-[#007acc] transition-colors" />
            <span>GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
