"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { ShieldCheck, CheckCircle2, AlertCircle, Clock, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CompliancePage() {
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

  if (loading) return <div className="p-10 text-center text-zinc-500 animate-pulse">Loading compliance data...</div>;

  const docs = vendor?.documents || [];

  const getComplianceStatus = (type: string) => {
    const doc = docs.find((d: any) => d.type === type);
    if (!doc) return "Requires Action";
    if (doc.verification?.status === "Verified") return "Verified";
    if (doc.verification?.status === "Rejected") return "Requires Action";
    return "Pending";
  };

  const complianceItems = [
    { type: "GST", label: "Goods and Services Tax (GST)", description: "Required for taxation and interstate commerce.", status: getComplianceStatus("GST") },
    { type: "PAN", label: "Permanent Account Number (PAN)", description: "Required for financial transactions and TDS.", status: getComplianceStatus("PAN") },
    { type: "BANK", label: "Bank Account", description: "Verified business account for settlements.", status: getComplianceStatus("BANK") },
    { type: "INCORPORATION", label: "Business Registration", description: "Proof of business existence and entity type.", status: getComplianceStatus("INCORPORATION") },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-black tracking-tight">Compliance Matrix</h1>
        <p className="text-zinc-500 mt-1">Overview of your regulatory and identity compliance requirements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {complianceItems.map((item) => (
          <div key={item.type} className="bg-white border border-zinc-200 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            
            {/* Status Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-20 ${
              item.status === "Verified" ? "bg-green-500" :
              item.status === "Pending" ? "bg-blue-500" :
              "bg-red-500"
            }`} />

            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                item.status === "Verified" ? "bg-green-50 border-green-100" :
                item.status === "Pending" ? "bg-blue-50 border-blue-100" :
                "bg-red-50 border-red-100"
              }`}>
                {item.status === "Verified" ? <CheckCircle2 className="w-6 h-6 text-green-600" /> :
                 item.status === "Pending" ? <Clock className="w-6 h-6 text-blue-600" /> :
                 <AlertCircle className="w-6 h-6 text-red-600" />}
              </div>
              
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                item.status === "Verified" ? "bg-green-50 border-green-200 text-green-700" :
                item.status === "Pending" ? "bg-blue-50 border-blue-200 text-blue-700" :
                "bg-red-50 border-red-200 text-red-700"
              }`}>
                {item.status}
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="font-bold text-lg text-black mb-1">{item.label}</h3>
              <p className="text-sm text-zinc-500 mb-6">{item.description}</p>
            </div>

            <div className="relative z-10 border-t border-zinc-100 pt-4 flex items-center justify-between">
              {item.status === "Requires Action" ? (
                <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                  <Upload className="w-4 h-4 mr-2" /> Upload Document
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="w-full text-zinc-600">
                  <FileText className="w-4 h-4 mr-2" /> View Details
                </Button>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
