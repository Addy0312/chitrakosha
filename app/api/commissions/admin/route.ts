import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET: List all commission requests (admin only for now)
export async function GET(req: NextRequest) {
  try {
    const commissions = await prisma.commission.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ commissions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch commissions' }, { status: 500 });
  }
}

// PATCH: Update commission status (admin only for now)
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }
    const updated = await prisma.commission.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ commission: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update commission' }, { status: 500 });
  }
}
