"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Webhook, 
  Terminal, 
  History, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff,
  Activity,
  Zap,
  ShieldCheck,
  RefreshCw,
  Globe,
  Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

export default function WebhooksPage() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [showSecret, setShowSecret] = useState<string | null>(null);

  const [form, setForm] = useState({
    id: "",
    url: "",
    events: "ORDER_UPDATED,ITEM_OUT_OF_STOCK",
    secret: ""
  });

  useEffect(() => {
    const raw = localStorage.getItem("vendorSession");
    if (raw) {
      const session = JSON.parse(raw);
      setUserId(session.id);
      fetchData(session.id);
    }
  }, []);

  const fetchData = async (uid: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/vendor/webhooks?userId=${uid}`);
      if (res.data.success) {
        setConfigs(res.data.configs);
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error("Fetch webhooks error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/vendor/webhooks', { ...form, userId });
      if (res.data.success) {
        toast({ title: "Webhook Configured", description: "Outgoing events will now fire to this URL." });
        setForm({ id: "", url: "", events: "ORDER_UPDATED,ITEM_OUT_OF_STOCK", secret: "" });
        fetchData(userId);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to save configuration", variant: "destructive" });
    }
  };

  const deleteConfig = async (id: string) => {
    try {
      const res = await axios.delete(`/api/vendor/webhooks?id=${id}`);
      if (res.data.success) {
        toast({ title: "Webhook Deleted", description: "Synchronization severed." });
        fetchData(userId);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete config", variant: "destructive" });
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you SURE? This will permanently delete ALL orders, webhook logs, and reset stock levels.")) return;
    
    try {
      const res = await axios.post("/api/vendor/reset", { userId });
      if (res.data.success) {
        toast({ title: "Simulation Purged", description: "Database has been reset to demo defaults." });
        fetchData(userId);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to reset simulation", variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Value added to clipboard." });
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <Activity className="h-10 w-10 text-primary animate-pulse" />
        <p className="text-muted-foreground animate-pulse font-medium">Syncing Outbound Logs...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Webhook className="h-8 w-8 text-primary" />
            Webhooks <span className="text-muted-foreground font-light">(Outbound)</span>
          </h1>
          <p className="text-muted-foreground font-medium">Push real-time dashboard events to your external synchronizers.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-red-500/20 text-red-500 hover:bg-red-50 font-bold" onClick={handleReset}>
            <Trash className="h-4 w-4 mr-2" /> Reset Demo
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 font-bold shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Add Endpoint
              </Button>
            </DialogTrigger>
            <DialogContent>
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>Add Outbound Webhook</DialogTitle>
                <DialogDescription>Define the destination for real-time order and inventory events.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Destination URL</Label>
                  <Input 
                    id="url" 
                    placeholder="https://your-server.com/webhooks" 
                    value={form.url} 
                    onChange={e => setForm({...form, url: e.target.value})} 
                    required 
                  />
                  <p className="text-[10px] text-muted-foreground">URL where VypaarSetu will send POST requests.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret">Signing Secret (Optional)</Label>
                  <Input 
                    id="secret" 
                    placeholder="Leave blank to auto-generate" 
                    value={form.secret} 
                    onChange={e => setForm({...form, secret: e.target.value})} 
                  />
                  <p className="text-[10px] text-muted-foreground italic">Used for HMAC SHA-256 payload signing (X-VypaarSetu-Signature).</p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full font-black">Register Endpoint</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>

      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Confabulation: Active Endpoints */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" /> Active Endpoints
          </h2>
          {configs.map((config) => (
            <Card key={config.id} className="border-none shadow-md overflow-hidden bg-gradient-to-br from-background to-muted/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="text-[9px] uppercase font-black bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    Active
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => deleteConfig(config.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <CardTitle className="text-sm truncate font-mono text-primary font-bold">{config.url}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pb-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-muted-foreground">Events</Label>
                  <div className="flex flex-wrap gap-1">
                    {config.events.split(',').map((ev: string) => (
                      <Badge key={ev} variant="secondary" className="text-[8px] px-1.5 h-4">{ev}</Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-muted-foreground">Signing Secret</Label>
                  <div className="flex items-center gap-2 bg-muted p-2 rounded-lg border">
                    <code className="text-[10px] font-mono flex-1 truncate">
                      {showSecret === config.id ? config.secret : '••••••••••••••••••••••••'}
                    </code>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowSecret(showSecret === config.id ? null : config.id)}>
                        {showSecret === config.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(config.secret)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {configs.length === 0 && (
            <div className="text-center py-10 rounded-xl border-2 border-dashed border-muted text-muted-foreground italic text-sm">
              No outbound webhooks configured.
            </div>
          )}
        </div>

        {/* Outreach History: Logs */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Delivery History
          </h2>
          <Card className="border-none shadow-xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Audit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {log.status === 'SUCCESS' ? (
                              <div className="h-5 w-5 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-3 w-3" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center">
                                <XCircle className="h-3 w-3" />
                              </div>
                            )}
                            <span className="text-[10px] font-bold text-muted-foreground">{log.statusCode}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] font-black tracking-tighter bg-primary/5 border-primary/20">
                            {log.event}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate font-mono text-[9px] text-muted-foreground opacity-70">
                          {log.config.url}
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                            <Terminal className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
              {logs.length === 0 && (
                <div className="text-center py-20 bg-muted/10 opacity-50">
                  <Zap className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium">No synchronization events recorded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
