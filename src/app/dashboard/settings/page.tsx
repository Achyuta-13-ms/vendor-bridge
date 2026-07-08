"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  Lock, 
  User, 
  Globe, 
  Shield, 
  Database,
  Mail,
  Smartphone
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

import { useSession } from "next-auth/react";
import axios from "axios";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [vendor, setVendor] = useState<any>(null);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await axios.get("/api/vendor/me");
        if (res.data.success) {
          setVendor(res.data.vendor);
        }
      } catch (err) {
        console.error("Failed to fetch vendor", err);
      }
    };
    if (session?.user) fetchVendor();
  }, [session]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 space-y-8"
    >
      <div>
        <h1 className="text-4xl font-black tracking-tight">System Settings</h1>
        <p className="text-muted-foreground font-medium">Manage your bridge configuration and account security.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="general" className="gap-2">
            <User className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Database className="h-4 w-4" /> Operations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle>Business Identity</CardTitle>
              <CardDescription>Update your public brand information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Business Display Name</Label>
                <Input id="name" placeholder="Vendor Name" defaultValue={vendor?.businessName || "Vendora Hub"} key={vendor?.businessName || "name"} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Support Email</Label>
                <Input id="email" type="email" placeholder="support@vendor.com" defaultValue={vendor?.user?.email || session?.user?.email || ""} key={vendor?.user?.email || session?.user?.email || "email"} />
              </div>
              <Button>Save Identity</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle>Bridge Alerts</CardTitle>
              <CardDescription>Configure how you receive operational updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Order Webhooks</Label>
                  <p className="text-xs text-muted-foreground">Notify on new incoming orders.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Inventory Critical</Label>
                  <p className="text-xs text-muted-foreground">Alert when stock falls below threshold.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Security Updates</Label>
                  <p className="text-xs text-muted-foreground">Receive login and audit logs.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
