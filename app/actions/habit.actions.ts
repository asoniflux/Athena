'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─── GET HABITS ─────────────────────────────────
export async function getHabits(): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const habits = await prisma.habit.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      include: {
        logs: {
          where: {
            date: today,
          },
        },
      },
    })

    const habitsWithStatus = habits.map((habit) => ({
      ...habit,
      completedToday: habit.logs.some((log) => log.completed),
    }))

    return { success: true, data: habitsWithStatus }
  } catch (error) {
    console.error('getHabits error:', error)
    return { success: false, error: 'Failed to fetch habits' }
  }
}

// ─── CREATE HABIT ───────────────────────────────
export async function createHabit(data: {
  name: string
  icon?: string
  color?: string
  category?: string
  frequency?: string
  targetDays?: number[]
  targetValue?: number
  unit?: string
}): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    if (!data.name || data.name.trim().length === 0) {
      return { success: false, error: 'Name is required' }
    }

    const habit = await prisma.habit.create({
      data: {
        userId: session.user.id,
        name: data.name.trim(),
        icon: data.icon || null,
        color: data.color || '#6366F1',
        category: (data.category as any) || 'PRODUCTIVITY',
        frequency: (data.frequency as any) || 'DAILY',
        targetDays: data.targetDays || [],
        targetValue: data.targetValue || null,
        unit: data.unit || null,
      },
    })

    revalidatePath('/habits')
    return { success: true, data: habit }
  } catch (error) {
    console.error('createHabit error:', error)
    return { success: false, error: 'Failed to create habit' }
  }
}

// ─── UPDATE HABIT ───────────────────────────────
export async function updateHabit(
  id: string,
  data: {
    name?: string
    icon?: string
    color?: string
    category?: string
    frequency?: string
    targetDays?: number[]
    targetValue?: number
    unit?: string
    isActive?: boolean
  }
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const existing = await prisma.habit.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return { success: false, error: 'Habit not found' }
    }

    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.icon !== undefined) updateData.icon = data.icon
    if (data.color !== undefined) updateData.color = data.color
    if (data.category !== undefined) updateData.category = data.category
    if (data.frequency !== undefined) updateData.frequency = data.frequency
    if (data.targetDays !== undefined) updateData.targetDays = data.targetDays
    if (data.targetValue !== undefined) updateData.targetValue = data.targetValue
    if (data.unit !== undefined) updateData.unit = data.unit
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    const habit = await prisma.habit.update({
      where: { id },
      data: updateData,
    })

    revalidatePath('/habits')
    return { success: true, data: habit }
  } catch (error) {
    console.error('updateHabit error:', error)
    return { success: false, error: 'Failed to update habit' }
  }
}

// ─── DELETE HABIT ────────────────────────────────
export async function deleteHabit(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const existing = await prisma.habit.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return { success: false, error: 'Habit not found' }
    }

    await prisma.habit.delete({ where: { id } })

    revalidatePath('/habits')
    return { success: true, data: { id } }
  } catch (error) {
    console.error('deleteHabit error:', error)
    return { success: false, error: 'Failed to delete habit' }
  }
}

// ─── TOGGLE HABIT LOG ───────────────────────────
export async function toggleHabitLog(
  habitId: string,
  date: string
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: session.user.id },
    })

    if (!habit) {
      return { success: false, error: 'Habit not found' }
    }

    const logDate = new Date(date)
    logDate.setHours(0, 0, 0, 0)

    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: logDate,
        },
      },
    })

    if (existingLog && existingLog.completed) {
      const log = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { completed: false },
      })
      revalidatePath('/habits')
      return { success: true, data: log }
    } else if (existingLog) {
      const log = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { completed: true },
      })
      revalidatePath('/habits')
      return { success: true, data: log }
    } else {
      const log = await prisma.habitLog.create({
        data: {
          habitId,
          date: logDate,
          completed: true,
        },
      })
      revalidatePath('/habits')
      return { success: true, data: log }
    }
  } catch (error) {
    console.error('toggleHabitLog error:', error)
    return { success: false, error: 'Failed to toggle habit log' }
  }
}

// ─── GET HABIT LOGS ─────────────────────────────
export async function getHabitLogs(
  habitId: string,
  startDate: string,
  endDate: string
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: session.user.id },
    })

    if (!habit) {
      return { success: false, error: 'Habit not found' }
    }

    const logs = await prisma.habitLog.findMany({
      where: {
        habitId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: 'asc' },
    })

    return { success: true, data: logs }
  } catch (error) {
    console.error('getHabitLogs error:', error)
    return { success: false, error: 'Failed to fetch habit logs' }
  }
}

// ─── GET STREAK DATA ────────────────────────────
export async function getStreakData(habitId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: session.user.id },
    })

    if (!habit) {
      return { success: false, error: 'Habit not found' }
    }

    const logs = await prisma.habitLog.findMany({
      where: {
        habitId,
        completed: true,
      },
      orderBy: { date: 'desc' },
    })

    if (logs.length === 0) {
      return { success: true, data: { currentStreak: 0, bestStreak: 0 } }
    }

    // Calculate current streak
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const completedDates = new Set(
      logs.map((log) => {
        const d = new Date(log.date)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
      })
    )

    // Check from today backwards
    const checkDate = new Date(today)
    // Allow starting from today or yesterday
    if (!completedDates.has(checkDate.getTime())) {
      checkDate.setDate(checkDate.getDate() - 1)
    }

    while (completedDates.has(checkDate.getTime())) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    }

    // Calculate best streak
    const sortedDates = Array.from(completedDates).sort((a, b) => a - b)
    let bestStreak = 1
    let tempStreak = 1

    for (let i = 1; i < sortedDates.length; i++) {
      const diff = sortedDates[i] - sortedDates[i - 1]
      if (diff === 86400000) {
        // 1 day in ms
        tempStreak++
        bestStreak = Math.max(bestStreak, tempStreak)
      } else {
        tempStreak = 1
      }
    }

    if (sortedDates.length === 0) bestStreak = 0

    return {
      success: true,
      data: { currentStreak, bestStreak: Math.max(bestStreak, currentStreak) },
    }
  } catch (error) {
    console.error('getStreakData error:', error)
    return { success: false, error: 'Failed to calculate streak' }
  }
}

// ─── LOG MOOD ───────────────────────────────────
export async function logMood(data: {
  mood: number
  energy: number
  focus: number
  journal?: string
}): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    if (data.mood < 1 || data.mood > 5 || data.energy < 1 || data.energy > 5 || data.focus < 1 || data.focus > 5) {
      return { success: false, error: 'Ratings must be between 1 and 5' }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const moodLog = await prisma.moodLog.upsert({
      where: {
        date: today,
      },
      create: {
        userId: session.user.id,
        date: today,
        mood: data.mood,
        energy: data.energy,
        focus: data.focus,
        journal: data.journal || null,
      },
      update: {
        mood: data.mood,
        energy: data.energy,
        focus: data.focus,
        journal: data.journal || null,
      },
    })

    revalidatePath('/habits')
    return { success: true, data: moodLog }
  } catch (error) {
    console.error('logMood error:', error)
    return { success: false, error: 'Failed to log mood' }
  }
}

// ─── GET MOOD LOGS ──────────────────────────────
export async function getMoodLogs(
  startDate: string,
  endDate: string
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const logs = await prisma.moodLog.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: 'desc' },
    })

    return { success: true, data: logs }
  } catch (error) {
    console.error('getMoodLogs error:', error)
    return { success: false, error: 'Failed to fetch mood logs' }
  }
}
