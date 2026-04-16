import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId query param is required' }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      include: {
        user: true,
        documents: {
          include: { verification: true },
        },
        connections: {
          include: { platform: true },
        },
        orders: {
          include: { 
            platform: true,
            customer: true,
            items: true
          },
          orderBy: { placedAt: 'desc' },
          take: 10
        }
      },
    });

    if (!vendor) {
      return NextResponse.json({ success: true, vendor: null });
    }

    return NextResponse.json({ success: true, vendor });
  } catch (error) {
    console.error('[GET /api/vendor]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
