'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  startTime: z.string(),
  endTime: z.string(),
  allDay: z.boolean().default(false),
  category: z.enum(['MEETING', 'DEEP_WORK', 'PERSONAL', 'CONTENT', 'ADMIN', 'HEALTH', 'SOCIAL']).default('MEETING'),
  color: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
})

const updateEventSchema = eventSchema.partial()

export type CreateEventInput = z.infer<typeof eventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>

// ─── GET EVENTS FOR MONTH ─────────────────────────
export async function getEvents(month: number, year: number): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get range that covers the full calendar grid (include adjacent month days)
    const startDate = new Date(year, month - 1, 1)
    startDate.setDate(startDate.getDate() - 7) // buffer for previous month days
    const endDate = new Date(year, month, 1)
    endDate.setDate(endDate.getDate() + 7) // buffer for next month days

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
      orderBy: { startTime: 'asc' },
    })

    return { success: true, data: events }
  } catch (error) {
    console.error('getEvents error:', error)
    return { success: false, error: 'Failed to fetch events' }
  }
}

// ─── GET EVENTS FOR DATE ──────────────────────────
export async function getEventsForDate(dateStr: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const date = new Date(dateStr)
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
        OR: [
          {
            startTime: { gte: startOfDay, lt: endOfDay },
          },
          {
            startTime: { lt: startOfDay },
            endTime: { gt: startOfDay },
          },
        ],
      },
      orderBy: { startTime: 'asc' },
    })

    return { success: true, data: events }
  } catch (error) {
    console.error('getEventsForDate error:', error)
    return { success: false, error: 'Failed to fetch events for date' }
  }
}

// ─── CREATE EVENT ─────────────────────────────────
export async function createEvent(data: CreateEventInput): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = eventSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const { startTime, endTime, notes, ...rest } = validated.data

    const event = await prisma.calendarEvent.create({
      data: {
        ...rest,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notes: notes ? { text: notes } : undefined,
        userId: session.user.id,
      },
    })

    revalidatePath('/calendar')
    return { success: true, data: event }
  } catch (error) {
    console.error('createEvent error:', error)
    return { success: false, error: 'Failed to create event' }
  }
}

// ─── UPDATE EVENT ─────────────────────────────────
export async function updateEvent(
  id: string,
  data: UpdateEventInput
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const existing = await prisma.calendarEvent.findFirst({
      where: { id, userId: session.user.id, deletedAt: null },
    })

    if (!existing) {
      return { success: false, error: 'Event not found' }
    }

    const validated = updateEventSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const { startTime, endTime, notes, ...rest } = validated.data

    const updateData: Record<string, unknown> = { ...rest }
    if (startTime !== undefined) {
      updateData.startTime = new Date(startTime)
    }
    if (endTime !== undefined) {
      updateData.endTime = new Date(endTime)
    }
    if (notes !== undefined) {
      updateData.notes = notes ? { text: notes } : null
    }

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: updateData,
    })

    revalidatePath('/calendar')
    return { success: true, data: event }
  } catch (error) {
    console.error('updateEvent error:', error)
    return { success: false, error: 'Failed to update event' }
  }
}

// ─── DELETE EVENT (SOFT) ──────────────────────────
export async function deleteEvent(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const existing = await prisma.calendarEvent.findFirst({
      where: { id, userId: session.user.id, deletedAt: null },
    })

    if (!existing) {
      return { success: false, error: 'Event not found' }
    }

    await prisma.calendarEvent.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    revalidatePath('/calendar')
    return { success: true, data: { id } }
  } catch (error) {
    console.error('deleteEvent error:', error)
    return { success: false, error: 'Failed to delete event' }
  }
}
