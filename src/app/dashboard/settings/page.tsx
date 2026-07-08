"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Lock, User, Building, MapPin, Phone, Mail, Image as ImageIcon, ShieldAlert, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await axios.get("/api/vendor/me");
        if (res.data.success) {
          setVendor(res.data.vendor);
        }
      } catch (err) {
        console.error("Failed to fetch vendor", err);
      } finally {
        setLoading(false);
      }
    };
    if (session?.user) fetchVendor();
  }, [session]);

  if (loading) return <div className="p-10 text-center text-zinc-500 animate-pulse">Loading settings...</div>;

  const isVerified = vendor?.status === "ACTIVE";

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black text-black tracking-tight">Settings</h1>
        <p className="text-zinc-500 mt-1">Manage your business profile and contact information.</p>
      </div>

      {isVerified && (
        <div className="bg-orange-50 border border-orange-200 rounded-[16px] p-5 flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-orange-900 text-sm">Profile Locked (Verified)</h3>
            <p className="text-sm text-orange-800 mt-1">
              Your business identity has been verified. To prevent fraud, core identity fields are locked. 
              If you need to change your legal business name or core details, you must restart the verification process.
            </p>
            <Button variant="outline" size="sm" className="mt-4 border-orange-300 text-orange-700 hover:bg-orange-100 font-bold">
              <RefreshCcw className="w-4 h-4 mr-2" /> Restart Verification
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-[16px] shadow-sm overflow-hidden">
        
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Business Logo */}
          <section>
            <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-zinc-400" /> Business Logo
            </h3>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-zinc-100 rounded-2xl border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
                {vendor?.logoUrl ? (
                  <img src={vendor.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building className="w-8 h-8 text-zinc-300" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={isVerified}>Upload Image</Button>
                  {vendor?.logoUrl && <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" disabled={isVerified}>Remove</Button>}
                </div>
                <p className="text-xs text-zinc-500">Recommended size: 512x512px. PNG or JPG.</p>
              </div>
            </div>
          </section>

          <hr className="border-zinc-100" />

          {/* Business Identity */}
          <section>
            <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-zinc-400" /> Core Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="flex items-center justify-between">
                  Business Name {isVerified && <Lock className="w-3 h-3 text-zinc-400" />}
                </Label>
                <Input id="businessName" defaultValue={vendor?.businessName} disabled={isVerified} className={isVerified ? "bg-zinc-50" : ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType" className="flex items-center justify-between">
                  Entity Type {isVerified && <Lock className="w-3 h-3 text-zinc-400" />}
                </Label>
                <Input id="businessType" defaultValue={vendor?.businessType || "Company"} disabled={isVerified} className={isVerified ? "bg-zinc-50" : ""} />
              </div>
            </div>
          </section>

          <hr className="border-zinc-100" />

          {/* Contact Details */}
          <section>
            <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-zinc-400" /> Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input id="contactPerson" defaultValue={vendor?.user?.name || session?.user?.name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input id="phone" defaultValue={vendor?.phone || vendor?.user?.phone || ""} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email" className="flex items-center justify-between">
                  Email Address {isVerified && <Lock className="w-3 h-3 text-zinc-400" />}
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input id="email" defaultValue={vendor?.email || vendor?.user?.email || session?.user?.email || ""} disabled={isVerified} className={`pl-9 ${isVerified ? "bg-zinc-50" : ""}`} />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-zinc-100" />

          {/* Address */}
          <section>
            <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-400" /> Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="addressLine1" className="flex items-center justify-between">
                  Address Line 1 {isVerified && <Lock className="w-3 h-3 text-zinc-400" />}
                </Label>
                <Input id="addressLine1" defaultValue={vendor?.addressLine1} disabled={isVerified} className={isVerified ? "bg-zinc-50" : ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center justify-between">
                  City {isVerified && <Lock className="w-3 h-3 text-zinc-400" />}
                </Label>
                <Input id="city" defaultValue={vendor?.city} disabled={isVerified} className={isVerified ? "bg-zinc-50" : ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="flex items-center justify-between">
                  State {isVerified && <Lock className="w-3 h-3 text-zinc-400" />}
                </Label>
                <Input id="state" defaultValue={vendor?.state} disabled={isVerified} className={isVerified ? "bg-zinc-50" : ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode" className="flex items-center justify-between">
                  Postal Code {isVerified && <Lock className="w-3 h-3 text-zinc-400" />}
                </Label>
                <Input id="postalCode" defaultValue={vendor?.postalCode} disabled={isVerified} className={isVerified ? "bg-zinc-50" : ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="flex items-center justify-between">
                  Country {isVerified && <Lock className="w-3 h-3 text-zinc-400" />}
                </Label>
                <Input id="country" defaultValue={vendor?.country || "India"} disabled={isVerified} className={isVerified ? "bg-zinc-50" : ""} />
              </div>
            </div>
          </section>

        </div>

        <div className="bg-zinc-50 border-t border-zinc-200 p-6 flex justify-end">
          <Button className="bg-black text-white hover:bg-black/90 font-bold px-8">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
