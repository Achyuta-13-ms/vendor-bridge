"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle2, XCircle, FileText, ExternalLink, RefreshCcw, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function VerificationRequests() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const res = await axios.get("/api/enterprise/verifications");
      if (res.data.success) {
        setVerifications(res.data.verifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status: "Verified" | "Rejected") => {
    if (!selectedDoc) return;
    
    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/enterprise/verifications", {
        documentId: selectedDoc.id,
        status,
        notes
      });
      
      if (res.data.success) {
        toast.success(`Document ${status.toLowerCase()} successfully`);
        setSelectedDoc(null);
        setNotes("");
        fetchVerifications();
      } else {
        toast.error(res.data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center">Loading Verification Queue...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Verification Requests</h1>
          <p className="text-muted-foreground">Review and approve uploaded business documents.</p>
        </div>
        <Button variant="outline" onClick={fetchVerifications}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh Queue
        </Button>
      </div>

      <Card className="shadow-sm border-zinc-200">
        <CardHeader>
          <CardTitle className="text-lg">Pending Reviews ({verifications.length})</CardTitle>
          <CardDescription>Documents requiring your attention before onboarding can complete.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Uploaded On</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Queue is completely empty. Excellent work!
                    </TableCell>
                  </TableRow>
                ) : (
                  verifications.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.vendor?.businessName || "Unknown"}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-zinc-400" />
                          {doc.type}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(doc.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDoc(doc)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
            <DialogDescription>
              Verify the {selectedDoc?.type} document for {selectedDoc?.vendor?.businessName}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="flex justify-center p-4 bg-zinc-50 rounded-lg border border-zinc-200">
              <Button asChild>
                <a href={selectedDoc?.url} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open Document File
                </a>
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Review Notes (Optional)</label>
              <Textarea 
                placeholder="Add notes for internal reference or rejection reason..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleAction("Rejected")}
              disabled={isSubmitting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject & Request Re-upload
            </Button>
            <Button 
              onClick={() => handleAction("Verified")}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
