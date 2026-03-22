'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, MicOff, X, Loader2, Check, AlertCircle, Volume2 } from 'lucide-react'
import { NAVIGATE_ROUTES, type VoiceProcessResult } from '@/lib/voice-commands'
import { toast } from 'sonner'

type VoiceState = 'idle' | 'listening' | 'processing' | 'success' | 'error'

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
        confidence: number
      }
      isFinal: boolean
    }
    length: number
  }
}

interface SpeechRecognitionErrorEvent {
  error: string
  message?: string
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

export function VoiceCommandButton() {
  const router = useRouter()
  const [state, setState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [result, setResult] = useState<VoiceProcessResult | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Check browser support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        setSupported(false)
      }
    }
  }, [])

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort()
      recognitionRef.current = null
    }
  }, [])

  const processTranscript = useCallback(async (text: string) => {
    setState('processing')
    setResult(null)

    try {
      const res = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to process command')
      }

      const data: VoiceProcessResult = await res.json()
      setResult(data)

      if (data.success) {
        setState('success')

        // Handle navigation
        if (data.intent.action === 'navigate') {
          const dest = (data.intent.params as { destination: string }).destination
          const route = NAVIGATE_ROUTES[dest]
          if (route) {
            toast.success(data.intent.response)
            setTimeout(() => {
              router.push(route)
              closePanel()
            }, 600)
            return
          }
        }

        // Handle queries - show results
        if (data.intent.action.startsWith('query_')) {
          const queryData = data.data as { summary?: string; tasks?: unknown[]; events?: unknown[]; ideas?: unknown[] }
          toast.info(data.intent.response)
          // Navigate to relevant page
          if (data.intent.action === 'query_tasks') {
            router.push('/tasks')
          } else if (data.intent.action === 'query_events') {
            router.push('/calendar')
          } else if (data.intent.action === 'query_ideas') {
            router.push('/ideas')
          }
          // Keep panel open to show summary
          if (queryData?.summary) {
            setResult(prev => prev ? { ...prev, data: queryData } : prev)
          }
          return
        }

        // Handle general_response
        if (data.intent.action === 'general_response') {
          toast.info((data.intent.params as { message: string }).message || data.intent.response)
          return
        }

        // Success for create/update actions
        toast.success(data.intent.response)
        router.refresh()

        // Auto-close after success
        timeoutRef.current = setTimeout(() => closePanel(), 2000)
      } else {
        setState('error')
        toast.error(data.error || 'Command failed')
      }
    } catch (err) {
      setState('error')
      const msg = err instanceof Error ? err.message : 'Failed to process command'
      toast.error(msg)
      setResult({ success: false, intent: { action: 'general_response', params: {}, confidence: 0, response: msg }, error: msg })
    }
  }, [router])

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in your browser. Try Chrome or Edge.')
      return
    }

    cleanup()
    setTranscript('')
    setInterimTranscript('')
    setResult(null)
    setShowPanel(true)

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setState('listening')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      if (final) {
        setTranscript(final)
        setInterimTranscript('')
      } else {
        setInterimTranscript(interim)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'no-speech') {
        setState('idle')
        toast.error('No speech detected. Try again.')
      } else if (event.error === 'not-allowed') {
        setState('error')
        toast.error('Microphone access denied. Please allow microphone access in your browser settings.')
      } else {
        setState('error')
        toast.error(`Speech error: ${event.error}`)
      }
    }

    recognition.onend = () => {
      // When recognition ends, process if we have a transcript
      setTranscript((prev) => {
        setInterimTranscript((interim) => {
          const finalText = prev || interim
          if (finalText.trim()) {
            // Use setTimeout to ensure state updates have been applied
            setTimeout(() => processTranscript(finalText.trim()), 0)
          } else {
            setState('idle')
          }
          return ''
        })
        return prev
      })
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [cleanup, processTranscript])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const closePanel = useCallback(() => {
    cleanup()
    setShowPanel(false)
    setState('idle')
    setTranscript('')
    setInterimTranscript('')
    setResult(null)
  }, [cleanup])

  const handleButtonClick = useCallback(() => {
    if (state === 'listening') {
      stopListening()
    } else if (state === 'idle' || state === 'success' || state === 'error') {
      startListening()
    }
  }, [state, startListening, stopListening])

  // Customizable keyboard shortcut
  const [shortcutLabel, setShortcutLabel] = useState('Ctrl+Shift+V')

  useEffect(() => {
    const saved = localStorage.getItem('athena-voice-shortcut')
    if (saved) setShortcutLabel(saved)

    const handleShortcutChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as string
      setShortcutLabel(detail)
    }
    window.addEventListener('athena-shortcut-changed', handleShortcutChange)
    return () => window.removeEventListener('athena-shortcut-changed', handleShortcutChange)
  }, [])

  useEffect(() => {
    function matchesShortcut(e: KeyboardEvent): boolean {
      const parts = shortcutLabel.split('+')
      const key = parts[parts.length - 1]
      const needsCtrl = parts.includes('Ctrl')
      const needsCmd = parts.includes('Cmd')
      const needsShift = parts.includes('Shift')
      const needsAlt = parts.includes('Alt')

      if (needsCtrl && !e.ctrlKey) return false
      if (needsCmd && !e.metaKey) return false
      if (needsShift && !e.shiftKey) return false
      if (needsAlt && !e.altKey) return false
      if (!needsCtrl && !needsCmd && (e.ctrlKey || e.metaKey)) return false
      if (!needsShift && e.shiftKey) return false
      if (!needsAlt && e.altKey) return false

      // Compare the actual key
      const pressedKey = e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toUpperCase() : e.key
      return pressedKey === key
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchesShortcut(e)) {
        e.preventDefault()
        handleButtonClick()
      }
      if (e.key === 'Escape' && showPanel) {
        closePanel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleButtonClick, showPanel, closePanel, shortcutLabel])

  if (!supported) return null

  const displayTranscript = transcript || interimTranscript

  return (
    <>
      {/* Floating Mic Button */}
      <button
        onClick={handleButtonClick}
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full
          flex items-center justify-center
          shadow-lg shadow-indigo-500/25
          transition-all duration-300 ease-out
          md:bottom-8 md:right-8
          ${state === 'listening'
            ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse'
            : state === 'processing'
            ? 'bg-amber-500 hover:bg-amber-600 cursor-wait'
            : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95'
          }
        `}
        title={`Voice Command (${shortcutLabel})`}
        aria-label="Voice command"
      >
        {state === 'listening' ? (
          <MicOff className="w-6 h-6 text-white" />
        ) : state === 'processing' ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}

        {/* Pulse rings when listening */}
        {state === 'listening' && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
            <span className="absolute -inset-1 rounded-full bg-red-500/20 animate-pulse" />
          </>
        )}
      </button>

      {/* Voice Command Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closePanel}
          />

          {/* Panel */}
          <div className="relative w-full max-w-lg mx-4 mb-4 md:mb-0 bg-[#1A1A24] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className={`
                  w-3 h-3 rounded-full
                  ${state === 'listening' ? 'bg-red-500 animate-pulse' :
                    state === 'processing' ? 'bg-amber-500 animate-pulse' :
                    state === 'success' ? 'bg-emerald-500' :
                    state === 'error' ? 'bg-red-500' :
                    'bg-gray-500'
                  }
                `} />
                <span className="text-sm font-medium text-white/90">
                  {state === 'listening' ? 'Listening...' :
                   state === 'processing' ? 'Processing...' :
                   state === 'success' ? 'Done!' :
                   state === 'error' ? 'Error' :
                   'Ready'
                  }
                </span>
              </div>
              <button
                onClick={closePanel}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-5 min-h-[120px]">
              {/* Waveform / Listening indicator */}
              {state === 'listening' && (
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-indigo-500 rounded-full animate-pulse"
                      style={{
                        height: `${12 + Math.random() * 24}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: `${0.5 + Math.random() * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Transcript display */}
              {displayTranscript && (
                <div className="mb-4">
                  <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wider">
                    You said:
                  </p>
                  <p className="text-white/90 text-lg leading-relaxed">
                    &ldquo;{displayTranscript}&rdquo;
                    {interimTranscript && !transcript && (
                      <span className="inline-block w-0.5 h-5 bg-indigo-500 animate-pulse ml-0.5 align-middle" />
                    )}
                  </p>
                </div>
              )}

              {/* Processing indicator */}
              {state === 'processing' && (
                <div className="flex items-center gap-3 text-white/60">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  <span className="text-sm">Understanding your command...</span>
                </div>
              )}

              {/* Result display */}
              {result && state !== 'processing' && (
                <div className={`
                  rounded-xl p-4 mt-2
                  ${result.success
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                  }
                `}>
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <Check className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${result.success ? 'text-emerald-300' : 'text-red-300'}`}>
                        {result.success ? result.intent.response : (result.error || 'Something went wrong')}
                      </p>

                      {/* Query results */}
                      {result.success && !!result.data && result.intent.action.startsWith('query_') && (
                        <div className="mt-3 space-y-1.5">
                          {(result.data as { summary?: string }).summary && (
                            <pre className="text-xs text-white/60 whitespace-pre-wrap font-sans">
                              {(result.data as { summary: string }).summary}
                            </pre>
                          )}
                        </div>
                      )}

                      {/* General response */}
                      {result.intent.action === 'general_response' && (
                        <p className="mt-1 text-xs text-white/50">
                          {(result.intent.params as { message?: string }).message}
                        </p>
                      )}

                      {/* Action badge */}
                      {result.intent.action !== 'general_response' && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/40 uppercase tracking-wider">
                            {result.intent.action.replace(/_/g, ' ')}
                          </span>
                          {result.intent.confidence < 0.7 && (
                            <span className="text-[10px] text-amber-400/60">
                              Low confidence
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {state === 'idle' && !displayTranscript && !result && (
                <div className="text-center py-4">
                  <Volume2 className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">
                    Click the mic button or press <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] font-mono">{shortcutLabel}</kbd> to start
                  </p>
                  <p className="text-white/25 text-xs mt-2">
                    Try: &ldquo;Add a task to review PRs&rdquo; or &ldquo;New idea: mobile app redesign&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-white/25 uppercase tracking-wider">
                Athena Voice
              </span>
              <div className="flex items-center gap-2">
                {(state === 'success' || state === 'error') && (
                  <button
                    onClick={startListening}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    Try again
                  </button>
                )}
                {state === 'listening' && (
                  <button
                    onClick={stopListening}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600/80 hover:bg-red-500 text-white transition-colors"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
