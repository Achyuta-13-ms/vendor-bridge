import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
import { PLAN_PRICING } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { plan } = await request.json();

    if (!plan || !PLAN_PRICING[plan.toLowerCase()]) {
      return NextResponse.json({ success: false, message: 'Invalid plan' }, { status: 400 });
    }

    const amount = PLAN_PRICING[plan.toLowerCase()];

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!
    });

    const order = await razorpay.orders.create({
      amount,
      currency: "INR"
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    console.error('[POST /api/payment/create-order]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
