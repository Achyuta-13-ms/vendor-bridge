import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      include: {
        businessIdentity: true,
        sharingProfiles: true,
        sharedLinks: {
          include: {
            sharingProfile: true,
            _count: { select: { accessLogs: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!vendor) {
      return NextResponse.json({ success: false, message: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      businessIdentity: vendor.businessIdentity,
      sharingProfiles: vendor.sharingProfiles,
      sharedLinks: vendor.sharedLinks
    });
  } catch (error: any) {
    console.error("[GET /api/vendor/share]", error);
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
    const body = await req.json();
    const { linkType, profileName, permissions } = body;

    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return NextResponse.json({ success: false, message: "Vendor not found" }, { status: 404 });
    }

    // Upsert the sharing profile based on name
    const sharingProfile = await prisma.sharingProfile.findFirst({
      where: { vendorId: vendor.id, name: profileName }
    }) || await prisma.sharingProfile.create({
      data: {
        vendorId: vendor.id,
        name: profileName || "Custom",
        shareBusinessDetails: permissions?.shareBusinessDetails ?? true,
        shareGST: permissions?.shareGST ?? false,
        sharePAN: permissions?.sharePAN ?? false,
        shareAddress: permissions?.shareAddress ?? true,
        shareContact: permissions?.shareContact ?? false,
        shareDocuments: permissions?.shareDocuments ?? false,
        shareCompliance: permissions?.shareCompliance ?? true,
        shareCertificates: permissions?.shareCertificates ?? false,
      }
    });

    // If it already existed but permissions were updated
    if (permissions) {
      await prisma.sharingProfile.update({
        where: { id: sharingProfile.id },
        data: {
          shareBusinessDetails: permissions.shareBusinessDetails,
          shareGST: permissions.shareGST,
          sharePAN: permissions.sharePAN,
          shareAddress: permissions.shareAddress,
          shareContact: permissions.shareContact,
          shareDocuments: permissions.shareDocuments,
          shareCompliance: permissions.shareCompliance,
          shareCertificates: permissions.shareCertificates,
        }
      });
    }

    // Determine expiry
    let expiresAt = null;
    if (linkType === "7_DAYS") {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
    } else if (linkType === "30_DAYS") {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
    }

    // Create unique token
    const token = crypto.randomUUID();

    const sharedLink = await prisma.sharedLink.create({
      data: {
        vendorId: vendor.id,
        sharingProfileId: sharingProfile.id,
        token,
        linkType: linkType || "PERMANENT",
        expiresAt
      },
      include: {
        sharingProfile: true
      }
    });

    return NextResponse.json({ success: true, sharedLink });
  } catch (error: any) {
    console.error("[POST /api/vendor/share]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get("linkId");

    if (!linkId) {
      return NextResponse.json({ success: false, message: "Link ID required" }, { status: 400 });
    }

    // Make sure it belongs to the user
    const vendor = await prisma.vendor.findUnique({
      where: { userId: (session.user as any).id }
    });

    if (!vendor) {
      return NextResponse.json({ success: false, message: "Vendor not found" }, { status: 404 });
    }

    await prisma.sharedLink.updateMany({
      where: { id: linkId, vendorId: vendor.id },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true, message: "Link revoked successfully" });
  } catch (error: any) {
    console.error("[DELETE /api/vendor/share]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
