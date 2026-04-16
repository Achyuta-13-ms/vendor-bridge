"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  Copy, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  LogOut, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Globe,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useBridgeNotifications } from "@/hooks/use-bridge-notifications";
import { OrderDetailsSheet } from "@/components/order-details-sheet";
import { TrendingUp, Package, AlertTriangle } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  displayName: string;
  logoUrl?: string;
}

interface Connection {
  id: string;
  platformId: string;
  status: string;
  platform: Platform;
}

interface Document {
  id: string;
  type: string;
  url: string;
  verification?: { status: string; response?: string | null; rejectionReason?: string | null } | null;
}

interface Order {
  id: string;
  externalOrderId: string;
  status: string;
  total: number;
  placedAt: string;
  platform: Platform;
  items: { name: string; quantity: number }[];
  customer?: { name: string; phone: string } | null;
}

interface VendorData {
  id: string;
  businessName: string | null;
  businessType: string | null;
  addressLine1: string | null;
  city: string | null;
  status: string;
  createdAt: string;
  user: { email: string; phone: string };
  documents: Document[];
  connections: Connection[];
  orders: Order[];
}

const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "verified": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    case "pending": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    case "rejected": return "text-red-500 bg-red-500/10 border-red-500/20";
    default: return "text-muted-foreground bg-muted border-transparent";
  }
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      staggerChildren: 0.1
    } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function VendorDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderSheetOpen, setIsOrderSheetOpen] = useState(false);

  // Initialize notifications
  useBridgeNotifications(vendor?.orders);

  useEffect(() => {
    const raw = localStorage.getItem("vendorSession");
    if (!raw) {
      router.push("/login");
      return;
    }
    const session = JSON.parse(raw);
    fetchData(session.id);

    // Auto-poll status every 30 seconds
    const interval = setInterval(() => fetchData(session.id, true), 30000);
    return () => clearInterval(interval);
  }, [router]);

  const fetchData = async (userId: string, isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [vendorRes, platformRes, analyticsRes, productsRes] = await Promise.all([
        axios.get(`/api/vendor?userId=${userId}`),
        axios.get('/api/platforms'),
        axios.get(`/api/vendor/analytics?userId=${userId}&range=1`),
        axios.get(`/api/vendor/products?userId=${userId}`)
      ]);

      if (vendorRes.data.success) setVendor(vendorRes.data.vendor);
      if (platformRes.data.success) setPlatforms(platformRes.data.platforms);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.analytics);
      if (productsRes.data.success) setProducts(productsRes.data.products);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderSheetOpen(true);
  };

  const handleStatusUpdate = (updatedOrder: any) => {
    if (!vendor) return;
    
    // Update local state optimistically
    const updatedOrders = vendor.orders.map(o => 
      o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o
    );
    
    setVendor({ ...vendor, orders: updatedOrders });
    setIsOrderSheetOpen(false);
    
    // Refresh for consistency
    fetchData(vendor.id, true);
  };

  const getDocStatus = (type: string) => {
    const doc = vendor?.documents.find(d => d.type === type);
    return doc?.verification?.status ?? "Pending Upload";
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Syncing Business Data...</p>
      </div>
    </div>
  );

  if (!vendor) return (
    <div className="flex items-center justify-center h-[80vh] p-4 text-center">
      <Card className="max-w-md border-dashed">
        <CardHeader>
          <CardTitle>Welcome to VendorBridge</CardTitle>
          <CardDescription>You haven't completed your profile setup. Let's get your business verified!</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full gap-2 group" onClick={() => router.push("/onboarding")}>
            Complete Onboarding <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const kycProgress = (vendor.documents.filter(d => d.verification?.status === "Verified").length / 3) * 100;

  const simulateOrder = async (pName: string) => {
    setRefreshing(true);
    try {
      await axios.post('/api/test/incoming-order', { 
        vendorId: vendor.id,
        platformName: pName
      });
      toast({ title: "Order Bridged!", description: `New mock order from ${pName} ingested.` });
      fetchData(vendor.id, true);
    } catch {
      toast({ title: "Error", description: "Failed to simulate order.", variant: "destructive" });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 md:p-10 space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              <ShieldCheck className="h-3 w-3 mr-1" />
              {vendor.status} Profile
            </Badge>
            {refreshing && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Bonjour, {vendor.businessName}</h1>
          <p className="text-muted-foreground font-medium">Here's an overview of your bridge status and compliance.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-background/50 backdrop-blur px-3 py-1.5 rounded-full border border-border shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Member ID:</span>
            <code className="text-xs font-mono">{vendor.id.slice(0, 8)}</code>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
              navigator.clipboard.writeText(vendor.id);
              toast({ title: "Copied!", description: "ID ready to bridge." });
            }}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={() => fetchData(vendor.id, true)} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column: KYC & Business Specs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* KYC Stepper Card */}
          <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-background to-muted/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">KYC Compliance</CardTitle>
                  <CardDescription>Authentication for marketplace integration</CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">{Math.round(kycProgress)}%</span>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Complete</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Progress value={kycProgress} className="h-2 bg-primary/10" />
              
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { type: "GST", label: "GST Certificate", desc: "Goods & Service Tax" },
                  { type: "PAN", label: "Company PAN", desc: "Corporate ID" },
                  { type: "BANK", label: "Bank Proof", desc: "Payout Verification" },
                ].map((docType) => {
                  const status = getDocStatus(docType.type);
                  const isVerified = status === "Verified";
                  return (
                    <div key={docType.type} className={cn(
                      "group p-4 rounded-xl border transition-all duration-300",
                      isVerified ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card border-border hover:border-primary/30 shadow-sm"
                    )}>
                      <div className="flex items-center justify-between mb-3">
                        <div className={cn("p-2 rounded-lg", isVerified ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-muted-foreground")}>
                          {isVerified ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        </div>
                        <Badge className={cn("text-[10px] font-bold px-1.5", statusColor(status))}>
                          {status}
                        </Badge>
                      </div>
                      <p className="font-bold text-sm tracking-tight">{docType.label}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{docType.desc}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Marketplace Connections Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Marketplace Bridge
              </h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-xs font-bold" onClick={() => simulateOrder('swiggy')}>
                  Simulate Swiggy
                </Button>
                <Button variant="ghost" size="sm" className="text-xs font-bold" onClick={() => simulateOrder('zomato')}>
                  Simulate Zomato
                </Button>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {platforms.map((platform) => {
                  const connection = vendor.connections.find(c => c.platformId === platform.id);
                  const isConnected = !!connection;
                  return (
                    <motion.div
                      key={platform.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className={cn(
                        "relative group transition-all duration-300 hover:shadow-lg border-2",
                        isConnected ? "border-primary/10 bg-primary/5 shadow-primary/5" : "border-border/50 opacity-60 hover:opacity-100"
                      )}>
                        <CardContent className="p-5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-white border shadow-sm p-2 flex items-center justify-center overflow-hidden shrink-0">
                              {platform.logoUrl ? (
                                <img src={platform.logoUrl} alt={platform.displayName} className="w-full object-contain" />
                              ) : (
                                <span className="font-bold text-primary">{platform.displayName[0]}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold">{platform.displayName}</p>
                              <Badge variant="ghost" className={cn("p-0 h-auto text-[10px] font-bold uppercase", isConnected ? "text-primary" : "text-muted-foreground")}>
                                {isConnected ? "Active Bridge" : "Ready to Link"}
                              </Badge>
                            </div>
                          </div>
                          
                          <Button 
                            variant={isConnected ? "ghost" : "outline"} 
                            size="sm" 
                            className={cn("font-bold h-8 transition-all", isConnected ? "text-primary" : "hover:bg-primary hover:text-white")}
                          >
                            {isConnected ? <ExternalLink className="h-4 w-4" /> : "Link"}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Live Order Feed */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <RefreshCw className={cn("h-5 w-5 text-primary", refreshing && "animate-spin")} />
                Live Order Feed
              </h3>
              <Badge variant="outline" className="text-[10px] uppercase tracking-tighter bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Listening for Webhooks...
              </Badge>
            </div>

            <div className="space-y-3">
              {vendor.orders && vendor.orders.length > 0 ? (
                vendor.orders.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()).slice(0, 5).map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="hover:shadow-md transition-shadow group">
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <span className="font-bold text-primary group-hover:scale-110 transition-transform">{order.platform.displayName[0]}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold">Order {order.externalOrderId}</p>
                              <StatusBadge status={order.status} />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.placedAt).toLocaleTimeString()} • {order.items.length} items • ₹{order.total}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-auto sm:ml-0">
                          <p className="text-xs font-medium text-muted-foreground mr-2 truncate hidden sm:block">
                            {order.customer?.name || "Guest Customer"}
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 font-bold text-xs"
                            onClick={() => handleOrderClick(order)}
                          >
                            Manage Order
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-xl bg-muted/20">
                  <p className="text-muted-foreground font-medium">No bridged orders yet. Simulation ready.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Business Profile Card */}
        <div className="space-y-6">
          <Card className="shadow-lg border-none bg-primary text-primary-foreground min-h-[300px] flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
              <ShieldCheck className="h-32 w-32" />
            </div>
            
            <CardHeader>
              <CardTitle className="text-xl opacity-80 font-bold tracking-widest uppercase text-xs">Business Profile</CardTitle>
              <div className="mt-4">
                <h2 className="text-3xl font-black truncate">{vendor.businessName}</h2>
                <p className="text-primary-foreground/70 font-medium">{vendor.businessType}</p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Verified Credentials</p>
                <p className="text-sm font-medium">{vendor.user.email}</p>
                <p className="text-sm font-medium">{vendor.user.phone}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">HQ Location</p>
                <p className="text-sm leading-snug font-medium line-clamp-2">
                  {vendor.addressLine1}, {vendor.city}
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="bg-white/10 backdrop-blur-sm border-t border-white/10 p-4">
              <Button variant="ghost" className="w-full text-primary-foreground hover:bg-white/10 font-bold group">
                Edit Business Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-none shadow-sm bg-muted/40 p-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Bridge Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Profile Updated", date: "Just Now", status: "System" },
                { label: "GST Verification", date: "2 hours ago", status: "Success" },
                { label: "Marketplace Linked", date: "Today", status: "Info" },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-background/50 border border-border/50">
                  <div>
                    <p className="font-bold">{log.label}</p>
                    <p className="text-muted-foreground">{log.date}</p>
                  </div>
                  <Badge variant="outline" className="text-[8px] font-black uppercase px-1 h-4">{log.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Analytics Widget */}
          <Card className="border-none shadow-sm bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">Daily Pulse</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Revenue</p>
                <p className="text-lg font-black">₹{analytics?.kpis?.totalRevenue?.toLocaleString() || '0'}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Events</p>
                <p className="text-lg font-black">{analytics?.kpis?.orderCount || '0'}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-primary/10">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-medium text-muted-foreground">AOV: ₹{Math.round(analytics?.kpis?.aov || 0)}</span>
                  <div className="h-1.5 w-16 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-2/3" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-[10px] font-black uppercase text-primary hover:bg-primary/5"
                onClick={() => router.push('/dashboard/analytics')}
              >
                Full Intel Report →
              </Button>
            </CardFooter>
          </Card>

          {/* Inventory Alert Widget */}
          {products.some(p => p.stock <= p.lowStockLevel) && (
            <Card className="border-none shadow-sm bg-amber-500/5 border-amber-500/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-600">Inventory Alert</CardTitle>
                  <Package className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 py-2">
                <div className="space-y-2">
                  {products.filter(p => p.stock <= p.lowStockLevel).slice(0, 3).map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="font-medium truncate max-w-[120px]">{p.name}</span>
                      <div className="flex items-center gap-2">
                        {p.stock === 0 ? (
                          <Badge variant="destructive" className="text-[8px] h-4 px-1">OOS</Badge>
                        ) : (
                          <span className="text-amber-600 font-bold">{p.stock} left</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {products.filter(p => p.stock <= p.lowStockLevel).length > 3 && (
                  <p className="text-[10px] text-muted-foreground text-center">+ {products.filter(p => p.stock <= p.lowStockLevel).length - 3} more items low</p>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-[10px] font-black uppercase text-amber-600 hover:bg-amber-500/5 shadow-none"
                  onClick={() => router.push('/dashboard/inventory')}
                >
                  Manage Stock →
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

      </div>

      <OrderDetailsSheet 
        order={selectedOrder as any}
        isOpen={isOrderSheetOpen}
        onClose={() => setIsOrderSheetOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = (s: string) => {
    switch (s.toUpperCase()) {
      case "NEW": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "CONFIRMED": return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
      case "PREPARING": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "READY": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "DELIVERED": return "bg-emerald-500 text-white border-transparent";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-1 h-4", color(status))}>
      {status}
    </Badge>
  );
}
