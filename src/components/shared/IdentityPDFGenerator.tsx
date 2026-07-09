"use client";

import React, { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IdentityPDFGenerator({ identityData, sharedLinkId }: { identityData: any, sharedLinkId?: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      const response = await fetch(`/api/identity/download/${identityData.businessId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `VyapaarSetu_Identity_${identityData.businessId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("PDF Download Error:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button 
      onClick={handleDownload} 
      disabled={isDownloading} 
      className="bg-slate-900 hover:bg-slate-800 text-white"
    >
      <FileDown className="w-4 h-4 mr-2" />
      {isDownloading ? "Downloading PDF..." : "Download Identity PDF"}
    </Button>
  );
}
