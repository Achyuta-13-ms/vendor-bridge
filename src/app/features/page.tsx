"use client";

import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Shield, Zap, Globe, Lock, Smartphone, Users, 
  Search, FileCheck, BadgeCheck, CheckCircle, ArrowRight
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
};

const features = [
  {
    title: "Instant KYC Auto-Verification",
    desc: "Our secure infrastructure connects directly to government databases for real-time validation of GST, PAN, and Bank details. Average response time is under 15 seconds.",
    icon: FileCheck,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Reusable Virtual Vendor IDs",
    desc: "Once a vendor is verified on VyapaarSetu, they receive a unique, secure ID. They can use this ID to instantly onboard with any marketplace in our ecosystem.",
    icon: BadgeCheck,
    color: "bg-blue-500/10 text-blue-600",

  },
  {
    title: "Webhooks & Real-time Alerts",
    desc: "Get notified the instant a vendor's document status changes. Our robust webhook system ensures your marketplace state is always in sync with our verifications.",
    icon: Zap,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Enterprise Grade Security",
    desc: "We use 256-bit AES encryption for all sensitive data. Our platform is built with a security-first mindset, ensuring your vendors' data is always protected.",
    icon: Shield,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Multi-Tenant Architecture",
    desc: "Perfect for large ecosystems. Manage multiple marketplace sub-accounts, each with their own set of vendors and custom verification rules.",
    icon: Users,
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    title: "Developer First APIs",
    desc: "Built by developers, for developers. Clean RESTful endpoints, detailed documentation, and a robust sandbox environment for testing.",
    icon: Globe,
    color: "bg-indigo-500/10 text-indigo-600",
  }
];

export default function FeaturesPage() {
  return (
    <PublicLayout>
      <section className="py-24 bg-gradient-to-b from-muted/50 to-background border-b">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeIn}>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-6">
              Powerful Infrastructure for <br />
              <span className="text-primary">Modern Marketplaces</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              VyapaarSetu provides the technical backbone for vendor onboarding, 
              compliance, and identity verification at scale.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8">Get Started</Button>
              </Link>
              <Link href="/api-docs">
                <Button variant="outline" size="lg" className="h-12 px-8">Read API Docs</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div 
                key={f.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-3xl border border-border bg-card hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${f.color} group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-secondary/50 border-y">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Security & Compliance</h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { label: "SOC 2 Type II", icon: CheckCircle },
              { label: "GDPR Compliant", icon: CheckCircle },
              { label: "ISO 27001", icon: CheckCircle },
              { label: "RBI Guidelines", icon: CheckCircle },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-center gap-2 text-foreground font-medium">
                <item.icon className="w-5 h-5 text-primary" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto rounded-3xl bg-primary p-12 text-primary-foreground shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <h2 className="text-3xl font-bold mb-4 relative z-10">Start scaling your marketplace today</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto relative z-10">
              Join 200+ leading platforms that trust VyapaarSetu for their compliance infrastructure.
            </p>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="h-12 px-8 font-bold relative z-10">
                Create Account <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
