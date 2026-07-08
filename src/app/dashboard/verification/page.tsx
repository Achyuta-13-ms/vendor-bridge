"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Check, Clock, AlertCircle } from "lucide-react";

export default function VerificationTimelinePage() {
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

  if (loading) return <div className="p-10 text-center text-zinc-500 animate-pulse">Loading timeline...</div>;

  const docs = vendor?.documents || [];
  const requiredDocs = docs.filter((d: any) => ["GST", "PAN", "BANK", "INCORPORATION"].includes(d.type));
  
  // Logic for timeline states
  const hasBusiness = !!vendor?.businessName;
  const hasDocs = requiredDocs.length > 0;
  const isVerifying = vendor?.status === "PENDING" && hasDocs;
  const allVerified = requiredDocs.length > 0 && requiredDocs.every((d: any) => d.verification?.status === "Verified");
  const identityIssued = vendor?.status === "ACTIVE" || allVerified;

  const timeline = [
    {
      title: "Business Created",
      description: "Basic profile and contact details submitted.",
      status: hasBusiness ? "complete" : "active",
      date: vendor?.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : null
    },
    {
      title: "Documents Uploaded",
      description: "Required KYC documents submitted for verification.",
      status: hasDocs ? "complete" : hasBusiness ? "active" : "pending",
      date: hasDocs ? new Date(Math.max(...requiredDocs.map((d: any) => new Date(d.createdAt).getTime()))).toLocaleDateString() : null
    },
    {
      title: "Under Verification",
      description: "Our team is verifying your submitted documents.",
      status: allVerified ? "complete" : isVerifying ? "active" : "pending",
      date: isVerifying ? "In Progress" : null
    },
    {
      title: "Verified",
      description: "All documents have been successfully verified.",
      status: allVerified ? "complete" : "pending",
      date: allVerified ? "Complete" : null
    },
    {
      title: "Business Identity Issued",
      description: "Your digital Business Identity is now active and ready to share.",
      status: identityIssued ? "complete" : "pending",
      date: identityIssued ? "Active" : null
    }
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black text-black tracking-tight">Verification Status</h1>
        <p className="text-zinc-500 mt-1">Track the progress of your Business Identity application.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-[16px] shadow-sm p-8 md:p-12">
        <div className="relative space-y-10 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
          {timeline.map((item, index) => (
            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              {/* Icon */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-colors ${
                item.status === "complete" ? "bg-black text-white" :
                item.status === "active" ? "bg-orange-500 text-white animate-pulse shadow-[0_0_0_4px_#FFF7ED]" :
                "bg-zinc-100 text-zinc-300"
              }`}>
                {item.status === "complete" ? <Check className="w-5 h-5" strokeWidth={3} /> :
                 item.status === "active" ? <Clock className="w-5 h-5" /> :
                 <div className="w-3 h-3 bg-zinc-300 rounded-full" />}
              </div>
              
              {/* Content */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-bold text-lg ${item.status === "pending" ? "text-zinc-400" : "text-black"}`}>{item.title}</h3>
                  {item.date && <span className={`text-xs font-semibold ${item.status === "active" ? "text-orange-500" : "text-zinc-400"}`}>{item.date}</span>}
                </div>
                <p className={`text-sm ${item.status === "pending" ? "text-zinc-400" : "text-zinc-600"}`}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
