"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Terminal, 
  Cpu, 
  ChevronRight, 
  Trash2, 
  RefreshCw, 
  ShieldCheck, 
  Layers, 
  Zap,
  Globe,
  Radio,
  ArrowDownLeft,
  Search,
  Code2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function OutboundSimulator() {
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    fetchEvents();
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(fetchEvents, 3000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/mock/platform');
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error("Fetch mock events error:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      await axios.delete('/api/mock/platform');
      setEvents([]);
      setSelectedEvent(null);
      toast({ title: "Memory Wiped", description: "Simulation logs have been purged." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to clear logs", variant: "destructive" });
    }
  };

  const copyUrl = () => {
    const url = `${window.location.origin}/api/mock/platform`;
    navigator.clipboard.writeText(url);
    toast({ title: "Copied!", description: "Use this URL in your Webhook settings." });
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Radio className="h-8 w-8 text-primary animate-pulse" />
            Outbound Simulator
          </h1>
          <p className="text-muted-foreground font-medium italic">Simulating a Platform Receiver (Swiggy/Zomato Endpoint).</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 font-bold" onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {autoRefresh ? "Listening..." : "Paused"}
          </Button>
          <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={clearLogs}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5 h-[70vh]">
        
        {/* Left Column: Event Stream */}
        <div className="lg:col-span-2 space-y-4 h-full flex flex-col">
          <Card className="border-none shadow-xl bg-black/95 text-green-500 font-mono text-xs overflow-hidden flex-1 flex flex-col">
            <CardHeader className="border-b border-green-500/20 py-3 bg-neutral-900 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span className="font-bold tracking-widest text-white">EVENT_STREAM</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-400 border-green-500/30">
                LIVE_200
              </Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto no-scrollbar flex-1">
              <div className="p-2 space-y-1">
                {events.map((ev) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    key={ev.id} 
                    className={cn(
                        "p-2 rounded cursor-pointer transition-colors border border-transparent",
                        selectedEvent?.id === ev.id ? "bg-green-500/20 border-green-500/40 text-white" : "hover:bg-green-500/10"
                    )}
                    onClick={() => setSelectedEvent(ev)}
                  >
                    <div className="flex items-center justify-between opacity-70 mb-1">
                      <span>[{ev.receivedAt.split('T')[1].split('.')[0]}]</span>
                      <span className="uppercase text-[10px] font-black">{ev.eventType || 'UNKNOWN'}</span>
                    </div>
                    <div className="truncate opacity-90">
                      → Payload: {JSON.stringify(ev.payload).slice(0, 50)}...
                    </div>
                  </motion.div>
                ))}
                {events.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center pt-20 text-green-800 animate-pulse">
                    <p>_AWAITING_INBOUND_SIGNAL_</p>
                    <p className="text-[10px] mt-2 opacity-50">SYNC_WEBHOOKS_TO_GET_STARTED</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t border-green-500/20 py-3 bg-neutral-900">
               <div className="flex items-center justify-between w-full text-[10px] text-green-700">
                  <span>VyapaarSetu_Outbound_Hub v1.0</span>
                  <span>{events.length} EVENTS RECORDED</span>
               </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Detailed Inspector */}
        <div className="lg:col-span-3 space-y-6 flex flex-col h-full">
          <AnimatePresence mode="wait">
            {selectedEvent ? (
              <motion.div 
                key={selectedEvent.id}
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 flex flex-col"
              >
                <Card className="border-none shadow-2xl overflow-hidden flex-1 flex flex-col">
                  <CardHeader className="bg-primary/5 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <ArrowDownLeft className="h-6 w-6 text-primary" />
                         </div>
                         <div>
                            <CardTitle>Inbound Event Insight</CardTitle>
                            <CardDescription className="text-xs">{selectedEvent.id}</CardDescription>
                         </div>
                      </div>
                      <Badge className="bg-blue-500 h-6">Acknowledged 200</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6 flex-1 overflow-y-auto no-scrollbar">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Event Type</p>
                        <p className="font-black text-sm">{selectedEvent.eventType}</p>
                      </div>
                      <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Received Map</p>
                        <p className="font-black text-sm">{new Date(selectedEvent.receivedAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                       <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3" /> Security Headers
                       </h4>
                       <div className="bg-neutral-900 p-4 rounded-xl text-[11px] font-mono text-blue-400 overflow-x-auto">
                          <p>X-VyapaarSetu-Signature: <span className="text-blue-400">{selectedEvent.signature || 'NONE_UNSIGNED'}</span></p>
                          <p>User-Agent: axios/1.6.8</p>
                          <p>Connection: keep-alive</p>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                        <Code2 className="h-3 w-3" /> Payload Content
                       </h4>
                       <pre className="bg-neutral-900 p-6 rounded-2xl text-xs text-amber-400 overflow-x-auto border-2 border-amber-900/20 shadow-inner">
                        {JSON.stringify(selectedEvent.payload, null, 2)}
                       </pre>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="flex-1 flex flex-col items-center justify-center text-center space-y-6 p-10 border-dashed border-2 bg-muted/20">
                <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
                   <Zap className="h-12 w-12 text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Simulator Integration Required</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                    to see how VyapaarSetu synchronizes with external platforms, you must first register this simulator endpoint in your developer console. 
                  </p>
                </div>
                <div className="w-full max-w-sm space-y-3">
                  <Input readOnly value={typeof window !== 'undefined' ? `${window.location.origin}/api/mock/platform` : '/api/mock/platform'} className="bg-background text-center font-mono text-xs" />
                  <Button className="w-full font-black gap-2" onClick={copyUrl}>
                    Copy Simulator URL <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
