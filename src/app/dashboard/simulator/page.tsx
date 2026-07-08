"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { 
  Terminal, 
  Send, 
  Trash2, 
  Plus, 
  Globe, 
  User, 
  ShoppingCart, 
  Zap,
  Info 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Item {
  name: string;
  quantity: number;
  price: number;
}

export default function SimulatorPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [vendorId, setVendorId] = useState<string>("");
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("swiggy");
  const [customer, setCustomer] = useState({ name: "John Doe", phone: "+919876543210", address: "Sector 5, Noida, UP" });
  const [items, setItems] = useState<Item[]>([{ name: "Margherita Pizza", quantity: 1, price: 399 }]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if ((session?.user as any)?.id) {
      setVendorId((session?.user as any).id);
    }
    fetchPlatforms();
  }, [session]);

  const fetchPlatforms = async () => {
    try {
      const res = await axios.get('/api/platforms');
      if (res.data.success) setPlatforms(res.data.platforms);
    } catch (err) {
      console.error("Platforms error:", err);
    }
  };

  const addItem = () => setItems([...items, { name: "New Item", quantity: 1, price: 100 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: keyof Item, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const handleDispatch = async () => {
    if (!vendorId) {
      toast({ title: "Error", description: "No vendor session found.", variant: "destructive" });
      return;
    }

    setLoading(true);
    addLog(`Initiating bridge simulation for ${selectedPlatform.toUpperCase()}...`);
    
    try {
      const subtotal = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
      const tax = subtotal * 0.05;
      const total = subtotal + tax + 30; // 30 delivery fee

      const payload = {
        vendorId,
        platformName: selectedPlatform,
        customer,
        items,
        totals: { subtotal, tax, deliveryFee: 30, total },
        specialInstructions: "Simulated from Bridge Console"
      };

      const res = await axios.post('/api/bridge/orders', payload);
      
      if (res.data.success) {
        addLog(`SUCCESS: Order effectively bridged (ID: ${res.data.orderId})`);
        toast({ title: "Order Bridged", description: `Simulated order ${res.data.externalId} dispatched.` });
      }
    } catch (err: any) {
      addLog(`ERROR: ${err.response?.data?.message || err.message}`);
      toast({ title: "Simulation Failed", description: "Check console logs.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary fill-primary" />
            Bridge Simulator
          </h1>
          <p className="text-muted-foreground font-medium">Test real-time orders and webhook harmonization logic.</p>
        </div>
        <Badge variant="outline" className="h-6 gap-2 bg-primary/5 text-primary border-primary/20">
          <Globe className="h-3 w-3" /> External Sandbox
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Order Configuration
              </CardTitle>
              <CardDescription>Customize the incoming marketplace payload.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Marketplace Platform</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map(p => (
                        <SelectItem key={p.id} value={p.name}>{p.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-9" 
                      value={customer.name} 
                      onChange={e => setCustomer({...customer, name: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold">Items & Pricing</Label>
                  <Button variant="outline" size="sm" onClick={addItem} className="h-7 gap-1">
                    <Plus className="h-3 w-3" /> Add Item
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <AnimatePresence>
                    {items.map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex gap-3 items-end"
                      >
                        <div className="flex-1 space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Name</Label>
                          <Input value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} />
                        </div>
                        <div className="w-20 space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Qty</Label>
                          <Input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value))} />
                        </div>
                        <div className="w-24 space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Price</Label>
                          <Input type="number" value={item.price} onChange={e => updateItem(i, 'price', parseInt(e.target.value))} />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-muted-foreground hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

            </CardContent>
            <CardFooter className="bg-muted/30 border-t p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Info className="h-4 w-4" />
                <span className="text-xs font-medium italic">Payload will be harmonized before ingestion.</span>
              </div>
              <Button onClick={handleDispatch} disabled={loading} className="gap-2 font-bold px-8 shadow-lg shadow-primary/20">
                {loading ? "Dispatching..." : "Dispatch Order"}
                <Send className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Console */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-zinc-900 text-zinc-100 min-h-[400px] flex flex-col">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Bridge Console
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 font-mono text-xs space-y-2 overflow-y-auto">
              <p className="text-zinc-500 italic">// Connection established. Awaiting dispatch...</p>
              {logs.map((log, i) => (
                <p key={i} className={cn(
                  "border-l-2 pl-2",
                  log.includes("SUCCESS") ? "border-blue-500 text-blue-400" : 
                  log.includes("ERROR") ? "border-red-500 text-red-400" : "border-zinc-700"
                )}>
                  {log}
                </p>
              ))}
            </CardContent>
            <div className="p-2 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
              {['swiggy', 'zomato', 'amazon'].map(p => (
                <Badge key={p} variant="outline" className="bg-white/5 border-white/10 text-white/50 text-[10px] uppercase py-0 cursor-pointer hover:bg-white/10">
                  {p}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="border-none shadow-sm bg-primary/5 p-4 space-y-2">
            <h4 className="text-sm font-bold tracking-tight">Rapid Test Suite</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold" onClick={() => setSelectedPlatform('swiggy')}>
                SWIGGY Profile
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold" onClick={() => setSelectedPlatform('zomato')}>
                ZOMATO Profile
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
