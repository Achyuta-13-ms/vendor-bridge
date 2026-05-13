"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, MapPin, FileText, CreditCard, CheckCircle2,
  Upload, ArrowRight, ArrowLeft, Loader2, ShieldCheck, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1 — Business Details
  businessName: string;
  businessType: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  // Step 2 — Address
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  // Step 3–5 — Documents
  gstFile: File | null;
  gstUrl: string;
  panFile: File | null;
  panUrl: string;
  bankFile: File | null;
  bankUrl: string;
}

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { icon: Building2, label: "Business", title: "Business Details", desc: "Tell us about your business" },
  { icon: MapPin,    label: "Address",  title: "Address Details",  desc: "Where is your business located?" },
  { icon: FileText,  label: "GST",      title: "GST Certificate",  desc: "Upload your GST registration" },
  { icon: FileText,  label: "PAN",      title: "Company PAN",      desc: "Upload your PAN card" },
  { icon: CreditCard,label: "Bank",     title: "Bank Proof",       desc: "Upload a cancelled cheque or bank statement" },
  { icon: CheckCircle2, label: "Review", title: "Review & Submit", desc: "Confirm your information" },
];

const BUSINESS_TYPES = [
  "Sole Proprietorship", "Partnership", "LLP", "Private Limited", "Public Limited", "Other"
];

// ─── File Upload Component ────────────────────────────────────────────────────

function FileUploadZone({
  label, file, url, onFileSelect, onRemove, uploading
}: {
  label: string;
  file: File | null;
  url: string;
  onFileSelect: (f: File) => void;
  onRemove: () => void;
  uploading: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFileSelect(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  if (url) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 animate-in slide-in-from-bottom-2">
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-emerald-700 dark:text-emerald-400 truncate">{file?.name || "File uploaded"}</p>
          <p className="text-xs text-muted-foreground">Upload successful</p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onRemove}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <label
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer",
        isDragging 
          ? "border-primary bg-primary/10 scale-[1.02]" 
          : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
      )}
    >
      <input
        type="file"
        className="sr-only"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => { if (e.target.files?.[0]) onFileSelect(e.target.files[0]); }}
        disabled={uploading}
      />
      {uploading ? (
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      ) : (
        <div className={cn("p-3 rounded-full", isDragging ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
          <Upload className="h-6 w-6" />
        </div>
      )}
      <div className="text-center">
        <p className="font-semibold text-sm">{uploading ? "Uploading…" : isDragging ? "Drop file here" : `Upload ${label}`}</p>
        <p className="text-xs text-muted-foreground mt-0.5">PDF, JPG, or PNG · Max 5MB</p>
      </div>
    </label>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>(0);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    businessName: "", businessType: "", description: "", phone: "", email: "", website: "",
    addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "India",
    gstFile: null, gstUrl: "",
    panFile: null, panUrl: "",
    bankFile: null, bankUrl: "",
  });

  // Guard: redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Guard: redirect if vendor already set up
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/vendor/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.vendor?.businessName) router.push("/dashboard");
      });
  }, [status, router]);

  const set = (field: keyof FormData, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const uploadFile = useCallback(async (file: File, field: "gstUrl" | "panUrl" | "bankUrl", fileField: "gstFile" | "panFile" | "bankFile") => {
    setUploadingField(field);
    set(fileField, file);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("path", "documents");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      set(field, data.url);
      toast({ title: "File uploaded", description: `${file.name} stored successfully.` });
    } catch {
      toast({ title: "Upload failed", description: "Try again.", variant: "destructive" });
      set(fileField, null);
    } finally {
      setUploadingField(null);
    }
  }, [toast]);

  const removeFile = (field: "gstUrl" | "panUrl" | "bankUrl", fileField: "gstFile" | "panFile" | "bankFile") => {
    set(field, "");
    set(fileField, null);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!form.businessName && !!form.businessType && !!form.phone;
      case 1: return !!form.addressLine1 && !!form.city && !!form.state && !!form.postalCode;
      case 2: return !!form.gstUrl;
      case 3: return !!form.panUrl;
      case 4: return !!form.bankUrl;
      case 5: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName,
          businessType: form.businessType,
          description: form.description,
          phone: form.phone,
          email: form.email,
          website: form.website,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
          gstUrl: form.gstUrl,
          panUrl: form.panUrl,
          bankUrl: form.bankUrl,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast({ title: "Profile submitted!", description: "Redirecting to your dashboard." });
      router.push("/dashboard");
    } catch (e: any) {
      toast({ title: "Submission failed", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-start p-4 pt-8 pb-20">
      {/* Header */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">VyapaarSetu</h1>
            <p className="text-xs text-muted-foreground">Vendor Onboarding</p>
          </div>
        </div>

        {/* Step Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{STEPS[step].title}</p>
            <Badge variant="outline" className="text-xs font-bold">Step {step + 1} of {STEPS.length}</Badge>
          </div>
          <Progress value={progress} className="h-2" />

          {/* Step Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all",
                  i === step ? "bg-primary text-primary-foreground" :
                  i < step ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                  "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? <CheckCircle2 className="h-3 w-3" /> : <s.icon className="h-3 w-3" />}
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Card */}
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-none shadow-2xl bg-card">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-bold">{STEPS[step].title}</CardTitle>
                <CardDescription>{STEPS[step].desc}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {/* ── Step 0: Business Details ── */}
                {step === 0 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input id="businessName" placeholder="e.g. Sharma Traders Pvt Ltd"
                        value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Business Type *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {BUSINESS_TYPES.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => set("businessType", t)}
                            className={cn(
                              "text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
                              form.businessType === t
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                            )}
                          >{t}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" type="tel" placeholder="+91 98765 43210"
                        value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bizEmail">Business Email</Label>
                      <Input id="bizEmail" type="email" placeholder="contact@yourbusiness.com"
                        value={form.email} onChange={(e) => set("email", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website (optional)</Label>
                      <Input id="website" placeholder="https://yourbusiness.com"
                        value={form.website} onChange={(e) => set("website", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">About your business (optional)</Label>
                      <textarea
                        id="description"
                        rows={3}
                        placeholder="Briefly describe what your business does…"
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </>
                )}

                {/* ── Step 1: Address Details ── */}
                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="addressLine1">Address Line 1 *</Label>
                      <Input id="addressLine1" placeholder="Street, building, or area"
                        value={form.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressLine2">Address Line 2 (optional)</Label>
                      <Input id="addressLine2" placeholder="Landmark, suite, etc."
                        value={form.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input id="city" placeholder="Mumbai"
                          value={form.city} onChange={(e) => set("city", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input id="state" placeholder="Maharashtra"
                          value={form.state} onChange={(e) => set("state", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">PIN Code *</Label>
                        <Input id="postalCode" placeholder="400001"
                          value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" value={form.country} readOnly className="bg-muted/50" />
                      </div>
                    </div>
                  </>
                )}

                {/* ── Step 2: GST Upload ── */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm space-y-1">
                      <p className="font-semibold text-blue-700 dark:text-blue-400">What to upload?</p>
                      <ul className="text-muted-foreground text-xs space-y-0.5 list-disc list-inside">
                        <li>GST Registration Certificate (Form REG-06)</li>
                        <li>Must clearly show GSTIN number</li>
                        <li>PDF, JPG, or PNG formats accepted</li>
                      </ul>
                    </div>
                    <FileUploadZone
                      label="GST Certificate"
                      file={form.gstFile}
                      url={form.gstUrl}
                      uploading={uploadingField === "gstUrl"}
                      onFileSelect={(f) => uploadFile(f, "gstUrl", "gstFile")}
                      onRemove={() => removeFile("gstUrl", "gstFile")}
                    />
                  </div>
                )}

                {/* ── Step 3: PAN Upload ── */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm space-y-1">
                      <p className="font-semibold text-blue-700 dark:text-blue-400">What to upload?</p>
                      <ul className="text-muted-foreground text-xs space-y-0.5 list-disc list-inside">
                        <li>Company or individual PAN card</li>
                        <li>Name should match business registration</li>
                        <li>Both sides if physical card scan</li>
                      </ul>
                    </div>
                    <FileUploadZone
                      label="PAN Card"
                      file={form.panFile}
                      url={form.panUrl}
                      uploading={uploadingField === "panUrl"}
                      onFileSelect={(f) => uploadFile(f, "panUrl", "panFile")}
                      onRemove={() => removeFile("panUrl", "panFile")}
                    />
                  </div>
                )}

                {/* ── Step 4: Bank Proof Upload ── */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm space-y-1">
                      <p className="font-semibold text-blue-700 dark:text-blue-400">What to upload?</p>
                      <ul className="text-muted-foreground text-xs space-y-0.5 list-disc list-inside">
                        <li>Cancelled cheque (preferred)</li>
                        <li>Or recent bank statement (last 3 months)</li>
                        <li>Must show account number and IFSC code</li>
                      </ul>
                    </div>
                    <FileUploadZone
                      label="Bank Proof"
                      file={form.bankFile}
                      url={form.bankUrl}
                      uploading={uploadingField === "bankUrl"}
                      onFileSelect={(f) => uploadFile(f, "bankUrl", "bankFile")}
                      onRemove={() => removeFile("bankUrl", "bankFile")}
                    />
                  </div>
                )}

                {/* ── Step 5: Review & Submit ── */}
                {step === 5 && (
                  <div className="space-y-4">
                    <ReviewRow label="Business Name" value={form.businessName} />
                    <ReviewRow label="Type" value={form.businessType} />
                    <ReviewRow label="Phone" value={form.phone} />
                    {form.email && <ReviewRow label="Business Email" value={form.email} />}
                    <hr className="border-border/50" />
                    <ReviewRow label="Address" value={`${form.addressLine1}, ${form.city}, ${form.state} – ${form.postalCode}`} />
                    <hr className="border-border/50" />
                    <div className="grid grid-cols-3 gap-3">
                      <DocStatusBadge label="GST" uploaded={!!form.gstUrl} />
                      <DocStatusBadge label="PAN" uploaded={!!form.panUrl} />
                      <DocStatusBadge label="Bank" uploaded={!!form.bankUrl} />
                    </div>
                    <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-muted-foreground">
                      By submitting, you confirm that all information provided is accurate and the documents are authentic. Our team will review and verify within 1–3 business days.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-4">
          {step > 0 && (
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => setStep((s) => (s - 1) as Step)}
              disabled={submitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          )}

          {step < STEPS.length - 1 ? (
            <Button
              className="flex-1 h-12 font-semibold"
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={!canProceed() || !!uploadingField}
            >
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              className="flex-1 h-12 font-semibold shadow-lg shadow-primary/20"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</>
              ) : (
                <><CheckCircle2 className="h-4 w-4 mr-2" /> Submit Profile</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-muted-foreground font-medium shrink-0 pt-0.5">{label}</span>
      <span className="text-sm font-semibold text-right">{value || "—"}</span>
    </div>
  );
}

function DocStatusBadge({ label, uploaded }: { label: string; uploaded: boolean }) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center",
      uploaded ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"
    )}>
      {uploaded
        ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        : <X className="h-5 w-5 text-red-500" />}
      <span className="text-xs font-bold">{label}</span>
      <span className={cn("text-[10px] font-medium", uploaded ? "text-emerald-600" : "text-red-600")}>
        {uploaded ? "Ready" : "Missing"}
      </span>
    </div>
  );
}
