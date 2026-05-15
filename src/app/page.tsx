"use client";

import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, FileCheck, Zap, Globe, ArrowRight,
  CheckCircle, Upload, Search, BadgeCheck,
  BarChart3, Lock, Smartphone, Users, ChevronRight,
  Check, Star, CreditCard, Sparkles, Building2,
  Clock, ShieldAlert, Rocket, MessageSquare,
  HelpCircle, ExternalLink, Play, LayoutDashboard
} from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";

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

const useCases = [
  {
    title: "Hyperlocal Delivery",
    desc: "Verify and onboard thousands of local dark stores and restaurants in hours, not weeks.",
    icon: Smartphone,
    color: "bg-blue-500/10 text-blue-600"
  },
  {
    title: "Grocery Marketplaces",
    desc: "Automate FSSAI and GST validation for thousands of kirana partners across India.",
    icon: Building2,
    color: "bg-blue-500/10 text-blue-600"
  },
  {
    title: "ONDC Sellers",
    desc: "Enable instant seller registration for the ONDC ecosystem with pre-verified profiles.",
    icon: Globe,
    color: "bg-emerald-500/10 text-emerald-600"
  },
  {
    title: "Pharmacy Apps",
    desc: "Securely verify medical licenses and drug certifications with automated document audit.",
    icon: Shield,
    color: "bg-purple-500/10 text-purple-600"
  }
];

const faqs = [
  {
    q: "How does the 'reusable profile' work?",
    a: "Once a vendor completes verification on VyapaarSetu, they receive a unique Profile ID. They can use this ID to instantly share their verified credentials with any other marketplace in our network, skipping the entire document upload process."
  },
  {
    q: "Is it compliant with Indian data regulations?",
    a: "Yes, we are fully compliant with the latest DPDP guidelines. Data is encrypted at rest and in transit, and vendors have full control over who they share their documents with."
  },
  {
    q: "Which documents can you auto-verify?",
    a: "We currently support automated verification for GSTIN, PAN (Individual & Business), Bank Account (via penny drop or cancelled cheque), FSSAI, and Aadhar (via DigiLocker/UIDAI)."
  },
  {
    q: "How long does integration take?",
    a: "Our API-first architecture allows for integration in less than a day. We provide comprehensive documentation, SDKs, and pre-built onboarding components."
  }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('before');

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background pt-24 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-50 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-glow-pulse" />
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary shadow-green-glow animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" />
              Infrastructure for the next 1M Indian Merchants
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl md:text-8xl leading-[1.0] mb-8 animate-fade-in">
              Vendor onboarding 
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-emerald-400">reimagined.</span>
            </h1>

            <p className="mt-8 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto animate-fade-in [animation-delay:200ms]">
              Marketplaces lose 40% of vendors during KYC. VyapaarSetu automates 
              verification in seconds, reducing drop-offs and cutting onboarding costs by 70%.
            </p>

            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in [animation-delay:400ms]">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-10 text-lg shadow-green-glow hover:shadow-green-glow-lg transition-all rounded-2xl group font-bold">
                  Start for Free <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button variant="ghost" size="lg" className="h-14 px-10 text-lg rounded-2xl gap-2 hover:bg-muted/50 border border-border/50">
                <Play className="h-5 w-5 fill-primary text-primary" /> Watch Demo
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground opacity-70">
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /> ISO 27001 Certified</span>
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /> SOC2 Type II Ready</span>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Before vs After */}
      <section className="py-24 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Onboarding Reimagined</h2>
            <div className="flex justify-center mt-8">
              <div className="inline-flex p-1 bg-background border rounded-2xl">
                <button 
                  onClick={() => setActiveTab('before')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'before' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Legacy Process
                </button>
                <button 
                  onClick={() => setActiveTab('after')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'after' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  With VyapaarSetu
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            <AnimatePresence mode="wait">
              {activeTab === 'before' ? (
                <motion.div 
                  key="before"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="bg-background border rounded-3xl p-8 border-red-500/20 shadow-xl shadow-red-500/5">
                    <div className="flex items-center gap-3 mb-6 text-red-600">
                      <ShieldAlert className="h-6 w-6" />
                      <h3 className="text-lg font-bold">The Pain Point</h3>
                    </div>
                    <ul className="space-y-4">
                      {[
                        "Manual document review (3-5 days)",
                        "High vendor drop-off rate (35-40%)",
                        "Risk of forged documents/fraud",
                        "Fragmented data across spreadsheets",
                        "Manual bank account validation"
                      ].map(t => (
                        <li key={t} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
                    <p className="text-2xl font-bold text-red-700">7-10 Days</p>
                    <p className="text-xs text-red-600 uppercase tracking-widest font-bold">Time to Market</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="after"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-background border rounded-3xl p-8 border-primary/20 shadow-xl shadow-green-glow">
                    <div className="flex items-center gap-3 mb-6 text-primary">
                      <Rocket className="h-6 w-6" />
                      <h3 className="text-lg font-bold">The Solution</h3>
                    </div>
                    <ul className="space-y-4">
                      {[
                        "Instant API-based verification (< 30s)",
                        "Zero-friction vendor experience",
                        "Direct government database check",
                        "Centralized real-time dashboard",
                        "Automated penny-drop validation"
                      ].map(t => (
                        <li key={t} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-2xl font-bold text-primary">Sub-minute</p>
                    <p className="text-xs text-primary/60 uppercase tracking-widest font-bold">Time to Market</p>
                  </div>
                </motion.div>

              )}
            </AnimatePresence>
            
            <div className="relative">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="aspect-video bg-card border rounded-[32px] shadow-2xl overflow-hidden relative group border-primary/20"
              >
                <img 
                  src="/demo/dashboard-mockup.png" 
                  alt="VyapaarSetu Dashboard Mockup" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                  <div className="text-white">
                    <p className="font-bold text-lg">Real-time Analytics Dashboard</p>
                    <p className="text-sm text-white/80">Monitor compliance across 100k+ vendors instantly.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div 
                key={s.label}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-extrabold text-foreground mb-2">{s.value}</div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Modern Workflow for Modern Platforms</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Engineered to scale with your growth, from the first vendor to the first million.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Upload, title: "Upload Once", desc: "Vendors upload GST, PAN, and Bank proof in a unified experience." },
              { icon: Search, title: "Instant Verify", desc: "Our engine connects to Govt. nodes to validate data in real-time." },
              { icon: Shield, title: "Risk Scoring", desc: "Automated fraud checks identify suspicious entities instantly." },
              { icon: Zap, title: "Live Sync", desc: "Approved vendors are pushed to your marketplace via webhooks." }
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/20">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 left-20 w-full h-[2px] bg-gradient-to-r from-primary/20 to-transparent -z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-24 bg-secondary/50 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Built for Scale</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trusted by operators across the most demanding Indian digital ecosystems.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.title}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="bg-background rounded-3xl p-8 border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${uc.color}`}>
                  <uc.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold mb-3">{uc.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why VyapaarSetu */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-4xl font-bold tracking-tight mb-8">Why platforms choose VyapaarSetu</h2>
              <div className="space-y-8">
                {[
                  { 
                    t: "Reduced Drop-offs", 
                    d: "Mobile-first, localized UX ensures vendors complete onboarding in one sitting.",
                    icon: Users
                  },
                  { 
                    t: "Audit-Ready Logs", 
                    d: "Every verification is timestamped with API response snapshots for compliance audits.",
                    icon: FileCheck
                  },
                  { 
                    t: "Unified Dashboard", 
                    d: "Manage verifications for Swiggy, Zomato, and Amazon partners in a single window.",
                    icon: LayoutDashboard
                  },
                  { 
                    t: "Developer Experience", 
                    d: "Built by developers, for developers. Simple APIs, webhooks, and exhaustive documentation.",
                    icon: Zap
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.t}</h4>
                      <p className="text-muted-foreground leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
              <motion.div 
                initial={{ rotate: -2, y: 0 }}
                whileInView={{ rotate: 0, y: -10 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative bg-background border rounded-[48px] p-2 shadow-3xl overflow-hidden"
              >
                <img 
                  src="/demo/verified-graphic.png" 
                  alt="Verified Infrastructure" 
                  className="w-full aspect-square object-cover rounded-[40px]"
                />
                <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl border shadow-2xl flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Verification Status</p>
                    <p className="font-extrabold text-foreground">AUTO-VERIFIED</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Book Demo CTA */}
      <section id="book-demo" className="py-24 bg-card border-y border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4 relative text-center">
          <motion.div {...fadeIn} className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight">Ready for a pilot?</h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Join 200+ leading marketplaces scaling with VyapaarSetu. 
              Schedule a demo with our founding team to explore a customized pilot for your platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="h-14 px-10 text-lg rounded-2xl font-bold shadow-green-glow hover:shadow-green-glow-lg transition-all">
                Book a Demo
              </Button>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-2xl border-border hover:bg-muted/50 font-bold transition-all">
                  Try it Free
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>


      {/* FAQ */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-border/50 px-2 py-2">
                <AccordionTrigger className="text-left font-bold text-lg hover:no-underline hover:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-base pt-2 pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final Footer Trust */}
      <section className="py-12 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {["FlipMart", "ShopEase", "BazaarHub", "TradeNet", "VendorX"].map((name) => (
              <span key={name} className="text-xl font-black tracking-tighter text-foreground">{name}</span>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;

function XCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}
