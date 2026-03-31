import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Clock, XCircle, FileText } from "lucide-react";

const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any; label: string }> = {
  pending: { variant: "secondary", icon: Clock, label: "Pending" },
  verified: { variant: "default", icon: BadgeCheck, label: "Verified" },
  failed: { variant: "destructive", icon: XCircle, label: "Failed" },
};

const typeLabels: Record<string, string> = {
  gst: "GST Verification",
  pan: "PAN Verification",
  bank: "Bank Account Verification",
};

const Verification = () => {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data: v } = await supabase.from("vendors").select("*").eq("user_id", user.id).maybeSingle();
      setVendor(v);
      if (v) {
        const { data } = await supabase.from("verifications").select("*").eq("vendor_id", v.id).order("created_at", { ascending: false });
        setVerifications(data || []);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Verification Status</h2>
          <p className="text-sm text-muted-foreground">Track your GST, PAN, and bank verification progress.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : !vendor ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Complete onboarding first.</p>
            </CardContent>
          </Card>
        ) : verifications.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No verifications yet. Upload your documents to start.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {verifications.map((v) => {
              const s = statusMap[v.status] || statusMap.pending;
              return (
                <Card key={v.id}>
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{typeLabels[v.verification_type] || v.verification_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.verified_at ? `Verified: ${new Date(v.verified_at).toLocaleDateString()}` : "Awaiting verification"}
                      </p>
                    </div>
                    <Badge variant={s.variant} className="gap-1">
                      <s.icon className="h-3 w-3" />
                      {s.label}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Verification;
