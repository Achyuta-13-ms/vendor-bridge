"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, X, Download, Eye, RefreshCcw, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface DocumentData {
  id: string;
  type: string;
  url: string;
  originalName: string | null;
  mimeType: string | null;
  size: number | null;
  createdAt: string;
  verification?: { status: string };
}

interface DocumentManagerProps {
  vendorId: string;
  documents: DocumentData[];
  onDocumentChange: () => void;
}

const REQUIRED_DOCS = [
  { type: "GST", label: "GST Certificate", desc: "Required for tax compliance" },
  { type: "PAN", label: "Business PAN", desc: "Required for identity verification" },
  { type: "BANK", label: "Cancelled Cheque", desc: "Required for settlement mapping" },
  { type: "INCORPORATION", label: "Certificate of Incorporation", desc: "Required for business legal entity verification" },
];

const OPTIONAL_DOCS = [
  { type: "MSME", label: "MSME Certificate", desc: "Optional for MSME benefits" },
  { type: "FSSAI", label: "FSSAI License", desc: "Required for food businesses" },
  { type: "TRADE", label: "Trade License", desc: "Optional business license" },
];

export default function DocumentManager({ vendorId, documents, onDocumentChange }: DocumentManagerProps) {
  const { toast } = useToast();
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewDoc, setPreviewDoc] = useState<DocumentData | null>(null);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileSelect = async (type: string, file: File) => {
    // Validate File
    const MAX_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    if (file.size > MAX_SIZE) {
      toast({ title: "Error", description: "File size exceeds 10MB limit.", variant: "destructive" });
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: "Error", description: "Invalid format. Upload PDF, JPG, or PNG.", variant: "destructive" });
      return;
    }

    try {
      setUploadingType(type);
      setUploadProgress(10);

      // 1. Upload to Blob / Local Fallback
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", `vendor_${vendorId}`);

      const uploadRes = await axios.post("/api/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || file.size));
          // cap at 90% until DB finishes
          setUploadProgress(Math.min(percentCompleted, 90));
        },
      });

      if (!uploadRes.data.success) {
        throw new Error(uploadRes.data.message || "Upload failed");
      }

      setUploadProgress(95);

      // 2. Save DB Record
      await axios.post("/api/documents", {
        vendorId,
        type,
        url: uploadRes.data.url,
        originalName: file.name,
        mimeType: file.type,
        size: file.size
      });

      setUploadProgress(100);
      toast({ title: "Success", description: "Document uploaded and saved securely." });
      onDocumentChange();

    } catch (err: any) {
      console.error(err);
      toast({ title: "Upload Failed", description: err?.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setUploadingType(null);
      setUploadProgress(0);
      if (fileInputRefs.current[type]) {
        fileInputRefs.current[type]!.value = "";
      }
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await axios.delete(`/api/documents/${docId}`);
      toast({ title: "Deleted", description: "Document removed successfully." });
      onDocumentChange();
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to delete document.", variant: "destructive" });
    }
  };

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "verified":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "pending":
      case "under review": 
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "rejected": 
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default: 
        return "text-muted-foreground bg-muted border-transparent";
    }
  };

  const renderDocSection = (docsList: typeof REQUIRED_DOCS) => {
    return docsList.map((docType) => {
      const existingDoc = documents.find(d => d.type === docType.type);
      const isUploading = uploadingType === docType.type;

      if (existingDoc) {
        // Document Exists -> Show Details Card
        const status = existingDoc.verification?.status || "Uploaded";
        const isPdf = existingDoc.mimeType === "application/pdf" || existingDoc.url.toLowerCase().endsWith(".pdf");

        return (
          <div key={docType.type} className="flex flex-col p-4 rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", 
                  status.toLowerCase() === "verified" ? "bg-blue-50 text-blue-600" : "bg-zinc-100 text-zinc-500")}>
                  {isPdf ? <FileText className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-black">{docType.label}</p>
                    <Badge className={cn("uppercase text-[10px] font-black h-5", statusColor(status))}>
                      {status}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 truncate max-w-[200px] sm:max-w-xs">{existingDoc.originalName || "document_file"}</p>
                  <p className="text-[10px] text-zinc-400">
                    {new Date(existingDoc.createdAt).toLocaleDateString()} • {existingDoc.size ? (existingDoc.size / 1024 / 1024).toFixed(2) + " MB" : ""}
                  </p>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden sm:flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setPreviewDoc(existingDoc)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <a href={existingDoc.url} target="_blank" download>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => fileInputRefs.current[docType.type]?.click()}>
                  <RefreshCcw className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(existingDoc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Mobile Actions */}
            <div className="flex sm:hidden items-center gap-2 pt-2 border-t border-zinc-100 justify-between">
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => setPreviewDoc(existingDoc)}>Preview</Button>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => fileInputRefs.current[docType.type]?.click()}><RefreshCcw className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDelete(existingDoc.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>

            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.png,.jpg,.jpeg" 
              ref={(el) => { fileInputRefs.current[docType.type] = el; }} 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(docType.type, e.target.files[0]);
                }
              }} 
            />
          </div>
        );
      } else {
        // Document Missing -> Show Upload Zone
        return (
          <div 
            key={docType.type} 
            className="relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer group"
            onClick={() => !isUploading && fileInputRefs.current[docType.type]?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (isUploading) return;
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileSelect(docType.type, e.dataTransfer.files[0]);
              }
            }}
          >
            {isUploading ? (
              <div className="flex flex-col items-center w-full max-w-[200px]">
                <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-3" />
                <p className="text-sm font-bold text-black mb-2">Uploading...</p>
                <Progress value={uploadProgress} className="h-2 w-full" />
              </div>
            ) : (
              <>
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="h-5 w-5 text-orange-500" />
                </div>
                <p className="font-bold text-black mb-1">{docType.label}</p>
                <p className="text-xs text-zinc-500 text-center max-w-[250px]">{docType.desc}</p>
                <Badge variant="outline" className="mt-4 text-[10px] bg-white">PDF, PNG, JPG (Max 10MB)</Badge>
              </>
            )}
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.png,.jpg,.jpeg" 
              ref={(el) => { fileInputRefs.current[docType.type] = el; }} 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(docType.type, e.target.files[0]);
                }
              }} 
            />
          </div>
        );
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Required Documents */}
      <div>
        <h3 className="text-lg font-bold text-black mb-4">Required Documents</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderDocSection(REQUIRED_DOCS)}
        </div>
      </div>

      {/* Optional Documents */}
      <div>
        <h3 className="text-lg font-bold text-black mb-4">Optional Documents</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderDocSection(OPTIONAL_DOCS)}
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100">
              <h3 className="font-bold text-lg">{previewDoc.originalName || "Document Preview"}</h3>
              <div className="flex items-center gap-2">
                <a href={previewDoc.url} target="_blank" download>
                  <Button variant="outline" size="sm" className="h-8 gap-2"><Download className="h-4 w-4" /> Download</Button>
                </a>
                <Button variant="ghost" size="icon" onClick={() => setPreviewDoc(null)} className="h-8 w-8 rounded-full hover:bg-zinc-100">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-zinc-50 flex items-center justify-center min-h-[50vh]">
              {(previewDoc.mimeType === "application/pdf" || previewDoc.url.toLowerCase().endsWith(".pdf")) ? (
                <iframe src={previewDoc.url} className="w-full h-[70vh] rounded-lg border border-zinc-200" title="PDF Preview" />
              ) : (
                <img src={previewDoc.url} alt="Document Preview" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
