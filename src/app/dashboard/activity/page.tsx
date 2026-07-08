"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Activity as ActivityIcon, Upload, Edit, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ActivityPage() {
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

  if (loading) return <div className="p-10 text-center text-zinc-500 animate-pulse">Loading activity...</div>;

  // Synthesize activity feed from vendor and document timestamps
  const activities: Array<{ id: string, title: string, date: Date, type: string }> = [];

  if (vendor) {
    activities.push({
      id: "created",
      title: "Business Profile Created",
      date: new Date(vendor.createdAt),
      type: "create"
    });

    if (vendor.updatedAt && new Date(vendor.updatedAt).getTime() - new Date(vendor.createdAt).getTime() > 1000) {
      activities.push({
        id: "updated",
        title: "Business Profile Updated",
        date: new Date(vendor.updatedAt),
        type: "update"
      });
    }

    if (vendor.status === "ACTIVE") {
      activities.push({
        id: "verified",
        title: "Business Identity Verified and Issued",
        date: vendor.updatedAt ? new Date(vendor.updatedAt) : new Date(),
        type: "verify"
      });
    }
  }

  const docs = vendor?.documents || [];
  docs.forEach((doc: any) => {
    activities.push({
      id: `doc_upload_${doc.id}`,
      title: `${doc.type} Uploaded`,
      date: new Date(doc.createdAt),
      type: "upload"
    });

    if (doc.updatedAt && new Date(doc.updatedAt).getTime() - new Date(doc.createdAt).getTime() > 1000) {
      activities.push({
        id: `doc_update_${doc.id}`,
        title: `${doc.type} Replaced`,
        date: new Date(doc.updatedAt),
        type: "update"
      });
    }

    if (doc.verification?.status === "Verified") {
      activities.push({
        id: `doc_verify_${doc.id}`,
        title: `${doc.type} Verified`,
        date: new Date(doc.verification.updatedAt || doc.updatedAt),
        type: "verify"
      });
    }
  });

  // Sort by newest first
  activities.sort((a, b) => b.date.getTime() - a.date.getTime());

  const getIcon = (type: string) => {
    switch (type) {
      case "create": return <CheckCircle2 className="w-5 h-5 text-white" />;
      case "update": return <Edit className="w-5 h-5 text-white" />;
      case "upload": return <Upload className="w-5 h-5 text-white" />;
      case "verify": return <ShieldCheck className="w-5 h-5 text-white" />;
      default: return <ActivityIcon className="w-5 h-5 text-white" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "create": return "bg-blue-500 shadow-[0_0_0_4px_#EFF6FF]";
      case "update": return "bg-zinc-500 shadow-[0_0_0_4px_#F4F4F5]";
      case "upload": return "bg-orange-500 shadow-[0_0_0_4px_#FFF7ED]";
      case "verify": return "bg-green-500 shadow-[0_0_0_4px_#F0FDF4]";
      default: return "bg-black";
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black text-black tracking-tight">Activity</h1>
        <p className="text-zinc-500 mt-1">Recent actions and compliance events for your account.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-[16px] shadow-sm p-8">
        {activities.length === 0 ? (
          <div className="text-center text-zinc-500 py-10">No activity found.</div>
        ) : (
          <div className="relative pl-6 space-y-8">
            {/* Vertical Line */}
            <div className="absolute left-[31px] top-4 bottom-4 w-px bg-zinc-200" />
            
            {activities.map((activity, idx) => (
              <div key={`${activity.id}-${idx}`} className="relative flex items-start gap-6">
                
                {/* Icon Container */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative z-10 ${getColor(activity.type)}`}>
                  {getIcon(activity.type)}
                </div>
                
                {/* Content */}
                <div className="pt-2">
                  <p className="text-base font-bold text-black leading-none mb-1.5">{activity.title}</p>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDistanceToNow(activity.date, { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
