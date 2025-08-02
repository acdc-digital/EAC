// Extensions Panel Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/dashboard/dashExtensions.tsx

"use client";

import { cn } from "@/lib/utils";
import { Download, Puzzle, Search, Star } from "lucide-react";
import { useState } from "react";

interface Extension {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  downloads: number;
  rating: number;
  isInstalled: boolean;
  category: 'productivity' | 'ai' | 'social' | 'development' | 'other';
}

// Mock extension data - this will be replaced with real data later
const mockExtensions: Extension[] = [
  {
    id: 'twitter-enhanced',
    name: 'Twitter Enhanced',
    description: 'Advanced Twitter integration with analytics and scheduling',
    author: 'EAC Team',
    version: '1.0.0',
    downloads: 1250,
    rating: 4.8,
    isInstalled: false,
    category: 'social'
  },
  {
    id: 'reddit-analytics',
    name: 'Reddit Analytics Pro',
    description: 'Deep Reddit analytics and content optimization tools',
    author: 'Community',
    version: '2.1.3',
    downloads: 892,
    rating: 4.6,
    isInstalled: false,
    category: 'social'
  },
  {
    id: 'ai-content-generator',
    name: 'AI Content Generator',
    description: 'Generate high-quality content using advanced AI models',
    author: 'AI Labs',
    version: '1.5.2',
    downloads: 2100,
    rating: 4.9,
    isInstalled: false,
    category: 'ai'
  }
];

export function DashExtensions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | Extension['category']>('all');

  const filteredExtensions = mockExtensions.filter(ext => {
    const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ext.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ext.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All', count: mockExtensions.length },
    { id: 'ai', label: 'AI', count: mockExtensions.filter(e => e.category === 'ai').length },
    { id: 'social', label: 'Social', count: mockExtensions.filter(e => e.category === 'social').length },
    { id: 'productivity', label: 'Productivity', count: mockExtensions.filter(e => e.category === 'productivity').length },
    { id: 'development', label: 'Development', count: mockExtensions.filter(e => e.category === 'development').length },
  ];

  const handleInstall = (extensionId: string) => {
    console.log(`Installing extension: ${extensionId}`);
    // TODO: Implement extension installation
  };

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      <div className="p-2">
        {/* Header */}
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>Extensions</span>
          <div className="flex items-center gap-1">
            <Puzzle className="w-3 h-3" />
            <span className="text-[#666]">{mockExtensions.length}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-2 mb-3">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[#858585]" />
          <input
            type="text"
            placeholder="Search extensions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2d2d2d] border border-[#454545] rounded text-xs px-7 py-1.5 placeholder-[#858585] focus:outline-none focus:border-[#007acc]"
          />
        </div>

        {/* Categories */}
        <div className="space-y-1 mb-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={cn(
                "w-full flex items-center justify-between px-2 py-1 text-xs rounded transition-colors",
                selectedCategory === category.id
                  ? "bg-[#094771] text-[#cccccc]"
                  : "hover:bg-[#2d2d2d] text-[#b3b3b3]"
              )}
            >
              <span>{category.label}</span>
              <span className="text-[#858585]">{category.count}</span>
            </button>
          ))}
        </div>

        {/* Extensions List */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-[#b3b3b3] px-2 py-1 border-b border-[#2d2d2d]">
            Available Extensions
          </div>
          
          {filteredExtensions.length === 0 ? (
            <div className="text-center py-4">
              <Puzzle className="w-8 h-8 text-[#858585] mx-auto mb-2" />
              <div className="text-xs text-[#858585]">No extensions found</div>
            </div>
          ) : (
            filteredExtensions.map((extension) => (
              <div
                key={extension.id}
                className="bg-[#1e1e1e] border border-[#2d2d2d] rounded p-2 space-y-2"
              >
                {/* Extension Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-[#cccccc] truncate">
                        {extension.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 text-[#ffcc02]" />
                        <span className="text-[10px] text-[#858585]">{extension.rating}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-[#b3b3b3] mb-1">
                      by {extension.author} • v{extension.version}
                    </div>
                    <div className="text-[10px] text-[#858585] leading-relaxed">
                      {extension.description}
                    </div>
                  </div>
                </div>

                {/* Extension Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-[#2d2d2d]">
                  <div className="flex items-center gap-3 text-[10px] text-[#858585]">
                    <div className="flex items-center gap-1">
                      <Download className="w-2.5 h-2.5" />
                      <span>{extension.downloads.toLocaleString()}</span>
                    </div>
                    <span className="px-1.5 py-0.5 bg-[#2d2d2d] rounded text-[9px] uppercase">
                      {extension.category}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleInstall(extension.id)}
                    disabled={extension.isInstalled}
                    className={cn(
                      "px-2 py-1 text-[10px] rounded transition-colors",
                      extension.isInstalled
                        ? "bg-[#2d2d2d] text-[#858585] cursor-default"
                        : "bg-[#007acc] hover:bg-[#106ebe] text-white"
                    )}
                  >
                    {extension.isInstalled ? 'Installed' : 'Install'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#2d2d2d]">
          <div className="text-[10px] text-[#858585] text-center">
            Extensions marketplace coming soon
          </div>
          <div className="text-[10px] text-[#858585] text-center mt-1">
            Create your own extensions with the EAC SDK
          </div>
        </div>
      </div>
    </div>
  );
}
