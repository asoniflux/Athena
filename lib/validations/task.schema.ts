import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.any().optional(),
  projectId: z.string().optional(),
  parentTaskId: z.string().optional(),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).default('BACKLOG'),
  priority: z.enum(['P1', 'P2', 'P3', 'P4']).default('P3'),
  dueDate: z.string().datetime().optional().nullable(),
  estimatedMinutes: z.number().int().positive().optional().nullable(),
  tags: z.array(z.string()).default([]),
  position: z.number().optional(),
})

export const updateTaskSchema = createTaskSchema.partial()

export const reorderTasksSchema = z.object({
  tasks: z.array(z.object({
    id: z.string(),
    status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
    position: z.number(),
  })),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type ReorderTasksInput = z.infer<typeof reorderTasksSchema>
