"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Script from "next/script";
import { 
  Server, 
  Activity, 
  ArrowUpCircle,
  Zap,
  ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function PlatformPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vendorSession, setVendorSession] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("vendorSession");
    if (raw) {
      const session = JSON.parse(raw);
      setVendorSession(session);
      fetchUsage(session.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUsage = async (userId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/platform/usage?userId=${userId}`);
      if (res.data.success) {
        setData({
          plan: res.data.plan,
          usage: res.data.usage,
          limit: res.data.limit,
          remaining: res.data.remaining
        });
      }
    } catch (err) {
      console.error("Usage fetch error:", err);
      toast.error("Failed to load platform usage data.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName: string) => {
    if (!vendorSession) return;
    
    // Free plan bypasses payment
    if (planName === "free") {
      try {
        const res = await axios.post("/api/platform/upgrade", { userId: vendorSession.id, plan: planName });
        if (res.data.success) {
          toast.success("Switched to free plan.");
          fetchUsage(vendorSession.id);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to change plan.");
      }
      return;
    }

    try {
      const orderRes = await axios.post("/api/payment/create-order", { plan: planName });
      if (!orderRes.data.success) {
        toast.error("Failed to create order");
        return;
      }

      const { orderId, amount, key } = orderRes.data;

      const options = {
        key,
        amount,
        currency: "INR",
        name: "VyapaarSetu",

        description: `Upgrade to ${planName} Plan`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await axios.post("/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planName,
              userId: vendorSession.id
            });
            if (verifyRes.data.success) {
              toast.success(`Upgraded to ${planName} plan!`);
              fetchUsage(vendorSession.id);
            }
          } catch (verifyErr: any) {
             toast.error(verifyErr.response?.data?.message || "Payment verification failed.");
          }
        },
        theme: {
          color: "#6366f1",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Payment initialization failed.");
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  const { plan, usage, limit, remaining } = data;
  const usagePercentage = Math.min((usage / limit) * 100, 100);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="p-6 md:p-10 space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <Server className="h-8 w-8 text-primary" />
          Platform Metrics
        </h1>
        <p className="text-muted-foreground font-medium">Monitor API usage, manage plan rates, and view metrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* KPI Cards */}
        <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Current Plan</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Zap className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black capitalize">{plan}</div>
            <p className="text-sm font-medium text-muted-foreground mt-1">Upgrade for more limits</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">API Usage</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{usage.toLocaleString()} / {limit.toLocaleString()}</div>
            <Progress value={usagePercentage} className="h-2 mt-3" />
            {usagePercentage >= 90 && (
              <p className="text-xs font-bold text-destructive mt-2 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> Warning: Approaching Limit
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Remaining Calls</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ArrowUpCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{remaining.toLocaleString()}</div>
            <p className="text-sm font-medium text-muted-foreground mt-1">resets next billing cycle</p>
          </CardContent>
        </Card>
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Upgrade Plan</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <PlanCard planName="free" currentPlan={plan} limit="50" onUpgrade={() => handleUpgrade("free")} />
          <PlanCard planName="starter" currentPlan={plan} limit="1,000" onUpgrade={() => handleUpgrade("starter")} />
          <PlanCard planName="growth" currentPlan={plan} limit="10,000" onUpgrade={() => handleUpgrade("growth")} />
          <PlanCard planName="enterprise" currentPlan={plan} limit="100,000" onUpgrade={() => handleUpgrade("enterprise")} />
        </div>
      </div>
      </div>
    </>
  );
}

function PlanCard({ planName, currentPlan, limit, onUpgrade }: any) {
  const isCurrent = planName.toLowerCase() === currentPlan.toLowerCase();
  return (
    <Card className={`border shadow-sm flex flex-col justify-between ${isCurrent ? "ring-2 ring-primary bg-primary/5" : ""}`}>
      <CardHeader>
        <CardTitle className="capitalize text-lg">{planName}</CardTitle>
        <CardDescription>{limit} API calls</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="text-sm text-muted-foreground space-y-2 font-medium">
          <li>✔ Usage Tracking</li>
          <li>✔ Global API Access</li>
          {planName !== "free" && <li>✔ Priority Support</li>}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          variant={isCurrent ? "secondary" : "default"} 
          className="w-full font-bold" 
          disabled={isCurrent}
          onClick={onUpgrade}
        >
          {isCurrent ? "Current Plan" : "Upgrade"}
        </Button>
      </CardFooter>
    </Card>
  );
}
