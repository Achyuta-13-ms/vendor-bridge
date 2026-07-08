"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Files, Eye, RefreshCw, Trash2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocumentsPage() {
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

  if (loading) return <div className="p-10 text-center text-zinc-500 animate-pulse">Loading documents...</div>;

  const docs = vendor?.documents || [];
  
  // Verification has started if the vendor is anything other than PENDING
  // Or if any document has a verification status other than PENDING
  const verificationStarted = vendor?.status !== "PENDING" || docs.some((d: any) => d.verification?.status && d.verification.status !== "PENDING");

  const requiredDocs = [
    { type: "GST", label: "GST Certificate" },
    { type: "PAN", label: "PAN Card" },
    { type: "BANK", label: "Bank Account Proof" },
    { type: "INCORPORATION", label: "Certificate of Incorporation" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-black text-black tracking-tight">Documents</h1>
        <p className="text-zinc-500 mt-1">Manage your uploaded business compliance documents.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-[16px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase font-bold text-zinc-500">
              <tr>
                <th className="px-6 py-4">Document Type</th>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Upload Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {requiredDocs.map((req) => {
                const doc = docs.find((d: any) => d.type === req.type);
                const status = doc?.verification?.status || "Missing";
                
                return (
                  <tr key={req.type} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-black">{req.label}</td>
                    <td className="px-6 py-4 text-zinc-600 font-medium">
                      {doc ? (
                        <div className="flex items-center gap-2">
                          <Files className="w-4 h-4 text-zinc-400" />
                          {doc.originalName || "Document Uploaded"}
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">Not uploaded</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {status === "Verified" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : status === "Rejected" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold border border-red-100">
                          <AlertCircle className="w-3.5 h-3.5" /> Rejected
                        </span>
                      ) : status === "PENDING" || doc ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                          <Clock className="w-3.5 h-3.5" /> Pending Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                          <AlertCircle className="w-3.5 h-3.5" /> Required
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {doc ? new Date(doc.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" disabled={!doc} className="h-8 w-8 p-0" title="View">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title={doc ? "Replace" : "Upload"}>
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled={!doc || verificationStarted} 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
