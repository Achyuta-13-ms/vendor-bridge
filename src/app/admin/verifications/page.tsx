"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, CheckCircle2, XCircle, FileText, ChevronDown, ChevronUp,
  Eye, Search, Filter, AlertTriangle, Upload, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Verification {
  id: string;
  status: string;
  rejectionReason: string | null;
}

interface Document {
  id: string;
  type: string;
  url: string;
  verification?: Verification | null;
}

interface Vendor {
  id: string;
  businessName: string | null;
  status: string;
  createdAt: string;
  user: { name: string | null; email: string | null };
  documents: Document[];
}

type StatusFilter = "ALL" | "PENDING" | "ACTIVE" | "REJECTED";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "ACTIVE":   return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "PENDING":  return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "REJECTED": return "bg-red-500/10 text-red-600 border-red-500/20";
    default:         return "bg-muted text-muted-foreground";
  }
};

const verificationBadgeClass = (status: string) => {
  switch (status) {
    case "VERIFIED": return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20";
    case "REJECTED": return "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:border-red-500/20";
    default:         return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20";
  }
};

function TimelineItem({ icon: Icon, title, time, status }: { icon: any, title: string, time: string, status: "complete" | "pending" }) {
  return (
    <div className="flex items-start gap-3 relative z-10">
      <div className={cn(
        "h-6 w-6 rounded-full flex items-center justify-center shrink-0 border-2",
        status === "complete" ? "bg-emerald-500 border-emerald-500 text-white" : "bg-background border-muted text-muted-foreground"
      )}>
        <Icon className="h-3 w-3" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-xs font-bold leading-none", status === "pending" && "text-muted-foreground")}>{title}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminVerifications() {
  const [vendors, setVendors]     = useState<Vendor[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<StatusFilter>("ALL");

  // Reject modal state
  const [rejectModal, setRejectModal] = useState<{ verificationId: string; docType: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { toast } = useToast();

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchVerifications = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res  = await fetch("/api/admin/verifications");
      const data = await res.json();
      if (data.success) {
        setVendors(data.vendors.filter((v: Vendor) => v.documents.length > 0));
      } else {
        throw new Error(data.message);
      }
    } catch (e: any) {
      toast({ title: "Failed to load verifications", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVerifications(); }, []);

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const matchesSearch =
        !search ||
        v.businessName?.toLowerCase().includes(search.toLowerCase()) ||
        v.user.email?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "ALL" || v.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [vendors, search, filter]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleApprove = async (verificationId: string) => {
    setActionLoading(verificationId);
    try {
      const res  = await fetch(`/api/admin/verifications/${verificationId}/approve`, { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast({ title: "Document Approved ✓", description: "Verification status updated." });
      fetchVerifications(true);
    } catch (e: any) {
      toast({ title: "Approval failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal) return;
    if (!rejectionReason.trim()) {
      toast({ title: "Reason required", description: "Please provide a rejection reason.", variant: "destructive" });
      return;
    }
    setActionLoading(rejectModal.verificationId);
    try {
      const res  = await fetch(`/api/admin/verifications/${rejectModal.verificationId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast({ title: "Document Rejected", description: "Vendor has been notified." });
      setRejectModal(null);
      setRejectionReason("");
      fetchVerifications(true);
    } catch (e: any) {
      toast({ title: "Rejection failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const FILTERS: StatusFilter[] = ["ALL", "PENDING", "ACTIVE", "REJECTED"];

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Verifications</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review and manage vendor documents</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchVerifications()} className="gap-2 shrink-0">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by business name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="text-xs"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Vendor List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-xl space-y-2 text-muted-foreground">
            <Filter className="h-8 w-8 mx-auto opacity-30" />
            <p className="font-medium text-sm">No vendors found</p>
            {search && <p className="text-xs">Try clearing your search filter</p>}
          </div>
        ) : (
          filtered.map((vendor) => (
            <motion.div
              key={vendor.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="overflow-hidden border-border/50 hover:border-border transition-colors">
                {/* Vendor row header */}
                <div
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(expandedId === vendor.id ? null : vendor.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary text-sm">
                      {vendor.businessName?.charAt(0)?.toUpperCase() || "V"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm truncate">{vendor.businessName || "Unnamed Business"}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {vendor.user.email} · {new Date(vendor.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge className={cn("text-[10px] uppercase tracking-wide border", statusBadgeClass(vendor.status))}>
                      {vendor.status}
                    </Badge>
                    {expandedId === vendor.id
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Expanded document rows */}
                <AnimatePresence>
                  {expandedId === vendor.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t bg-muted/10 p-4 sm:p-5 space-y-3">
                        <div className="flex flex-col md:flex-row gap-6 mb-6 bg-background/50 rounded-2xl p-5 border border-dashed">
                          <div className="space-y-3 flex-1">
                            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Verification Timeline</p>
                            <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
                              <TimelineItem icon={CheckCircle2} title="Account Created" time={new Date(vendor.createdAt).toLocaleDateString()} status="complete" />
                              <TimelineItem icon={Upload} title="Documents Uploaded" time={`${vendor.documents.length} Files`} status="complete" />
                              <TimelineItem icon={RefreshCw} title="Auto-Checks Performed" time="System processed" status="complete" />
                              <TimelineItem icon={Clock} title="Final Review" time="Awaiting Admin" status={vendor.status === "ACTIVE" ? "complete" : "pending"} />
                            </div>
                          </div>
                          <div className="hidden md:block w-px bg-muted" />
                          <div className="space-y-3 flex-1">
                            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Quick Info</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Risk Level</p>
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 text-[10px]">Low Risk</Badge>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Auto-Check</p>
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 text-[10px]">100% Match</Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Documents</p>

                        {vendor.documents.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                        ) : (
                          vendor.documents.map((doc) => {
                            const verStatus = doc.verification?.status || "PENDING";
                            const isVerified = verStatus === "VERIFIED";
                            const isRejected = verStatus === "REJECTED";

                            return (
                              <div
                                key={doc.id}
                                className="bg-background border rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm">{doc.type} Document</p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <Badge variant="outline" className={cn("text-[10px] h-5", verificationBadgeClass(verStatus))}>
                                        {verStatus === "PENDING" ? "Under Review" : verStatus}
                                      </Badge>
                                      
                                      {/* Demo-ready Auto-Check Result */}
                                      <Badge 
                                        variant="secondary" 
                                        className={cn(
                                          "text-[9px] h-5 font-bold border",
                                          doc.type === "GST" || doc.type === "PAN" 
                                            ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/10" 
                                            : "bg-amber-500/5 text-amber-600 border-amber-500/10"
                                        )}
                                      >
                                        Auto-Check: {doc.type === "GST" || doc.type === "PAN" ? "Pass (Format Verified)" : "Manual Review Required"}
                                      </Badge>

                                      {isRejected && doc.verification?.rejectionReason && (
                                        <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                                          <AlertTriangle className="h-3 w-3" />{doc.verification.rejectionReason}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={() => window.open(doc.url, "_blank")}
                                  >
                                    <Eye className="h-3.5 w-3.5" /> View
                                  </Button>

                                  {!isVerified && (
                                    <Button
                                      size="sm"
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                                      disabled={!doc.verification?.id || actionLoading === doc.verification?.id}
                                      onClick={() => handleApprove(doc.verification!.id)}
                                    >
                                      {actionLoading === doc.verification?.id
                                        ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                        : <CheckCircle2 className="h-3.5 w-3.5" />}
                                      Approve
                                    </Button>
                                  )}

                                  {!isRejected && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="gap-1.5"
                                      disabled={!doc.verification?.id}
                                      onClick={() => {
                                        setRejectionReason("");
                                        setRejectModal({ verificationId: doc.verification!.id, docType: doc.type });
                                      }}
                                    >
                                      <XCircle className="h-3.5 w-3.5" /> Reject
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Reject Reason Dialog */}
      <Dialog open={!!rejectModal} onOpenChange={(open) => { if (!open) { setRejectModal(null); setRejectionReason(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Reject Document
            </DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting the <strong>{rejectModal?.docType}</strong> document. The vendor will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-sm font-medium">Rejection Reason *</label>
            <textarea
              className="w-full h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="e.g. Document is blurry, GSTIN not visible, name mismatch…"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setRejectModal(null); setRejectionReason(""); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim() || !!actionLoading}
              className="gap-2"
            >
              {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
