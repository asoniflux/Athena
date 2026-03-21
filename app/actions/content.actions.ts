'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createContentSchema, updateContentSchema } from '@/lib/validations/content.schema'
import { revalidatePath } from 'next/cache'
import { logActivity } from '@/lib/activity'

export async function getContentPieces(filters?: {
  status?: string
  platform?: string
  search?: string
}) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  const where: Record<string, unknown> = {
    userId: session.user.id,
    deletedAt: null,
  }

  if (filters?.status) where.status = filters.status
  if (filters?.platform) where.platform = filters.platform
  if (filters?.search) {
    where.title = { contains: filters.search, mode: 'insensitive' }
  }

  const pieces = await prisma.contentPiece.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return { success: true, data: pieces }
}

export async function createContentPiece(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  const validated = createContentSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const piece = await prisma.contentPiece.create({
    data: {
      ...validated.data,
      userId: session.user.id,
      publishDate: validated.data.publishDate ? new Date(validated.data.publishDate) : null,
    },
  })

  await logActivity(session.user.id, 'created', 'content', piece.id, piece.title)
  revalidatePath('/content')
  return { success: true, data: piece }
}

export async function updateContentPiece(id: string, data: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  const existing = await prisma.contentPiece.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  })
  if (!existing) return { success: false, error: 'Content not found' }

  const validated = updateContentSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const piece = await prisma.contentPiece.update({
    where: { id },
    data: {
      ...validated.data,
      publishDate: validated.data.publishDate ? new Date(validated.data.publishDate) : undefined,
    },
  })

  await logActivity(session.user.id, 'updated', 'content', piece.id, piece.title)
  revalidatePath('/content')
  return { success: true, data: piece }
}

export async function deleteContentPiece(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  const existing = await prisma.contentPiece.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  })
  if (!existing) return { success: false, error: 'Content not found' }

  await prisma.contentPiece.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  await logActivity(session.user.id, 'deleted', 'content', id, existing.title)
  revalidatePath('/content')
  return { success: true }
}
