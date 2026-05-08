import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        documents: {
          include: { verification: true },
        },
      },
    });

    return NextResponse.json({ success: true, vendors });
  } catch (error: any) {
    console.error('[GET /api/vendors]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
