"use client";

import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield, FileCheck, Zap, Globe, ArrowRight,
  CheckCircle, Upload, Search, BadgeCheck,
  BarChart3, Lock, Smartphone, Users, ChevronRight,
  Check, Star, CreditCard, Sparkles
} from "lucide-react";

/**
 * ANIMATION VARIANTS
 */
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true }
};

const stats = [
  { value: "50,000+", label: "Vendors Verified" },
  { value: "99.2%", label: "Verification Accuracy" },
  { value: "< 30s", label: "Avg. Verification Time" },
  { value: "200+", label: "Platforms Integrated" },
];

const features = [
  { icon: FileCheck, title: "Auto KYC Verification", desc: "GST, PAN, and bank details verified instantly via government APIs." },
  { icon: Shield, title: "Reusable Vendor Profile", desc: "Vendors verify once, onboard everywhere. No repeated paperwork." },
  { icon: Zap, title: "API-First Architecture", desc: "Plug VendorFlow into any marketplace with simple REST APIs." },
  { icon: Globe, title: "Multi-Tenant Ready", desc: "One platform powering verification for hundreds of marketplaces." },
  { icon: Lock, title: "Bank-Grade Security", desc: "End-to-end encryption. HTTPS everywhere. Full audit logs." },
  { icon: Smartphone, title: "Mobile-First", desc: "Built for India. Works flawlessly on any device, any network." },
];

const workflowSteps = [
  { icon: Upload, label: "Upload", desc: "GST, PAN, Bank" },
  { icon: Search, label: "Verify", desc: "Auto-validated" },
  { icon: BadgeCheck, label: "Share", desc: "Profile ID ready" },
  { icon: Globe, label: "Sell", desc: "Onboard anywhere" },
];

const pricingPlans = [
  {
    name: "Sandbox",
    price: "Free",
    desc: "For testing and development",
    features: ["100 Verifications / mo", "Standard Support", "API Access", "Webhook Testing"],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Growth",
    price: "₹4,999",
    period: "/mo",
    desc: "For scaling marketplaces",
    features: ["5,000 Verifications / mo", "Priority Support", "Custom Webhooks", "Analytics Dashboard"],
    cta: "Get Started",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For high-volume platforms",
    features: ["Unlimited Verifications", "24/7 Dedicated Rep", "SLA Guarantee", "On-premise Options"],
    cta: "Contact Sales",
    popular: false
  }
];

const Index = () => (
  <PublicLayout>
    {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/50 to-primary/5 border-b">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto py-24 md:py-32 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Seamless Onboarding Platform v2.0
            <ChevronRight className="h-3 w-3" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.1] mb-6">
            Verify vendors once.
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">onboard instantly.</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            The modern infrastructure for Indian marketplaces. Auto-verify GST, PAN, 
            and Bank details in seconds. Build trust with a global vendor profile.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/login">
              <Button size="lg" className="gap-2 h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
                Build Your Profile <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/api-docs">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm hover:bg-background transition-all">
                API Reference
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5 font-medium"><Star className="h-4 w-4 text-amber-500 fill-amber-500" /> 4.9/5 Trust Score</span>
            <span className="flex items-center gap-1.5 font-medium text-emerald-600"><CheckCircle className="h-4 w-4" /> ISO Certified</span>
            <span className="flex items-center gap-1.5 font-medium text-blue-600"><Users className="h-4 w-4" /> 50k+ Active Vendors</span>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Workflow Diagram */}
    <section className="border-y border-border bg-secondary">
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
          {workflowSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card shadow-xs">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="mt-2 text-sm font-medium text-foreground">{step.label}</span>
                <span className="text-xs text-muted-foreground">{step.desc}</span>
              </div>
              {i < workflowSteps.length - 1 && (
                <ArrowRight className="hidden md:block h-4 w-4 text-muted-foreground/40 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="border-b border-border">
      <div className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-semibold text-foreground">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          {...fadeIn}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Platform Infrastructure</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to automate vendor compliance and focus on your core marketplace growth.
          </p>
        </motion.div>
        
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeIn}
              className="group rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* Pricing */}
    <section id="pricing" className="py-24 border-y bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div 
          {...fadeIn}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <CreditCard className="h-3.5 w-3.5" /> Pricing Plans
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Flexible plans designed to grow with your platform. No hidden fees.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`relative rounded-3xl p-8 border ${plan.popular ? 'border-primary bg-background shadow-2xl scale-105 z-10' : 'border-border bg-card'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground text-sm font-medium">{plan.period}</span>}
              </div>
              <div className="space-y-4 mb-8">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
              <Button 
                variant={plan.popular ? 'default' : 'outline'} 
                className={`w-full h-11 ${plan.popular ? 'shadow-lg shadow-primary/30' : ''}`}
                asChild
              >
                <Link href="/login">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Platform CTA */}
    <section className="border-y border-border bg-secondary py-16">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl border border-border bg-card p-8 md:p-12 shadow-card max-w-3xl mx-auto text-center">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">For Marketplace Platforms</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Integrate VendorFlow's API to auto-verify and onboard vendors. Get dashboards, webhooks, and usage analytics out of the box.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/login">
              <Button size="lg" className="gap-2 h-11 px-6">
                <BarChart3 className="h-4 w-4" /> Platform Sign Up
              </Button>
            </Link>
            <Link href="/api-docs">
              <Button variant="outline" size="lg" className="h-11 px-6">
                Explore API
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Trust Elements */}
    <section className="py-12 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> 256-bit Encryption
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" /> KYC Compliant
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5" /> SOC 2 Ready
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BadgeCheck className="h-3.5 w-3.5" /> Govt. API Verified
          </div>
        </div>
      </div>
    </section>

    {/* Trusted By */}
    <section className="py-10 border-b border-border">
      <div className="container text-center mx-auto px-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-6">Trusted by leading platforms</p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {["FlipMart", "ShopEase", "BazaarHub", "TradeNet", "VendorX"].map((name) => (
            <span key={name} className="text-sm font-semibold text-muted-foreground/40">{name}</span>
          ))}
        </div>
      </div>
    </section>

    {/* Final CTA */}
    <section className="py-20">
      <div className="container text-center mx-auto px-4">
        <h2 className="text-2xl font-semibold text-foreground">Ready to simplify vendor onboarding?</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Join 200+ platforms using VendorFlow to verify and onboard vendors in seconds.
        </p>
        <div className="mt-6">
          <Link href="/login">
            <Button size="lg" className="gap-2 h-11 px-6">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default Index;
