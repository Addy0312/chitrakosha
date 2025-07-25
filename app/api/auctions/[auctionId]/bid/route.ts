
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { createNotification } from '@/lib/services/notifications';
import { NotificationType } from '@prisma/client';

export async function POST(req: NextRequest, { params }: { params: { auctionId: string } }) {
  const { auctionId } = params;
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { amount } = await req.json();
  if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid bid amount' }, { status: 400 });
  const auction = await prisma.auction.findUnique({ where: { id: auctionId } });
  if (!auction) return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
  if (new Date() < auction.startTime || new Date() > auction.endTime) return NextResponse.json({ error: 'Auction not active' }, { status: 400 });
  if (auction.currentBid && amount <= auction.currentBid) return NextResponse.json({ error: 'Bid must be higher than current' }, { status: 400 });
  // Find previous highest bid
  const prevHighestBid = await prisma.bid.findFirst({
    where: { auctionId },
    orderBy: { amount: 'desc' },
  });

  const bid = await prisma.bid.create({
    data: {
      amount,
      auctionId,
      userId: session.user.id,
    },
  });
  await prisma.auction.update({ where: { id: auctionId }, data: { currentBid: amount } });

  // Notify previous highest bidder if outbid
  if (prevHighestBid && prevHighestBid.userId !== session.user.id) {
    await createNotification({
      userId: prevHighestBid.userId,
      type: NotificationType.OUTBID,
      title: 'You have been outbid!',
      message: `Your bid was surpassed in auction ${auctionId}.`,
      relatedEntityId: auctionId,
      relatedEntityType: 'Auction',
    });
  }

  return NextResponse.json({ success: true, bid });
}
