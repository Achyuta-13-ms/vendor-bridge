"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  ShieldCheck, 
  FileText, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function KYCPage() {
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("vendorSession");
    if (raw) {
      const session = JSON.parse(raw);
      fetchVendor(session.id);
    }
  }, []);

  const fetchVendor = async (userId: string) => {
    try {
      const res = await axios.get(`/api/vendor?userId=${userId}`);
      if (res.data.success) setVendor(res.data.vendor);
    } catch (err) {
      console.error("KYC fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !vendor) return <div className="p-10 animate-pulse bg-muted/20 h-screen" />;

  const getDocStatus = (type: string) => {
    const doc = vendor.documents.find((d: any) => d.type === type);
    return doc?.verification?.status ?? "Pending Upload";
  };

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified": return "text-emerald-500 bg-emerald-500/10";
      case "pending": return "text-amber-500 bg-amber-500/10";
      case "rejected": return "text-red-500 bg-red-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const kycProgress = (vendor.documents.filter((d: any) => d.verification?.status === "Verified").length / 3) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 md:p-10 space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-10 w-10 text-primary" />
            KYC Verification
          </h1>
          <p className="text-muted-foreground font-medium italic">Authentication required for marketplace bridge activation.</p>
        </div>
        <Badge variant="outline" className="h-8 px-4 font-bold bg-primary/5 border-primary/20 text-primary uppercase tracking-widest">
            Level 1 Standard
        </Badge>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-2xl">
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
            <CardDescription>We verify your business docs to ensure trust across the bridge.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>Verification Progress</span>
                <span>{Math.round(kycProgress)}%</span>
              </div>
              <Progress value={kycProgress} className="h-3" />
            </div>

            <div className="space-y-4">
              {[
                { type: "GST", label: "GST Certificate", desc: "Required for tax compliance" },
                { type: "PAN", label: "Business PAN", desc: "Required for identity verification" },
                { type: "BANK", label: "Cancelled Cheque", desc: "Required for settlement mapping" },
              ].map((doc) => {
                const status = getDocStatus(doc.type);
                const isVerified = status === "Verified";
                return (
                  <div key={doc.type} className="flex items-center justify-between p-4 rounded-2xl border bg-muted/10 group hover:border-primary/40 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", isVerified ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-muted-foreground")}>
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold">{doc.label}</p>
                        <p className="text-xs text-muted-foreground">{doc.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={cn("h-6 uppercase text-[10px] font-black", statusColor(status))}>
                        {status}
                      </Badge>
                      {!isVerified && (
                        <Button size="sm" variant="ghost" className="h-8 gap-1 font-bold group">
                          {status === "Pending Upload" ? <Upload className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {status === "Pending Upload" ? "Upload" : "Re-upload"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Why verify?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4 opacity-90 font-medium leading-relaxed">
              <p>Marketplaces like Swiggy and Zomato require verified business identities before allowing bridge activations.</p>
              <p>Once verified, you'll unlock:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 italic"><CheckCircle2 className="h-3 w-3" /> Automatic Order Ingestion</li>
                <li className="flex items-center gap-2 italic"><CheckCircle2 className="h-3 w-3" /> Real-time Price Syncing</li>
                <li className="flex items-center gap-2 italic"><CheckCircle2 className="h-3 w-3" /> 1-Click Catalog Publishing</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
