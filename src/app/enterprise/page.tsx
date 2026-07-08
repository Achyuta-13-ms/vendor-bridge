"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Users, CheckCircle2, AlertCircle, FileText, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EnterpriseDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/enterprise/dashboard");
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center">Loading Enterprise Dashboard...</div>;
  }

  if (!data) {
    return <div className="flex h-[400px] items-center justify-center text-red-500">Failed to load dashboard data.</div>;
  }

  const { kpis, recentVendors } = data;

  const kpiCards = [
    { title: "Businesses Invited", value: kpis.invited, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Businesses Verified", value: kpis.verified, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
    { title: "Pending Reviews", value: kpis.pending, icon: FileText, color: "text-orange-500", bg: "bg-orange-50" },
    { title: "Compliance Alerts", value: kpis.complianceAlerts, icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Enterprise Overview</h1>
        <p className="text-muted-foreground">Monitor onboarding and verification across your network.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="shadow-sm border-zinc-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm border-zinc-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-500" />
            Recently Shared Identities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentVendors.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6">No recent identities shared.</div>
          ) : (
            <div className="space-y-4">
              {recentVendors.map((ev: any) => (
                <div key={ev.id} className="flex items-center justify-between p-4 border rounded-xl bg-zinc-50/50">
                  <div>
                    <p className="font-semibold">{ev.vendor?.businessName || "Unknown Business"}</p>
                    <p className="text-xs text-muted-foreground">{ev.vendor?.businessType} • {ev.vendor?.city}</p>
                  </div>
                  <div>
                    <Badge variant={ev.status === "APPROVED" ? "default" : "secondary"} className={ev.status === "APPROVED" ? "bg-green-100 text-green-700" : ""}>
                      {ev.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
