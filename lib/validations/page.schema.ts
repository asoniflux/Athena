import { z } from 'zod'

export const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  parentId: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  content: z.any().optional(),
  tags: z.array(z.string()).default([]),
  isTemplate: z.boolean().default(false),
})

export const updatePageSchema = createPageSchema.partial()

export type CreatePageInput = z.infer<typeof createPageSchema>
export type UpdatePageInput = z.infer<typeof updatePageSchema>
