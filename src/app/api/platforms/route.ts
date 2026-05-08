import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const platforms = await prisma.platform.findMany({
      orderBy: { displayName: 'asc' },
    });
    return NextResponse.json({ success: true, platforms });
  } catch (error) {
    console.error('[GET /api/platforms]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
