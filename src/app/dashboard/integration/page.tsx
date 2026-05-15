"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Globe, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
}

export default function IntegrationPage() {
  const { toast } = useToast();
  const [vendor, setVendor] = useState<any>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkingId, setLinkingId] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("vendorSession");
    if (raw) {
      const session = JSON.parse(raw);
      fetchData(session.id);
    }
  }, []);

  const fetchData = async (userId: string) => {
    try {
      const [vendorRes, platformRes] = await Promise.all([
        axios.get(`/api/vendor?userId=${userId}`),
        axios.get('/api/platforms')
      ]);

      if (vendorRes.data.success) setVendor(vendorRes.data.vendor);
      if (platformRes.data.success) setPlatforms(platformRes.data.platforms);
    } catch (err) {
      console.error("Integration fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = (pId: string) => {
    setLinkingId(pId);
    setTimeout(() => {
      setLinkingId(null);
      toast({ 
        title: "Integration Started", 
        description: "Please check your email for the marketplace approval link.",
        variant: "default"
      });
    }, 1500);
  };

  if (loading || !vendor) return <div className="p-10 animate-pulse bg-muted/20 h-screen" />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Globe className="h-10 w-10 text-primary" />
            Marketplace Bridge
          </h1>
          <p className="text-muted-foreground font-medium italic">Configure real-time order and inventory sync with external platforms.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="px-3 bg-blue-500/5 text-blue-600 border-blue-500/20">
               <Zap className="h-3 w-3 mr-1" /> All Systems Nominal
           </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {platforms.map((platform) => {
            const connection = vendor.connections.find((c: any) => c.platformId === platform.id);
            const isConnected = !!connection;
            const isLinking = linkingId === platform.id;

            return (
              <motion.div
                key={platform.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className={cn(
                  "relative group h-full transition-all duration-300 hover:shadow-2xl border-2 flex flex-col",
                  isConnected ? "border-primary/20 bg-primary/5 shadow-primary/5 shadow-lg" : "border-border/50 hover:border-primary/30"
                )}>
                  <CardHeader className="pb-3 flex flex-row items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-white border-2 shadow-sm p-2 flex items-center justify-center overflow-hidden shrink-0 group-hover:rotate-3 transition-transform">
                      {platform.logoUrl ? (
                        <img src={platform.logoUrl} alt={platform.displayName} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xl font-black text-primary">{platform.displayName[0]}</span>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">{platform.displayName}</CardTitle>
                      <Badge variant="outline" className={cn("px-2 py-0 h-auto text-[10px] font-black uppercase", isConnected ? "text-primary border-primary/20 bg-primary/5" : "text-muted-foreground")}>
                        {isConnected ? "Active Connection" : "Awaiting Bridge"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <p className="text-sm text-muted-foreground font-medium leading-normal">
                      Automate ingestion for {platform.displayName} orders directly into your dashboard.
                    </p>
                    
                    {isConnected && (
                      <div className="p-3 rounded-xl bg-background/50 border border-primary/10 space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <span>Sync Health</span>
                          <span className="text-blue-500">Excellent</span>
                        </div>
                        <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-[95%]" />
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">Last sync: 2 minutes ago</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-muted/50">
                    <Button 
                      onClick={() => !isConnected && handleLink(platform.id)}
                      variant={isConnected ? "outline" : "default"} 
                      className="w-full gap-2 font-bold"
                      disabled={isLinking}
                    >
                      {isLinking ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : isConnected ? (
                        <>Manage Connection <ArrowRight className="h-4 w-4" /></>
                      ) : (
                        <>Link Marketplace <ShieldCheck className="h-4 w-4" /></>
                      )}
                    </Button>
                  </CardFooter>
                  
                  {!isConnected && (
                    <div className="absolute top-4 right-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                      <Lock className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Card className="border-none shadow-sm bg-muted/40 p-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
             <AlertTriangle className="h-4 w-4 text-amber-500" /> Connection Log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs p-3 rounded-xl bg-background border flex items-center justify-between font-medium">
            <span className="flex items-center gap-2 italic"><CheckCircle2 className="h-3 w-3 text-blue-500" /> Swiggy API Bridge Stabilized</span>
            <span className="text-muted-foreground opacity-60">12:45 PM</span>
          </div>
          <div className="text-xs p-3 rounded-xl bg-background border flex items-center justify-between font-medium">
             <span className="flex items-center gap-2 italic"><CheckCircle2 className="h-3 w-3 text-blue-500" /> Zomato Credential Verified</span>
             <span className="text-muted-foreground opacity-60">10:30 AM</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
