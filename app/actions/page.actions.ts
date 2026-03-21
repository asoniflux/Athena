'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createPageSchema,
  updatePageSchema,
  type CreatePageInput,
  type UpdatePageInput,
} from '@/lib/validations/page.schema'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─── GET ALL PAGES (FLAT LIST) ────────────────────
export async function getPages(): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const pages = await prisma.page.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        parentId: true,
        title: true,
        icon: true,
        tags: true,
        isFavorite: true,
        position: true,
        createdAt: true,
        updatedAt: true,
        children: {
          where: { deletedAt: null },
          select: { id: true },
        },
      },
    })

    return { success: true, data: pages }
  } catch (error) {
    console.error('getPages error:', error)
    return { success: false, error: 'Failed to fetch pages' }
  }
}

// ─── GET PAGE BY ID ───────────────────────────────
export async function getPageById(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const page = await prisma.page.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        children: {
          where: { deletedAt: null },
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
          select: {
            id: true,
            title: true,
            icon: true,
            parentId: true,
          },
        },
      },
    })

    if (!page) {
      return { success: false, error: 'Page not found' }
    }

    return { success: true, data: page }
  } catch (error) {
    console.error('getPageById error:', error)
    return { success: false, error: 'Failed to fetch page' }
  }
}

// ─── CREATE PAGE ──────────────────────────────────
export async function createPage(data: CreatePageInput): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = createPageSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    // Verify parent ownership if parentId is provided
    if (validated.data.parentId) {
      const parent = await prisma.page.findFirst({
        where: {
          id: validated.data.parentId,
          userId: session.user.id,
          deletedAt: null,
        },
      })
      if (!parent) {
        return { success: false, error: 'Parent page not found' }
      }
    }

    const page = await prisma.page.create({
      data: {
        title: validated.data.title,
        parentId: validated.data.parentId || null,
        icon: validated.data.icon || null,
        content: validated.data.content || null,
        tags: validated.data.tags || [],
        isTemplate: validated.data.isTemplate || false,
        userId: session.user.id,
      },
    })

    revalidatePath('/knowledge')
    return { success: true, data: page }
  } catch (error) {
    console.error('createPage error:', error)
    return { success: false, error: 'Failed to create page' }
  }
}

// ─── UPDATE PAGE ──────────────────────────────────
export async function updatePage(
  id: string,
  data: UpdatePageInput
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const existing = await prisma.page.findFirst({
      where: { id, userId: session.user.id, deletedAt: null },
    })

    if (!existing) {
      return { success: false, error: 'Page not found' }
    }

    const validated = updatePageSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const updateData: Record<string, unknown> = {}

    if (validated.data.title !== undefined) updateData.title = validated.data.title
    if (validated.data.parentId !== undefined) updateData.parentId = validated.data.parentId || null
    if (validated.data.icon !== undefined) updateData.icon = validated.data.icon || null
    if (validated.data.content !== undefined) {
      updateData.content = validated.data.content
      // Also store plain text for search
      if (typeof validated.data.content === 'string') {
        updateData.contentText = validated.data.content
      }
    }
    if (validated.data.tags !== undefined) updateData.tags = validated.data.tags

    const page = await prisma.page.update({
      where: { id },
      data: updateData,
    })

    revalidatePath('/knowledge')
    return { success: true, data: page }
  } catch (error) {
    console.error('updatePage error:', error)
    return { success: false, error: 'Failed to update page' }
  }
}

// ─── DELETE PAGE (SOFT) ───────────────────────────
export async function deletePage(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const existing = await prisma.page.findFirst({
      where: { id, userId: session.user.id, deletedAt: null },
    })

    if (!existing) {
      return { success: false, error: 'Page not found' }
    }

    // Soft-delete the page and all its children
    await prisma.$transaction([
      prisma.page.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
      prisma.page.updateMany({
        where: {
          parentId: id,
          userId: session.user.id,
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      }),
    ])

    revalidatePath('/knowledge')
    return { success: true, data: { id } }
  } catch (error) {
    console.error('deletePage error:', error)
    return { success: false, error: 'Failed to delete page' }
  }
}
