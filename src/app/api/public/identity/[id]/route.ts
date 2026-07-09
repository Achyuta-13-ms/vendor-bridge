import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const identifier = resolvedParams.id; // Could be VS-ID or Share Token

    // 1. Check if it's a SharedLink token
    const sharedLink = await prisma.sharedLink.findUnique({
      where: { token: identifier },
      include: {
        sharingProfile: true,
        vendor: {
          include: {
            user: true,
            documents: {
              include: { verification: true }
            },
            businessIdentity: true,
          }
        }
      }
    });

    if (sharedLink) {
      // Validate token
      if (!sharedLink.isActive) {
        return NextResponse.json({ success: false, message: "This link is no longer active." }, { status: 403 });
      }
      
      if (sharedLink.expiresAt && new Date() > sharedLink.expiresAt) {
        return NextResponse.json({ success: false, message: "This link has expired." }, { status: 403 });
      }

      // Check single use
      if (sharedLink.linkType === "SINGLE_USE") {
        // Find if it was accessed before
        const accesses = await prisma.accessLog.count({
          where: { sharedLinkId: sharedLink.id }
        });
        if (accesses > 0) {
          return NextResponse.json({ success: false, message: "This single-use link has already been consumed." }, { status: 403 });
        }
      }

      const vendor = sharedLink.vendor;
      const profile = sharedLink.sharingProfile;
      const identity = vendor.businessIdentity;

      // Mask documents if not shared
      const docs = profile.shareDocuments ? vendor.documents.map(d => ({
        type: d.type,
        status: d.verification?.status || "PENDING",
        // Mask specific numbers if needed later
      })) : [];

      return NextResponse.json({
        success: true,
        type: "SHARED_LINK",
        businessName: vendor.businessName,
        businessType: vendor.businessType,
        businessId: identity?.businessId,
        isPublic: identity?.isPublic,
        description: identity?.profileDescription || vendor.description,
        status: vendor.status,
        
        // Conditional fields based on SharingProfile
        address: profile.shareAddress ? {
          city: vendor.city,
          state: vendor.state,
          country: vendor.country
        } : null,
        contact: profile.shareContact ? {
          email: vendor.email,
          phone: vendor.phone,
          website: vendor.website
        } : null,
        gst: profile.shareGST ? true : false,
        pan: profile.sharePAN ? true : false,
        compliance: profile.shareCompliance ? true : false, // In a real app we calculate compliance dynamically
        certificates: profile.shareCertificates ? true : false,
        documents: docs,
        
        sharedLinkId: sharedLink.id
      });
    }

    // 2. Check if it's a Business ID
    if (identifier.startsWith("VS-")) {
      const identity = await prisma.businessIdentity.findUnique({
        where: { businessId: identifier },
        include: {
          vendor: {
            include: {
              documents: { include: { verification: true } }
            }
          }
        }
      });

      if (!identity) {
        return NextResponse.json({ success: false, message: "Business Identity not found" }, { status: 404 });
      }

      if (!identity.isPublic) {
        return NextResponse.json({ success: false, message: "This Business Identity is private." }, { status: 403 });
      }

      const vendor = identity.vendor;

      return NextResponse.json({
        success: true,
        type: "PUBLIC_PROFILE",
        businessName: vendor.businessName,
        businessType: vendor.businessType,
        businessId: identity.businessId,
        isPublic: identity.isPublic,
        description: identity.profileDescription || vendor.description,
        status: vendor.status,
        address: {
          city: vendor.city,
          state: vendor.state,
          country: vendor.country
        },
        contact: null, // Public profile hides contact by default unless configured
        compliance: true,
        documents: []
      });
    }

    return NextResponse.json({ success: false, message: "Invalid identity identifier" }, { status: 400 });

  } catch (error: any) {
    console.error("[GET /api/public/identity/[id]]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
