
import prisma from '@/lib/db';
import { NotificationType } from '@prisma/client';

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
