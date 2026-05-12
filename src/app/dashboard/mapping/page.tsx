"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  Link, 
  Unlink, 
  Search, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Plus,
  ArrowRight,
  Database,
  ArrowLeftRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  platformMappings: any[];
}

interface UnmappedItem {
  name: string;
  platformName: string;
  platformId: string;
  suggestedExternalId: string;
}

const DEMO_MAPPINGS = [
  {
    id: "p1", name: "Classic Cheese Pizza", sku: "PIZ-001",
    platformMappings: [
      { id: "m1", externalId: "SW-9921", platform: { displayName: "Swiggy" } },
      { id: "m2", externalId: "ZO-1102", platform: { displayName: "Zomato" } }
    ]
  },
  {
    id: "p2", name: "Farmhouse Delight", sku: "PIZ-002",
    platformMappings: [
      { id: "m3", externalId: "AMZ-FOOD-22", platform: { displayName: "Amazon Food" } }
    ]
  },
  {
    id: "p3", name: "Garlic Breadsticks", sku: "SID-001",
    platformMappings: []
  }
];

const DEMO_PLATFORMS = [
  { id: "pl1", displayName: "Swiggy" },
  { id: "pl2", displayName: "Zomato" },
  { id: "pl3", displayName: "Amazon Food" },
  { id: "pl4", displayName: "ONDC (Magicpin)" },
];

export default function MappingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [unmappedItems, setUnmappedItems] = useState<UnmappedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState<string>("");

  const [mappingForm, setMappingForm] = useState({
    productId: "",
    platformId: "",
    externalId: "",
    externalName: "",
  });

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    } else if (authStatus === "authenticated" && (session?.user as any)?.id) {
      const uid = (session?.user as any).id;
      setUserId(uid);
      fetchData(uid);
    }

    // Safety timeout
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
        if (products.length === 0) {
          setProducts(DEMO_MAPPINGS as any);
          setPlatforms(DEMO_PLATFORMS);
          setIsDemo(true);
        }
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [authStatus, session]);

  const fetchData = async (uid: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/vendor/mapping?userId=${uid}`);
      if (res.data.success) {
        if (res.data.products.length > 0) {
          setProducts(res.data.products);
          setPlatforms(res.data.platforms);
          setUnmappedItems(res.data.unmappedItems);
          setIsDemo(false);
        } else {
          setProducts(DEMO_MAPPINGS as any);
          setPlatforms(DEMO_PLATFORMS);
          setIsDemo(true);
        }
      }
    } catch (err) {
      console.error("Mapping fetch error:", err);
      setProducts(DEMO_MAPPINGS as any);
      setPlatforms(DEMO_PLATFORMS);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMap = async () => {
    try {
      const res = await axios.post('/api/vendor/mapping', mappingForm);
      if (res.data.success) {
        toast({ title: "Mapping Secured", description: "Marketplace ID successfully linked." });
        fetchData(userId);
        setMappingForm({ productId: "", platformId: "", externalId: "", externalName: "" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to create mapping", variant: "destructive" });
    }
  };

  const unlink = async (id: string) => {
    try {
      const res = await axios.delete(`/api/vendor/mapping?id=${id}`);
      if (res.data.success) {
        toast({ title: "Mapping Removed", description: "Marketplace link severed." });
        fetchData(userId);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete mapping", variant: "destructive" });
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Synchronizing Catalog Maps...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <ArrowLeftRight className="h-8 w-8 text-primary" />
            Catalog Alignment
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground font-medium">Link master inventory to marketplace-specific external IDs.</p>
            {isDemo && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] animate-pulse">
                DEMO MODE
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Left Column: Quick Mapping Tool */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5 text-primary" />
                Quick Mapper
              </CardTitle>
              <CardDescription>Link a marketplace item to a master product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Internal Product</label>
                <Select onValueChange={(v) => setMappingForm({ ...mappingForm, productId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target item" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Marketplace</label>
                <Select onValueChange={(v) => setMappingForm({ ...mappingForm, platformId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map(p => <SelectItem key={p.id} value={p.id}>{p.displayName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">External Item ID</label>
                <Input value={mappingForm.externalId} onChange={e => setMappingForm({ ...mappingForm, externalId: e.target.value })} placeholder="e.g. SWIGGY_10293" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleMap} className="w-full gap-2 font-bold" disabled={!mappingForm.productId || !mappingForm.platformId || !mappingForm.externalId}>
                Link Catalog <CheckCircle2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Unmapped Alerts */}
          {unmappedItems.length > 0 && (
            <Card className="border-amber-500/20 bg-amber-500/5 shadow-lg border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-amber-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Bridge Outliers ({unmappedItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {unmappedItems.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1 p-3 rounded-lg bg-white border border-amber-500/10">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs">{item.name}</span>
                      <Badge variant="outline" className="text-[8px] uppercase">{item.platformName}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] w-full mt-1 justify-between text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => setMappingForm({ ...mappingForm, externalId: item.suggestedExternalId, externalName: item.name, platformId: item.platformId })}>
                      Suggest for mapping <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Mapping Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl min-h-[500px]">
            <CardHeader className="pb-4 border-b">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Alignment Matrix</CardTitle>
                  <CardDescription>View and severed links for synchronized fulfillment.</CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search master items..." 
                    className="pl-9 bg-muted/20 border-none"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredProducts.map((p) => (
                <div key={p.id} className="border-b last:border-0 hover:bg-muted/5 transition-colors p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black">
                        {p.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{p.sku || 'No SKU'}</p>
                      </div>
                    </div>
                    <Badge variant={p.platformMappings.length > 0 ? "secondary" : "outline"} className="text-[9px] uppercase font-black">
                      {p.platformMappings.length} Active Mappings
                    </Badge>
                  </div>

                  <div className="grid gap-2 pl-12">
                    {p.platformMappings.length > 0 ? p.platformMappings.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/50 text-xs">
                        <div className="flex items-center gap-3">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span className="font-bold uppercase tracking-tighter opacity-70 w-24">{m.platform.displayName}</span>
                          <span className="text-muted-foreground font-mono">ID: {m.externalId}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={() => unlink(m.id)}>
                          <Unlink className="h-3 w-3" />
                        </Button>
                      </div>
                    )) : (
                      <div className="text-center py-4 rounded-lg border border-dashed text-muted-foreground text-[10px]">
                        No external marketplace IDs linked to this item.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
