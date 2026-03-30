import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, FileCheck, Zap, Globe, ArrowRight,
  CheckCircle, Upload, Search, BadgeCheck, Users,
  BarChart3, Lock, Smartphone
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
  }),
};

const stats = [
  { value: "50K+", label: "Vendors Verified" },
  { value: "99.2%", label: "Verification Accuracy" },
  { value: "< 30s", label: "Average Verification" },
  { value: "200+", label: "Platforms Integrated" },
];

const features = [
  { icon: FileCheck, title: "Auto KYC Verification", desc: "GST, PAN, and bank details verified instantly via government APIs." },
  { icon: Shield, title: "Reusable Vendor Profile", desc: "Vendors verify once, onboard everywhere. No repeated paperwork." },
  { icon: Zap, title: "API-First Architecture", desc: "Plug VendorFlow into any marketplace with our RESTful APIs." },
  { icon: Globe, title: "Multi-Tenant Ready", desc: "One platform powering verification for hundreds of marketplaces." },
  { icon: Lock, title: "Bank-Grade Security", desc: "End-to-end encryption. HTTPS everywhere. Audit logs for compliance." },
  { icon: Smartphone, title: "Mobile-First Design", desc: "Built for India. Works flawlessly on any device, any network." },
];

const steps = [
  { icon: Upload, title: "Upload Documents", desc: "GST certificate, PAN card, bank details — all in one place." },
  { icon: Search, title: "Auto Verification", desc: "Real-time validation against government databases." },
  { icon: BadgeCheck, title: "Get Verified", desc: "Receive your Vendor Profile ID in seconds." },
  { icon: Globe, title: "Onboard Anywhere", desc: "Share your profile with any marketplace instantly." },
];

const Index = () => (
  <PublicLayout>
    {/* Hero */}
    <section className="bg-gradient-hero">
      <div className="container py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial="hidden" animate="visible" custom={0} variants={fadeUp}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
          >
            <Shield className="h-4 w-4" /> Trusted Vendor Verification
          </motion.div>

          <motion.h1
            initial="hidden" animate="visible" custom={1} variants={fadeUp}
            className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.1]"
          >
            Verify Once.{" "}
            <span className="text-gradient-primary">Onboard Everywhere.</span>
          </motion.h1>

          <motion.p
            initial="hidden" animate="visible" custom={2} variants={fadeUp}
            className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            VendorFlow is India's vendor onboarding infrastructure. Auto-verify GST, PAN & bank details.
            Generate reusable vendor profiles. Integrate with any marketplace via API.
          </motion.p>

          <motion.div
            initial="hidden" animate="visible" custom={3} variants={fadeUp}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <Link to="/signup">
              <Button variant="hero" size="lg" className="gap-2 text-base px-8 h-12">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/api-docs">
              <Button variant="hero-outline" size="lg" className="text-base px-8 h-12">
                View API Docs
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="border-y border-border bg-card">
      <div className="container py-10">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              custom={i} variants={fadeUp}
              className="text-center"
            >
              <div className="text-3xl font-extrabold text-gradient-primary">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="container py-20">
      <div className="text-center mb-14">
        <h2 className="text-3xl font-bold text-foreground">How VendorFlow Works</h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Four simple steps from document upload to marketplace onboarding.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            custom={i} variants={fadeUp}
            className="relative text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <step.icon className="h-7 w-7 text-primary" />
            </div>
            <div className="mb-1 text-xs font-bold text-primary uppercase tracking-wider">Step {i + 1}</div>
            <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Features */}
    <section className="bg-muted/50 py-20">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-foreground">Built for Scale & Trust</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Everything you need to verify, manage, and onboard vendors at scale.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              custom={i} variants={fadeUp}
              className="rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-elevated transition-shadow duration-300"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Platform CTA */}
    <section className="container py-20">
      <div className="rounded-2xl bg-gradient-primary p-10 md:p-16 text-center">
        <Users className="mx-auto h-10 w-10 text-primary-foreground/80 mb-4" />
        <h2 className="text-3xl font-bold text-primary-foreground">For Marketplace Platforms</h2>
        <p className="mt-3 text-primary-foreground/80 max-w-lg mx-auto">
          Integrate VendorFlow's API to auto-verify and onboard vendors. Get dashboards, webhooks, and usage analytics.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/signup">
            <Button variant="secondary" size="lg" className="gap-2 h-12 px-8">
              <BarChart3 className="h-4 w-4" /> Platform Sign Up
            </Button>
          </Link>
          <Link to="/api-docs">
            <Button variant="hero-outline" size="lg" className="h-12 px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              Explore API
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* Trust */}
    <section className="bg-muted/50 py-16">
      <div className="container text-center">
        <h2 className="text-2xl font-bold text-foreground mb-6">Trusted by Leading Platforms</h2>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
          {["FlipMart", "ShopEase", "BazaarHub", "TradeNet", "VendorX"].map((name) => (
            <span key={name} className="text-lg font-bold text-muted-foreground">{name}</span>
          ))}
        </div>
      </div>
    </section>

    {/* Final CTA */}
    <section className="container py-20 text-center">
      <h2 className="text-3xl font-bold text-foreground">Ready to Simplify Vendor Onboarding?</h2>
      <p className="mt-3 text-muted-foreground max-w-md mx-auto">
        Join 200+ platforms using VendorFlow to verify and onboard vendors in seconds.
      </p>
      <div className="mt-8">
        <Link to="/signup">
          <Button variant="hero" size="lg" className="gap-2 h-12 px-8 text-base">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-secondary" /> Free to start</span>
        <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-secondary" /> No credit card</span>
        <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-secondary" /> API access included</span>
      </div>
    </section>
  </PublicLayout>
);

export default Index;
