import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AIService } from '@/services/ai.service'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationId } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check if Ollama is available
    const available = await AIService.isAvailable()
    if (!available) {
      return NextResponse.json(
        { error: 'AI service is currently unavailable. Please make sure Ollama is running.' },
        { status: 503 }
      )
    }

    // Get or create conversation
    let convoId = conversationId
    if (!convoId) {
      const title = message.length > 50 ? message.slice(0, 50) + '...' : message
      const conversation = await prisma.chatConversation.create({
        data: {
          userId: session.user.id,
          title,
        },
      })
      convoId = conversation.id
    } else {
      // Verify ownership
      const existing = await prisma.chatConversation.findFirst({
        where: { id: convoId, userId: session.user.id, deletedAt: null },
      })
      if (!existing) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        conversationId: convoId,
        role: 'USER',
        content: message,
      },
    })

    // Get conversation history for context
    const history = await prisma.chatMessage.findMany({
      where: { conversationId: convoId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    })

    const contextMessages = history.map((m) => `${m.role}: ${m.content}`).join('\n')

    // Stream response from Ollama
    const ollamaStream = await AIService.stream({
      prompt: message,
      systemPrompt:
        'You are Athena, a helpful AI assistant. You help users manage their tasks, organize knowledge, and brainstorm ideas. Be concise, friendly, and helpful. Use markdown formatting when appropriate.',
      context: contextMessages ? [contextMessages] : undefined,
      temperature: 0.7,
    })

    let fullResponse = ''

    // Create a TransformStream to capture and forward the response
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true })
        // Ollama streams JSON lines
        const lines = text.split('\n').filter(Boolean)
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line)
            if (parsed.response) {
              fullResponse += parsed.response
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: parsed.response, conversationId: convoId })}\n\n`))
            }
            if (parsed.done) {
              // Save the full assistant response to DB
              await prisma.chatMessage.create({
                data: {
                  conversationId: convoId,
                  role: 'ASSISTANT',
                  content: fullResponse,
                  model: 'general',
                },
              })

              // Update conversation updatedAt
              await prisma.chatConversation.update({
                where: { id: convoId },
                data: { updatedAt: new Date() },
              })

              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, conversationId: convoId })}\n\n`))
            }
          } catch {
            // Skip malformed lines
          }
        }
      },
    })

    const responseStream = ollamaStream.pipeThrough(transformStream)

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
