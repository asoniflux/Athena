import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AIService } from '@/services/ai.service'
import { buildSystemPrompt, type VoiceIntent, type VoiceProcessResult } from '@/lib/voice-commands'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { transcript } = await req.json()
    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 })
    }

    // Check AI availability
    const available = await AIService.isAvailable()
    if (!available) {
      return NextResponse.json(
        { error: 'AI service unavailable. Please make sure Ollama is running.' },
        { status: 503 }
      )
    }

    // Parse intent with AI
    const systemPrompt = buildSystemPrompt()
    const response = await AIService.generate({
      prompt: transcript,
      systemPrompt,
      model: 'general',
      temperature: 0.1, // Low temp for structured output
    })

    // Parse the JSON response
    let intent: VoiceIntent
    try {
      // Strip any markdown code fences if present
      let content = response.content.trim()
      content = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '')
      intent = JSON.parse(content)
    } catch {
      return NextResponse.json({
        success: true,
        intent: {
          action: 'general_response',
          params: { message: response.content },
          confidence: 0.3,
          response: 'I couldn\'t parse that command. Try saying something like "Add a task to..." or "New idea: ..."',
        },
        data: null,
      } satisfies VoiceProcessResult)
    }

    // Execute the action
    const result = await executeAction(intent, session.user.id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Voice process error:', error)
    return NextResponse.json({ error: 'Failed to process voice command' }, { status: 500 })
  }
}

async function executeAction(intent: VoiceIntent, userId: string): Promise<VoiceProcessResult> {
  const { action, params } = intent

  try {
    switch (action) {
      case 'create_task': {
        const p = params as { title: string; priority?: string; status?: string; dueDate?: string; tags?: string[]; description?: string }
        const task = await prisma.task.create({
          data: {
            userId,
            title: p.title,
            priority: (p.priority as 'P1' | 'P2' | 'P3' | 'P4') || 'P3',
            status: (p.status as 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE') || 'TODO',
            dueDate: p.dueDate ? new Date(p.dueDate + 'T23:59:59Z') : null,
            tags: p.tags || [],
            description: p.description || undefined,
          },
        })
        revalidatePath('/tasks')
        revalidatePath('/dashboard')
        return { success: true, intent, data: { id: task.id, title: task.title } }
      }

      case 'complete_task': {
        const p = params as { searchTerm: string }
        const task = await prisma.task.findFirst({
          where: {
            userId,
            deletedAt: null,
            title: { contains: p.searchTerm, mode: 'insensitive' },
            status: { not: 'DONE' },
          },
        })
        if (!task) {
          return {
            success: false,
            intent,
            error: `No active task found matching "${p.searchTerm}"`,
          }
        }
        await prisma.task.update({
          where: { id: task.id },
          data: { status: 'DONE' },
        })
        revalidatePath('/tasks')
        revalidatePath('/dashboard')
        intent.response = `Completed: ${task.title}`
        return { success: true, intent, data: { id: task.id, title: task.title } }
      }

      case 'update_task': {
        const p = params as { searchTerm: string; updates: Record<string, string> }
        const task = await prisma.task.findFirst({
          where: {
            userId,
            deletedAt: null,
            title: { contains: p.searchTerm, mode: 'insensitive' },
          },
        })
        if (!task) {
          return { success: false, intent, error: `No task found matching "${p.searchTerm}"` }
        }
        const updateData: Record<string, unknown> = {}
        if (p.updates.status) updateData.status = p.updates.status
        if (p.updates.priority) updateData.priority = p.updates.priority
        if (p.updates.title) updateData.title = p.updates.title
        if (p.updates.dueDate) updateData.dueDate = new Date(p.updates.dueDate + 'T23:59:59Z')
        await prisma.task.update({ where: { id: task.id }, data: updateData })
        revalidatePath('/tasks')
        revalidatePath('/dashboard')
        intent.response = `Updated: ${task.title}`
        return { success: true, intent, data: { id: task.id, title: task.title } }
      }

      case 'create_idea': {
        const p = params as { title: string; description?: string; category?: string; tags?: string[] }
        const idea = await prisma.idea.create({
          data: {
            userId,
            title: p.title,
            description: p.description || undefined,
            category: p.category || null,
            status: 'RAW',
            tags: p.tags || [],
          },
        })
        revalidatePath('/ideas')
        return { success: true, intent, data: { id: idea.id, title: idea.title } }
      }

      case 'create_event': {
        const p = params as { title: string; date: string; startTime?: string; endTime?: string; allDay?: boolean; category?: string; location?: string; notes?: string }
        let startTime: Date
        let endTime: Date

        if (p.allDay || (!p.startTime && !p.endTime)) {
          startTime = new Date(p.date + 'T00:00:00')
          endTime = new Date(p.date + 'T23:59:59')
        } else {
          startTime = new Date(`${p.date}T${p.startTime || '09:00'}:00`)
          endTime = new Date(`${p.date}T${p.endTime || '10:00'}:00`)
        }

        const event = await prisma.calendarEvent.create({
          data: {
            userId,
            title: p.title,
            startTime,
            endTime,
            allDay: p.allDay || (!p.startTime && !p.endTime),
            category: (p.category as 'MEETING' | 'DEEP_WORK' | 'PERSONAL' | 'CONTENT' | 'ADMIN' | 'HEALTH' | 'SOCIAL') || 'MEETING',
            location: p.location || undefined,
            notes: p.notes || undefined,
          },
        })
        revalidatePath('/calendar')
        revalidatePath('/dashboard')
        return { success: true, intent, data: { id: event.id, title: event.title } }
      }

      case 'create_habit': {
        const p = params as { name: string; category?: string; frequency?: string }
        const habit = await prisma.habit.create({
          data: {
            userId,
            name: p.name,
            category: (p.category as 'HEALTH' | 'PRODUCTIVITY' | 'LEARNING' | 'MINDFULNESS' | 'BUSINESS' | 'SOCIAL' | 'CREATIVE') || 'PRODUCTIVITY',
            frequency: (p.frequency as 'DAILY' | 'SPECIFIC_DAYS' | 'X_PER_WEEK') || 'DAILY',
          },
        })
        revalidatePath('/habits')
        return { success: true, intent, data: { id: habit.id, name: habit.name } }
      }

      case 'toggle_habit': {
        const p = params as { searchTerm: string }
        const habit = await prisma.habit.findFirst({
          where: {
            userId,
            isActive: true,
            name: { contains: p.searchTerm, mode: 'insensitive' },
          },
        })
        if (!habit) {
          return { success: false, intent, error: `No habit found matching "${p.searchTerm}"` }
        }
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const existingLog = await prisma.habitLog.findFirst({
          where: { habitId: habit.id, date: today },
        })
        if (existingLog) {
          await prisma.habitLog.update({
            where: { id: existingLog.id },
            data: { completed: !existingLog.completed },
          })
        } else {
          await prisma.habitLog.create({
            data: { habitId: habit.id, date: today, completed: true },
          })
        }
        revalidatePath('/habits')
        revalidatePath('/dashboard')
        intent.response = `Toggled habit: ${habit.name}`
        return { success: true, intent, data: { id: habit.id, name: habit.name } }
      }

      case 'create_content': {
        const p = params as { title: string; platform: string; body?: string; tags?: string[] }
        const content = await prisma.contentPiece.create({
          data: {
            userId,
            title: p.title,
            platform: (p.platform as 'LINKEDIN' | 'INSTAGRAM' | 'YOUTUBE' | 'BLOG' | 'NEWSLETTER' | 'TWITTER') || 'BLOG',
            status: 'IDEA',
            body: p.body || undefined,
            tags: p.tags || [],
          },
        })
        revalidatePath('/content')
        return { success: true, intent, data: { id: content.id, title: content.title } }
      }

      case 'create_page': {
        const p = params as { title: string; content?: string; tags?: string[] }
        const page = await prisma.page.create({
          data: {
            userId,
            title: p.title,
            content: p.content || undefined,
            tags: p.tags || [],
          },
        })
        revalidatePath('/knowledge')
        return { success: true, intent, data: { id: page.id, title: page.title } }
      }

      case 'query_tasks': {
        const tasks = await prisma.task.findMany({
          where: {
            userId,
            deletedAt: null,
            status: { not: 'DONE' },
          },
          orderBy: [{ dueDate: 'asc' }, { priority: 'asc' }],
          take: 10,
        })

        const p = params as { filter?: { dueDateRange?: string; status?: string; priority?: string } }
        let filtered = tasks

        if (p.filter?.dueDateRange === 'today') {
          const todayStart = new Date()
          todayStart.setHours(0, 0, 0, 0)
          const todayEnd = new Date()
          todayEnd.setHours(23, 59, 59, 999)
          filtered = tasks.filter(
            (t) => t.dueDate && t.dueDate >= todayStart && t.dueDate <= todayEnd
          )
        }

        if (p.filter?.status) {
          filtered = filtered.filter((t) => t.status === p.filter!.status)
        }

        const summary = filtered.length === 0
          ? 'No tasks found matching your criteria.'
          : filtered
              .map((t) => `- ${t.title} [${t.priority}] ${t.dueDate ? `due ${t.dueDate.toLocaleDateString()}` : ''}`)
              .join('\n')

        intent.response = `Found ${filtered.length} task(s)`
        return { success: true, intent, data: { tasks: filtered, summary } }
      }

      case 'query_events': {
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const todayEnd = new Date()
        todayEnd.setHours(23, 59, 59, 999)

        const events = await prisma.calendarEvent.findMany({
          where: {
            userId,
            deletedAt: null,
            startTime: { gte: todayStart, lte: todayEnd },
          },
          orderBy: { startTime: 'asc' },
        })

        const summary = events.length === 0
          ? 'No events scheduled for today.'
          : events.map((e) => `- ${e.title} at ${e.startTime.toLocaleTimeString()}`).join('\n')

        intent.response = `Found ${events.length} event(s) today`
        return { success: true, intent, data: { events, summary } }
      }

      case 'query_ideas': {
        const ideas = await prisma.idea.findMany({
          where: { userId, deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })

        intent.response = `Found ${ideas.length} idea(s)`
        return { success: true, intent, data: { ideas } }
      }

      case 'navigate': {
        // Navigation is handled client-side
        return { success: true, intent }
      }

      case 'general_response': {
        return { success: true, intent }
      }

      default:
        return {
          success: false,
          intent,
          error: `Unknown action: ${action}`,
        }
    }
  } catch (error) {
    console.error(`Action ${action} failed:`, error)
    return {
      success: false,
      intent,
      error: `Failed to execute ${action}`,
    }
  }
}
