import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { communityId: string } }) {
  const { communityId } = params;
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      members: { include: { user: true } },
      posts: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
  if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 });
  return NextResponse.json(community);
}
