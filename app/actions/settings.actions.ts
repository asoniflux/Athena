'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash, compare } from 'bcryptjs'
import { isOllamaAvailable } from '@/lib/ollama'
import { OLLAMA_MODELS } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─── GET PROFILE ────────────────────────────────
export async function getProfile(): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true,
        avatar: true,
        createdAt: true,
      },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    return { success: true, data: user }
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return { success: false, error: 'Failed to fetch profile' }
  }
}

// ─── UPDATE PROFILE ─────────────────────────────
export async function updateProfile(data: {
  name?: string
  email?: string
  timezone?: string
}): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const updateData: Record<string, string> = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.email !== undefined) updateData.email = data.email.trim()
    if (data.timezone !== undefined) updateData.timezone = data.timezone

    // Check email uniqueness if changing
    if (updateData.email) {
      const existing = await prisma.user.findFirst({
        where: { email: updateData.email, id: { not: session.user.id } },
      })
      if (existing) {
        return { success: false, error: 'Email is already in use' }
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true,
      },
    })

    revalidatePath('/settings')
    return { success: true, data: user }
  } catch (error) {
    console.error('Failed to update profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
}

// ─── CHANGE PASSWORD ────────────────────────────
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    if (!currentPassword || !newPassword) {
      return { success: false, error: 'Both passwords are required' }
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters' }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const isValid = await compare(currentPassword, user.hashedPassword)
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' }
    }

    const hashedPassword = await hash(newPassword, 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hashedPassword },
    })

    return { success: true, data: null }
  } catch (error) {
    console.error('Failed to change password:', error)
    return { success: false, error: 'Failed to change password' }
  }
}

// ─── CHECK OLLAMA STATUS ────────────────────────
export async function checkOllamaStatus(): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const available = await isOllamaAvailable()

    const models = {
      general: OLLAMA_MODELS.general,
      structured: OLLAMA_MODELS.structured,
      embed: OLLAMA_MODELS.embed,
    }

    return {
      success: true,
      data: {
        available,
        models,
      },
    }
  } catch (error) {
    console.error('Failed to check Ollama status:', error)
    return { success: false, error: 'Failed to check Ollama status' }
  }
}

// ─── GET DATABASE STATS ─────────────────────────
export async function getDatabaseStats(): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const userId = session.user.id

    const [tasks, pages, files, conversations, productions, habits] = await Promise.all([
      prisma.task.count({ where: { userId, deletedAt: null } }),
      prisma.page.count({ where: { userId, deletedAt: null } }),
      prisma.file.count({ where: { userId, deletedAt: null } }),
      prisma.chatConversation.count({ where: { userId, deletedAt: null } }),
      prisma.production.count({ where: { userId, deletedAt: null } }),
      prisma.habit.count({ where: { userId } }),
    ])

    return {
      success: true,
      data: { tasks, pages, files, conversations, productions, habits },
    }
  } catch (error) {
    console.error('Failed to fetch database stats:', error)
    return { success: false, error: 'Failed to fetch database stats' }
  }
}
