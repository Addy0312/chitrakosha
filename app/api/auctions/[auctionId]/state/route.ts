import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { auctionId: string } }) {
  const { auctionId } = params;
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: { bids: { orderBy: { createdAt: 'desc' }, take: 10, include: { user: true } }, artwork: true },
  });
  if (!auction) return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
  return NextResponse.json(auction);
}
