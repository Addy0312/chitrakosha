import { NextRequest, NextResponse } from 'next/server';
import razorpay from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, receipt } = await req.json();
    if (!amount || !currency) {
      return NextResponse.json({ error: 'Amount and currency are required.' }, { status: 400 });
    }
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Order creation failed.' }, { status: 500 });
  }
}
