import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const sort = searchParams.get('sort') || 'endTime';
  const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
  const now = new Date();
  const auctions = await prisma.auction.findMany({
    where: {
      startTime: { lte: now },
      endTime: { gte: now },
    },
    include: { artwork: true },
    orderBy: { [sort]: order },
    take: 50,
  });
  return NextResponse.json(auctions);
}
