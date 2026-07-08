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

    // Get all vendors for this enterprise
    const enterpriseVendors = await prisma.enterpriseVendor.findMany({
      where: { enterpriseId: entUser.enterpriseId },
      select: { vendorId: true }
    });

    const vendorIds = enterpriseVendors.map(ev => ev.vendorId);

    // Fetch documents belonging to these vendors that need verification
    const documents = await prisma.document.findMany({
      where: {
        vendorId: { in: vendorIds }
      },
      include: {
        vendor: {
          select: { businessName: true }
        },
        verification: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter to only those pending or unverified
    const pendingDocs = documents.filter(doc => !doc.verification || doc.verification.status === "Pending");

    return NextResponse.json({ success: true, verifications: pendingDocs });
  } catch (error: any) {
    console.error("[GET /api/enterprise/verifications]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const entUser = await prisma.enterpriseUser.findFirst({
      where: { userId },
    });

    if (!entUser || entUser.role === 'VIEWER') {
      return NextResponse.json({ success: false, message: "Not authorized to verify" }, { status: 403 });
    }

    const { documentId, status, notes } = await req.json();

    if (!documentId || !status) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) {
      return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 });
    }

    const verification = await prisma.verification.upsert({
      where: { documentId },
      create: {
        documentId,
        status: status === "Verified" ? "VERIFIED" : (status === "Rejected" ? "REJECTED" : "PENDING"),
        response: notes,
        verifiedBy: userId,
        verifiedAt: new Date()
      },
      update: {
        status: status === "Verified" ? "VERIFIED" : (status === "Rejected" ? "REJECTED" : "PENDING"),
        response: notes,
        verifiedBy: userId,
        verifiedAt: new Date()
      }
    });

    // Check if we need to auto-approve the Vendor record
    if (status === "Verified") {
      const vendorId = doc.vendorId;
      const allDocs = await prisma.document.findMany({
        where: { vendorId },
        include: { verification: true }
      });
      const requiredDocs = allDocs.filter(d => d.type === "GST" || d.type === "PAN" || d.type === "BANK");
      const verifiedDocs = requiredDocs.filter(d => d.verification && d.verification.status === "VERIFIED");
      
      if (requiredDocs.length > 0 && requiredDocs.length === verifiedDocs.length) {
        await prisma.enterpriseVendor.updateMany({
          where: { vendorId, enterpriseId: entUser.enterpriseId },
          data: { status: "APPROVED" }
        });
      }
    }

    return NextResponse.json({ success: true, verification });
  } catch (error: any) {
    console.error("[POST /api/enterprise/verifications]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
