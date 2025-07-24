import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest, { params }: { params: { communityId: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { title, content } = await req.json();
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: session.user.id,
      communityId: params.communityId,
    },
  });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: { params: { communityId: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { postId, title, content } = await req.json();
  if (!postId) return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
  const post = await prisma.post.update({
    where: { id: postId, authorId: session.user.id, communityId: params.communityId },
    data: { title, content },
  });
  return NextResponse.json(post);
}

export async function DELETE(req: NextRequest, { params }: { params: { communityId: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { postId } = await req.json();
  if (!postId) return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
  await prisma.post.delete({
    where: { id: postId, authorId: session.user.id, communityId: params.communityId },
  });
  return NextResponse.json({ success: true });
}
