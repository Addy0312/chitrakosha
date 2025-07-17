import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's application
    const application = await prisma.artistApplication.findUnique({
      where: { userId: session.user.id },
    });

    if (!application) {
      return NextResponse.json({ error: 'No application found' }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('[GET_ARTIST_APPLICATION_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}