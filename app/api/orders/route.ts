
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all orders for the logged-in user
  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      artwork: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
          price: true,
          artist: { select: { id: true, name: true } },
        },
      },
    },
  });

  return NextResponse.json({ orders });
}
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { artworkId } = await req.json();
  if (!artworkId) {
    return NextResponse.json({ error: 'Missing artworkId' }, { status: 400 });
  }

  // Check if artwork exists and is for sale
  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
    include: { order: true },
  });
  if (!artwork || artwork.status !== 'FOR_SALE') {
    return NextResponse.json({ error: 'Artwork not available for purchase' }, { status: 400 });
  }
  if (artwork.order) {
    return NextResponse.json({ error: 'Artwork already sold' }, { status: 400 });
  }

  // Create order
  const order = await prisma.order.create({
    data: {
      amount: artwork.price,
      status: 'PENDING',
      buyerId: session.user.id,
      artworkId: artwork.id,
      paymentId: 'MOCK_PAYMENT_ID', // Replace with real payment integration
    },
  });

  // Update artwork status
  await prisma.artwork.update({
    where: { id: artwork.id },
    data: { status: 'SOLD' },
  });

  return NextResponse.json({ order });
}
