"use client";

import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Info, ArrowRight, Zap, Shield, Globe } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
};

const tiers = [
  {
    name: "Sandbox",
    price: "Free",
    period: "Forever",
    desc: "Perfect for testing and early development of your marketplace compliance flow.",
    features: [
      "100 Verifications / mo",
      "Standard Government APIs",
      "Email Support",
      "REST API Access",
      "Webhook Sandbox",
      "No Credit Card Required"
    ],
    cta: "Start Testing",
    popular: false,
    icon: Shield
  },
  {
    name: "Growth",
    price: "₹4,999",
    period: "/mo",
    desc: "For scaling marketplaces that need faster verifications and priority support.",
    features: [
      "5,000 Verifications / mo",
      "Priority Government APIs",
      "Chat & Email Support",
      "Advanced Webhooks",
      "Real-time Analytics",
      "Custom Branding"
    ],
    cta: "Scale Now",
    popular: true,
    icon: Zap
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "Pricing",
    desc: "For high-volume platforms requiring dedicated infrastructure and SLAs.",
    features: [
      "Unlimited Verifications",
      "Dedicated Infrastructure",
      "24/7 Phone Support",
      "SLA Guarantees",
      "On-premise Deployment",
      "Custom Legal Docs"
    ],
    cta: "Talk to Sales",
    popular: false,
    icon: Globe
  }
];

export default function PricingPage() {
  return (
    <PublicLayout>
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeIn}>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
              Predictable <span className="text-primary italic">Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Infrastructure that grows with you. Choose the plan that fits your current volume and scale as needed.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex flex-col p-8 rounded-xl border bg-card transition-all ${
                  tier.popular ? "border-primary shadow-2xl scale-105 z-10" : "border-border shadow-sm"
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-12 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                    Recommended
                  </div>
                )}
                
                <div className="mb-8">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${tier.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <tier.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{tier.desc}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tight">{tier.price}</span>
                    <span className="text-muted-foreground font-medium">{tier.period}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant={tier.popular ? "default" : "outline"}
                  className={`w-full h-12 text-sm font-bold transition-all ${tier.popular ? 'shadow-lg shadow-primary/30' : ''}`}
                  asChild
                >
                  <Link href="/login">{tier.cta}</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Question */}
      <section className="py-24 bg-muted/20 border-t">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center justify-center p-3 bg-card rounded-lg shadow-sm mb-6 border border-border">
            <Info className="w-5 h-5 text-primary mr-2" />
            <span className="text-sm font-medium">Need something simpler?</span>
            <button className="ml-2 text-sm text-primary hover:underline font-bold">Try Pay-as-you-go</button>
          </div>
          <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="grid gap-6 text-left mt-12">
            {[
              { q: "What counts as a verification?", a: "Each time you call an API to verify a GST, PAN, or Bank account, it counts as one verification unit." },
              { q: "Can I upgrade or downgrade anytime?", a: "Yes, you can change your plan at the beginning of any billing cycle directly from your dashboard." },
              { q: "Do you offer test credits?", a: "The Sandbox plan comes with 100 free verification units per month to test your integration logic." },
            ].map((faq) => (
              <div key={faq.q} className="p-6 rounded-lg bg-card border border-border">
                <h4 className="font-bold mb-2">{faq.q}</h4>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to start?</h2>
          <p className="text-muted-foreground mb-10">Get your API keys in 5 minutes.</p>
          <Link href="/login">
            <Button size="lg" className="h-12 px-12 text-base font-bold shadow-xl shadow-primary/20">
              Get API Keys <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
