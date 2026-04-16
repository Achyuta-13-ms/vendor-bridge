import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { documentId, status, rejectionReason } = await request.json();

    if (!documentId || !status) {
      return NextResponse.json({ success: false, message: 'documentId and status are required' }, { status: 400 });
    }

    const verification = await prisma.verification.upsert({
      where: { documentId },
      update: {
        status,
        rejectionReason: status === 'Rejected' ? rejectionReason : null,
        response: status === 'Verified' ? 'Document manually verified by admin' : `Rejected: ${rejectionReason || 'No reason provided'}`,
      },
      create: {
        documentId,
        status,
        rejectionReason: status === 'Rejected' ? rejectionReason : null,
        response: status === 'Verified' ? 'Document manually verified by admin' : `Rejected: ${rejectionReason || 'No reason provided'}`,
      },
    });

    return NextResponse.json({ success: true, verification });
  } catch (error) {
    console.error('[vendor/verify]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
