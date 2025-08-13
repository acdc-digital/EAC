"use client";

import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Calendar,
  Code2,
  Github,
  Laptop,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function WelcomeSignInCard() {
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  
  const features = [
    {
      icon: MessageSquare,
      title: "Cross-Platform Publishing",
      description: "One dashboard for X, LinkedIn, Reddit, Instagram & more",
      color: "from-[#007acc] to-[#0e639c]"
    },
    {
      icon: BarChart3,
      title: "Developer Analytics",
      description: "Track engagement, growth, and community metrics",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Code2,
      title: "API-First Design",
      description: "RESTful API with webhooks and custom integrations",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "AI optimizes for your audience's active hours",
      color: "from-orange-500 to-red-500"
    }
  ];

  const testimonials = [
    {
      text: "Cut my social media time by 80%. Now I can focus on shipping features instead of crafting tweets.",
      author: "@shipit_sam",
      role: "Full-Stack Developer",
      avatar: "S"
    },
    {
      text: "The GitHub integration alone is worth it. Auto-share releases and milestones? Game changer.",
      author: "@opensourcedeva",
      role: "OSS Maintainer",
      avatar: "O"
    },
    {
      text: "Finally, analytics that matter. Not just vanity metrics but actual community engagement.",
      author: "@indiehacker",
      role: "Solo Founder",
      avatar: "I"
    }
  ];

  const stats = [
    { icon: Users, value: "5K+", label: "Developers" },
    { icon: TrendingUp, value: "150M+", label: "Impressions" },
    { icon: Github, value: "10K+", label: "Repos Connected" }
  ];

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-full bg-black relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#007acc] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-[#0e639c] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-900/50 to-black" />
      </div>

      <div className="relative z-10 h-full flex items-start justify-start px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-12 xl:py-10 overflow-hidden">
        <div className="w-full max-w-none overflow-hidden h-full flex flex-col">
          
          {/* Hero Content - Left aligned and scalable */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-5 xl:space-y-6 w-full max-w-none flex-1 flex flex-col justify-center">
            {/* Logo and Tagline */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#007acc] to-[#0e639c] rounded-xl opacity-50" />
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-gradient-to-br from-[#007acc] to-[#0e639c] rounded-xl flex items-center justify-center">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white tracking-tight">EAC</h1>
                <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-zinc-400 font-medium">Effortless Audience Control</p>
              </div>
            </div>

            {/* Hero Content */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-5 xl:space-y-6 w-full">
              {/* Badges */}
              <div className="flex flex-wrap gap-1 sm:gap-1.5 lg:gap-2">
                <Badge className="bg-[#007acc]/10 text-[#007acc] border-[#007acc]/20 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs sm:text-sm">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  AI-Powered
                </Badge>
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs sm:text-sm">
                  <Code2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  Developer-First
                </Badge>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs sm:text-sm">
                  <Laptop className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  Creator Friendly
                </Badge>
              </div>
              
              {/* Main Headline */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                  Social Media on
                  <span className="block bg-gradient-to-r from-[#007acc] via-[#0e639c] to-[#007acc] bg-clip-text text-transparent">
                    Autopilot Mode
                  </span>
                </h2>
                
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-zinc-300 leading-relaxed font-light max-w-3xl">
                  The only social media manager built by developers, for developers and influencers. 
                  Ship code, not tweets. We'll handle the rest.
                </p>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 w-full max-w-6xl">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="group relative p-2 sm:p-2.5 lg:p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/80 transition-all duration-300 hover:scale-[1.02] hover:border-zinc-700"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <feature.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-white font-semibold text-xs sm:text-sm lg:text-base">{feature.title}</h3>
                        <p className="text-zinc-400 text-xs lg:text-sm leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-5 sm:gap-7 lg:gap-10 xl:gap-14 pt-2 sm:pt-3">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3">
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-zinc-500" />
                    <div className="flex items-baseline gap-1 sm:gap-2">
                      <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white">{stat.value}</span>
                      <span className="text-sm sm:text-base lg:text-lg xl:text-xl text-zinc-500">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
