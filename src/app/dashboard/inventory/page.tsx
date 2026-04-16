"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingDown, 
  ArrowRight,
  Edit2,
  Trash2,
  RefreshCw,
  Box,
  ShoppingCart,
  Layers,
  History,
  Zap,
  Power,
  PowerOff,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  lowStockLevel: number;
  isActive: boolean;
  category: string | null;
  platformMappings?: any[];
}

export default function InventoryPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    sku: "",
    price: 399,
    stock: 50,
    lowStockLevel: 10,
    description: "",
  });

  useEffect(() => {
    const raw = localStorage.getItem("vendorSession");
    if (raw) {
      const session = JSON.parse(raw);
      setUserId(session.id);
      fetchProducts(session.id);
    }
  }, []);

  const fetchProducts = async (uid: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/vendor/products?userId=${uid}`);
      if (res.data.success) setProducts(res.data.products);
    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/vendor/products', { ...formData, userId });
      if (res.data.success) {
        toast({ title: "Inventory Updated", description: `${formData.name} saved successfully.` });
        setIsAddOpen(false);
        fetchProducts(userId);
        setFormData({ productId: "", name: "", sku: "", price: 399, stock: 50, lowStockLevel: 10, description: "" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to save product", variant: "destructive" });
    }
  };

  const toggleActive = async (product: Product, newValue: boolean) => {
    try {
      const res = await axios.post("/api/vendor/products", {
        userId,
        productId: product.id,
        isActive: newValue,
        name: product.name,
        price: product.price,
        stock: product.stock
      });
      if (res.data.success) {
        toast({ 
          title: newValue ? "Item Activated" : "Item Paused", 
          description: `${product.name} is now ${newValue ? 'live' : 'hidden'} across all connected platforms.`
        });
        fetchProducts(userId);
      }
    } catch (err) {
      toast({ title: "Update Failed", description: "Failed to toggle status", variant: "destructive" });
    }
  };

  const adjustStock = async (id: string, change: number) => {
    try {
      const res = await axios.patch('/api/vendor/products', { updates: [{ id, stockChange: change }] });
      if (res.data.success) {
        setProducts(products.map(p => p.id === id ? { ...p, stock: p.stock + change } : p));
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to adjust stock", variant: "destructive" });
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= p.lowStockLevel).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((acc, p) => acc + (p.price * p.stock), 0)
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Syncing Master Inventory...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            Inventory Control
          </h1>
          <p className="text-muted-foreground font-medium">Master catalog and cross-platform stock management.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 font-bold shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleSave}>
                <DialogHeader>
                  <DialogTitle>{formData.productId ? "Edit Product" : "New Master Product"}</DialogTitle>
                  <DialogDescription>Define the core item and its fulfillment parameters.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" className="col-span-3" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sku" className="text-right">SKU</Label>
                    <Input id="sku" className="col-span-3" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="e.g. VS-PIZZA-001" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">Price</Label>
                    <Input id="price" type="number" className="col-span-3" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stock" className="text-right">Stock</Label>
                    <Input id="stock" type="number" className="col-span-3" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full font-bold">Save Product</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard label="Total Items" value={stats.total} icon={Box} color="primary" />
        <StatsCard label="Low Stock" value={stats.lowStock} icon={TrendingDown} color="amber" alert={stats.lowStock > 0} />
        <StatsCard label="Out of Stock" value={stats.outOfStock} icon={AlertTriangle} color="red" alert={stats.outOfStock > 0} />
        <StatsCard label="Vault Value" value={`₹${stats.totalValue.toLocaleString()}`} icon={ShoppingCart} color="emerald" />
      </div>

      <Card className="border-none shadow-xl overflow-hidden bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Product Catalog</CardTitle>
              <CardDescription>Bridged items across Swiggy, Zomato, and Direct.</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products/SKUs..." 
                className="pl-9 bg-background/50 border-muted"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[300px]">Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Platforms</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredProducts.map((product) => {
                  const isLow = product.stock > 0 && product.stock <= product.lowStockLevel;
                  const isOOS = product.stock === 0;
                  return (
                    <TableRow key={product.id} className={cn("group transition-colors hover:bg-muted/10", !product.isActive && "opacity-60 bg-muted/30")}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm",
                            product.isActive ? (isOOS ? "bg-red-100 text-red-600" : isLow ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary") : "bg-muted text-muted-foreground"
                          )}>
                            {product.name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-sm tracking-tight flex items-center gap-2">
                              {product.name}
                              {!product.isActive && <Badge variant="outline" className="text-[8px] h-4 uppercase border-red-500/20 text-red-500">Paused</Badge>}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{product.sku || 'N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "text-[10px] uppercase font-black px-1.5 h-5",
                          isOOS ? "bg-red-500/10 text-red-600 border-red-500/20" : isLow ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        )}>
                          {isOOS ? "Out of Stock" : isLow ? "Low Stock" : "Healthy"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-neutral-200" onClick={() => adjustStock(product.id, -1)} disabled={product.stock === 0}>
                              <span className="text-lg">-</span>
                            </Button>
                            <span className={cn("text-sm font-black w-8 text-center", isOOS ? "text-red-600" : isLow ? "text-amber-600" : "")}>
                              {product.stock}
                            </span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-neutral-200" onClick={() => adjustStock(product.id, 1)}>
                              <span className="text-lg">+</span>
                            </Button>
                          </div>
                          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden hidden xl:block">
                            <div 
                              className={cn("h-full transition-all", isOOS ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-emerald-500")}
                              style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2">
                                 <Switch 
                                   checked={product.isActive} 
                                   onCheckedChange={(v) => toggleActive(product, v)}
                                   className="data-[state=checked]:bg-emerald-500"
                                 />
                                 {product.isActive ? <Power className="h-3 w-3 text-emerald-500" /> : <PowerOff className="h-3 w-3 text-muted-foreground" />}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-[10px]">{product.isActive ? 'Mark as Out of Stock (Bulk Push)' : 'Back in Stock'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-1.5">
                          {product.platformMappings?.length > 0 ? product.platformMappings.map((m: any) => (
                            <div key={m.id} className="h-5 w-5 rounded-full border border-background bg-muted flex items-center justify-center overflow-hidden" title={m.platform.displayName}>
                               <Globe className="h-2.5 w-2.5 text-muted-foreground opacity-70" />
                            </div>
                          )) : (
                            <span className="text-[10px] text-muted-foreground italic opacity-50">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-muted/5">
              <Layers className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No results found in the bridge catalog.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Platform Blocking Alert Simulation */}
      {stats.outOfStock > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-red-500/50 bg-red-500/5 shadow-lg">
            <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
              <AlertTriangle className="h-6 w-6 text-red-600 shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-red-900">Critical: Platform Connections Compromised</p>
                <p className="text-sm text-red-700">Orders for {stats.outOfStock} items are being automatically ignored by the bridge to prevent marketplace penalties.</p>
              </div>
              <Button variant="destructive" className="font-bold" onClick={() => setIsAddOpen(true)}>Replenish Now</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color, alert }: any) {
  const colorMap: Record<string, string> = {
    primary: "text-primary bg-primary/10 border-primary/20",
    amber: "text-amber-600 bg-amber-50 border-amber-500/20",
    red: "text-red-600 bg-red-50 border-red-500/20",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-500/20",
  };

  return (
    <Card className={cn("border-none shadow-md", alert && "animate-pulse ring-2 ring-destructive ring-offset-2")}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={cn("p-2 rounded-xl border", colorMap[color])}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <span className="text-3xl font-black">{value}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
        </div>
      </CardContent>
    </Card>
  );
}
