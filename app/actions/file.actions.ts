'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─── GET FILES ──────────────────────────────────
export async function getFiles(folderId?: string | null): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const [files, folders] = await Promise.all([
      prisma.file.findMany({
        where: {
          userId: session.user.id,
          folderId: folderId || null,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.fileFolder.findMany({
        where: {
          parentId: folderId || null,
        },
        orderBy: { name: 'asc' },
      }),
    ])

    return { success: true, data: { files, folders } }
  } catch (error) {
    console.error('Failed to fetch files:', error)
    return { success: false, error: 'Failed to fetch files' }
  }
}

// ─── GET FOLDERS ────────────────────────────────
export async function getFolders(): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const folders = await prisma.fileFolder.findMany({
      orderBy: { name: 'asc' },
      include: {
        children: true,
      },
    })

    return { success: true, data: folders }
  } catch (error) {
    console.error('Failed to fetch folders:', error)
    return { success: false, error: 'Failed to fetch folders' }
  }
}

// ─── CREATE FOLDER ──────────────────────────────
export async function createFolder(name: string, parentId?: string | null): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: 'Folder name is required' }
    }

    const folder = await prisma.fileFolder.create({
      data: {
        name: name.trim(),
        parentId: parentId || null,
      },
    })

    revalidatePath('/files')
    return { success: true, data: folder }
  } catch (error) {
    console.error('Failed to create folder:', error)
    return { success: false, error: 'Failed to create folder' }
  }
}

// ─── DELETE FILE ────────────────────────────────
export async function deleteFile(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.file.update({
      where: { id, userId: session.user.id },
      data: { deletedAt: new Date() },
    })

    revalidatePath('/files')
    return { success: true, data: null }
  } catch (error) {
    console.error('Failed to delete file:', error)
    return { success: false, error: 'Failed to delete file' }
  }
}

// ─── STAR FILE ──────────────────────────────────
export async function starFile(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const file = await prisma.file.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!file) {
      return { success: false, error: 'File not found' }
    }

    const updated = await prisma.file.update({
      where: { id },
      data: { isStarred: !file.isStarred },
    })

    revalidatePath('/files')
    return { success: true, data: updated }
  } catch (error) {
    console.error('Failed to star file:', error)
    return { success: false, error: 'Failed to star file' }
  }
}
