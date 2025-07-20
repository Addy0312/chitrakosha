import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserNotifications, getUnreadNotificationsCount } from '@/lib/services/notification';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const includeCount = searchParams.get('includeCount') === 'true';

    // Get user notifications
    const notifications = await getUserNotifications(session.user.id);
    
    const response: any = { notifications };
    
    if (includeCount) {
      const unreadCount = await getUnreadNotificationsCount(session.user.id);
      response.unreadCount = unreadCount;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[GET_NOTIFICATIONS_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}