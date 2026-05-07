import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ success: false, message: 'url is required' }, { status: 400 });
    }

    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return NextResponse.json({ success: false, message: 'Invalid URL protocol' }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ success: false, message: 'Invalid URL format' }, { status: 400 });
    }

    const webhook = await prisma.webhook.create({
      data: { url }
    });

    return NextResponse.json({ success: true, webhook });
  } catch (error) {
    console.error('[POST /api/webhook/register]', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
