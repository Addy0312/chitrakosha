
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createNotification } from '@/lib/services/notifications';
import { NotificationType } from '@prisma/client';

// POST /api/auctions/[auctionId]/conclude
export async function POST(
  req: NextRequest,
  { params }: { params: { auctionId: string } }
) {
  const { auctionId } = params;

  // Fetch auction and bids
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: { bids: { orderBy: { amount: 'desc' }, include: { user: true } }, artwork: true },
  });
  if (!auction) {
    return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
  }
  if (auction.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Auction already concluded' }, { status: 400 });
  }
  if (new Date() < new Date(auction.endTime)) {
    return NextResponse.json({ error: 'Auction has not ended yet' }, { status: 400 });
  }

  // Determine winner
  const highestBid = auction.bids[0];
  let winnerId = null;
  if (highestBid) {
    winnerId = highestBid.userId;
  }

  // Update auction
  await prisma.auction.update({
    where: { id: auctionId },
    data: {
      status: 'ENDED',
      winnerId: winnerId || undefined,
      concludedAt: new Date(),
    },
  });

  // Create order for winner if there is a winner
  let order = null;
  if (winnerId && auction.artworkId) {
    order = await prisma.order.create({
      data: {
        amount: highestBid.amount,
        paymentId: `auction-${auctionId}`,
        status: 'PENDING',
        buyerId: winnerId,
        artworkId: auction.artworkId,
      },
    });
    // Mark artwork as SOLD
    await prisma.artwork.update({
      where: { id: auction.artworkId },
      data: { status: 'SOLD' },
    });
  }

  // Send notifications
  if (winnerId) {
    await createNotification({
      userId: winnerId,
      type: NotificationType.AUCTION_RESULT,
      title: 'You won the auction!',
      message: `Congratulations! You won the auction for ${auction.artwork?.title || 'an artwork'}.`,
      relatedEntityId: auctionId,
      relatedEntityType: 'Auction',
    });
  }
  // Notify all other bidders
  const notified = new Set<string>();
  for (const bid of auction.bids) {
    if (bid.userId && bid.userId !== winnerId && !notified.has(bid.userId)) {
      await createNotification({
        userId: bid.userId,
        type: NotificationType.AUCTION_RESULT,
        title: 'Auction ended',
        message: `The auction for ${auction.artwork?.title || 'an artwork'} has ended.`,
        relatedEntityId: auctionId,
        relatedEntityType: 'Auction',
      });
      notified.add(bid.userId);
    }
  }
  return NextResponse.json({
    message: 'Auction concluded',
    winnerId,
    orderId: order?.id || null,
  });
}
