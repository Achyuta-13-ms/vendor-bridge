"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Clock, CheckCircle2, XCircle, RefreshCw, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface AdminMetrics {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchVerifications = async () => {
    try {
      const res = await fetch("/api/admin/verifications");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
      } else {
        throw new Error(data.message);
      }
    } catch (e: any) {
      toast({ title: "Failed to load metrics", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const statCards = [
    {
      title: "Total Vendors",
      key: "total" as const,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/10",
      desc: "All registered vendors",
    },
    {
      title: "Pending Review",
      key: "pending" as const,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/10",
      desc: "Awaiting verification",
    },
    {
      title: "Verified Active",
      key: "verified" as const,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/10",
      desc: "Fully onboarded",
    },
    {
      title: "Rejected",
      key: "rejected" as const,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/10",
      desc: "Requires re-submission",
    },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">Platform vendor registration statistics</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setLoading(true); fetchVerifications(); }}
          className="gap-2 shrink-0"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Card className={`border shadow-sm hover:shadow-md transition-shadow ${stat.border}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  <div className="text-3xl font-bold tabular-nums">{metrics?.[stat.key] ?? 0}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Action */}
      {!loading && (metrics?.pending ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {metrics!.pending} vendor{metrics!.pending !== 1 ? "s" : ""} pending verification
                  </p>
                  <p className="text-xs text-muted-foreground">Review and approve document submissions</p>
                </div>
              </div>
              <Button
                size="sm"
                className="gap-1.5 shrink-0"
                onClick={() => router.push("/admin/verifications")}
              >
                Review <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => router.push("/admin/verifications")}>
            View all verifications
          </Button>
        </div>
        
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="divide-y">
            {[
              { type: "Vendor Signup", name: "Modern Retailers", time: "2m ago", status: "PENDING" },
              { type: "Doc Upload", name: "Global Exports", time: "15m ago", status: "ACTIVE" },
              { type: "Verification", name: "Sunrise Foods", time: "1h ago", status: "ACTIVE" },
            ].map((activity, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{activity.name}</p>
                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{activity.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">{activity.time}</p>
                  <Badge variant="outline" className="text-[9px] h-4 uppercase">{activity.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
