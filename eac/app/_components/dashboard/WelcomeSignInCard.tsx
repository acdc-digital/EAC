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
    <div className="h-full bg-black relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#007acc] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-[#0e639c] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-900/50 to-black" />
      </div>

      <div className="relative z-10 h-full flex items-start justify-start px-6 py-8 md:px-10 md:py-12 overflow-hidden">
        <div className="w-full max-w-5xl overflow-hidden">
          
          {/* Hero Content - Now left aligned */}
          <div className="space-y-4 max-w-4xl">
            {/* Logo and Tagline */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#007acc] to-[#0e639c] rounded-xl blur-lg opacity-50" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-[#007acc] to-[#0e639c] rounded-xl flex items-center justify-center shadow-2xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">EAC</h1>
                <p className="text-sm text-zinc-400 font-medium">Effortless Audience Control</p>
              </div>
            </div>

            {/* Hero Content */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-[#007acc]/10 text-[#007acc] border-[#007acc]/20 backdrop-blur-sm px-2.5 py-0.5">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered
                </Badge>
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 backdrop-blur-sm px-2.5 py-0.5">
                  <Code2 className="w-3 h-3 mr-1" />
                  Developer-First
                </Badge>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 backdrop-blur-sm px-2.5 py-0.5">
                  <Laptop className="w-3 h-3 mr-1" />
                  Creator Friendly
                </Badge>
              </div>
              
              {/* Main Headline */}
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight">
                  Social Media on
                  <span className="block bg-gradient-to-r from-[#007acc] via-[#0e639c] to-[#007acc] bg-clip-text text-transparent">
                    Autopilot Mode
                  </span>
                </h2>
                
                <p className="text-lg text-zinc-300 leading-relaxed font-light">
                  The only social media manager built by developers, for developers and influencers. 
                  Ship code, not tweets. We'll handle the rest.
                </p>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="group relative p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/80 transition-all duration-300 hover:scale-[1.02] hover:border-zinc-700"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <feature.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-white font-semibold text-sm">{feature.title}</h3>
                        <p className="text-zinc-400 text-xs leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-12 pt-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <stat.icon className="w-6 h-6 text-zinc-500" />
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">{stat.value}</span>
                      <span className="text-lg text-zinc-500">{stat.label}</span>
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
