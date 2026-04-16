import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { dispatchWebhook } from '@/lib/webhooks';

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
          },
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!vendor) {
      return NextResponse.json({ success: false, message: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      products: vendor.products 
    });

  } catch (error) {
    console.error('[GET /api/vendor/products]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, productId, name, price, stock, lowStockLevel, sku, description, isActive } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return NextResponse.json({ success: false, message: 'Vendor not found' }, { status: 404 });
    }

    let product;

    if (productId) {
      product = await prisma.product.update({
        where: { id: productId },
        data: {
          name,
          price,
          stock,
          lowStockLevel,
          sku,
          description,
          isActive: isActive !== undefined ? isActive : (stock > 0)
        },
        include: { platformMappings: true }
      });
    } else {
      // Create new
      product = await prisma.product.create({
        data: {
          vendorId: vendor.id,
          name,
          price,
          stock,
          lowStockLevel,
          sku,
          description,
          isActive: isActive !== undefined ? isActive : true
        },
        include: { platformMappings: true }
      });
    }

    // 🏆 Bulk Platform Push logic
    if (product.isActive === false || product.stock === 0) {
        // If the product is disabled or OOS, notify all mapped platforms
        for (const mapping of product.platformMappings) {
            dispatchWebhook(vendor.id, 'ITEM_OUT_OF_STOCK', {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                platformId: mapping.platformId,
                externalId: mapping.externalId,
                status: 'DISABLED_BY_VENDOR'
            });
        }
    }

    if (product.stock === 0) {
        dispatchWebhook(vendor.id, 'ITEM_OUT_OF_STOCK', {
            productId: product.id,
            productName: product.name,
            sku: product.sku
        });
    }

    return NextResponse.json({ success: true, product });

  } catch (error: any) {
    console.error('[POST /api/vendor/products]', error);
    const message = error.code === 'P2002' ? 'Product name already exists for this vendor' : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { updates } = body; // Array of { id, stockChange }

    if (!Array.isArray(updates)) {
      return NextResponse.json({ success: false, message: 'updates must be an array' }, { status: 400 });
    }

    const results = await prisma.$transaction(
      updates.map(u => prisma.product.update({
        where: { id: u.id },
        data: { stock: { increment: u.stockChange } },
        include: { vendor: true }
      }))
    );

    // Fire webhooks for any items that hit 0
    results.forEach(p => {
        if (p.stock <= 0) {
            dispatchWebhook(p.vendorId, 'ITEM_OUT_OF_STOCK', {
                productId: p.id,
                productName: p.name,
                sku: p.sku
            });
        }
    });

    return NextResponse.json({ success: true, count: results.length });

  } catch (error) {
    console.error('[PATCH /api/vendor/products]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
