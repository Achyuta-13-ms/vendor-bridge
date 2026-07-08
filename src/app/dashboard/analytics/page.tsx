"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar
} from "lucide-react";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  Bar,
  BarChart,
  LabelList
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartConfig 
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const chartConfig: ChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--muted-foreground))",
  },
};

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7");

  useEffect(() => {
    if ((session?.user as any)?.id) {
      fetchAnalytics((session?.user as any).id, range);
    }
  }, [session, range]);

  const fetchAnalytics = async (userId: string, r: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/vendor/analytics?userId=${userId}&range=${r}`);
      if (res.data.success) setData(res.data.analytics);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-[300px] bg-muted rounded-xl" />
          <div className="h-[300px] bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  const { kpis, salesTrend, platformDistribution, hourlyDistribution } = data;

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Business Intelligence
          </h1>
          <p className="text-muted-foreground font-medium">Platform-wide performance and sales analysis.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border">
          {["7", "30", "90"].map(r => (
            <Button 
              key={r}
              variant={range === r ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setRange(r)}
              className="px-4 text-xs font-bold"
            >
              {r} Days
            </Button>
          ))}
          <div className="w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Calendar className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Total Revenue" 
          value={`₹${kpis.totalRevenue.toLocaleString()}`} 
          desc="+12.5% from last month" 
          icon={DollarSign}
          trend="up"
        />
        <KpiCard 
          title="Orders Bridged" 
          value={kpis.orderCount} 
          desc="+4% from last period" 
          icon={ShoppingBag}
          trend="up"
        />
        <KpiCard 
          title="Avg. Order Value" 
          value={`₹${Math.round(kpis.aov)}`} 
          desc="Stable" 
          icon={TrendingUp}
        />
        <KpiCard 
          title="Bridge Utilization" 
          value="98.2%" 
          desc="API Latency < 45ms" 
          icon={ArrowUpRight}
          trend="up"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Sales Trend Chart */}
        <Card className="lg:col-span-4 border-none shadow-xl bg-gradient-to-br from-background to-muted/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Daily revenue performance across all platforms.</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] w-full pt-4">
            <ChartContainer config={chartConfig}>
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="url(#fillRevenue)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t p-4 flex justify-between">
            <div className="text-xs font-medium text-muted-foreground">
              Calculated dynamically from the Bridge order pool.
            </div>
          </CardFooter>
        </Card>

        {/* Platform Share Pie Chart */}
        <Card className="lg:col-span-3 border-none shadow-xl">
          <CardHeader>
            <CardTitle>Platform Share</CardTitle>
            <CardDescription>Market distribution per marketplace.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformDistribution}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              {platformDistribution.map((plat: any, i: number) => (
                <div key={plat.name} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs font-bold truncate">{plat.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{plat.value} ords</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Hourly Density */}
      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Hourly Peak Density</CardTitle>
              <CardDescription>Identification of busy hours for operational scaling.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[250px] w-full pt-8">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={hourlyDistribution}>
              <XAxis 
                dataKey="hour" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9 }}
              />
              <ChartTooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} content={<ChartTooltipContent />} />
              <Bar 
                dataKey="orders" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
              >
                <LabelList dataKey="orders" position="top" style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, desc, icon: Icon, trend }: any) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold tracking-widest uppercase text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          {trend === "up" ? <ArrowUpRight className="h-3 w-3 text-blue-500" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3 text-red-500" /> : null}

          <p className="text-[10px] font-medium text-muted-foreground">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}
