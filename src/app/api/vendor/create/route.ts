import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find the user by email to link the vendor
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found. Please log in first.' }, { status: 404 });
    }

    // Check if vendor already exists for this user
    const existing = await prisma.vendor.findUnique({ where: { userId: user.id } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Vendor profile already exists for this user.' }, { status: 409 });
    }

    // Create vendor + documents in a transaction
    const vendor = await prisma.$transaction(async (tx) => {
      const v = await tx.vendor.create({
        data: {
          userId: user.id,
          businessName: data.businessName,
          businessType: data.businessType,
          description: data.description,
          addressLine1: data.address || 'Pending Address',
          city: data.city || 'Unknown',
          status: 'PENDING',
          documents: {
            create: [
              ...(data.documents?.gst ? [{ type: 'GST', url: data.documents.gst }] : []),
              ...(data.documents?.pan ? [{ type: 'PAN', url: data.documents.pan }] : []),
              ...(data.documents?.bank ? [{ type: 'BANK', url: data.documents.bank }] : []),
            ],
          },
        },
        include: { documents: true },
      });

      // Initialize verifications for each document
      const verificationPromises = v.documents.map(doc => {
        const isAutoVerified = doc.type !== 'BANK'; // Mock logic: Auto-verify GST/PAN, pending BANK
        return tx.verification.create({
          data: {
            documentId: doc.id,
            status: isAutoVerified ? 'Verified' : 'Pending',
            response: isAutoVerified ? 'Document verified via internal system (Mock)' : 'Awaiting manual verification',
          },
        });
      });

      await Promise.all(verificationPromises);
      return v;
    });

    // Refresh vendor with documents and their verifications
    const updatedVendor = await prisma.vendor.findUnique({
      where: { id: vendor.id },
      include: { 
        documents: {
          include: { verification: true }
        }
      }
    });

    if (!updatedVendor) throw new Error("Failed to retrieve updated vendor record");

    const statuses: Record<string, string> = {};
    updatedVendor.documents.forEach(doc => {
      statuses[doc.type] = doc.verification?.status || 'Unknown';
    });

    return NextResponse.json({
      success: true,
      vendor: {
        id: updatedVendor.id,
        userId: updatedVendor.userId,
        businessName: updatedVendor.businessName,
        address: updatedVendor.address,
        statuses,
        overallStatus: Object.values(statuses).every(s => s === 'Verified') ? 'Verified' : 'Pending',
        createdAt: updatedVendor.createdAt,
      },
    });
  } catch (error) {
    console.error('[vendor/create]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
