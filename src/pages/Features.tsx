import PublicLayout from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import {
  FileCheck, Shield, Zap, Globe, Lock, Smartphone,
  Bell, BarChart3, Users, RefreshCw, Database, Eye
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" }
  }),
};

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

const Features = () => (
  <PublicLayout>
    <section className="bg-gradient-hero py-20">
      <div className="container text-center">
        <motion.h1
          initial="hidden" animate="visible" custom={0} variants={fadeUp}
          className="text-4xl font-extrabold text-foreground md:text-5xl"
        >
          Powerful Features for{" "}
          <span className="text-gradient-primary">Every Stakeholder</span>
        </motion.h1>
        <motion.p
          initial="hidden" animate="visible" custom={1} variants={fadeUp}
          className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Whether you're a vendor getting verified or a platform managing thousands of sellers,
          VendorFlow has the tools you need.
        </motion.p>
      </div>
    </section>

    {/* Vendor Features */}
    <section className="container py-20">
      <h2 className="text-2xl font-bold text-foreground mb-2">For Vendors</h2>
      <p className="text-muted-foreground mb-10">Verify once, onboard everywhere. No more repetitive paperwork.</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vendorFeatures.map((f, i) => (
          <motion.div
            key={f.title}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            custom={i} variants={fadeUp}
            className="rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-elevated transition-shadow"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Platform Features */}
    <section className="bg-muted/50 py-20">
      <div className="container">
        <h2 className="text-2xl font-bold text-foreground mb-2">For Platforms</h2>
        <p className="text-muted-foreground mb-10">API-first infrastructure to verify and onboard vendors at scale.</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {platformFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              custom={i} variants={fadeUp}
              className="rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-elevated transition-shadow"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/10">
                <f.icon className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default Features;
