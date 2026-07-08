import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    const vendorId = id;

    // Check if the enterprise has access to this vendor
    const ev = await prisma.enterpriseVendor.findUnique({
      where: {
        enterpriseId_vendorId: {
          enterpriseId: entUser.enterpriseId,
          vendorId: vendorId
        }
      },
      include: {
        vendor: {
          include: {
            documents: {
              include: {
                verification: true
              }
            }
          }
        }
      }
    });

    if (!ev) {
      return NextResponse.json({ success: false, message: "Vendor not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true, business: ev });
  } catch (error: any) {
    console.error(`[GET /api/enterprise/businesses] Error`, error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
