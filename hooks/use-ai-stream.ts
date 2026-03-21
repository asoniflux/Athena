'use client'

import { useState, useCallback } from 'react'

interface UseAIStreamOptions {
  onComplete?: (content: string) => void
  onError?: (error: Error) => void
}

interface UseAIStreamReturn {
  content: string
  isStreaming: boolean
  error: string | null
  startStream: (url: string, body: Record<string, unknown>) => Promise<void>
  reset: () => void
}

export function useAIStream(options?: UseAIStreamOptions): UseAIStreamReturn {
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setContent('')
    setIsStreaming(false)
    setError(null)
  }, [])

  const startStream = useCallback(async (url: string, body: Record<string, unknown>) => {
    setContent('')
    setIsStreaming(true)
    setError(null)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.response) {
                accumulated += parsed.response
                setContent(accumulated)
              }
            } catch {
              // Skip unparseable lines
            }
          }
        }
      }

      options?.onComplete?.(accumulated)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Stream failed'
      setError(errorMsg)
      options?.onError?.(err instanceof Error ? err : new Error(errorMsg))
    } finally {
      setIsStreaming(false)
    }
  }, [options])

  return { content, isStreaming, error, startStream, reset }
}
