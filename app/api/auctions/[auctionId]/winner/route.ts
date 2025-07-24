import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/auctions/[auctionId]/winner
export async function GET(req: NextRequest, { params }: { params: { auctionId: string } }) {
  const { auctionId } = params;
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
  });
  if (!auction) return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
  if (auction.status !== 'ENDED') return NextResponse.json({ error: 'Auction not concluded' }, { status: 400 });
  return NextResponse.json({ winnerId: auction.winnerId });
}
