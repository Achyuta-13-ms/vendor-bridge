import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Server-side auth & role check
    if (!session?.user?.email || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch metrics
    const totalVendors = await prisma.vendor.count();
    const pendingVendors = await prisma.vendor.count({ where: { status: 'PENDING' } });
    const verifiedVendors = await prisma.vendor.count({ where: { status: 'ACTIVE' } });
    const rejectedVendors = await prisma.vendor.count({ where: { status: 'REJECTED' } });

    // 2. Fetch all vendors with pending/all documents
    const vendors = await prisma.vendor.findMany({
      include: {
        documents: {
          include: { verification: true },
        },
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      metrics: {
        total: totalVendors,
        pending: pendingVendors,
        verified: verifiedVendors,
        rejected: rejectedVendors,
      },
      vendors,
    });
  } catch (error: any) {
    console.error('[GET /api/admin/verifications]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
