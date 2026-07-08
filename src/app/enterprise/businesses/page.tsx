"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Eye, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { format } from "date-fns";

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await axios.get("/api/enterprise/businesses");
        if (res.data.success) {
          setBusinesses(res.data.businesses);
          setFiltered(res.data.businesses);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (!query) {
      setFiltered(businesses);
    } else {
      const q = query.toLowerCase();
      setFiltered(businesses.filter(b => 
        b.businessName.toLowerCase().includes(q) || 
        b.industry.toLowerCase().includes(q)
      ));
    }
  }, [query, businesses]);

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center">Loading Directory...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business Directory</h1>
          <p className="text-muted-foreground">Manage and review all onboarded businesses.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-zinc-200">
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or industry..." 
              className="pl-9" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Verification Status</TableHead>
                  <TableHead>Compliance Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No businesses found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.businessName}</TableCell>
                      <TableCell>{b.industry}</TableCell>
                      <TableCell>
                        <Badge variant={b.status === "APPROVED" ? "default" : "secondary"} className={b.status === "APPROVED" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={b.complianceStatus === "Compliant" ? "outline" : "destructive"}>
                          {b.complianceStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(b.lastUpdated), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/enterprise/businesses/${b.vendorId}`}>
                          <Button variant="ghost" size="sm">
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
