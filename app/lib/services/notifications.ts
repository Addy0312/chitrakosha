import prisma from '@/lib/db';

export async function createNotification({
  userId,
  type,
  title,
  message,
  relatedEntityId,
  relatedEntityType,
}: {
  userId: string;
  type: string;
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
