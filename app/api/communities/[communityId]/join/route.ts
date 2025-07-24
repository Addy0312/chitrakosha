import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest, { params }: { params: { communityId: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { communityId } = params;
  // Check if already a member
  const existing = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId, userId: session.user.id } },
  });
  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 400 });
  await prisma.communityMember.create({
    data: { communityId, userId: session.user.id },
  });
  return NextResponse.json({ success: true });
}
