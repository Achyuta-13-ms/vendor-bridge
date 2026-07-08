"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  ShieldCheck,
  Edit2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";



export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    } else if (authStatus === "authenticated") {
      fetchVendor();
    }
  }, [authStatus, session, router]);

  const fetchVendor = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/vendor/me`);
      if (res.data.success && res.data.vendor) {
        setVendor(res.data.vendor);
      } else {
        setVendor(null);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setVendor(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <User className="h-10 w-10 text-primary animate-pulse" />
          <p className="text-muted-foreground animate-pulse font-medium">Loading Identity Profile...</p>
        </div>
      </div>
    );
  }

  if (!vendor && !loading) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-black mb-2">No Profile Found</h2>
        <p className="text-zinc-500 mb-6">Please complete your onboarding to view your profile.</p>
        <Button onClick={() => router.push('/onboarding')}>Complete Profile</Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 space-y-8"
    >
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Card className="w-full md:w-80 border-none shadow-xl overflow-hidden shrink-0">
          <div className="h-24 bg-primary" />
          <CardContent className="relative pt-0 flex flex-col items-center">
            <Avatar className="h-24 w-24 border-4 border-background absolute -top-12">
              <AvatarImage src={`https://avatar.vercel.sh/${vendor.businessName}.png`} />
              <AvatarFallback>{vendor.businessName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="mt-14 text-center space-y-1">
              <h2 className="text-xl font-black">{vendor.businessName}</h2>
              <p className="text-sm text-muted-foreground font-medium">{vendor.businessType || "Unknown Type"}</p>
              <Badge variant="outline" className="mt-2 bg-blue-500/5 text-blue-600 border-blue-500/20 uppercase text-[10px] font-black">
                {vendor.status} Profile
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="border-t border-muted/50 p-4">
            <Button variant="ghost" className="w-full gap-2 font-bold" onClick={() => toast({ title: "Coming Soon", description: "Profile editing is currently being optimized for the demo." })}>
              <Edit2 className="h-4 w-4" /> Edit Profile
            </Button>
          </CardFooter>
        </Card>

        <div className="flex-1 space-y-6 w-full">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Business Overview</CardTitle>
              <CardDescription>Verified details for marketplace integration.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</p>
                    <p className="font-medium">{vendor.user?.email || session?.user?.email || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Phone Number</p>
                    <p className="font-medium">{vendor.user?.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Headquarters</p>
                    <p className="font-medium">{[vendor.addressLine1, vendor.city].filter(Boolean).join(", ") || "Not provided"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Member ID</p>
                    <code className="text-xs font-mono bg-muted px-1 rounded">{vendor.id}</code>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Member Since</p>
                    <p className="font-medium">{new Date(vendor.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-muted/20">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Operational Status</h3>
                  <p className="text-sm text-muted-foreground font-medium">Your bridge is actively listening for marketplace webhooks.</p>
                </div>
              </div>
              <Button onClick={() => window.location.href = '/dashboard'}>Go to Overview</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
