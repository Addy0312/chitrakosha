import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { name, description } = await req.json();
  if (!name || name.length < 3) return NextResponse.json({ error: 'Name too short' }, { status: 400 });
  if (!description || description.length < 10) return NextResponse.json({ error: 'Description too short' }, { status: 400 });
  // Check for duplicate
  const exists = await prisma.community.findFirst({ where: { name } });
  if (exists) return NextResponse.json({ error: 'Community already exists' }, { status: 400 });
  // Moderation/validation placeholder: extend as needed
  const community = await prisma.community.create({
    data: {
      name,
      description,
      createdAt: new Date(),
      creatorId: session.user.id,
    },
  });
  await prisma.communityMember.create({ data: { communityId: community.id, userId: session.user.id } });
  return NextResponse.json(community);
}
