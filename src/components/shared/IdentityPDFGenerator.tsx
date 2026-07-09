"use client";

import React, { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IdentityPDFGenerator({ identityData, sharedLinkId }: { identityData: any, sharedLinkId?: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    // Since this is a file stream download, we can simply redirect the browser to the API route
    // Or we can use an anchor tag with the download attribute. Using window.location works for streaming.
    window.location.href = `/api/identity/download/${identityData.businessId}`;
    
    // Reset state after a short delay to re-enable button
    setTimeout(() => setIsDownloading(false), 2000);
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
