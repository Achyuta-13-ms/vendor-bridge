"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Building2, MapPin, CheckCircle2, ShieldAlert, FileText, Globe, Mail, Phone, Lock, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import IdentityPDFGenerator from "@/components/shared/IdentityPDFGenerator";

export default function PublicIdentityPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    
    const fetchIdentity = async () => {
      try {
        const res = await axios.get(`/api/public/identity/${id}`);
        setData(res.data);
        
        // If it's a shared link, we should also trigger the access log
        if (res.data.type === "SHARED_LINK" && res.data.sharedLinkId) {
          axios.post("/api/identity/log-access", { sharedLinkId: res.data.sharedLinkId }).catch(console.error);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load identity profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchIdentity();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-orange-200 mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-0">
          <CardContent className="pt-6 text-center">
            <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => window.location.href = '/'}>
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-orange-600" />
            <span className="font-bold text-xl">VyapaarSetu</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Secure Identity Profile
            </Badge>
            <IdentityPDFGenerator identityData={data} sharedLinkId={data.sharedLinkId} />
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {data.businessName}
                      {data.status === "APPROVED" && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-base mt-1 flex items-center gap-4">
                      <span>{data.businessType}</span>
                      {data.address && (
                        <span className="flex items-center text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" />
                          {data.address.city}, {data.address.state}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-wrap">{data.description || "No description provided."}</p>
              </CardContent>
            </Card>

            {/* Documents Section */}
            {data.documents && data.documents.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Verified Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {data.documents.map((doc: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 text-orange-700 rounded-md">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.type}</p>
                            <p className="text-xs text-gray-500">Document securely masked</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={doc.status === "VERIFIED" ? "bg-green-50 text-green-700 border-green-200" : ""}>
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {(!data.documents || data.documents.length === 0) && (
              <Card className="border-0 shadow-sm bg-gray-50">
                <CardContent className="py-8 text-center text-gray-500">
                  <EyeOff className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>Documents are hidden by the sharing permissions.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm bg-slate-900 text-white">
              <CardHeader>
                <CardTitle className="text-lg text-slate-200">Business Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Business ID</p>
                  <p className="font-mono bg-slate-800 p-2 rounded text-center text-lg">{data.businessId || "VS-HIDDEN"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Verification Status</p>
                  <div className="flex items-center gap-2">
                    {data.status === "APPROVED" ? (
                      <Badge className="bg-green-500/20 text-green-400 border-0 hover:bg-green-500/20">Verified Identity</Badge>
                    ) : (
                      <Badge variant="secondary">Pending Review</Badge>
                    )}
                  </div>
                </div>
                {data.compliance && (
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Compliance</p>
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">Requirements Met</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {data.contact && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="w-4 h-4 text-orange-600" />
                    Contact Info
                  </CardTitle>
                  <CardDescription>Authorized access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.contact.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{data.contact.email}</span>
                    </div>
                  )}
                  {data.contact.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{data.contact.phone}</span>
                    </div>
                  )}
                  {data.contact.website && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href={data.contact.website} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
