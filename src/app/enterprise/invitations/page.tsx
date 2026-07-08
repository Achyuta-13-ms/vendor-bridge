"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Send, UserPlus, Link as LinkIcon, RefreshCcw, Mail, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({ businessName: "", email: "", phone: "", message: "" });
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const res = await axios.get("/api/enterprise/invitations");
      if (res.data.success) {
        setInvitations(res.data.invitations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName || !form.email) {
      toast.error("Business name and email are required.");
      return;
    }
    
    setInviting(true);
    try {
      const res = await axios.post("/api/enterprise/invitations", form);
      if (res.data.success) {
        toast.success("Invitation sent successfully!");
        setForm({ businessName: "", email: "", phone: "", message: "" });
        fetchInvitations();
      } else {
        toast.error(res.data.message || "Failed to send invitation.");
      }
    } catch (err) {
      toast.error("Server error. Please try again later.");
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center">Loading Invitations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invitations</h1>
          <p className="text-muted-foreground">Invite businesses to onboard and verify their identity.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-sm border-zinc-200 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-orange-500" />
              New Invitation
            </CardTitle>
            <CardDescription>Send an onboarding link directly to a business.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Name *</label>
                <Input 
                  placeholder="e.g. Acme Corp" 
                  value={form.businessName}
                  onChange={e => setForm({...form, businessName: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address *</label>
                <Input 
                  type="email"
                  placeholder="admin@acmecorp.com" 
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number (Optional)</label>
                <Input 
                  placeholder="+91 9876543210" 
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message (Optional)</label>
                <Textarea 
                  placeholder="Include a custom message..." 
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  className="resize-none"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={inviting}>
                {inviting ? "Sending..." : "Send Invitation"}
                {!inviting && <Send className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm border-zinc-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Sent Invitations</CardTitle>
              <CardDescription>Track the status of your onboarding invites.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchInvitations}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No invitations sent yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invitations.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.businessName}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Mail className="w-3 h-3 mr-1 text-zinc-400" />
                            {inv.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {inv.status === "ACCEPTED" ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Accepted
                            </Badge>
                          ) : inv.status === "EXPIRED" ? (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <XCircle className="w-3 h-3 mr-1" /> Expired
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <Clock className="w-3 h-3 mr-1" /> Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(inv.createdAt), "MMM dd")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/onboarding?token=${inv.token}`);
                            toast.success("Invite link copied to clipboard");
                          }}>
                            <LinkIcon className="w-4 h-4 mr-1" />
                            Copy Link
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
      </div>
    </div>
  );
}
