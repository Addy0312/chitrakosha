import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const search = searchParams.get('search') || '';
  const communities = await prisma.community.findMany({
    where: search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {},
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json(communities);
}
