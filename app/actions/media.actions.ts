'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─── GET PRODUCTIONS ────────────────────────────
export async function getProductions(): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const productions = await prisma.production.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { shots: true },
        },
      },
    })

    return { success: true, data: productions }
  } catch (error) {
    console.error('Failed to fetch productions:', error)
    return { success: false, error: 'Failed to fetch productions' }
  }
}

// ─── CREATE PRODUCTION ──────────────────────────
export async function createProduction(data: {
  title: string
  description?: string
  platform?: string
  status?: string
}): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    if (!data.title || data.title.trim().length === 0) {
      return { success: false, error: 'Title is required' }
    }

    const production = await prisma.production.create({
      data: {
        userId: session.user.id,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        platform: (data.platform as 'LINKEDIN' | 'INSTAGRAM' | 'YOUTUBE' | 'BLOG' | 'NEWSLETTER' | 'TWITTER') || null,
        status: (data.status as 'CONCEPT' | 'SCRIPT' | 'PRE_PRODUCTION' | 'SHOOT' | 'EDIT' | 'PUBLISHED') || 'CONCEPT',
      },
    })

    revalidatePath('/media')
    return { success: true, data: production }
  } catch (error) {
    console.error('Failed to create production:', error)
    return { success: false, error: 'Failed to create production' }
  }
}

// ─── UPDATE PRODUCTION ──────────────────────────
export async function updateProduction(
  id: string,
  data: {
    title?: string
    description?: string
    platform?: string | null
    status?: string
  }
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const existing = await prisma.production.findFirst({
      where: { id, userId: session.user.id, deletedAt: null },
    })

    if (!existing) {
      return { success: false, error: 'Production not found' }
    }

    const updateData: Record<string, unknown> = {}
    if (data.title !== undefined) updateData.title = data.title.trim()
    if (data.description !== undefined) updateData.description = data.description.trim() || null
    if (data.platform !== undefined) updateData.platform = data.platform || null
    if (data.status !== undefined) updateData.status = data.status

    const production = await prisma.production.update({
      where: { id },
      data: updateData,
    })

    revalidatePath('/media')
    return { success: true, data: production }
  } catch (error) {
    console.error('Failed to update production:', error)
    return { success: false, error: 'Failed to update production' }
  }
}

// ─── DELETE PRODUCTION ──────────────────────────
export async function deleteProduction(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.production.update({
      where: { id, userId: session.user.id },
      data: { deletedAt: new Date() },
    })

    revalidatePath('/media')
    return { success: true, data: null }
  } catch (error) {
    console.error('Failed to delete production:', error)
    return { success: false, error: 'Failed to delete production' }
  }
}
