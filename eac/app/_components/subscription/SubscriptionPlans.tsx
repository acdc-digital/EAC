// Subscription Plans Component
// Displays subscription pricing and plan details aligned with EAC's strategic vision

"use client";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  DollarSign,
  Shield,
  Sparkles,
  Users,
  Zap
} from "lucide-react";
import { useState } from "react";

export function SubscriptionPlans() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['plans']));
  
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      badge: "Start Building",
      targetAudience: "App Builders & Developers",
      features: [
        "VS Code-inspired IDE interface",
        "Unlimited manual posts & scheduling",
        "Core agent team for brand building",
        "Onboarding agent & brand knowledge base",
        "Basic content creation tools",
        "Project management workspace",
        "Community support"
      ],
      highlighted: false,
    },
    {
      name: "Pro",
      price: { monthly: 5, yearly: 50 },
      badge: "Most Popular",
      targetAudience: "Growing Creators & Influencers",
      features: [
        "Everything in Free",
        "All extensions unlocked",
        "Logo generator extension",
        "Research assistant agent",
        "Content scheduler agent",
        "Campaign director",
        "Platform-specific tools",
        "Pay only $0.003-0.03 per extension use",
        "Priority support"
      ],
      highlighted: true,
    },
    {
      name: "Power",
      price: { monthly: 20, yearly: 200 },
      badge: "Best Value",
      targetAudience: "Power Users & Small Teams",
      features: [
        "Everything in Pro",
        "Unlimited extension usage",
        "No pay-per-use fees",
        "Advanced analytics (coming soon)",
        "API access",
        "Custom workflow automation",
        "Priority feature requests",
        "Dedicated support channel",
        "Beta features early access"
      ],
      highlighted: false,
    },
  ];

  const extensionPricing = [
    { name: "Logo Generator", tokens: "500 tokens avg", cost: "~$0.03/use" },
    { name: "Content Scheduler", tokens: "200 tokens avg", cost: "~$0.005/use" },
    { name: "Research Assistant", tokens: "400 tokens avg", cost: "~$0.01/use" },
    { name: "Campaign Director", tokens: "300 tokens avg", cost: "~$0.008/use" }
  ];

  const handleSubscribe = (planName: string, price: number) => {
    console.log(`Subscribe to ${planName} plan at $${price}/month`);
    alert(`Subscribing to ${planName} plan - Payment integration coming soon!`);
  };

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      <div className="p-2">
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>Your Marketing Co-Founder</span>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center gap-2 px-2 py-2 text-xs">
          <span className={cn(
            "text-xs transition-colors",
            billingCycle === "monthly" ? "text-[#cccccc]" : "text-[#858585]"
          )}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className="relative inline-flex h-4 w-8 items-center rounded-full bg-[#2d2d2d] transition-colors focus:outline-none"
            aria-label={`Switch to ${billingCycle === "monthly" ? "yearly" : "monthly"} billing`}
            title={`Switch to ${billingCycle === "monthly" ? "yearly" : "monthly"} billing`}
          >
            <span
              className={cn(
                "inline-block h-3 w-3 transform rounded-full bg-[#007acc] transition-transform",
                billingCycle === "yearly" ? "translate-x-4" : "translate-x-0.5"
              )}
            />
          </button>
          <span className={cn(
            "text-xs transition-colors",
            billingCycle === "yearly" ? "text-[#cccccc]" : "text-[#858585]"
          )}>
            Yearly
            {billingCycle === "yearly" && <span className="ml-1 text-green-400">Save 17%</span>}
          </span>
        </div>

        {/* Plans Section */}
        <div className="space-y-1 mt-2">
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <button
              onClick={() => toggleSection('plans')}
              className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
            >
              {expandedSections.has('plans') ? 
                <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
              }
              <DollarSign className="w-3.5 h-3.5 text-[#858585]" />
              <span className="text-xs font-medium flex-1 text-left">Subscription Plans</span>
            </button>
            
            {expandedSections.has('plans') && (
              <div className="px-2 pb-2 space-y-2">
                <Separator className="bg-[#2d2d2d]" />
                
                {plans.map((plan, index) => (
                  <div key={plan.name} className={cn(
                    "rounded border p-2 text-xs",
                    plan.highlighted 
                      ? "border-[#007acc] bg-[#1e2a37]" 
                      : "border-[#2d2d2d] bg-[#1a1a1a]"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#cccccc]">{plan.name}</span>
                        {plan.highlighted && (
                          <span className="text-[10px] bg-[#007acc] text-white px-1 py-0.5 rounded">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-[#cccccc]">
                          ${plan.price[billingCycle]}
                        </span>
                        <span className="text-[10px] text-[#858585]">
                          /{billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                        {plan.name === "Pro" && (
                          <span className="text-[10px] text-[#858585] ml-1">+ usage</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-[10px] text-[#858585] mb-2 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {plan.targetAudience}
                    </div>
                    
                    <div className="space-y-0.5 mb-2">
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-1 text-[10px]">
                          <Check className="w-3 h-3 text-green-400 shrink-0 mt-0.5" />
                          <span className="text-[#cccccc]">{feature}</span>
                        </div>
                      ))}
                      {plan.features.length > 4 && (
                        <div className="text-[10px] text-[#858585] pl-4">
                          +{plan.features.length - 4} more features
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleSubscribe(plan.name, plan.price[billingCycle])}
                      className={cn(
                        "w-full py-1 px-2 rounded text-[10px] font-medium transition-colors",
                        plan.highlighted
                          ? "bg-[#007acc] text-white hover:bg-[#005a9e]"
                          : "bg-[#2d2d2d] text-[#cccccc] hover:bg-[#3d3d3d]"
                      )}
                    >
                      {plan.name === "Free" ? "Start Free" : `Choose ${plan.name}`}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extension Pricing */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <button
              onClick={() => toggleSection('extensions')}
              className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
            >
              {expandedSections.has('extensions') ? 
                <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
              }
              <Sparkles className="w-3.5 h-3.5 text-[#858585]" />
              <span className="text-xs font-medium flex-1 text-left">Extension Pricing</span>
            </button>
            
            {expandedSections.has('extensions') && (
              <div className="px-2 pb-2 space-y-2">
                <Separator className="bg-[#2d2d2d]" />
                
                <div className="text-[10px] text-[#858585] p-1 bg-[#2d2d2d]/30 rounded">
                  💡 <strong>Transparent pricing:</strong> Pay only for AI costs (Claude Sonnet 3.5) + small margin. Most extensions cost $0.003-0.03 per use.
                </div>
                
                <div className="space-y-1">
                  {extensionPricing.map((ext, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px] p-1 bg-[#1a1a1a] rounded border border-[#2d2d2d]">
                      <div>
                        <span className="text-[#cccccc] font-medium">{ext.name}</span>
                        <span className="text-[#858585] ml-2">({ext.tokens})</span>
                      </div>
                      <span className="text-[#858585] font-mono">{ext.cost}</span>
                    </div>
                  ))}
                </div>
                
                <Separator className="bg-[#2d2d2d]" />
                
                <div className="text-[10px] text-[#858585] space-y-1">
                  <div className="font-medium text-[#cccccc] mb-1">Real Example (Pro User)</div>
                  <div className="flex justify-between">
                    <span>Base subscription:</span>
                    <span className="font-medium text-[#cccccc]">$5.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>100 extensions (avg $0.01):</span>
                    <span className="font-medium text-[#cccccc]">$1.00</span>
                  </div>
                  <div className="border-t border-[#2d2d2d] pt-1 mt-1 flex justify-between">
                    <span className="font-medium">Total monthly:</span>
                    <span className="font-medium text-green-400">$6.00</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <button
              onClick={() => toggleSection('features')}
              className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
            >
              {expandedSections.has('features') ? 
                <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
              }
              <Zap className="w-3.5 h-3.5 text-[#858585]" />
              <span className="text-xs font-medium flex-1 text-left">Key Features</span>
            </button>
            
            {expandedSections.has('features') && (
              <div className="px-2 pb-2 space-y-2">
                <Separator className="bg-[#2d2d2d]" />
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] p-1">
                    <Code2 className="w-3 h-3 text-blue-400" />
                    <span className="text-[#cccccc] font-medium">IDE-Style Interface</span>
                  </div>
                  <div className="text-[10px] text-[#858585] pl-5">
                    Familiar VS Code experience for developers
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] p-1">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-[#cccccc] font-medium">Agentic Automation</span>
                  </div>
                  <div className="text-[10px] text-[#858585] pl-5">
                    AI agents handle your entire workflow
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] p-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-[#cccccc] font-medium">Brand to Publish</span>
                  </div>
                  <div className="text-[10px] text-[#858585] pl-5">
                    Complete pipeline from strategy to content
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] p-1">
                    <Shield className="w-3 h-3 text-green-400" />
                    <span className="text-[#cccccc] font-medium">Transparent Pricing</span>
                  </div>
                  <div className="text-[10px] text-[#858585] pl-5">
                    Pay only for what you use, when you use it
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enterprise */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <button
              onClick={() => toggleSection('enterprise')}
              className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
            >
              {expandedSections.has('enterprise') ? 
                <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
              }
              <Shield className="w-3.5 h-3.5 text-[#858585]" />
              <span className="text-xs font-medium flex-1 text-left">Enterprise & Teams</span>
            </button>
            
            {expandedSections.has('enterprise') && (
              <div className="px-2 pb-2 space-y-2">
                <Separator className="bg-[#2d2d2d]" />
                
                <div className="text-[10px] text-[#858585] p-1 bg-[#2d2d2d]/30 rounded">
                  💡 <strong>Enterprise features on roadmap:</strong> Contact us to discuss team needs and help shape development.
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-[#858585]">📞 Contact Sales</span>
                    <button className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline">
                      Contact
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-[#858585]">🔧 Custom Extension</span>
                    <button className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline">
                      Request
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
