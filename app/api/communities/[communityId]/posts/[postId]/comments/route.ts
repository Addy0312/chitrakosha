import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
  const { postId } = params;
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    include: { author: true },
  });
  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { text, parentId } = await req.json();
  if (!text) return NextResponse.json({ error: 'Text required' }, { status: 400 });
  const comment = await prisma.comment.create({
    data: {
      text,
      postId: params.postId,
      authorId: session.user.id,
      // @ts-expect-error: parentId is present in DB but not in Prisma types
      parentId: parentId || null,
    },
  });
  // Optionally: send notification to post author or parent comment author
  return NextResponse.json(comment);
}
