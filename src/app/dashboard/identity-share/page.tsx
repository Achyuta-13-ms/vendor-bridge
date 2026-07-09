"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { Share2, Link as LinkIcon, QrCode, FileDown, Mail, Trash2, Check, Copy, Clock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AccessHistory from "@/components/vendor/AccessHistory";

export default function IdentitySharePage() {
  const [links, setLinks] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [identity, setIdentity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [copiedLink, setCopiedLink] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  // New Link State
  const [linkType, setLinkType] = useState("PERMANENT");
  const [profileName, setProfileName] = useState("Public");
  const [permissions, setPermissions] = useState({
    shareBusinessDetails: true,
    shareGST: false,
    sharePAN: false,
    shareAddress: true,
    shareContact: false,
    shareDocuments: false,
    shareCompliance: true,
    shareCertificates: false
  });

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/vendor/share");
      if (res.data.success) {
        setLinks(res.data.sharedLinks || []);
        setProfiles(res.data.sharingProfiles || []);
        setIdentity(res.data.businessIdentity);
      }
    } catch (error) {
      console.error("Failed to load share data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProfileChange = (val: string) => {
    setProfileName(val);
    if (val === "Public") {
      setPermissions({ ...permissions, shareDocuments: false, sharePAN: false, shareGST: false, shareContact: false });
    } else if (val === "Enterprise") {
      setPermissions({ ...permissions, shareDocuments: true, sharePAN: true, shareGST: true, shareContact: true });
    } else if (val === "Private") {
      setPermissions({ ...permissions, shareDocuments: false, shareBusinessDetails: false, shareAddress: false, shareCompliance: false });
    }
  };

  const createLink = async () => {
    setIsCreating(true);
    try {
      await axios.post("/api/vendor/share", {
        linkType,
        profileName,
        permissions
      });
      fetchData();
    } catch (error) {
      console.error("Failed to create link", error);
    } finally {
      setIsCreating(false);
    }
  };

  const revokeLink = async (id: string) => {
    try {
      await axios.delete(`/api/vendor/share?linkId=${id}`);
      fetchData();
    } catch (error) {
      console.error("Failed to revoke link", error);
    }
  };

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/identity/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(token);
    setTimeout(() => setCopiedLink(""), 2000);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading sharing dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Identity Sharing</h1>
        <p className="text-gray-500">Securely share your verified Business Identity with enterprises and partners.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Create Link Form */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="w-5 h-5 text-orange-600" />
                Generate Share Link
              </CardTitle>
              <CardDescription>Create a secure link with specific permissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-2">
                <Label>Link Expiry</Label>
                <Select value={linkType} onValueChange={setLinkType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERMANENT">Permanent (No expiry)</SelectItem>
                    <SelectItem value="30_DAYS">30 Days</SelectItem>
                    <SelectItem value="7_DAYS">7 Days</SelectItem>
                    <SelectItem value="SINGLE_USE">Single Use</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sharing Profile</Label>
                <Select value={profileName} onValueChange={handleProfileChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public">Public (Basic Info)</SelectItem>
                    <SelectItem value="Enterprise">Enterprise (Full Info + Docs)</SelectItem>
                    <SelectItem value="Private">Private (Strictly Custom)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Permissions</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="share-docs" className="text-sm text-gray-600">Include Documents</Label>
                  <Switch 
                    id="share-docs" 
                    checked={permissions.shareDocuments}
                    onCheckedChange={(c) => setPermissions({...permissions, shareDocuments: c})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="share-contact" className="text-sm text-gray-600">Contact Details</Label>
                  <Switch 
                    id="share-contact" 
                    checked={permissions.shareContact}
                    onCheckedChange={(c) => setPermissions({...permissions, shareContact: c})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="share-pan" className="text-sm text-gray-600">PAN & GST Info</Label>
                  <Switch 
                    id="share-pan" 
                    checked={permissions.sharePAN}
                    onCheckedChange={(c) => setPermissions({...permissions, sharePAN: c, shareGST: c})}
                  />
                </div>
              </div>

              <Button 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-4" 
                onClick={createLink}
                disabled={isCreating}
              >
                {isCreating ? "Generating..." : "Generate Secure Link"}
              </Button>

            </CardContent>
          </Card>
        </div>

        {/* Generated Links List */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Shared Links</CardTitle>
              <CardDescription>Manage and track who has access to your identity.</CardDescription>
            </CardHeader>
            <CardContent>
              {links.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                  <LinkIcon className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p>No active shared links yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {links.map((link) => {
                    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/identity/${link.token}`;
                    return (
                      <div key={link.id} className={`p-4 border rounded-lg flex flex-col sm:flex-row gap-4 ${!link.isActive ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                        {/* QR Code */}
                        <div className="hidden sm:block p-2 bg-white border rounded">
                          <QRCodeSVG value={url} size={80} />
                        </div>
                        
                        {/* Link Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={link.sharingProfile?.name === "Enterprise" ? "border-orange-500 text-orange-600" : ""}>
                                {link.sharingProfile?.name || "Custom"} Profile
                              </Badge>
                              {link.linkType === "SINGLE_USE" && <Badge variant="secondary">Single Use</Badge>}
                              {!link.isActive && <Badge variant="destructive">Revoked</Badge>}
                            </div>
                            {link.isActive && (
                              <Button variant="ghost" size="sm" onClick={() => revokeLink(link.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2">
                                <Trash2 className="w-4 h-4 mr-1" /> Revoke
                              </Button>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Input value={url} readOnly className="h-8 bg-gray-50 text-sm" />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-3 shrink-0"
                              onClick={() => copyToClipboard(link.token)}
                            >
                              {copiedLink === link.token ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {link.expiresAt ? `Expires: ${new Date(link.expiresAt).toLocaleDateString()}` : "Permanent"}
                            </span>
                            <span className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {link._count?.accessLogs || 0} Views
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Access History */}
      <div className="mt-8">
        <AccessHistory />
      </div>
    </div>
  );
}
