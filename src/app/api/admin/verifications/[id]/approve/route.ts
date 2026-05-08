import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id: verificationId } = await params;
    if (!verificationId) {
      return NextResponse.json({ success: false, message: 'Verification ID required' }, { status: 400 });
    }

    // Update the verification record
    const verification = await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status: 'VERIFIED',
        rejectionReason: null,
        verifiedBy: (session.user as any).id,
        verifiedAt: new Date(),
      },
      include: {
        document: {
          include: {
            vendor: true
          }
        }
      }
    });

    const vendorId = verification.document.vendorId;

    // Check if ALL documents for this vendor are now verified
    const allDocs = await prisma.document.findMany({
      where: { vendorId },
      include: { verification: true }
    });

    // Assume requirements: GST, PAN, BANK
    const requiredTypes = ['GST', 'PAN', 'BANK'];
    const hasAllRequired = requiredTypes.every(type => 
      allDocs.some((d: any) => d.type === type)
    );

    const allVerified = allDocs.every((d: any) => d.verification?.status === 'VERIFIED');

    if (hasAllRequired && allVerified) {
      // Update vendor status to ACTIVE
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { status: 'ACTIVE' }
      });
    }

    return NextResponse.json({ success: true, verification });
  } catch (error) {
    console.error('[POST /api/admin/verifications/[id]/approve]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
