import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, BadgeCheck, Clock, AlertTriangle, ArrowRight } from "lucide-react";

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  pending: { color: "text-warning", icon: Clock, label: "Pending" },
  verified: { color: "text-success", icon: BadgeCheck, label: "Verified" },
  failed: { color: "text-destructive", icon: AlertTriangle, label: "Failed" },
  in_review: { color: "text-warning", icon: Clock, label: "In Review" },
};

const DashboardHome = () => {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const [vendorRes, profileRes] = await Promise.all([
        supabase.from("vendors").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      ]);
      setVendor(vendorRes.data);
      setProfile(profileRes.data);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const status = vendor ? statusConfig[vendor.verification_status] || statusConfig.pending : null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h2>
          <p className="text-sm text-muted-foreground">Here's your vendor onboarding status.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : !vendor ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-1">No vendor profile yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start your onboarding to create your vendor profile.</p>
              <Link to="/dashboard/onboarding">
                <Button className="gap-2">Start Onboarding <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Business Name</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-foreground">{vendor.business_name}</p>
                <p className="text-xs text-muted-foreground mt-1">ID: {vendor.vendor_profile_id}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                {status && (
                  <div className="flex items-center gap-2">
                    <status.icon className={`h-5 w-5 ${status.color}`} />
                    <span className={`text-lg font-semibold ${status.color}`}>{status.label}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">GST Number</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-foreground">{vendor.gst_number || "—"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">PAN Number</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-foreground">{vendor.pan_number || "—"}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
