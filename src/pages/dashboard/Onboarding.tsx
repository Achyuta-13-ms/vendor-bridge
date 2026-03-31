import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Building2, FileText, Landmark } from "lucide-react";

const steps = [
  { id: 1, label: "Business Info", icon: Building2 },
  { id: 2, label: "GST & PAN", icon: FileText },
  { id: 3, label: "Bank Details", icon: Landmark },
];

const Onboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [existingVendor, setExistingVendor] = useState<any>(null);

  const [form, setForm] = useState({
    business_name: "",
    gst_number: "",
    pan_number: "",
    bank_account_number: "",
    bank_ifsc: "",
    bank_name: "",
  });

  useEffect(() => {
    const checkExisting = async () => {
      if (!user) return;
      const { data } = await supabase.from("vendors").select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        setExistingVendor(data);
        setForm({
          business_name: data.business_name || "",
          gst_number: data.gst_number || "",
          pan_number: data.pan_number || "",
          bank_account_number: data.bank_account_number || "",
          bank_ifsc: data.bank_ifsc || "",
          bank_name: data.bank_name || "",
        });
      }
    };
    checkExisting();
  }, [user]);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    if (existingVendor) {
      const { error } = await supabase.from("vendors").update(form).eq("id", existingVendor.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Profile updated ✅", description: "Your vendor details have been saved." });
        navigate("/dashboard");
      }
    } else {
      const { error } = await supabase.from("vendors").insert({ ...form, user_id: user.id });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Onboarding complete ✅", description: "Your vendor profile has been created." });
        navigate("/dashboard");
      }
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Vendor Onboarding</h2>
          <p className="text-sm text-muted-foreground">Complete these steps to create your vendor profile.</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <button
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                  step === s.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : step > s.id
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {step > s.id ? <CheckCircle className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                {s.label}
              </button>
              {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>

        <Card>
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="text-base">Business Information</CardTitle>
                <CardDescription>Enter your registered business name.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Business Name *</Label>
                  <Input
                    placeholder="e.g. Sharma Traders Pvt Ltd"
                    value={form.business_name}
                    onChange={(e) => update("business_name", e.target.value)}
                    required
                  />
                </div>
                <Button onClick={() => setStep(2)} disabled={!form.business_name}>
                  Continue
                </Button>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="text-base">GST & PAN Details</CardTitle>
                <CardDescription>Provide your tax identification numbers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    value={form.gst_number}
                    onChange={(e) => update("gst_number", e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <Label>PAN Number</Label>
                  <Input
                    placeholder="e.g. ABCDE1234F"
                    value={form.pan_number}
                    onChange={(e) => update("pan_number", e.target.value.toUpperCase())}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)}>Continue</Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="text-base">Bank Details</CardTitle>
                <CardDescription>Add your bank account for payouts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    placeholder="e.g. State Bank of India"
                    value={form.bank_name}
                    onChange={(e) => update("bank_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    placeholder="e.g. 1234567890"
                    value={form.bank_account_number}
                    onChange={(e) => update("bank_account_number", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IFSC Code</Label>
                  <Input
                    placeholder="e.g. SBIN0001234"
                    value={form.bank_ifsc}
                    onChange={(e) => update("bank_ifsc", e.target.value.toUpperCase())}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving…" : existingVendor ? "Update Profile" : "Complete Onboarding"}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Onboarding;
