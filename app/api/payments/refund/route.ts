import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

import prisma from '@/lib/db';
import { OrderStatus } from '@/lib/order-status';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { paymentId, amount } = await req.json();
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required.' }, { status: 400 });
    }
    // Optionally, check if refund already exists or is allowed
    const refund = await razorpay.payments.refund(paymentId, { amount: amount ? Math.round(amount * 100) : undefined });
    // Update order status in DB
    await prisma.order.updateMany({
      where: { paymentId },
      data: { status: OrderStatus.REFUNDED },
    });
    return NextResponse.json({ success: true, refund });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Refund failed.' }, { status: 500 });
  }
}
