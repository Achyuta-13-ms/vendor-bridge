import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return NextResponse.json({ success: false, message: 'Vendor not found' }, { status: 404 });
    }

    // 1. Purge simulation-heavy data
    await prisma.$transaction([
        // Delete all Order Items first (FK)
        prisma.orderItem.deleteMany({
            where: { order: { vendorId: vendor.id } }
        }),
        // Delete all Orders
        prisma.order.deleteMany({
            where: { vendorId: vendor.id }
        }),
        // Delete all Webhook logs
        prisma.webhookLog.deleteMany({
            where: { config: { vendorId: vendor.id } }
        }),
        // Reset Products to default demo state
        prisma.product.updateMany({
            where: { vendorId: vendor.id },
            data: {
                stock: 50,
                isActive: true
            }
        })
    ]);

    console.log(`[DEMO RESET] Purged all data for vendor: ${vendor.id}`);

    return NextResponse.json({ 
        success: true, 
        message: 'Simulation data has been successfully purged. Catalog reset to defaults.' 
    });

  } catch (error) {
    console.error('[POST /api/vendor/reset]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
