import { z } from 'zod'

export const createContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  platform: z.enum(['LINKEDIN', 'INSTAGRAM', 'YOUTUBE', 'BLOG', 'NEWSLETTER', 'TWITTER']),
  status: z.enum(['IDEA', 'OUTLINE', 'DRAFT', 'EDIT', 'READY', 'PUBLISHED']).default('IDEA'),
  body: z.any().optional(),
  tags: z.array(z.string()).default([]),
  publishDate: z.string().datetime().optional().nullable(),
  metadata: z.any().optional(),
})

export const updateContentSchema = createContentSchema.partial()

export type CreateContentInput = z.infer<typeof createContentSchema>
export type UpdateContentInput = z.infer<typeof updateContentSchema>
