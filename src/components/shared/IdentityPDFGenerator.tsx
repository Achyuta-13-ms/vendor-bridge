"use client";

import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QRCodeSVG } from "qrcode.react";
import { FileDown, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IdentityPDFGenerator({ identityData, sharedLinkId }: { identityData: any, sharedLinkId?: string }) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (!pdfRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`VyapaarSetu_Identity_${identityData.businessId || "Profile"}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/identity/${sharedLinkId || identityData.businessId}`;

  return (
    <>
      <Button onClick={generatePDF} disabled={isGenerating} className="bg-slate-900 hover:bg-slate-800 text-white">
        <FileDown className="w-4 h-4 mr-2" />
        {isGenerating ? "Generating PDF..." : "Download Identity PDF"}
      </Button>

      {/* Hidden PDF Template */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div ref={pdfRef} className="bg-white text-black p-10 w-[800px] border">
          <div className="flex justify-between items-start border-b pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-orange-600">VyapaarSetu</h1>
              <p className="text-gray-500 font-medium">Digital Business Identity</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Business ID</p>
              <p className="text-xl font-mono font-bold bg-gray-100 px-3 py-1 rounded inline-block">
                {identityData.businessId || "VS-XXXXXXX"}
              </p>
            </div>
          </div>

          <div className="flex gap-8 mb-8">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-2">{identityData.businessName}</h2>
              <p className="text-xl text-gray-600 mb-4">{identityData.businessType}</p>
              
              {identityData.status === "APPROVED" && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 w-fit px-4 py-2 rounded-full mb-6">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-bold">Verified Business</span>
                </div>
              )}

              <div className="space-y-4">
                {identityData.address && (
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Registered Location</p>
                    <p className="font-medium text-lg">{identityData.address.city}, {identityData.address.state}</p>
                  </div>
                )}
                
                {identityData.contact && (
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Contact Info</p>
                    {identityData.contact.email && <p className="font-medium">{identityData.contact.email}</p>}
                    {identityData.contact.phone && <p className="font-medium">{identityData.contact.phone}</p>}
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-48 flex flex-col items-center p-4 bg-gray-50 rounded-lg border">
              <QRCodeSVG value={verificationUrl} size={140} />
              <p className="text-xs text-center text-gray-500 mt-4">
                Scan to verify authenticity on VyapaarSetu
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-12">
            {identityData.compliance && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 font-bold mb-2">
                  <ShieldCheck className="w-5 h-5" />
                  Compliance Summary
                </div>
                <p className="text-sm text-blue-900">
                  This business meets VyapaarSetu's stringent compliance and verification standards.
                </p>
              </div>
            )}
            <div className="p-4 bg-gray-50 border rounded-lg">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Generated On</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
              
              <p className="text-sm text-gray-500 uppercase tracking-wide mt-4 mb-1">Digital Stamp</p>
              <p className="font-medium text-xs font-mono break-all">{sharedLinkId || identityData.businessId}-AUTH-{Date.now()}</p>
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-400 mt-12 pt-4 border-t">
            This document is generated by VyapaarSetu for informational purposes. 
            <br />
            Visit vyapaarsetu.com to verify real-time status.
          </div>
        </div>
      </div>
    </>
  );
}
