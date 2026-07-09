"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { ShieldCheck, Eye, Building2, Globe, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AccessHistory() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("/api/vendor/share/logs"); // Wait, I need to create this endpoint
        if (res.data.success) {
          setLogs(res.data.logs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div>Loading access history...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          Identity Access Audit Log
        </CardTitle>
        <CardDescription>Track who has viewed your business identity profile.</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Eye className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No accesses recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex gap-4">
                  <div className="mt-1 p-2 bg-white border rounded-full text-blue-600">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{log.organization}</p>
                    <p className="text-sm text-gray-600">{log.purpose}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(log.accessedAt), "PPp")}
                      </span>
                      <span className="flex items-center">
                        <Globe className="w-3 h-3 mr-1" />
                        IP: {log.accessorIp || "Hidden"}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Profile: {log.sharedLink?.sharingProfile?.name || "Public"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
