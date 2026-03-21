import { OLLAMA_MODELS } from './constants'

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'

interface OllamaGenerateRequest {
  model: string
  prompt: string
  system?: string
  stream?: boolean
  options?: {
    temperature?: number
    num_predict?: number
    top_p?: number
  }
}

interface OllamaGenerateResponse {
  model: string
  response: string
  done: boolean
}

interface OllamaEmbeddingRequest {
  model: string
  prompt: string
}

interface OllamaEmbeddingResponse {
  embedding: number[]
}

export async function ollamaGenerate(
  prompt: string,
  options?: {
    system?: string
    model?: keyof typeof OLLAMA_MODELS
    temperature?: number
    maxTokens?: number
  }
): Promise<string> {
  const model = OLLAMA_MODELS[options?.model || 'general']

  const body: OllamaGenerateRequest = {
    model,
    prompt,
    system: options?.system,
    stream: false,
    options: {
      temperature: options?.temperature ?? 0.7,
      num_predict: options?.maxTokens ?? 2048,
    },
  }

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as OllamaGenerateResponse
  return data.response
}

export async function ollamaGenerateStream(
  prompt: string,
  options?: {
    system?: string
    model?: keyof typeof OLLAMA_MODELS
    temperature?: number
    maxTokens?: number
  }
): Promise<ReadableStream<Uint8Array>> {
  const model = OLLAMA_MODELS[options?.model || 'general']

  const body: OllamaGenerateRequest = {
    model,
    prompt,
    system: options?.system,
    stream: true,
    options: {
      temperature: options?.temperature ?? 0.7,
      num_predict: options?.maxTokens ?? 2048,
    },
  }

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
  }

  if (!response.body) {
    throw new Error('No response body from Ollama')
  }

  return response.body
}

export async function ollamaEmbed(text: string): Promise<number[]> {
  const body: OllamaEmbeddingRequest = {
    model: OLLAMA_MODELS.embed,
    prompt: text,
  }

  const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Ollama embedding error: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as OllamaEmbeddingResponse
  return data.embedding
}

export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    })
    return response.ok
  } catch {
    return false
  }
}
