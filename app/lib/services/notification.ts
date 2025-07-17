import prisma from '@/lib/db';
import { NotificationType } from '@prisma/client';

/**
 * Creates a notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  relatedEntityId,
  relatedEntityType,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      relatedEntityId,
      relatedEntityType,
    },
  });
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

/**
 * Gets all notifications for a user
 */
export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Gets unread notifications count for a user
 */
export async function getUnreadNotificationsCount(userId: string) {
  return prisma.notification.count({
    where: { 
      userId,
      isRead: false
    },
  });
}