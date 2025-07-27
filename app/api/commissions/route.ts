import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, email, description, budget } = await req.json();
    if (!name || !email || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const commission = await prisma.commission.create({
      data: { name, email, description, budget },
    });
    return NextResponse.json({ commission });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit commission' }, { status: 500 });
  }
}
