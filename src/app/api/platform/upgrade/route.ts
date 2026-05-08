import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
import { PLAN_LIMITS } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, plan } = body;

    if (!userId || !plan) {
      return NextResponse.json({ success: false, message: 'userId and plan are required' }, { status: 400 });
    }

    const limit = PLAN_LIMITS[plan.toLowerCase()];
    if (limit === undefined) {
      return NextResponse.json({ success: false, message: 'Invalid plan' }, { status: 400 });
    }

    const keyRecord = await prisma.apiKey.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!keyRecord) {
      return NextResponse.json({ success: false, message: 'API key not found for user' }, { status: 404 });
    }

    const updatedKey = await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: {
        plan: plan.toLowerCase(),
        limit
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Plan upgraded successfully',
      plan: updatedKey.plan,
      limit: updatedKey.limit
    });

  } catch (error) {
    console.error('[POST /api/platform/upgrade]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
