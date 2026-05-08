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

    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json({ success: false, message: 'Rejection reason is required' }, { status: 400 });
    }

    // Update the verification record
    const verification = await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        verifiedBy: (session.user as any).id,
        verifiedAt: new Date(),
      },
      include: {
        document: true
      }
    });

    const vendorId = verification.document.vendorId;

    // Update vendor status to REJECTED so they know action is required
    await prisma.vendor.update({
      where: { id: vendorId },
      data: { status: 'REJECTED' }
    });

    return NextResponse.json({ success: true, verification });
  } catch (error: any) {
    console.error('[POST /api/admin/verifications/[id]/reject]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
