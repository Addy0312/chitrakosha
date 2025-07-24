import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { artworkId, startTime, endTime, startingPrice } = body;

  if (!artworkId || !startTime || !endTime || !startingPrice) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Validate auction times
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return NextResponse.json({ error: 'Invalid auction times' }, { status: 400 });
  }

  // Validate price
  if (isNaN(Number(startingPrice)) || Number(startingPrice) < 0) {
    return NextResponse.json({ error: 'Invalid starting price' }, { status: 400 });
  }

  // Check if artwork exists and belongs to user
  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
    include: { artist: true },
  });
  if (!artwork || artwork.artistId !== session.user.id) {
    return NextResponse.json({ error: 'Artwork not found or not owned by user' }, { status: 403 });
  }

  // Create auction
  const auction = await prisma.auction.create({
    data: {
      artworkId,
      startTime: start,
      endTime: end,
      startingBid: Number(startingPrice),
      currentBid: Number(startingPrice),
      status: 'ACTIVE',
    },
  });

  // Update artwork status
  await prisma.artwork.update({
    where: { id: artworkId },
    data: { status: 'IN_AUCTION' },
  });

  return NextResponse.json({ auction });
}
