'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─── GET IDEAS ──────────────────────────────────
export async function getIdeas(filters?: {
  status?: string
  category?: string
}): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const where: Record<string, unknown> = {
      userId: session.user.id,
      deletedAt: null,
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.category) {
      where.category = filters.category
    }

    const ideas = await prisma.idea.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: ideas }
  } catch (error) {
    console.error('getIdeas error:', error)
    return { success: false, error: 'Failed to fetch ideas' }
  }
}

// ─── CREATE IDEA ────────────────────────────────
export async function createIdea(data: {
  title: string
  description?: string
  category?: string
  tags?: string[]
}): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    if (!data.title || data.title.trim().length === 0) {
      return { success: false, error: 'Title is required' }
    }

    const idea = await prisma.idea.create({
      data: {
        userId: session.user.id,
        title: data.title.trim(),
        description: data.description || null,
        category: data.category || null,
        tags: data.tags || [],
        status: 'RAW',
      },
    })

    revalidatePath('/ideas')
    return { success: true, data: idea }
  } catch (error) {
    console.error('createIdea error:', error)
    return { success: false, error: 'Failed to create idea' }
  }
}

// ─── UPDATE IDEA ────────────────────────────────
export async function updateIdea(
  id: string,
  data: {
    title?: string
    description?: string
    category?: string
    status?: string
    tags?: string[]
    impactRating?: number
    effortRating?: number
    excitementRating?: number
  }
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const existing = await prisma.idea.findFirst({
      where: { id, userId: session.user.id, deletedAt: null },
    })

    if (!existing) {
      return { success: false, error: 'Idea not found' }
    }

    const updateData: Record<string, unknown> = {}
    if (data.title !== undefined) updateData.title = data.title.trim()
    if (data.description !== undefined) updateData.description = data.description
    if (data.category !== undefined) updateData.category = data.category
    if (data.status !== undefined) updateData.status = data.status
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.impactRating !== undefined) updateData.impactRating = data.impactRating
    if (data.effortRating !== undefined) updateData.effortRating = data.effortRating
    if (data.excitementRating !== undefined) updateData.excitementRating = data.excitementRating

    const idea = await prisma.idea.update({
      where: { id },
      data: updateData,
    })

    revalidatePath('/ideas')
    return { success: true, data: idea }
  } catch (error) {
    console.error('updateIdea error:', error)
    return { success: false, error: 'Failed to update idea' }
  }
}

// ─── DELETE IDEA (SOFT) ─────────────────────────
export async function deleteIdea(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const existing = await prisma.idea.findFirst({
      where: { id, userId: session.user.id, deletedAt: null },
    })

    if (!existing) {
      return { success: false, error: 'Idea not found' }
    }

    await prisma.idea.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    revalidatePath('/ideas')
    return { success: true, data: { id } }
  } catch (error) {
    console.error('deleteIdea error:', error)
    return { success: false, error: 'Failed to delete idea' }
  }
}

// ─── RATE IDEA ──────────────────────────────────
export async function rateIdea(
  id: string,
  impact: number,
  effort: number,
  excitement: number
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    if (
      impact < 1 || impact > 5 ||
      effort < 1 || effort > 5 ||
      excitement < 1 || excitement > 5
    ) {
      return { success: false, error: 'Ratings must be between 1 and 5' }
    }

    const existing = await prisma.idea.findFirst({
      where: { id, userId: session.user.id, deletedAt: null },
    })

    if (!existing) {
      return { success: false, error: 'Idea not found' }
    }

    const idea = await prisma.idea.update({
      where: { id },
      data: {
        impactRating: impact,
        effortRating: effort,
        excitementRating: excitement,
      },
    })

    revalidatePath('/ideas')
    return { success: true, data: idea }
  } catch (error) {
    console.error('rateIdea error:', error)
    return { success: false, error: 'Failed to rate idea' }
  }
}
