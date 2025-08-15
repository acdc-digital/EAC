// Simple Logo Generator Tab for testing
// /Users/matthewsimon/Projects/eac/eac/app/_components/logo-generator/LogoGeneratorTabSimple.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function LogoGeneratorTabSimple() {
  return (
    <div className="h-full bg-[#1e1e1e] text-[#cccccc] flex flex-col">
      {/* Header */}
      <div className="border-b border-[#2d2d2d] p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ffcc02]/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-[#ffcc02]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#cccccc]">Logo Generator</h1>
            <p className="text-sm text-[#858585]">AI-powered logo creation</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-[#454545] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-12 h-12 text-[#858585]" />
          </div>
          <p className="text-[#858585] text-sm">Logo Generator loaded successfully!</p>
          <Button className="mt-4 bg-[#ffcc02] hover:bg-[#e6b800] text-black font-medium">
            Test Button
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LogoGeneratorTabSimple;
