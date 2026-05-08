import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
        products: {
          include: {
            platformMappings: {
              include: { platform: true }
            }
          }
        },
        connections: {
          include: { platform: true }
        }
      }
    });

    if (!vendor) {
      return NextResponse.json({ success: false, message: 'Vendor not found' }, { status: 404 });
    }

    // Also fetch unmapped items from recent orders
    const unmappedOrderItems = await prisma.orderItem.findMany({
      where: {
        productId: null,
        order: { vendorId: vendor.id }
      },
      distinct: ['name'],
      include: {
        order: { include: { platform: true } }
      },
      orderBy: { order: { placedAt: 'desc' } },
      take: 20
    });

    return NextResponse.json({ 
      success: true, 
      products: vendor.products,
      platforms: vendor.connections.map((c: any) => c.platform),
      unmappedItems: unmappedOrderItems.map((item: any) => ({
        name: item.name,
        platformName: item.order.platform.displayName,
        platformId: item.order.platformId,
        suggestedExternalId: item.name.toUpperCase().replace(/\s/g, '_') // Mock ID for simulation
      }))
    });

  } catch (error: any) {
    console.error('[GET /api/vendor/mapping]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, platformId, externalId, externalName } = body;

    if (!productId || !platformId || !externalId) {
      return NextResponse.json({ success: false, message: 'productId, platformId, and externalId are required' }, { status: 400 });
    }

    const mapping = await prisma.platformProduct.upsert({
      where: {
        platformId_externalId: { platformId, externalId }
      },
      update: {
        productId,
        externalName
      },
      create: {
        productId,
        platformId,
        externalId,
        externalName
      }
    });

    // Also retroactively update OrderItems with this name
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (product) {
        await prisma.orderItem.updateMany({
            where: { 
                name: externalName || undefined,
                order: { platformId },
                productId: null
            },
            data: { productId }
        });
    }

    return NextResponse.json({ success: true, mapping });

  } catch (error: any) {
    console.error('[POST /api/vendor/mapping]', error);
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

    await prisma.platformProduct.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[DELETE /api/vendor/mapping]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
