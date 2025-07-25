import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { OrderStatus } from '@/lib/order-status';

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const signature = req.headers.get('x-razorpay-signature');
  const body = await req.text();

  // Verify signature
  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const event = JSON.parse(body);

  // Handle different event types
  switch (event.event) {
    case 'payment.captured':
      // Update order/payment status in DB
      await prisma.order.updateMany({
        where: { paymentId: event.payload.payment.entity.id },
        data: { status: OrderStatus.COMPLETED },
      });
      break;
    case 'payment.failed':
      await prisma.order.updateMany({
        where: { paymentId: event.payload.payment.entity.id },
        data: { status: OrderStatus.CANCELLED }, // Use CANCELLED for failed payments
      });
      break;
    // Add more event types as needed
    default:
      break;
  }

  return NextResponse.json({ success: true });
}
