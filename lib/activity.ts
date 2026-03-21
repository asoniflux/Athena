import { prisma } from './prisma'

export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  entityTitle?: string,
  metadata?: Record<string, string | number | boolean>
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        entityTitle: entityTitle || null,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    })
  } catch {
    // Don't let activity logging failures break the main operation
    console.error('Failed to log activity')
  }
}
