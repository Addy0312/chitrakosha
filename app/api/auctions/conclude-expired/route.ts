import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST /api/auctions/conclude-expired
// This endpoint can be called by a cron job or manually to conclude all expired auctions
export async function POST(req: NextRequest) {
  const now = new Date();
  // Find all active auctions that have ended
  const expiredAuctions = await prisma.auction.findMany({
    where: {
      status: 'ACTIVE',
      endTime: { lte: now },
    },
    include: { bids: { orderBy: { amount: 'desc' } }, artwork: true },
  });
  const results = [];
  for (const auction of expiredAuctions) {
    const highestBid = auction.bids[0];
    let winnerId = null;
    if (highestBid) {
      winnerId = highestBid.userId;
    }
    await prisma.auction.update({
      where: { id: auction.id },
      data: {
        status: 'ENDED',
        winnerId: winnerId || undefined,
        concludedAt: now,
      },
    });
    let order = null;
    if (winnerId && auction.artworkId) {
      order = await prisma.order.create({
        data: {
          amount: highestBid.amount,
          paymentId: `auction-${auction.id}`,
          status: 'PENDING',
          buyerId: winnerId,
          artworkId: auction.artworkId,
        },
      });
      await prisma.artwork.update({
        where: { id: auction.artworkId },
        data: { status: 'SOLD' },
      });
    }
    results.push({ auctionId: auction.id, winnerId, orderId: order?.id || null });
  }
  return NextResponse.json({ message: 'Concluded expired auctions', results });
}
