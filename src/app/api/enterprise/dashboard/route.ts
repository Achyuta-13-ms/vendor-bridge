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
      include: { enterprise: true }
    });

    if (!entUser) {
      return NextResponse.json({ success: false, message: "Not an enterprise user" }, { status: 403 });
    }

    const enterpriseId = entUser.enterpriseId;

    const [invited, verified, pending, recentVendors] = await Promise.all([
      prisma.enterpriseInvitation.count({ where: { enterpriseId } }),
      prisma.enterpriseVendor.count({ where: { enterpriseId, status: "APPROVED" } }),
      prisma.enterpriseVendor.count({ where: { enterpriseId, status: "PENDING" } }),
      prisma.enterpriseVendor.findMany({
        where: { enterpriseId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          vendor: {
            select: { businessName: true, businessType: true, city: true }
          }
        }
      })
    ]);

    // Mock compliance alerts for now since it requires deep document inspection
    const complianceAlerts = 2; 

    return NextResponse.json({
      success: true,
      kpis: {
        invited,
        verified,
        pending,
        complianceAlerts
      },
      recentVendors
    });
  } catch (error: any) {
    console.error("[GET /api/enterprise/dashboard]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
