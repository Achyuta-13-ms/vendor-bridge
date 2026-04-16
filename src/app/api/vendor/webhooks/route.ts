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

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      include: {
        webhooks: {
          include: {
            _count: { select: { logs: true } }
          }
        }
      }
    });

    if (!vendor) {
      return NextResponse.json({ success: false, message: 'Vendor not found' }, { status: 404 });
    }

    const logs = await prisma.webhookLog.findMany({
      where: { config: { vendorId: vendor.id } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        config: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      configs: vendor.webhooks,
      logs
    });

  } catch (error) {
    console.error('[GET /api/vendor/webhooks]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, url, id, events, secret } = body;

    if (!userId || !url) {
      return NextResponse.json({ success: false, message: 'userId and url are required' }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) return NextResponse.json({ success: false, message: 'Vendor not found' }, { status: 404 });

    const finalSecret = secret || crypto.randomBytes(24).toString('hex');

    if (id) {
        // Update
        const config = await prisma.webhookConfig.update({
            where: { id },
            data: { url, events, secret: finalSecret }
        });
        return NextResponse.json({ success: true, config });
    } else {
        // Create
        const config = await prisma.webhookConfig.create({
            data: {
                vendorId: vendor.id,
                url,
                events: events || 'ORDER_UPDATED,ITEM_OUT_OF_STOCK',
                secret: finalSecret
            }
        });
        return NextResponse.json({ success: true, config });
    }

  } catch (error) {
    console.error('[POST /api/vendor/webhooks]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'id is required' }, { status: 400 });
    }

    await prisma.webhookConfig.delete({ where: { id } });
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[DELETE /api/vendor/webhooks]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
