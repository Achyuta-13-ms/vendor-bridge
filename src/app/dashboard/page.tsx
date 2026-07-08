"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  Link as LinkIcon, 
  RefreshCcw, 
  FileUp,
  Building,
  Check,
  ChevronRight
} from "lucide-react";

export default function DashboardPage() {
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

  const getStatus = (docs: any[]) => {
    if (!docs || docs.length === 0) return "Pending";
    const required = docs.filter((d: any) => d.type === "GST" || d.type === "PAN");
    if (required.length < 2) return "Pending";
    return required.every((d: any) => d.verification?.status === "Verified") ? "Verified" : "Pending";
  };

  const status = vendor ? getStatus(vendor.documents) : "Pending";

  if (loading) return <div className="p-10 text-center animate-pulse">Loading dashboard...</div>;

  return (
    <div className="space-y-8 pb-10">
      
      {/* SECTION 1: Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight">Welcome back, {vendor?.businessName || session?.user?.name || "Vendor"}</h1>
          <p className="text-zinc-500 mt-1">Manage your verified business identity from one place.</p>
        </div>
        <Button className="shrink-0 bg-black text-white hover:bg-black/90 font-semibold shadow-sm">
          Complete Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Identity & Status) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* SECTION 2: Business Identity Overview */}
          <section>
            <h2 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Business Identity</h2>
            <div className="bg-white border border-zinc-200 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                      <Building className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black">{vendor?.businessName || "Your Business"}</h3>
                      <p className="text-xs font-mono text-zinc-500">ID: {vendor?.id?.split("-")[0] || "NEW"}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${
                      status === "Verified" ? "bg-green-50 border-green-100 text-green-700" : "bg-amber-50 border-amber-100 text-amber-700"
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Identity {status}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Trust Score: {status === "Verified" ? 99 : 45}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 text-black text-xs font-bold">
                      Compliance {status === "Verified" ? "Active" : "Pending"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="p-2 bg-white border border-zinc-200 rounded-xl shadow-sm">
                    <QrCode className="w-20 h-20 text-black" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-xs h-8">
                    View Full Identity
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: Verification Status */}
          <section>
            <h2 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Verification Status</h2>
            <div className="bg-white border border-zinc-200 rounded-[16px] shadow-sm p-6 md:p-8">
              <div className="relative">
                {/* Horizontal line for desktop */}
                <div className="hidden md:block absolute top-4 left-4 right-4 h-0.5 bg-zinc-100" />
                {/* Active line */}
                <div className="hidden md:block absolute top-4 left-4 w-[60%] h-0.5 bg-orange-500" />

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2">
                  {[
                    { label: "Account Created", status: "complete" },
                    { label: "Details Submitted", status: vendor?.businessName ? "complete" : "active" },
                    { label: "Documents Uploaded", status: vendor?.documents?.length >= 2 ? "complete" : vendor?.businessName ? "active" : "pending" },
                    { label: "Verification Complete", status: status === "Verified" ? "complete" : vendor?.documents?.length >= 2 ? "active" : "pending" },
                    { label: "Identity Active", status: status === "Verified" ? "complete" : "pending" },
                  ].map((step, i) => (
                    <div key={i} className="relative z-10 flex md:flex-col items-center md:text-center gap-4 md:gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                        step.status === "complete" ? "bg-black border-black text-white" :
                        step.status === "active" ? "bg-white border-orange-500 shadow-[0_0_0_4px_#FFF7ED]" :
                        "bg-white border-zinc-200"
                      }`}>
                        {step.status === "complete" ? <Check className="w-4 h-4" strokeWidth={3} /> :
                         step.status === "active" ? <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" /> :
                         null}
                      </div>
                      <span className={`text-xs font-bold leading-tight ${
                        step.status === "pending" ? "text-zinc-400" : "text-black"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: Connected Organizations */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-black uppercase tracking-wider">Connected Organizations</h2>
              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">Share Identity</Button>
            </div>
            <div className="bg-white border border-zinc-200 rounded-[16px] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase font-bold text-zinc-500">
                    <tr>
                      <th className="px-6 py-4">Organization</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Access Granted</th>
                      <th className="px-6 py-4">Last Accessed</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                        No organizations connected yet.
                      </td>
                    </tr>
                    {/* Placeholder for future rows */}
                    {/* <tr className="border-b border-zinc-100 hover:bg-zinc-50">
                      <td className="px-6 py-4 font-semibold text-black">HDFC Bank</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold">Active</span></td>
                      <td className="px-6 py-4 text-zinc-600">Full Profile, KYC</td>
                      <td className="px-6 py-4 text-zinc-600">2 days ago</td>
                      <td className="px-6 py-4 text-right"><Button variant="ghost" size="sm">Manage</Button></td>
                    </tr> */}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column (Compliance, Activity, Actions) */}
        <div className="space-y-8">
          
          {/* SECTION 4: Compliance Overview */}
          <section>
            <h2 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Compliance</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-zinc-200 p-4 rounded-[16px] shadow-sm">
                <div className="text-xs text-zinc-500 font-semibold mb-2">GST Status</div>
                <div className={`flex items-center gap-2 text-sm font-bold ${vendor?.documents?.some((d:any) => d.type === "GST" && d.verification?.status === "Verified") ? "text-green-700" : "text-amber-600"}`}>
                  <CheckCircle2 className="w-4 h-4" /> {vendor?.documents?.some((d:any) => d.type === "GST" && d.verification?.status === "Verified") ? "Verified" : "Pending"}
                </div>
              </div>
              <div className="bg-white border border-zinc-200 p-4 rounded-[16px] shadow-sm">
                <div className="text-xs text-zinc-500 font-semibold mb-2">PAN Status</div>
                <div className={`flex items-center gap-2 text-sm font-bold ${vendor?.documents?.some((d:any) => d.type === "PAN" && d.verification?.status === "Verified") ? "text-green-700" : "text-amber-600"}`}>
                  <CheckCircle2 className="w-4 h-4" /> {vendor?.documents?.some((d:any) => d.type === "PAN" && d.verification?.status === "Verified") ? "Verified" : "Pending"}
                </div>
              </div>
              <div className="bg-white border border-zinc-200 p-4 rounded-[16px] shadow-sm">
                <div className="text-xs text-zinc-500 font-semibold mb-2">Doc Expiry</div>
                <div className="flex items-center gap-2 text-sm font-bold text-orange-600">
                  <Clock className="w-4 h-4" /> {status === "Verified" ? "Active" : "N/A"}
                </div>
              </div>
              <div className="bg-white border border-zinc-200 p-4 rounded-[16px] shadow-sm">
                <div className="text-xs text-zinc-500 font-semibold mb-2">Health</div>
                <div className="flex items-center gap-2 text-sm font-bold text-black">
                  <ShieldCheck className="w-4 h-4 text-orange-500" /> {status === "Verified" ? "Excellent" : "Needs Action"}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 7: Quick Actions */}
          <section>
            <h2 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Quick Actions</h2>
            <div className="bg-white border border-zinc-200 rounded-[16px] shadow-sm p-2 flex flex-col">
              <button className="flex items-center gap-3 w-full p-3 text-sm font-semibold text-black hover:bg-zinc-50 rounded-xl transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0"><LinkIcon className="w-4 h-4" /></div>
                Create Share Link
              </button>
              <button className="flex items-center gap-3 w-full p-3 text-sm font-semibold text-black hover:bg-zinc-50 rounded-xl transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0"><Download className="w-4 h-4" /></div>
                Download Identity PDF
              </button>
              <button className="flex items-center gap-3 w-full p-3 text-sm font-semibold text-black hover:bg-zinc-50 rounded-xl transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0"><QrCode className="w-4 h-4" /></div>
                Generate QR Code
              </button>
              <button className="flex items-center gap-3 w-full p-3 text-sm font-semibold text-black hover:bg-zinc-50 rounded-xl transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0"><FileUp className="w-4 h-4" /></div>
                Upload New Document
              </button>
              <button className="flex items-center gap-3 w-full p-3 text-sm font-semibold text-black hover:bg-zinc-50 rounded-xl transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0"><RefreshCcw className="w-4 h-4" /></div>
                Request Verification Update
              </button>
            </div>
          </section>

          {/* SECTION 6: Recent Activity */}
          <section>
            <h2 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Recent Activity</h2>
            <div className="bg-white border border-zinc-200 rounded-[16px] shadow-sm p-6">
              <div className="relative pl-4 space-y-6">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-200" />
                
                <div className="relative flex items-start gap-4">
                  <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center shrink-0 z-10 mt-0.5 border-2 border-white shadow-sm" />
                  <div>
                    <p className="text-sm font-bold text-black leading-none mb-1">Verification Started</p>
                    <p className="text-xs text-zinc-500">Just now</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="w-4 h-4 rounded-full bg-zinc-300 flex items-center justify-center shrink-0 z-10 mt-0.5 border-2 border-white shadow-sm" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-600 leading-none mb-1">Documents Uploaded</p>
                    <p className="text-xs text-zinc-500">2 hours ago</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="w-4 h-4 rounded-full bg-zinc-300 flex items-center justify-center shrink-0 z-10 mt-0.5 border-2 border-white shadow-sm" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-600 leading-none mb-1">Business Profile Updated</p>
                    <p className="text-xs text-zinc-500">3 hours ago</p>
                  </div>
                </div>
                
                <div className="relative flex items-start gap-4">
                  <div className="w-4 h-4 rounded-full bg-zinc-300 flex items-center justify-center shrink-0 z-10 mt-0.5 border-2 border-white shadow-sm" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-600 leading-none mb-1">Account Created</p>
                    <p className="text-xs text-zinc-500">Yesterday</p>
                  </div>
                </div>

              </div>
              <Button variant="link" className="w-full mt-4 text-orange-600 text-xs font-bold p-0 h-auto">View All Activity <ChevronRight className="w-3 h-3 ml-1" /></Button>
            </div>
          </section>

        </div>
      </div>

    </div>
  );
}
