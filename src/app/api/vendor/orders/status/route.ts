import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { dispatchWebhook } from '@/lib/webhooks';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, newStatus } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json({ success: false, message: 'orderId and newStatus are required' }, { status: 400 });
    }

    // Fetch current order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Validation logic (Business Rules)
    const validStatuses = ['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    if (order.status === 'CANCELLED' && newStatus !== 'CANCELLED') {
      return NextResponse.json({ success: false, message: 'Cannot update status of a cancelled order' }, { status: 400 });
    }

    if (order.status === 'DELIVERED') {
      return NextResponse.json({ success: false, message: 'Order is already delivered' }, { status: 400 });
    }

    // Update Status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { platform: true, items: true, customer: true }
    });

    // 🏆 Dispatch Outreach Webhook
    dispatchWebhook(order.vendorId, 'ORDER_UPDATED', {
      orderId: updatedOrder.id,
      externalOrderId: updatedOrder.externalOrderId,
      platform: updatedOrder.platform.name,
      newStatus,
      updatedAt: updatedOrder.updatedAt
    });

    console.log(`[ORDER STATUS UPDATE] ID: ${orderId}, ${order.status} -> ${newStatus}`);

    return NextResponse.json({ 
      success: true, 
      message: `Order status updated to ${newStatus}`,
      order: updatedOrder
    });

  } catch (error) {
    console.error('[POST /api/vendor/orders/status]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
