// Subscription Plans Component
// Displays subscription pricing and plan details

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check,
  CreditCard,
  DollarSign,
  Globe,
  Headphones,
  Shield,
  Star,
  Zap
} from "lucide-react";

export function SubscriptionPlans() {
  const plans = [
    {
      name: "Free",
      price: 0,
      period: "forever",
      description: "IDE-style platform for developers to quickly jump into media content strategy",
      popular: false,
      features: [
        "Unlimited manual posts",
        "Post scheduling",
        "Basic agent team (brand & content creation)",
        "VS Code-inspired interface",
        "Project management tools",
        "Community support",
        "Basic templates",
        "Manual content creation"
      ],
      limitations: [
        "No premium extensions",
        "Manual workflow only",
        "Basic agent capabilities"
      ]
    },
    {
      name: "Extension Access",
      price: 5,
      period: "month",
      description: "Unlock powerful extensions with pay-per-use pricing",
      popular: true,
      features: [
        "Everything in Free",
        "Access to all extensions",
        "Logo generator (pay-per-use)",
        "Research assistant (pay-per-use)",
        "Content scheduler agent (pay-per-use)",
        "Campaign director (pay-per-use)",
        "Carousel maker (pay-per-use)",
        "Slideshow creator (pay-per-use)",
        "Priority support"
      ],
      limitations: [
        "Extensions billed per usage",
        "Costs vary by extension complexity"
      ]
    },
    {
      name: "Power User",
      price: 50,
      period: "month",
      description: "Everything included - perfect for power users who need all extensions",
      popular: false,
      features: [
        "Everything in Extension Access",
        "Unlimited use of all extensions",
        "Logo generator (unlimited)",
        "Research assistant (unlimited)",
        "Content scheduler agent (unlimited)",
        "Campaign director (unlimited)",
        "Carousel maker (unlimited)",
        "Slideshow creator (unlimited)",
        "Advanced automation",
        "Priority agent queue",
        "Advanced analytics",
        "Custom agent configurations"
      ],
      limitations: []
    }
  ];

  const handleSubscribe = (planName: string, price: number) => {
    console.log(`Subscribe to ${planName} plan at $${price}/month`);
    // TODO: Integrate with Stripe or payment provider
    alert(`Subscribing to ${planName} plan - Payment integration coming soon!`);
  };

  return (
    <div className="min-h-full bg-[#1a1a1a] text-[#cccccc] p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <DollarSign className="w-8 h-8 text-[#f1c40f]" />
            <h1 className="text-3xl font-bold text-[#cccccc]">Subscription Plans</h1>
          </div>
          <p className="text-[#858585] text-lg max-w-2xl mx-auto">
            Agentic social media management platform. From brand creation to content publishing,
            automate your entire media strategy with our agent-powered tools and VS Code-inspired interface.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative bg-[#2d2d2d] border transition-all duration-200 hover:border-[#007acc] ${
                plan.popular 
                  ? 'border-[#f1c40f] shadow-lg scale-105' 
                  : 'border-[#454545]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#f1c40f] text-black font-semibold px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-[#cccccc] text-xl mb-2">
                  {plan.name}
                </CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-[#cccccc]">
                    ${plan.price}
                  </span>
                  <span className="text-[#858585]">/{plan.period}</span>
                </div>
                <p className="text-sm text-[#858585] mt-2">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div>
                  <h4 className="font-semibold text-[#cccccc] mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    What's included:
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-[#cccccc]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations (if any) */}
                {plan.limitations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-[#858585] mb-2 text-sm">
                      Limitations:
                    </h4>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, idx) => (
                        <li key={idx} className="text-xs text-[#858585]">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={() => handleSubscribe(plan.name, plan.price)}
                  className={`w-full mt-6 ${
                    plan.popular
                      ? 'bg-[#f1c40f] hover:bg-[#e1b404] text-black font-semibold'
                      : plan.price === 0 
                        ? 'bg-[#4ec9b0] hover:bg-[#3da58a] text-black font-semibold'
                        : 'bg-[#007acc] hover:bg-[#005a9e] text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {plan.price === 0 ? 'Get Started Free' : `Choose ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Teams & Enterprise Section */}
        <Card className="bg-[#2d2d2d] border-[#f1c40f] mb-8">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#cccccc] mb-4 flex items-center justify-center gap-2">
                <Shield className="w-6 h-6 text-[#f1c40f]" />
                Teams & Enterprise
              </h2>
              <p className="text-[#858585] mb-6 max-w-3xl mx-auto">
                Need custom pricing for your team or enterprise? We offer special rates for larger organizations,
                custom integrations, white-label solutions, and dedicated support.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-left">
                  <h3 className="font-semibold text-[#cccccc] mb-3">Enterprise Features:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-[#cccccc]">Custom agent development</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-[#cccccc]">White-label platform</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-[#cccccc]">Dedicated infrastructure</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-[#cccccc]">24/7 priority support</span>
                    </li>
                  </ul>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-[#cccccc] mb-3">Extension Development:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#f1c40f]" />
                      <span className="text-[#cccccc]">Recommend custom extensions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#f1c40f]" />
                      <span className="text-[#cccccc]">We'll build them for you</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#f1c40f]" />
                      <span className="text-[#cccccc]">Community-driven development</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#f1c40f]" />
                      <span className="text-[#cccccc]">API integration support</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Button className="bg-[#f1c40f] hover:bg-[#e1b404] text-black font-semibold px-8 py-3">
                <Headphones className="w-4 h-4 mr-2" />
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#2d2d2d] border-[#454545]">
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 text-[#4ec9b0] mx-auto mb-2" />
              <h3 className="font-semibold text-[#cccccc] mb-1">Agent-Powered</h3>
              <p className="text-xs text-[#858585]">
                AI agents handle your entire content workflow
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#2d2d2d] border-[#454545]">
            <CardContent className="p-4 text-center">
              <Globe className="w-8 h-8 text-[#dcdcaa] mx-auto mb-2" />
              <h3 className="font-semibold text-[#cccccc] mb-1">IDE Experience</h3>
              <p className="text-xs text-[#858585]">
                Code your media strategy like software
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#2d2d2d] border-[#454545]">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-[#f1c40f] mx-auto mb-2" />
              <h3 className="font-semibold text-[#cccccc] mb-1">Extensions</h3>
              <p className="text-xs text-[#858585]">
                Modular tools that scale with your needs
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#2d2d2d] border-[#454545]">
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 text-[#007acc] mx-auto mb-2" />
              <h3 className="font-semibold text-[#cccccc] mb-1">Brand to Publish</h3>
              <p className="text-xs text-[#858585]">
                Complete pipeline from concept to content
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ or Additional Info */}
        <Card className="bg-[#2d2d2d] border-[#454545]">
          <CardHeader>
            <CardTitle className="text-[#cccccc] flex items-center gap-2">
              <Headphones className="w-5 h-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="space-y-3 text-[#858585]">
                <div>
                  <strong className="text-[#cccccc]">How do extension costs work?</strong>
                  <br />
                  Extensions are priced based on their computational cost and complexity. You only pay when you use them, 
                  making it affordable to experiment with different tools.
                </div>
                <div>
                  <strong className="text-[#cccccc]">Can I recommend new extensions?</strong>
                  <br />
                  Absolutely! Submit your extension ideas and we'll work with our community to develop them. 
                  Popular requests get priority development.
                </div>
                <div>
                  <strong className="text-[#cccccc]">What makes this different from other social media tools?</strong>
                  <br />
                  Our IDE-style interface lets you "code" your media strategy. Agent-powered automation handles the execution 
                  while you focus on strategy and creativity.
                </div>
                <div>
                  <strong className="text-[#cccccc]">Is there a learning curve?</strong>
                  <br />
                  If you're familiar with VS Code or development tools, you'll feel right at home. 
                  Our agent team helps non-technical users get started quickly.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
