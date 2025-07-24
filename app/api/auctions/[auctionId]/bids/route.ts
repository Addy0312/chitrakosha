import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { auctionId: string } }) {
  const { auctionId } = params;
  const bids = await prisma.bid.findMany({
    where: { auctionId },
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });
  return NextResponse.json({ bids });
}
