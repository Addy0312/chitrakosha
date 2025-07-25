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

    // Update application status
    const updatedApplication = await prisma.artistApplication.update({
      where: { id: applicationId },
      data: { status: 'REJECTED' },
    });

    // Create notification for the user
    await createNotification({
      userId: application.userId,
      type: NotificationType.ARTIST_APPLICATION_REJECTED,
      title: 'Artist Application Not Approved',
      message: 'Unfortunately, your artist application was not approved at this time. You may submit a new application with additional portfolio samples.',
      relatedEntityId: applicationId,
      relatedEntityType: 'ArtistApplication',
    });

    return NextResponse.json({
      message: 'Application rejected successfully',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('[REJECT_ARTIST_APPLICATION_ERROR]', error);
    return NextResponse.json({ error: 'Failed to reject application' }, { status: 500 });
  }
}