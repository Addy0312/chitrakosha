import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

import prisma from '@/lib/db';
import { OrderStatus } from '@/lib/order-status';

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

export async function POST(req: NextRequest) {
  try {
      const { paymentId, amount } = await req.json();
      if (!paymentId) {
        return NextResponse.json({ error: 'Payment ID is required.' }, { status: 400 });
      }
      // Skipping Razorpay refund for now
      // const refund = await razorpay.payments.refund(paymentId, { amount });
      // return NextResponse.json({ refund }, { status: 200 });
      return NextResponse.json({ message: 'Refund processing is currently disabled.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Refund failed.' }, { status: 500 });
  }
}
