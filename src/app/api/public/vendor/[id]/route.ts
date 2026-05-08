import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const apiKeyHeader = request.headers.get("x-api-key");
    
    if (!apiKeyHeader) {
      return NextResponse.json({ success: false, message: "Unauthorized: Missing API Key" }, { status: 401 });
    }

    const validKey = await prisma.apiKey.findUnique({
      where: { key: apiKeyHeader }
    });

    if (!validKey) {
      return NextResponse.json({ success: false, message: "Unauthorized: Invalid API Key" }, { status: 401 });
    }

    if (validKey.usage >= validKey.limit) {
      return NextResponse.json({ success: false, message: "API limit exceeded" }, { status: 403 });
    }

    // Update lastUsed and usage asynchronously without blocking
    prisma.apiKey.update({
      where: { id: validKey.id },
      data: { 
        lastUsed: new Date(),
        usage: { increment: 1 }
      }
    }).catch(console.error);

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        documents: {
          include: {
            verification: true
          }
        }
      }
    });

    if (!vendor) {
      return NextResponse.json({ success: false, message: "Vendor not found" }, { status: 404 });
    }

    // Status Aggregation Logic
    const statuses = vendor.documents.map((d: any) => d.verification?.status?.toUpperCase() || 'PENDING');
    let overallStatus = "pending";

    if (statuses.length === 0) {
       overallStatus = "pending";
    } else if (statuses.includes("REJECTED") || statuses.includes("FAILED")) {
      overallStatus = "failed";
    } else if (statuses.every((s: string) => s === "VERIFIED")) {
      overallStatus = "verified";
    }

    // Cleaned response format
    const responsePayload = {
      vendorId: vendor.id,
      businessName: vendor.businessName || "Unknown",
      status: overallStatus,
      documents: vendor.documents.map((d: any) => ({
        type: d.type,
        status: d.verification?.status?.toLowerCase() || 'pending'
      }))
    };

    return NextResponse.json(responsePayload);
    
  } catch (error: any) {
    console.error('[GET /api/public/vendor/[id]]', error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
