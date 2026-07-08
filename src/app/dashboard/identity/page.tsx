"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { ShieldCheck, QrCode, Download, Link as LinkIcon, Building } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IdentityPage() {
  const { data: session } = useSession();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await axios.get("/api/vendor/me");
        if (res.data.success) {
          setVendor(res.data.vendor);
        }
      } catch (err) {
        console.error("Failed to fetch vendor", err);
      } finally {
        setLoading(false);
      }
    };
    if (session?.user) fetchVendor();
  }, [session]);

  const getRequired = () => vendor?.documents?.filter((d: any) => ["GST", "PAN", "BANK", "INCORPORATION"].includes(d.type)) || [];
  
  const getIdentityStatus = () => {
    if (!vendor) return "Pending Review";
    if (vendor.status === "ACTIVE") return "Verified";
    if (vendor.status === "REJECTED") return "Rejected";
    
    const required = getRequired();
    if (required.length === 0) return "Requires Action";
    const allVerified = required.length > 0 && required.every((d: any) => d.verification?.status === "Verified");
    return allVerified ? "Verified" : "Pending Review";
  };

  const getTrustScore = () => {
    const required = getRequired();
    if (required.length === 0) return 20;
    const verified = required.filter((d: any) => d.verification?.status === "Verified").length;
    return Math.min(100, 20 + (verified / 4) * 80);
  };

  const status = getIdentityStatus();
  const score = getTrustScore();

  const getDoc = (type: string) => vendor?.documents?.find((d: any) => d.type === type)?.originalName || "Not provided";
  const getRegDate = () => vendor?.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : "N/A";

  if (loading) return <div className="p-10 text-center text-zinc-500 animate-pulse">Loading Identity Card...</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-black tracking-tight">Business Identity</h1>
        <p className="text-zinc-500 mt-1">Your verifiable digital identity card.</p>
      </div>

      <div className="bg-black text-white p-8 md:p-10 rounded-[24px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 relative z-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Building className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Business Name</div>
              <div className="text-3xl font-black tracking-tight">{vendor?.businessName || "Pending Profile"}</div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-2xl shrink-0">
            <QrCode className="w-20 h-20 text-black" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 relative z-10">
          <div>
            <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Business ID</div>
            <div className="font-mono text-sm tracking-wider">{vendor?.id?.split("-")[0].toUpperCase() || "N/A"}</div>
          </div>
          <div>
            <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Entity Type</div>
            <div className="text-sm font-semibold">{vendor?.businessType || "N/A"}</div>
          </div>
          <div>
            <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Registration Date</div>
            <div className="text-sm font-semibold">{getRegDate()}</div>
          </div>
          <div>
            <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Trust Score</div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-green-400">
              <ShieldCheck className="w-4 h-4" /> {score}/100
            </div>
          </div>
          
          <div>
            <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">GST Number</div>
            <div className="text-sm font-semibold">{getDoc("GST")}</div>
          </div>
          <div>
            <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">PAN Number</div>
            <div className="text-sm font-semibold">{getDoc("PAN")}</div>
          </div>
          <div className="col-span-2">
            <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Verification Status</div>
            <div className="text-sm font-semibold text-white">{status}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="gap-2 font-bold"><Download className="w-4 h-4" /> Download PDF</Button>
        <Button variant="outline" className="gap-2 font-bold"><LinkIcon className="w-4 h-4" /> Copy Public Link</Button>
      </div>

    </div>
  );
}
