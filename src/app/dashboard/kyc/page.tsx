"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { cn } from "@/lib/utils";
import DocumentManager from "@/components/dashboard/DocumentManager";

const DEMO_KYC_VENDOR = {
  id: "v-demo-kyc",
  documents: [
    { type: "GST", verification: { status: "Verified" } },
    { type: "PAN", verification: { status: "Verified" } },
    { type: "BANK", verification: { status: "Pending" } }
  ]
};

export default function KYCPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    } else if (authStatus === "authenticated" && (session?.user as any)?.id) {
      fetchVendor((session?.user as any).id);
    }

    // Safety timeout
    const timer = setTimeout(() => {
      if (loading && !vendor) {
        setLoading(false);
        setVendor(DEMO_KYC_VENDOR);
        setIsDemo(true);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [authStatus, session]);

  const fetchVendor = async (userId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/vendor?userId=${userId}`);
      if (res.data.success && res.data.vendor) {
        setVendor(res.data.vendor);
        setIsDemo(false);
      } else {
        setVendor(DEMO_KYC_VENDOR);
        setIsDemo(true);
      }
    } catch (err) {
      console.error("KYC fetch error:", err);
      setVendor(DEMO_KYC_VENDOR);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <ShieldCheck className="h-10 w-10 text-primary animate-pulse" />
          <p className="text-muted-foreground animate-pulse font-medium">Verifying Document Status...</p>
        </div>
      </div>
    );
  }

  if (!vendor) return <div className="p-10 animate-pulse bg-muted/20 h-screen" />;

  const getDocStatus = (type: string) => {
    const doc = vendor.documents.find((d: any) => d.type === type);
    const status = doc?.verification?.status ?? "Pending Upload";
    
    if (status.toLowerCase() === "verified") {
      if (type === "GST" || type === "PAN") return "Format Verified";
      return "Verified";
    }
    if (status.toLowerCase() === "pending" && doc) {
      return "Under Review";
    }
    return status;
  };

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
      case "format verified": 
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "pending":
      case "under review": 
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "rejected": 
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default: 
        return "text-muted-foreground bg-muted border-transparent";
    }
  };

  const requiredDocTypes = ["GST", "PAN", "BANK", "INCORPORATION"];
  const verifiedDocsCount = vendor.documents.filter((d: any) => requiredDocTypes.includes(d.type) && d.verification?.status?.toLowerCase() === "verified").length;
  const kycProgress = (verifiedDocsCount / 4) * 100;

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
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground font-medium italic">Authentication required for marketplace bridge activation.</p>
            {isDemo && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] animate-pulse">
                DEMO MODE
              </Badge>
            )}
          </div>
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
              <DocumentManager 
                vendorId={vendor.id} 
                documents={vendor.documents || []} 
                onDocumentChange={() => fetchVendor((session?.user as any).id)} 
              />
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
