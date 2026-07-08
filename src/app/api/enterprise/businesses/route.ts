import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const entUser = await prisma.enterpriseUser.findFirst({
      where: { userId },
    });

    if (!entUser) {
      return NextResponse.json({ success: false, message: "Not an enterprise user" }, { status: 403 });
    }

    const vendors = await prisma.enterpriseVendor.findMany({
      where: { enterpriseId: entUser.enterpriseId },
      include: {
        vendor: {
          include: {
            documents: {
              include: { verification: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map to simple structure for UI
    const mapped = vendors.map(ev => {
      const v = ev.vendor;
      
      const requiredDocs = v.documents.filter(d => d.type === "GST" || d.type === "PAN" || d.type === "BANK");
      const verifiedDocs = requiredDocs.filter(d => d.verification && d.verification.status === "VERIFIED");
      
      const complianceStatus = requiredDocs.length > 0 && requiredDocs.length === verifiedDocs.length 
        ? "Compliant" 
        : "Action Required";

      return {
        id: ev.id,
        vendorId: v.id,
        businessName: v.businessName || "Unknown",
        industry: v.businessType || "N/A",
        status: ev.status,
        complianceStatus,
        lastUpdated: ev.createdAt
      };
    });

    return NextResponse.json({ success: true, businesses: mapped });
  } catch (error: any) {
    console.error("[GET /api/enterprise/businesses]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
