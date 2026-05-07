import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { PLAN_LIMITS } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      plan,
      userId
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan || !userId) {
      return NextResponse.json({ success: false, message: 'Missing required parameters' }, { status: 400 });
    }

    console.log("Verifying payment:", razorpay_order_id, razorpay_payment_id, "for plan:", plan);

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ success: false, message: 'Invalid payment signature' }, { status: 400 });
    }

    // Payment has been verified
    const keyRecord = await prisma.apiKey.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!keyRecord) {
       return NextResponse.json({ success: false, message: 'API Key not found for user' }, { status: 404 });
    }

    // Update Plan
    const limit = PLAN_LIMITS[plan.toLowerCase()];
    if (!limit) {
       return NextResponse.json({ success: false, message: 'Invalid plan' }, { status: 400 });
    }

    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: {
        plan: plan.toLowerCase(),
        limit
      }
    });

    // Store Payment Record
    await prisma.payment.create({
      data: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        plan: plan.toLowerCase()
      }
    });

    return NextResponse.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('[POST /api/payment/verify]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
