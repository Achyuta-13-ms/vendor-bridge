"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { UserPlus, Shield, User, Mail, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function TeamManagement() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({ name: "", email: "", role: "VIEWER" });
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await axios.get("/api/enterprise/team");
      if (res.data.success) {
        setTeam(res.data.team);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Name and email are required.");
      return;
    }
    
    setInviting(true);
    try {
      const res = await axios.post("/api/enterprise/team", form);
      if (res.data.success) {
        toast.success("Team member added successfully!");
        setForm({ name: "", email: "", role: "VIEWER" });
        fetchTeam();
      } else {
        toast.error(res.data.message || "Failed to add team member.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Server error. Please try again later.");
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center">Loading Team Data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage roles and access for your enterprise team.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-sm border-zinc-200 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-orange-500" />
              Invite Member
            </CardTitle>
            <CardDescription>Grant access to your colleagues.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                  placeholder="John Doe" 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input 
                  type="email"
                  placeholder="john@example.com" 
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Access Role</label>
                <Select value={form.role} onValueChange={val => setForm({...form, role: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin (Full Access)</SelectItem>
                    <SelectItem value="REVIEWER">Reviewer (Approve/Reject)</SelectItem>
                    <SelectItem value="VIEWER">Viewer (Read Only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={inviting}>
                {inviting ? "Inviting..." : "Add to Team"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle className="text-lg">Active Team Members ({team.length})</CardTitle>
            <CardDescription>People with access to this enterprise dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No team members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    team.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 border flex items-center justify-center">
                              <User className="w-4 h-4 text-zinc-600" />
                            </div>
                            <div>
                              <p className="font-medium">{member.user?.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                                <Mail className="w-3 h-3 mr-1" /> {member.user?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.role === "ADMIN" ? "default" : "outline"} className={member.role === "ADMIN" ? "bg-blue-600" : ""}>
                            {member.role === "ADMIN" && <Shield className="w-3 h-3 mr-1" />}
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
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
