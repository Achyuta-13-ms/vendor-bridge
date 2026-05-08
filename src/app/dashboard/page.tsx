"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, AlertCircle, ArrowRight, LogOut,
  RefreshCw, ShieldCheck, FileText, Building2, ChevronRight,
  Upload, Eye, Sparkles, FileCheck, BadgeCheck, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DocRecord {
  id: string;
  type: string;
  url: string;
  originalName?: string | null;
  verification?: { status: string; rejectionReason?: string | null } | null;
}

interface VendorProfile {
  id: string;
  businessName: string | null;
  businessType: string | null;
  city: string | null;
  state: string | null;
  status: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
  documents: DocRecord[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeProgress(vendor: VendorProfile | null): number {
  if (!vendor) return 0;
  let score = 0;
  if (vendor.businessName) score += 20;
  if (vendor.businessType) score += 10;
  if (vendor.city) score += 10;
  const docTypes = vendor.documents.map((d: DocRecord) => d.type);
  if (docTypes.includes("GST")) score += 20;
  if (docTypes.includes("PAN")) score += 20;
  if (docTypes.includes("BANK")) score += 20;
  return score;
}

function getDocStatus(vendor: VendorProfile | null, type: string) {
  const doc = vendor?.documents.find((d: DocRecord) => d.type === type);
  if (!doc) return "not_uploaded";
  return (doc.verification?.status ?? "PENDING").toLowerCase();
}

function getNextAction(vendor: VendorProfile | null): { label: string; href: string; icon: any } | null {
  if (!vendor) return { label: "Complete onboarding to get started", href: "/onboarding", icon: Building2 };
  const missing = ["GST", "PAN", "BANK"].filter((t: string) => !vendor.documents.find((d: DocRecord) => d.type === t));
  if (missing.length > 0) return { label: `Upload missing documents: ${missing.join(", ")}`, href: "/onboarding", icon: Upload };
  const pending = vendor.documents.filter((d: DocRecord) => (d.verification?.status ?? "PENDING") === "PENDING");
  if (pending.length > 0) return { label: "Awaiting document verification by our team", href: "#", icon: Clock };
  const rejected = vendor.documents.filter((d: DocRecord) => d.verification?.status === "REJECTED");
  if (rejected.length > 0) return { label: "Some documents were rejected — re-upload required", href: "/onboarding", icon: AlertCircle };
  return null;
}

const statusStyles = (s: string) => {
  switch (s) {
    case "verified": return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
    case "pending":  return "text-amber-600 bg-amber-500/10 border-amber-500/20";
    case "rejected": return "text-red-600 bg-red-500/10 border-red-500/20";
    default:         return "text-muted-foreground bg-muted border-transparent";
  }
};

const statusIcon = (s: string) => {
  switch (s) {
    case "verified": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "pending":  return <Clock className="h-4 w-4 text-amber-500" />;
    case "rejected": return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:         return <Upload className="h-4 w-4 text-muted-foreground" />;
  }
};

const DOC_META: Record<string, { label: string; desc: string }> = {
  GST:  { label: "GST Certificate", desc: "Goods & Service Tax Registration" },
  PAN:  { label: "Company PAN",     desc: "Permanent Account Number" },
  BANK: { label: "Bank Proof",      desc: "Cancelled Cheque / Statement" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const { toast } = useToast();

  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVendor = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/vendor/me");
      const data = await res.json();
      if (data.success) {
        if (!data.vendor) {
          router.push("/onboarding");
          return;
        }
        setVendor(data.vendor);
      }
    } catch {
      toast({ title: "Error fetching profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === "unauthenticated") { router.push("/login"); return; }
    if (authStatus === "authenticated") fetchVendor();
  }, [authStatus]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 sm:h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const progress = computeProgress(vendor);
  const nextAction = getNextAction(vendor);
  const docTypes = ["GST", "PAN", "BANK"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6"
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">VendorFlow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {vendor?.businessName ? `Welcome, ${vendor.businessName}` : "Welcome!"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {session?.user?.email}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </Button>
      </div>

      {/* ── Next Action Banner ── */}
      {nextAction && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "flex items-center gap-4 p-4 rounded-xl border",
            nextAction.href === "#"
              ? "bg-amber-500/5 border-amber-500/20"
              : "bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"
          )}
          onClick={() => nextAction.href !== "#" && router.push(nextAction.href)}
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <nextAction.icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight">{nextAction.label}</p>
            {nextAction.href !== "#" && (
              <p className="text-xs text-primary font-medium mt-0.5">Tap to continue →</p>
            )}
          </div>
          {nextAction.href !== "#" && <ChevronRight className="h-5 w-5 text-primary shrink-0" />}
        </motion.div>
      )}

      {/* ── Profile Completion ── */}
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">Profile Completion</CardTitle>
            <span className="text-2xl font-extrabold text-primary">{progress}%</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="h-3 rounded-full" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <ChecklistItem done={!!vendor?.businessName} label="Business name" />
            <ChecklistItem done={!!vendor?.businessType} label="Business type" />
            <ChecklistItem done={!!vendor?.city} label="Address added" />
            <ChecklistItem done={docTypes.every((t: string) => !!vendor?.documents.find((d: DocRecord) => d.type === t))} label="All docs uploaded" />
          </div>
        </CardContent>
        {progress < 100 && (
          <CardFooter className="pt-0">
            <Button variant="outline" className="w-full gap-2 group" onClick={() => router.push("/onboarding")}>
              Complete Profile <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* ── Quick Tips ── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm font-bold">Quick Tips for Success</p>
          </div>
          <div className="grid gap-3">
            {[
              { t: "Complete KYC", d: "A 100% complete profile gets verified 2x faster.", icon: FileCheck },
              { t: "Connect Platforms", d: "Link your Swiggy/Amazon ID to sync orders instantly.", icon: Globe },
              { t: "Reusable ID", d: "Use your VendorFlow ID to onboard on new apps without KYC.", icon: BadgeCheck },
            ].map((tip, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center shrink-0">
                  <tip.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold">{tip.t}</p>
                  <p className="text-[11px] text-muted-foreground">{tip.d}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Verification Status ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1">
          Document Verification
        </h2>
        <div className="space-y-3">
          {docTypes.map((type: string) => {
            const statusRaw = getDocStatus(vendor, type);
            const meta = DOC_META[type];
            const doc = vendor?.documents.find((d: DocRecord) => d.type === type);
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: docTypes.indexOf(type) * 0.07 }}
              >
                <Card className={cn(
                  "border transition-all",
                  statusRaw === "verified" ? "border-emerald-500/20 bg-emerald-500/5" :
                  statusRaw === "rejected" ? "border-red-500/20 bg-red-500/5" :
                  "border-border"
                )}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                      statusRaw === "verified" ? "bg-emerald-500/20" :
                      statusRaw === "rejected" ? "bg-red-500/20" :
                      "bg-muted"
                    )}>
                      {statusIcon(statusRaw)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{meta.label}</p>
                      <p className="text-xs text-muted-foreground">{meta.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={cn("text-[10px] font-bold uppercase px-2", statusStyles(statusRaw))}>
                        {doc ? statusRaw : "Not uploaded"}
                      </Badge>
                      {doc && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(doc.url, "_blank")}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                  {statusRaw === "rejected" && doc?.verification?.rejectionReason && (
                    <div className="px-4 pb-4">
                      <p className="text-xs text-red-600 bg-red-500/5 rounded-lg p-2 border border-red-500/10">
                        ❌ {doc.verification.rejectionReason}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Business Profile Summary ── */}
      {vendor && (
        <Card className="border-none shadow-md bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Business Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <ProfileField label="Business Type" value={vendor.businessType} />
            <ProfileField label="Phone" value={vendor.phone} />
            <ProfileField label="City" value={vendor.city} />
            <ProfileField label="State" value={vendor.state} />
            {vendor.email && <ProfileField label="Business Email" value={vendor.email} />}
            <ProfileField label="Status" value={vendor.status} />
          </CardContent>
        </Card>
      )}

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-14 flex flex-col gap-1 text-xs" onClick={() => router.push("/onboarding")}>
          <FileText className="h-5 w-5 text-primary" />
          Update Documents
        </Button>
        <Button variant="outline" className="h-14 flex flex-col gap-1 text-xs" onClick={() => fetchVendor(true)}>
          <RefreshCw className="h-5 w-5 text-primary" />
          Refresh Status
        </Button>
      </div>
    </motion.div>
  );
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {done
        ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
      <span className={done ? "font-medium" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-semibold mt-0.5 truncate">{value || "—"}</p>
    </div>
  );
}
