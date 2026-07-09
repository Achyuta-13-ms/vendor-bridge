import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import QRCode from "qrcode";
import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { IdentityPDFTemplate } from "@/components/shared/IdentityPDFTemplate";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || (session.user as any).role !== "VENDOR") {
    return NextResponse.json({ error: "Unauthorized. Only business owners can download this PDF." }, { status: 401 });
  }

  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const identity = await prisma.businessIdentity.findUnique({
      where: { businessId: id },
      include: { vendor: true }
    });

    if (!identity) {
      return NextResponse.json({ error: "Identity not found" }, { status: 404 });
    }

    // Verify ownership
    if (identity.vendorId !== (session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized access to identity" }, { status: 401 });
    }

    // Generate QR Code data URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (request.headers.get("origin") || "http://localhost:3000");
    const verificationUrl = `${appUrl}/identity/${identity.businessId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 400, margin: 1 });

    // Render PDF stream
    const pdfStream = await renderToStream(React.createElement(IdentityPDFTemplate, { data: identity, qrCodeDataUrl }) as any);

    // Return file stream as response
    return new NextResponse(pdfStream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="VyapaarSetu_Identity_${identity.businessId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
