import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Shield, FileCheck, Zap, Globe, ArrowRight,
  CheckCircle, Upload, Search, BadgeCheck,
  BarChart3, Lock, Smartphone, Users, ChevronRight
} from "lucide-react";

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

const Index = () => (
  <PublicLayout>
    {/* Hero */}
    <section className="bg-gradient-to-br from-[hsl(152,60%,97%)] to-[hsl(40,40%,97%)]">
      <div className="container py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-xs">
            <Lock className="h-3 w-3 text-primary" />
            Secure & KYC Compliant
            <ChevronRight className="h-3 w-3" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl leading-[1.15]">
            Upload once. Get verified.
            <br />
            <span className="text-primary">Sell everywhere.</span>
          </h1>

          <p className="mt-5 text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            VendorFlow is India's vendor onboarding infrastructure. Auto-verify GST, PAN & bank details in seconds. 
            Generate a reusable profile. Integrate with any marketplace via API.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/signup">
              <Button size="lg" className="gap-2 h-11 px-6">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/api-docs">
              <Button variant="outline" size="lg" className="h-11 px-6">
                Get API Access
              </Button>
            </Link>
          </div>

          <div className="mt-5 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-primary" /> Free to start</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-primary" /> No credit card</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-primary" /> API included</span>
          </div>
        </div>
      </div>
    </section>

    {/* Workflow Diagram */}
    <section className="border-y border-border bg-secondary">
      <div className="container py-12">
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
      <div className="container py-10">
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
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-foreground">Built for Scale & Trust</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
            Everything you need to verify, manage, and onboard vendors at scale.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:shadow-card transition-shadow duration-200"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Platform CTA */}
    <section className="border-y border-border bg-secondary py-16">
      <div className="container">
        <div className="rounded-2xl border border-border bg-card p-8 md:p-12 shadow-card max-w-3xl mx-auto text-center">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">For Marketplace Platforms</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Integrate VendorFlow's API to auto-verify and onboard vendors. Get dashboards, webhooks, and usage analytics out of the box.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/signup">
              <Button size="lg" className="gap-2 h-11 px-6">
                <BarChart3 className="h-4 w-4" /> Platform Sign Up
              </Button>
            </Link>
            <Link to="/api-docs">
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
      <div className="container">
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
      <div className="container text-center">
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
      <div className="container text-center">
        <h2 className="text-2xl font-semibold text-foreground">Ready to simplify vendor onboarding?</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Join 200+ platforms using VendorFlow to verify and onboard vendors in seconds.
        </p>
        <div className="mt-6">
          <Link to="/signup">
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
