"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, ShieldAlert, FileWarning, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { format } from "date-fns";

export default function ComplianceMonitor() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await axios.get("/api/enterprise/businesses");
        if (res.data.success) {
          // Filter out those with compliance issues
          const nonCompliant = res.data.businesses.filter((b: any) => b.complianceStatus !== "Compliant");
          setAlerts(nonCompliant);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center">Loading Compliance Data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance Monitor</h1>
          <p className="text-muted-foreground">Track expiring documents and missing mandatory requirements.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-zinc-200 border-t-4 border-t-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alerts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Businesses non-compliant</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-zinc-200 border-t-4 border-t-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon (30d)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">0</div>
            <p className="text-xs text-muted-foreground mt-1">GST/Certificates expiring</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-zinc-200 border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Documents</CardTitle>
            <FileWarning className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-xs text-muted-foreground mt-1">Required docs missing</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-zinc-200">
        <CardHeader>
          <CardTitle className="text-lg text-red-600 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Action Required
          </CardTitle>
          <CardDescription>The following businesses are missing mandatory verified documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-red-100">
            <Table>
              <TableHeader className="bg-red-50/50">
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Issue Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Detected On</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-green-600 font-medium">
                      All onboarded businesses are fully compliant!
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.businessName}</TableCell>
                      <TableCell>Missing Verified Documents</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="bg-red-500">High</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/enterprise/businesses/${b.vendorId}`}>
                          <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50">
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </Link>
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
  );
}
