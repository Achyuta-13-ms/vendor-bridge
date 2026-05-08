import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    // Usually a vendor has one primary API key. We fetch the most recent one.
    const keyRecord = await prisma.apiKey.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!keyRecord) {
      return NextResponse.json({ success: false, message: 'API key not found for user' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      plan: keyRecord.plan,
      usage: keyRecord.usage,
      limit: keyRecord.limit,
      remaining: Math.max(0, keyRecord.limit - keyRecord.usage)
    });

  } catch (error) {
    console.error('[GET /api/platform/usage]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
