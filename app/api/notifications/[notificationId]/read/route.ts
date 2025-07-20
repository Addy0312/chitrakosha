import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { markNotificationAsRead } from '@/lib/services/notification';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    const { notificationId } = params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the notification belongs to the current user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Mark notification as read
    const updatedNotification = await markNotificationAsRead(notificationId);

    return NextResponse.json({
      message: 'Notification marked as read',
      notification: updatedNotification,
    });
  } catch (error) {
    console.error('[MARK_NOTIFICATION_READ_ERROR]', error);
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
  }
}