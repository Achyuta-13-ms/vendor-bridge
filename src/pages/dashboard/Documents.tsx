import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, Clock, XCircle } from "lucide-react";

const docTypes = [
  { value: "gst_certificate", label: "GST Certificate" },
  { value: "pan_card", label: "PAN Card" },
  { value: "bank_proof", label: "Bank Proof (Cheque/Statement)" },
  { value: "address_proof", label: "Address Proof" },
  { value: "other", label: "Other" },
];

const statusIcons: Record<string, { icon: any; color: string }> = {
  uploaded: { icon: Clock, color: "text-warning" },
  verifying: { icon: Clock, color: "text-warning" },
  verified: { icon: CheckCircle, color: "text-success" },
  rejected: { icon: XCircle, color: "text-destructive" },
};

const Documents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [vendor, setVendor] = useState<any>(null);
  const [docType, setDocType] = useState("gst_certificate");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    const { data: v } = await supabase.from("vendors").select("*").eq("user_id", user.id).maybeSingle();
    setVendor(v);
    if (v) {
      const { data: docs } = await supabase.from("documents").select("*").eq("vendor_id", v.id).order("created_at", { ascending: false });
      setDocuments(docs || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleUpload = async () => {
    if (!file || !user || !vendor) return;
    setUploading(true);

    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("vendor-documents").upload(filePath, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("vendor-documents").getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("documents").insert({
      vendor_id: vendor.id,
      user_id: user.id,
      document_type: docType,
      file_name: file.name,
      file_url: urlData.publicUrl,
    });

    if (insertError) {
      toast({ title: "Error saving document", description: insertError.message, variant: "destructive" });
    } else {
      toast({ title: "Document uploaded ✅" });
      setFile(null);
      fetchData();
    }
    setUploading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Documents</h2>
          <p className="text-sm text-muted-foreground">Upload and manage your KYC documents.</p>
        </div>

        {!vendor ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Complete onboarding first to upload documents.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Upload Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select value={docType} onValueChange={setDocType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {docTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>File</Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                <Button onClick={handleUpload} disabled={!file || uploading} className="gap-2">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading…" : "Upload"}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : documents.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                  </CardContent>
                </Card>
              ) : (
                documents.map((doc) => {
                  const s = statusIcons[doc.status] || statusIcons.uploaded;
                  return (
                    <Card key={doc.id}>
                      <CardContent className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{doc.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {docTypes.find((t) => t.value === doc.document_type)?.label}
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${s.color}`}>
                          <s.icon className="h-3.5 w-3.5" />
                          {doc.status}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Documents;
