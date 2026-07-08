"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { format, subMonths } from "date-fns";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await axios.get("/api/enterprise/businesses");
        if (res.data.success) {
          setData(res.data.businesses);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center">Generating Reports...</div>;
  }

  // Generate mock chart data based on actual numbers
  const verifiedCount = data.filter((b: any) => b.status === "APPROVED").length;
  const pendingCount = data.filter((b: any) => b.status === "PENDING").length;

  const statusData = [
    { name: "Verified", count: verifiedCount, fill: "#22c55e" },
    { name: "Pending", count: pendingCount, fill: "#f59e0b" },
    { name: "Rejected", count: 0, fill: "#ef4444" },
  ];

  // Mock month-over-month growth
  const monthsData = Array.from({length: 6}).map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return {
      name: format(d, 'MMM'),
      invited: Math.floor(Math.random() * 20) + 5,
      verified: Math.floor(Math.random() * 15) + 2
    };
  });
  
  // Add actual data to the current month
  monthsData[5].verified += verifiedCount;
  monthsData[5].invited += verifiedCount + pendingCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Onboarding Reports</h1>
          <p className="text-muted-foreground">Visualize your vendor onboarding metrics and growth.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle>Onboarding Growth (6 Months)</CardTitle>
            <CardDescription>Businesses invited vs successfully verified.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthsData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="invited" name="Invited" stroke="#3b82f6" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="verified" name="Verified" stroke="#f97316" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle>Current Status Breakdown</CardTitle>
            <CardDescription>Total distribution of businesses in your pipeline.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#71717a'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#71717a'}} />
                <Tooltip 
                  cursor={{fill: '#f4f4f5'}}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
