"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Files,
  Activity,
  ChevronRight,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
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

  const getDocs = () => vendor?.documents || [];
  const getRequired = () => getDocs().filter((d: any) => ["GST", "PAN", "BANK", "INCORPORATION"].includes(d.type));
  
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
  const uploadedCount = getRequired().length;

  if (loading) return <div className="p-10 text-center text-zinc-500 animate-pulse">Loading dashboard...</div>;

  if (!vendor?.businessName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
          <Building className="w-10 h-10 text-orange-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-black">Create your Business Identity</h1>
          <p className="text-zinc-500 mt-2 max-w-md mx-auto">You haven't completed your business profile yet. Finish onboarding to unlock your dashboard.</p>
        </div>
        <Button onClick={() => router.push("/onboarding")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-6 rounded-xl text-lg shadow-xl shadow-orange-500/20">
          Complete Onboarding
        </Button>
      </div>
    );
  }

  const lastUpdated = vendor.updatedAt ? formatDistanceToNow(new Date(vendor.updatedAt), { addSuffix: true }) : "Just now";

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">Dashboard Overview</h1>
          <p className="text-zinc-500 mt-1">Here is a summary of your Business Identity.</p>
        </div>
      </div>

      {/* DASHBOARD OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {/* Card 1: Identity Status */}
        <div className="bg-white p-5 rounded-[16px] border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Identity Status</div>
          <div className="flex items-center gap-2">
            {status === "Verified" ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
             status === "Requires Action" ? <AlertCircle className="w-5 h-5 text-amber-500" /> : 
             <Clock className="w-5 h-5 text-blue-500" />}
            <span className={`text-lg font-black ${
              status === "Verified" ? "text-green-700" :
              status === "Requires Action" ? "text-amber-700" :
              "text-blue-700"
            }`}>{status}</span>
          </div>
        </div>

        {/* Card 2: Trust Score */}
        <div className="bg-white p-5 rounded-[16px] border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Trust Score</div>
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-5 h-5 ${score >= 80 ? "text-green-500" : "text-amber-500"}`} />
            <span className="text-lg font-black text-black">{score} <span className="text-zinc-400 text-sm font-semibold">/ 100</span></span>
          </div>
        </div>

        {/* Card 3: Documents */}
        <div className="bg-white p-5 rounded-[16px] border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Documents</div>
          <div className="flex items-center gap-2">
            <Files className="w-5 h-5 text-zinc-400" />
            <span className="text-lg font-black text-black">{uploadedCount} of 4 <span className="text-zinc-400 text-sm font-semibold">Uploaded</span></span>
          </div>
        </div>

        {/* Card 4: Compliance Status */}
        <div className="bg-white p-5 rounded-[16px] border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Compliance Status</div>
          <div className="flex items-center gap-2">
            {score === 100 ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-orange-500" />}
            <span className={`text-lg font-black ${score === 100 ? "text-green-700" : "text-orange-700"}`}>
              {score === 100 ? "Compliant" : "Action Required"}
            </span>
          </div>
        </div>

        {/* Card 5: Last Updated */}
        <div className="bg-white p-5 rounded-[16px] border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Last Updated</div>
          <div className="flex items-center gap-2 text-black">
            <Activity className="w-5 h-5 text-zinc-400" />
            <span className="text-lg font-bold truncate">{lastUpdated}</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-4">
        
        {/* Quick Links Section */}
        <section>
          <h2 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Quick Navigation</h2>
          <div className="bg-white border border-zinc-200 rounded-[16px] shadow-sm flex flex-col overflow-hidden">
            <Link href="/dashboard/identity" className="flex items-center justify-between p-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center"><QrCode className="w-5 h-5 text-orange-500" /></div>
                <div>
                  <h3 className="font-bold text-black">Business Identity Card</h3>
                  <p className="text-xs text-zinc-500">View and share your digital identity</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-300" />
            </Link>
            <Link href="/dashboard/documents" className="flex items-center justify-between p-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center"><Files className="w-5 h-5 text-zinc-600" /></div>
                <div>
                  <h3 className="font-bold text-black">Manage Documents</h3>
                  <p className="text-xs text-zinc-500">View, replace, or delete uploaded files</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-300" />
            </Link>
            <Link href="/dashboard/verification" className="flex items-center justify-between p-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Clock className="w-5 h-5 text-blue-500" /></div>
                <div>
                  <h3 className="font-bold text-black">Verification Timeline</h3>
                  <p className="text-xs text-zinc-500">Track your application status</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-300" />
            </Link>
            <Link href="/dashboard/compliance" className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-green-600" /></div>
                <div>
                  <h3 className="font-bold text-black">Compliance Matrix</h3>
                  <p className="text-xs text-zinc-500">Check GST, PAN, and Bank statuses</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-300" />
            </Link>
          </div>
        </section>

        {/* Business Identity Preview */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">Identity Preview</h2>
            <Link href="/dashboard/identity" className="text-xs font-bold text-orange-600 hover:underline">View Full Card</Link>
          </div>
          <div className="bg-black text-white p-6 rounded-[20px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Business Name</div>
                <div className="text-2xl font-black">{vendor.businessName}</div>
              </div>
              <div className="bg-white p-2 rounded-xl">
                <QrCode className="w-12 h-12 text-black" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Business ID</div>
                <div className="font-mono text-sm">{vendor.id.split("-")[0].toUpperCase()}</div>
              </div>
              <div>
                <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Entity Type</div>
                <div className="text-sm font-semibold">{vendor.businessType || "Company"}</div>
              </div>
              <div>
                <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Trust Score</div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-green-400">
                  <ShieldCheck className="w-4 h-4" /> {score}/100
                </div>
              </div>
              <div>
                <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Status</div>
                <div className="text-sm font-semibold">{status}</div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
