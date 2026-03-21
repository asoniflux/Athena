import { ollamaGenerate, ollamaGenerateStream, ollamaEmbed, isOllamaAvailable } from '@/lib/ollama'
import { OLLAMA_MODELS } from '@/lib/constants'

type ModelType = keyof typeof OLLAMA_MODELS

interface AIRequest {
  prompt: string
  systemPrompt?: string
  model?: ModelType
  stream?: boolean
  context?: string[]
  maxTokens?: number
  temperature?: number
}

interface AIResponse {
  content: string
  model: string
}

// Centralized AI service — all AI calls flow through here
export class AIService {
  // Check if AI is available
  static async isAvailable(): Promise<boolean> {
    return isOllamaAvailable()
  }

  // Generate a complete response
  static async generate(request: AIRequest): Promise<AIResponse> {
    const model = request.model || 'general'
    let prompt = request.prompt

    // Inject RAG context if provided
    if (request.context && request.context.length > 0) {
      const contextStr = request.context.join('\n\n---\n\n')
      prompt = `Context:\n${contextStr}\n\nQuestion/Task: ${prompt}`
    }

    // Truncate to fit context window (~8K tokens for Llama 8B)
    const maxPromptChars = 6000 * 4 // rough char-to-token ratio
    if (prompt.length > maxPromptChars) {
      prompt = prompt.slice(0, maxPromptChars) + '\n\n[Context truncated]'
    }

    const content = await ollamaGenerate(prompt, {
      system: request.systemPrompt,
      model,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
    })

    return {
      content,
      model: OLLAMA_MODELS[model],
    }
  }

  // Generate a streaming response
  static async stream(request: AIRequest): Promise<ReadableStream<Uint8Array>> {
    const model = request.model || 'general'
    let prompt = request.prompt

    if (request.context && request.context.length > 0) {
      const contextStr = request.context.join('\n\n---\n\n')
      prompt = `Context:\n${contextStr}\n\nQuestion/Task: ${prompt}`
    }

    const maxPromptChars = 6000 * 4
    if (prompt.length > maxPromptChars) {
      prompt = prompt.slice(0, maxPromptChars) + '\n\n[Context truncated]'
    }

    return ollamaGenerateStream(prompt, {
      system: request.systemPrompt,
      model,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
    })
  }

  // Generate embeddings for text
  static async embed(text: string): Promise<number[]> {
    return ollamaEmbed(text)
  }

  // Generate embeddings for multiple texts
  static async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => ollamaEmbed(text)))
  }
}
