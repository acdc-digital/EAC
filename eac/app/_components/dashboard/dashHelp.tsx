// Help Panel Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashboard/dashHelp.tsx

"use client";

import { Book, ExternalLink, Info, Keyboard, MessageSquare } from "lucide-react";

export function DashHelp() {
  const helpSections = [
    {
      title: "Getting Started",
      icon: Book,
      items: [
        "Creating your first project",
        "Setting up social media connections", 
        "Using the file editor",
        "Managing your content calendar"
      ]
    },
    {
      title: "Keyboard Shortcuts",
      icon: Keyboard,
      items: [
        "Ctrl+N - New file",
        "Ctrl+S - Save file",
        "Ctrl+W - Close tab",
        "Ctrl+Shift+P - Command palette"
      ]
    },
    {
      title: "Support",
      icon: MessageSquare,
      items: [
        "Contact support team",
        "Submit feedback",
        "Report a bug",
        "Request a feature"
      ]
    }
  ];

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      <div className="p-2">
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>Help & Support</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {/* Welcome Section */}
        <div className="bg-[#2d2d2d] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-[#007acc]" />
            <h3 className="text-sm font-medium">Welcome to EAC Dashboard</h3>
          </div>
          <p className="text-xs text-[#858585] leading-relaxed">
            Your all-in-one solution for social media management, project tracking, and financial analytics. 
            Get started by exploring the panels and creating your first project.
          </p>
        </div>

        {/* Help Sections */}
        {helpSections.map((section, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <section.icon className="w-4 h-4 text-[#007acc]" />
              <h4 className="text-sm font-medium">{section.title}</h4>
            </div>
            <div className="space-y-1 ml-6">
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="text-xs text-[#858585] hover:text-[#cccccc] cursor-pointer p-1 rounded hover:bg-[#2d2d2d] transition-colors"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Documentation Link */}
        <div className="border-t border-[#2d2d2d] pt-4 mt-6">
          <button className="flex items-center gap-2 text-xs text-[#007acc] hover:text-[#4fc3f7] transition-colors">
            <ExternalLink className="w-3 h-3" />
            View Full Documentation
          </button>
        </div>

        {/* Version Info */}
        <div className="text-center text-xs text-[#454545] mt-6">
          EAC Dashboard v1.0.0
        </div>
      </div>
    </div>
  );
}
