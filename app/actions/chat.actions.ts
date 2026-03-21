'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─── GET CONVERSATIONS ──────────────────────────
export async function getConversations(): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const conversations = await prisma.chatConversation.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return { success: true, data: conversations }
  } catch (error) {
    console.error('Failed to fetch conversations:', error)
    return { success: false, error: 'Failed to fetch conversations' }
  }
}

// ─── GET CONVERSATION ───────────────────────────
export async function getConversation(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!conversation) {
      return { success: false, error: 'Conversation not found' }
    }

    return { success: true, data: conversation }
  } catch (error) {
    console.error('Failed to fetch conversation:', error)
    return { success: false, error: 'Failed to fetch conversation' }
  }
}

// ─── DELETE CONVERSATION ────────────────────────
export async function deleteConversation(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.chatConversation.update({
      where: { id, userId: session.user.id },
      data: { deletedAt: new Date() },
    })

    revalidatePath('/chat')
    return { success: true, data: null }
  } catch (error) {
    console.error('Failed to delete conversation:', error)
    return { success: false, error: 'Failed to delete conversation' }
  }
}

// ─── STAR CONVERSATION ──────────────────────────
export async function starConversation(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const conversation = await prisma.chatConversation.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!conversation) {
      return { success: false, error: 'Conversation not found' }
    }

    const updated = await prisma.chatConversation.update({
      where: { id },
      data: { isStarred: !conversation.isStarred },
    })

    revalidatePath('/chat')
    return { success: true, data: updated }
  } catch (error) {
    console.error('Failed to star conversation:', error)
    return { success: false, error: 'Failed to star conversation' }
  }
}
