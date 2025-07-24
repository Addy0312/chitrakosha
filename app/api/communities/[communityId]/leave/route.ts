import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest, { params }: { params: { communityId: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { communityId } = params;
  await prisma.communityMember.deleteMany({
    where: { communityId, userId: session.user.id },
  });
  return NextResponse.json({ success: true });
}
