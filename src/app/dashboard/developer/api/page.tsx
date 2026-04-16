"use client";

import { useState } from "react";
import { 
  Key, 
  ExternalLink, 
  Copy, 
  Shield, 
  RefreshCw, 
  Database,
  Code2,
  Lock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

export default function ConnectedAPIsPage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("pk_test_bridge_" + Array(16).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
  const [showKey, setShowKey] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "API Key ready for use." });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 md:p-10 space-y-8"
    >
      <div>
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <Database className="h-10 w-10 text-primary" />
          Connected APIs
        </h1>
        <p className="text-muted-foreground font-medium italic">Manage secure access keys for third-party marketplace integrations.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-2xl">
            <CardHeader>
              <CardTitle>Merchant API Key</CardTitle>
              <CardDescription>Use this key to authenticate your bridge requests via the REST API.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Main Production Key</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active</Badge>
                </div>
                <div className="flex gap-2">
                  <Input 
                    type={showKey ? "text" : "password"} 
                    value={apiKey} 
                    readOnly 
                    className="font-mono text-sm bg-muted/50"
                  />
                  <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
                    <Lock className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(apiKey)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-between items-center text-xs">
                <p className="text-muted-foreground italic">Last rotated: 14 days ago</p>
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-primary font-bold">
                  <RefreshCw className="h-3 w-3" /> Rotate Key
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-none shadow-sm bg-blue-500/5 hover:bg-blue-500/10 transition-colors cursor-pointer border border-blue-500/10">
              <CardContent className="p-6 space-y-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Code2 className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-bold">REST Documentation</h3>
                <p className="text-xs text-muted-foreground font-medium">Explore endpoint schemas for Catalog, Inventory, and Orders.</p>
                <Button variant="link" className="p-0 h-auto text-blue-600 font-bold">Read Docs →</Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer border border-emerald-500/10">
              <CardContent className="p-6 space-y-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-bold">Integrity Logs</h3>
                <p className="text-xs text-muted-foreground font-medium">Audit logs of all data ingestion events via the bridge API.</p>
                <Button variant="link" className="p-0 h-auto text-emerald-600 font-bold">View Logs →</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-dashed border-2 bg-muted/20">
            <CardHeader>
              <CardTitle className="text-sm">Quick Connection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-xl bg-background border shadow-sm">
                <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Bridge Version</p>
                <p className="text-sm font-bold">v1.4.2-stable</p>
              </div>
              <div className="p-3 rounded-xl bg-background border shadow-sm">
                <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Response Time</p>
                <p className="text-sm font-bold">42ms average</p>
              </div>
              <Button className="w-full gap-2 font-bold" variant="outline">
                <ExternalLink className="h-4 w-4" /> API Status Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
