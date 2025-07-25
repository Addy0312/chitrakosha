import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { OrderStatus } from '@/lib/order-status';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    if (generatedSignature !== razorpay_signature) {
      // Mark order as failed
      await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED }, // Use CANCELLED for failed payments
      });
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
    }
    // Mark order as completed
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        paymentId: razorpay_payment_id,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Verification failed.' }, { status: 500 });
  }
}
