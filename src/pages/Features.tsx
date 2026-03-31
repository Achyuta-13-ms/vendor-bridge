import PublicLayout from "@/components/layout/PublicLayout";
import {
  FileCheck, Shield, Zap, Globe, Lock, Smartphone,
  Bell, BarChart3, Users, RefreshCw, Database, Eye
} from "lucide-react";

const vendorFeatures = [
  { icon: FileCheck, title: "One-Time KYC Upload", desc: "Upload GST certificate, PAN card, and bank details once. Never fill the same forms again." },
  { icon: Shield, title: "Auto Verification", desc: "Real-time validation against government databases — GST, PAN, and bank account APIs." },
  { icon: RefreshCw, title: "Reusable Profile", desc: "Your verified profile works across all integrated marketplaces. Share with a single link." },
  { icon: Eye, title: "Real-Time Status", desc: "Track verification progress live — Pending, Verified, or Failed with clear next steps." },
  { icon: Smartphone, title: "Mobile-First UX", desc: "Complete your entire onboarding from your phone. Designed for India's mobile-first users." },
  { icon: Lock, title: "Secure Storage", desc: "Documents encrypted at rest and in transit. Bank-grade security for your sensitive data." },
];

const platformFeatures = [
  { icon: Zap, title: "REST API Integration", desc: "Simple, well-documented APIs. Fetch vendor profiles, trigger verifications, manage webhooks." },
  { icon: Bell, title: "Webhook Notifications", desc: "Get notified instantly when vendors complete verification or when statuses change." },
  { icon: BarChart3, title: "Usage Analytics", desc: "Track API calls, verification success rates, and onboarding metrics in your dashboard." },
  { icon: Globe, title: "Multi-Tenant Architecture", desc: "Serve multiple marketplaces from a single VendorFlow integration." },
  { icon: Users, title: "Vendor Management", desc: "View, filter, and manage all your onboarded vendors from a centralized dashboard." },
  { icon: Database, title: "Bulk Operations", desc: "Import vendor lists, trigger batch verifications, and export data at scale." },
];

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:shadow-card transition-shadow duration-200">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{desc}</p>
  </div>
);

const Features = () => (
  <PublicLayout>
    <section className="border-b border-border py-16">
      <div className="container text-center">
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
          Powerful features for <span className="text-primary">every stakeholder</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
          Whether you're a vendor getting verified or a platform managing thousands of sellers, VendorFlow has the tools you need.
        </p>
      </div>
    </section>

    <section className="container py-16">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground">For Vendors</h2>
        <p className="mt-1 text-sm text-muted-foreground">Verify once, onboard everywhere. No more repetitive paperwork.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vendorFeatures.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </section>

    <section className="border-t border-border bg-secondary py-16">
      <div className="container">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground">For Platforms</h2>
          <p className="mt-1 text-sm text-muted-foreground">API-first infrastructure to verify and onboard vendors at scale.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {platformFeatures.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default Features;
