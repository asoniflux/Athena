'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createTaskSchema,
  updateTaskSchema,
  reorderTasksSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type ReorderTasksInput,
} from '@/lib/validations/task.schema'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─── GET TASKS ─────────────────────────────────
export async function getTasks(filters?: {
  status?: string
  priority?: string
  search?: string
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

    if (filters?.priority) {
      where.priority = filters.priority
    }

    if (filters?.search) {
      where.title = {
        contains: filters.search,
        mode: 'insensitive',
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      include: {
        project: {
          select: { id: true, name: true, color: true },
        },
      },
    })

    return { success: true, data: tasks }
  } catch (error) {
    console.error('getTasks error:', error)
    return { success: false, error: 'Failed to fetch tasks' }
  }
}

// ─── GET TASK BY ID ────────────────────────────
export async function getTaskById(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        project: {
          select: { id: true, name: true, color: true },
        },
        subtasks: {
          where: { deletedAt: null },
          orderBy: { position: 'asc' },
        },
      },
    })

    if (!task) {
      return { success: false, error: 'Task not found' }
    }

    return { success: true, data: task }
  } catch (error) {
    console.error('getTaskById error:', error)
    return { success: false, error: 'Failed to fetch task' }
  }
}

// ─── CREATE TASK ───────────────────────────────
export async function createTask(data: CreateTaskInput): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = createTaskSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const { dueDate, ...rest } = validated.data

    const task = await prisma.task.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: session.user.id,
      },
    })

    revalidatePath('/tasks')
    return { success: true, data: task }
  } catch (error) {
    console.error('createTask error:', error)
    return { success: false, error: 'Failed to create task' }
  }
}

// ─── UPDATE TASK ───────────────────────────────
export async function updateTask(
  id: string,
  data: UpdateTaskInput
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Verify ownership
    const existing = await prisma.task.findFirst({
      where: { id, userId: session.user.id, deletedAt: null },
    })

    if (!existing) {
      return { success: false, error: 'Task not found' }
    }

    const validated = updateTaskSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const { dueDate, ...rest } = validated.data

    const updateData: Record<string, unknown> = { ...rest }
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    })

    revalidatePath('/tasks')
    return { success: true, data: task }
  } catch (error) {
    console.error('updateTask error:', error)
    return { success: false, error: 'Failed to update task' }
  }
}

// ─── DELETE TASK (SOFT) ────────────────────────
export async function deleteTask(id: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Verify ownership
    const existing = await prisma.task.findFirst({
      where: { id, userId: session.user.id, deletedAt: null },
    })

    if (!existing) {
      return { success: false, error: 'Task not found' }
    }

    await prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    revalidatePath('/tasks')
    return { success: true, data: { id } }
  } catch (error) {
    console.error('deleteTask error:', error)
    return { success: false, error: 'Failed to delete task' }
  }
}

// ─── REORDER TASKS ─────────────────────────────
export async function reorderTasks(
  input: ReorderTasksInput
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = reorderTasksSchema.safeParse(input)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    // Verify all tasks belong to user
    const taskIds = validated.data.tasks.map((t) => t.id)
    const existingTasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
        userId: session.user.id,
        deletedAt: null,
      },
      select: { id: true },
    })

    if (existingTasks.length !== taskIds.length) {
      return { success: false, error: 'One or more tasks not found' }
    }

    // Bulk update in a transaction
    await prisma.$transaction(
      validated.data.tasks.map((task) =>
        prisma.task.update({
          where: { id: task.id },
          data: { status: task.status, position: task.position },
        })
      )
    )

    revalidatePath('/tasks')
    return { success: true, data: { updated: validated.data.tasks.length } }
  } catch (error) {
    console.error('reorderTasks error:', error)
    return { success: false, error: 'Failed to reorder tasks' }
  }
}
