import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { createNotification } from '@/lib/services/notification';
import { NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Helper function to check if user is admin
async function isAdmin(userId: string) {
  // In a real application, you would check if the user has admin privileges
  // For now, we'll use a simple check - you can replace this with your actual admin check logic
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  
  // For demo purposes, consider specific emails as admins
  // In production, you would have a proper role system
  const adminEmails = [
    'admin@chitrakosha.com',
    'admin@example.com',
    // Add your email here for testing
  ];
  return user && adminEmails.includes(user.email);
}

export async function POST(
  req: Request,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { applicationId } = params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const admin = await isAdmin(session.user.id);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the application
    const application = await prisma.artistApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if application is already processed
    if (application.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Application has already been processed' },
        { status: 400 }
      );
    }

    // Update application status and user isArtist flag in a transaction
    const result = await prisma.$transaction([
      // Update application status
      prisma.artistApplication.update({
        where: { id: applicationId },
        data: { status: 'APPROVED' },
      }),
      
      // Update user to be an artist
      prisma.user.update({
        where: { id: application.userId },
        data: { isArtist: true },
      }),
    ]);

    // Create notification for the user
    await createNotification({
      userId: application.userId,
      type: NotificationType.ARTIST_APPLICATION_APPROVED,
      title: 'Artist Application Approved',
      message: 'Congratulations! Your artist application has been approved. You can now upload and sell your artwork on Chitrakosha.',
      relatedEntityId: applicationId,
      relatedEntityType: 'ArtistApplication',
    });

    return NextResponse.json({
      message: 'Application approved successfully',
      application: result[0],
    });
  } catch (error) {
    console.error('[APPROVE_ARTIST_APPLICATION_ERROR]', error);
    return NextResponse.json({ error: 'Failed to approve application' }, { status: 500 });
  }
}