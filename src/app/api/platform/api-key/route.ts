import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, apiKeys });
  } catch (error) {
    console.error('[GET /api/platform/api-key]', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    const key = "vf_" + crypto.randomBytes(16).toString("hex");
    
    const newApiKey = await prisma.apiKey.create({
      data: {
        userId: data.userId,
        key,
        name: data.name || "Default Key"
      }
    });

    return NextResponse.json({ success: true, apiKey: newApiKey });
  } catch (error) {
    console.error('[POST /api/platform/api-key]', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
