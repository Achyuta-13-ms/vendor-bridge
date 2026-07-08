"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Users, CheckCircle2, Activity, Zap, Search, Bell, Settings, LayoutDashboard, FileText, Webhook, Key, Copy, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Document {
  id: string;
  type: string;
  url: string;
  verification?: { status: string } | null;
}

interface VendorRecord {
  id: string;
  businessName: string | null;
  address: string | null;
  createdAt: string;
  user: { phone: string };
  documents: Document[];
}

function getOverallStatus(docs: Document[]) {
  if (!docs.length) return "Pending";
  const required = docs.filter((d: Document) => d.type === "GST" || d.type === "PAN");
  return required.every((d: Document) => d.verification?.status === "Verified") ? "Verified" : "Pending";
}

export default function PlatformDashboard() {
  const { data: session } = useSession();
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [filtered, setFiltered] = useState<VendorRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<VendorRecord | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<{ id: string; event: string; payload: string; time: string }[]>([]);
  const [activeTab, setActiveTab] = useState<"vendors" | "webhooks" | "api-keys">("vendors");
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [generatingKey, setGeneratingKey] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/vendors");
      if (res.data.success) {
        setVendors(res.data.vendors);
        setFiltered(res.data.vendors);
      }
    } catch {
      toast.error("Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if ((session?.user as any)?.id) {
      fetchApiKeys((session?.user as any).id);
    }
  }, [session]);

  const fetchApiKeys = async (userId: string) => {
    try {
      const res = await axios.get(`/api/platform/api-key?userId=${userId}`);
      if (res.data.success) setApiKeys(res.data.apiKeys);
    } catch {
      toast.error("Failed to load API Keys.");
    }
  };

  const handleGenerateKey = async () => {
    if (!(session?.user as any)?.id) return toast.error("Not logged in");
    setGeneratingKey(true);
    try {
      const res = await axios.post("/api/platform/api-key", { userId: (session?.user as any).id, name: "Production Key" });
      if (res.data.success) {
        toast.success("API Key Generated Successfully");
        fetchApiKeys((session?.user as any).id);
      }
    } catch {
      toast.error("Failed to generate API Key");
    } finally {
      setGeneratingKey(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(vendors);
    } else {
      const q = query.toLowerCase();
      setFiltered(vendors.filter((v: VendorRecord) =>
        v.businessName?.toLowerCase().includes(q) ||
        v.user.phone.includes(q) ||
        v.id.toLowerCase().includes(q)
      ));
    }
  }, [query, vendors]);

  const verifiedCount = vendors.filter((v: VendorRecord) => getOverallStatus(v.documents) === "Verified").length;

  const metrics = [
    { title: "Total Vendors", value: loading ? "-" : vendors.length.toString(), icon: Users, diff: "+12%" },
    { title: "Verified Vendors", value: loading ? "-" : verifiedCount.toString(), icon: CheckCircle2, diff: "+4%" },
    { title: "API Calls / min", value: "1,248", icon: Activity, diff: "+21%" },
    { title: "Success Rate", value: "99.8%", icon: Zap, diff: "+0.1%" },
  ];

  const handleVerify = async (status: "Verified" | "Rejected") => {
    if (!selectedDoc) return;
    if (status === "Rejected" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post("/api/vendor/verify", {
        documentId: selectedDoc.id,
        status,
        rejectionReason: status === "Rejected" ? rejectionReason : "",
      });

      if (res.data.success) {
        toast.success(`Document ${status.toLowerCase()} successfully.`);
        
        // Log a simulated webhook
        const newWebhook = {
          id: `WH-${Math.floor(1000 + Math.random() * 9000)}`,
          event: `vendor.${status.toLowerCase()}`,
          time: new Date().toLocaleTimeString(),
          payload: JSON.stringify({
            vendorId: selectedVendor?.id,
            documentId: selectedDoc.id,
            type: selectedDoc.type,
            status: status,
            timestamp: new Date().toISOString()
          }, null, 2)
        };
        setWebhookLogs((prev: any[]) => [newWebhook, ...prev].slice(0, 10));

        setSelectedDoc(null);
        setRejectionReason("");
        fetchVendors(); // Refresh the list
      }
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-muted/10">

      {/* Sidebar */}
      <aside className="w-64 border-r bg-background hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="font-bold text-2xl text-primary tracking-tight">VyapaarSetu</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Platform Console</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab("vendors"); }} 
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'vendors' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Users className="h-4 w-4" /> Vendors
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab("webhooks"); }} 
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'webhooks' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Webhook className="h-4 w-4" /> Webhook Simulator
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab("api-keys"); }} 
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'api-keys' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Key className="h-4 w-4" /> API Keys
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground text-sm transition-colors">
            <Activity className="h-4 w-4" /> API Usage
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground text-sm transition-colors">
            <Settings className="h-4 w-4" /> Settings
          </a>
        </nav>
        <div className="p-4 border-t space-y-3">
          <a href="/admin/dashboard" className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-md transition-colors">
            <ShieldCheck className="h-3.5 w-3.5" /> Admin Console
          </a>
          <a href="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1">
            <LayoutDashboard className="h-3.5 w-3.5" /> Back to Main Site
          </a>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b bg-background flex items-center px-6 shrink-0">
          <div className="flex items-center justify-between w-full">
            <h2 className="font-semibold text-lg">Vendors Overview</h2>
            <div className="flex items-center gap-4">
              <div className="relative w-56 hidden sm:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search vendors..."
                  className="pl-8 bg-muted/50 h-9"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
              <Bell className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                A
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6 flex-1 overflow-auto">

          {/* Metric Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.title} className="shadow-xs border-muted">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-blue-600 mt-1">{metric.diff} from last month</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Vendors Table */}
          {activeTab === "vendors" && (
            <Card className="shadow-xs border-muted">
              <CardHeader>
                <CardTitle>All Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor ID</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Docs</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="animate-pulse text-muted-foreground">Loading vendors...</div>
                        </TableCell>
                      </TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {query ? "No vendors match your search." : "No vendors yet. Vendors appear here after onboarding."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((vendor) => {
                        const status = getOverallStatus(vendor.documents);
                        const docsCount = vendor.documents.length;
                        return (
                          <TableRow key={vendor.id}>
                            <TableCell className="font-mono text-xs">{vendor.id.slice(0, 8)}...</TableCell>
                            <TableCell>
                              <div className="font-medium">{vendor.businessName ?? "—"}</div>
                              <div className="text-xs text-muted-foreground">{vendor.address?.split(",")[0]}</div>
                            </TableCell>
                            <TableCell className="text-sm">{vendor.user.phone}</TableCell>
                            <TableCell className="text-sm">{docsCount} uploaded</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  status === "Verified"
                                    ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                    : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                }
                              >
                                {status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(vendor.createdAt).toLocaleDateString("en-IN")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() => setSelectedVendor(vendor)}
                              >
                                Review Docs
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* API Keys Tab */}
          {activeTab === "api-keys" && (
            <div className="space-y-6">
              <Card className="shadow-xs border-muted">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                       <Key className="h-5 w-5 text-primary" /> API Keys
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Manage API keys to access the public Vendor data endpoints.</p>
                  </div>
                  <Button onClick={handleGenerateKey} disabled={generatingKey}>
                    {generatingKey ? "Generating..." : "Generate New Key"}
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key Name</TableHead>
                        <TableHead>Secret Key</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Last Used</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No API Keys generated yet. Create one to begin integrating.
                          </TableCell>
                        </TableRow>
                      ) : (
                        apiKeys.map((key: any) => (
                          <TableRow key={key.id}>
                            <TableCell className="font-medium">{key.name}</TableCell>
                            <TableCell className="font-mono text-xs">{key.key}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : "Never"}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => {
                                navigator.clipboard.writeText(key.key);
                                toast.success("API Key copied to clipboard!");
                              }}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Webhook History */}
          {activeTab === "webhooks" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="shadow-xs border-muted">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Webhook className="h-5 w-5 text-primary" /> Webhook Console
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Simulate real-time POST notifications sent to your marketplace when a vendor status changes.
                    </p>
                    <div className="bg-muted p-4 rounded-lg font-mono text-[10px] space-y-2 overflow-auto max-h-[400px]">
                      {webhookLogs.length === 0 ? (
                        <div className="text-center py-10 opacity-50">No webhooks sent yet. Verify a document to see activity.</div>
                      ) : (
                        webhookLogs.map((log: any) => (
                          <div key={log.id} className="border-b border-border pb-2 last:border-0">
                            <div className="flex justify-between text-primary font-bold mb-1">
                              <span>POST /v1/webhooks/vyapaarsetu</span>
                              <span>{log.time}</span>
                            </div>
                            <div className="text-foreground">Event: {log.event}</div>
                            <pre className="mt-1 text-muted-foreground">{log.payload}</pre>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-xs border-muted">
                  <CardHeader>
                    <CardTitle>Webhook Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground block mb-1.5">Callback URL</label>
                      <Input value="https://api.your-marketplace.com/webhooks" readOnly className="bg-muted/30" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground block mb-1.5">Secret Key</label>
                      <Input value="whsec_5f86ac..." readOnly className="bg-muted/30 shadow-none border-dashed" />
                    </div>
                    <Button className="w-full gap-2" variant="outline" disabled>
                      <Zap className="h-4 w-4" /> Send Test Notification
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Review Modal */}
          <Dialog open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Review Documents: {selectedVendor?.businessName}</DialogTitle>
                <DialogDescription>
                  Review the uploaded KYC documents for this vendor.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {selectedVendor?.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-xl bg-muted/20 text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{doc.type} Document</p>
                        <a href={doc.url} target="_blank" className="text-xs text-primary hover:underline" rel="noreferrer">View Uploaded File</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={
                        doc.verification?.status === "Verified" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                        doc.verification?.status === "Rejected" ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }>
                        {doc.verification?.status || "Pending"}
                      </Badge>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedDoc(doc)}>Update</Button>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Action Modal */}
          <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verify {selectedDoc?.type} Document</DialogTitle>
                <DialogDescription>
                  Approve or reject this document after review.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <p className="text-sm font-medium">Rejection Reason (only if rejecting)</p>
                <Textarea
                  placeholder="e.g. Document is blurry or expired"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => handleVerify("Rejected")} disabled={submitting} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  Reject Document
                </Button>
                <Button onClick={() => handleVerify("Verified")} disabled={submitting}>
                  Approve & Verify
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </main>
    </div>
  );
}
