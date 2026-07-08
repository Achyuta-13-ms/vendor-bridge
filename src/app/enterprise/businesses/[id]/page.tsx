"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Building2, MapPin, Briefcase, FileText, Download, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { format } from "date-fns";

export default function BusinessProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await axios.get(`/api/enterprise/businesses/${id}`);
        if (res.data.success) {
          setData(res.data.business);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [id]);

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center">Loading Profile...</div>;
  }

  if (!data) {
    return <div className="flex h-[400px] items-center justify-center text-red-500">Failed to load business profile.</div>;
  }

  const { vendor, status, createdAt } = data;
  const docs = vendor.documents || [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/enterprise/businesses">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{vendor.businessName || "Unknown Business"}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <Badge variant={status === "APPROVED" ? "default" : "secondary"} className={status === "APPROVED" ? "bg-green-100 text-green-700" : ""}>
              {status}
            </Badge>
            <span>•</span>
            <span>ID: {vendor.id}</span>
            <span>•</span>
            <span>Joined: {format(new Date(createdAt), "MMM dd, yyyy")}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none px-6 py-3 data-[state=active]:shadow-none">Overview</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none px-6 py-3 data-[state=active]:shadow-none">Documents</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none px-6 py-3 data-[state=active]:shadow-none">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-zinc-200">
              <CardHeader>
                <CardTitle className="text-lg">Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Industry / Type</p>
                    <p className="font-medium">{vendor.businessType || "Not Specified"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Address</p>
                    <p className="font-medium">{vendor.address || "Not Provided"}</p>
                    <p className="text-sm text-zinc-600">{vendor.city}, {vendor.state} {vendor.pincode}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Year of Establishment</p>
                    <p className="font-medium">{vendor.yearOfEstablishment || "Not Specified"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-zinc-200">
              <CardHeader>
                <CardTitle className="text-lg">Primary Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-zinc-500">Full Name</p>
                  <p className="font-medium">{vendor.user?.name || "Not Specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">Email Address</p>
                  <p className="font-medium">{vendor.user?.email || "Not Specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">Phone Number</p>
                  <p className="font-medium">{vendor.user?.phone || "Not Specified"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 mt-0">
          <Card className="shadow-sm border-zinc-200">
            <CardHeader>
              <CardTitle className="text-lg">Uploaded Documents</CardTitle>
              <CardDescription>Review and verify identity documents.</CardDescription>
            </CardHeader>
            <CardContent>
              {docs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No documents uploaded yet.</div>
              ) : (
                <div className="space-y-4">
                  {docs.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-xl bg-zinc-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{doc.type} Document</p>
                          <p className="text-xs text-muted-foreground">Uploaded on {format(new Date(doc.createdAt), "MMM dd, yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {doc.verification?.status === "Verified" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        ) : doc.verification?.status === "Rejected" ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <XCircle className="w-3 h-3 mr-1" /> Rejected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc.url} target="_blank" rel="noreferrer">
                            <Eye className="w-4 h-4 mr-2" /> View
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <Card className="shadow-sm border-zinc-200">
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                Detailed activity log will appear here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
