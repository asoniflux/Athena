'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  MessageSquare,
  Plus,
  Sparkles,
  Send,
  Star,
  Trash2,
  Search,
  Loader2,
  AlertCircle,
  Bot,
  User,
} from 'lucide-react'
import {
  getConversations,
  getConversation,
  deleteConversation,
  starConversation,
} from '@/app/actions/chat.actions'

interface Message {
  id: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
  createdAt: string
}

interface Conversation {
  id: string
  title: string
  isStarred: boolean
  updatedAt: string
  messages: Message[]
}

export default function ChatView() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  async function loadConversations() {
    const result = await getConversations()
    if (result.success) {
      setConversations(result.data as Conversation[])
    }
  }

  async function loadConversation(id: string) {
    const result = await getConversation(id)
    if (result.success) {
      const convo = result.data as Conversation & { messages: Message[] }
      setActiveConversationId(id)
      setMessages(convo.messages)
      setError(null)
    }
  }

  function startNewChat() {
    setActiveConversationId(null)
    setMessages([])
    setError(null)
    setInput('')
    inputRef.current?.focus()
  }

  async function handleSend(messageText?: string) {
    const text = messageText || input.trim()
    if (!text || isStreaming) return

    setInput('')
    setError(null)

    // Add user message optimistically
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content: text,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsStreaming(true)

    // Add placeholder for assistant
    const assistantMessage: Message = {
      id: `temp-assistant-${Date.now()}`,
      role: 'ASSISTANT',
      content: '',
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId: activeConversationId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let accumulatedContent = ''
      let newConvoId: string | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n').filter(Boolean)

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))

            if (data.conversationId && !newConvoId) {
              newConvoId = data.conversationId
            }

            if (data.token) {
              accumulatedContent += data.token
              setMessages((prev) => {
                const updated = [...prev]
                const lastMsg = updated[updated.length - 1]
                if (lastMsg && lastMsg.role === 'ASSISTANT') {
                  updated[updated.length - 1] = { ...lastMsg, content: accumulatedContent }
                }
                return updated
              })
            }

            if (data.done && newConvoId) {
              if (!activeConversationId) {
                setActiveConversationId(newConvoId)
              }
              await loadConversations()
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((m) => m.content !== '' || m.role !== 'ASSISTANT'))
    } finally {
      setIsStreaming(false)
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteConversation(id)
    if (result.success) {
      if (activeConversationId === id) {
        startNewChat()
      }
      await loadConversations()
    }
  }

  async function handleStar(id: string) {
    await starConversation(id)
    await loadConversations()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const starredConversations = filteredConversations.filter((c) => c.isStarred)
  const regularConversations = filteredConversations.filter((c) => !c.isStarred)

  const suggestedPrompts = [
    'Help me plan my day',
    'Brainstorm ideas for...',
    'Summarize my tasks',
  ]

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="hidden md:flex w-72 flex-col border-r border-[#2D2D3A] bg-[#1A1A24]">
          <div className="p-4">
            <button
              onClick={startNewChat}
              className="flex w-full items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#818CF8] transition"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 rounded-lg border border-[#2D2D3A] bg-[#0F0F14] px-3 py-2">
              <Search className="h-3.5 w-3.5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-[#F1F1F3] placeholder-[#6B7280] outline-none"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {/* Starred */}
            {starredConversations.length > 0 && (
              <div className="mb-3">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Starred
                </p>
                {starredConversations.map((convo) => (
                  <ConversationItem
                    key={convo.id}
                    conversation={convo}
                    isActive={convo.id === activeConversationId}
                    onClick={() => loadConversation(convo.id)}
                    onDelete={() => handleDelete(convo.id)}
                    onStar={() => handleStar(convo.id)}
                  />
                ))}
              </div>
            )}

            {/* Regular */}
            {regularConversations.length > 0 && (
              <div>
                {starredConversations.length > 0 && (
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Recent
                  </p>
                )}
                {regularConversations.map((convo) => (
                  <ConversationItem
                    key={convo.id}
                    conversation={convo}
                    isActive={convo.id === activeConversationId}
                    onClick={() => loadConversation(convo.id)}
                    onDelete={() => handleDelete(convo.id)}
                    onStar={() => handleStar(convo.id)}
                  />
                ))}
              </div>
            )}

            {filteredConversations.length === 0 && (
              <p className="px-2 py-4 text-xs text-[#6B7280]">
                {searchQuery ? 'No matching conversations' : 'No conversations yet'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header for mobile */}
        <div className="flex items-center gap-2 border-b border-[#2D2D3A] px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-[#9CA3AF] hover:bg-[#2D2D3A]"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-[#F1F1F3]">
            {activeConversationId ? 'Chat' : 'New Chat'}
          </span>
        </div>

        {/* Messages or Empty State */}
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6366F1]/10">
              <Sparkles className="h-8 w-8 text-[#6366F1]" />
            </div>
            <h2 className="text-xl font-semibold text-[#F1F1F3]">Athena AI Chat</h2>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              Ask anything about your tasks, files, or knowledge base
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-4 py-3 text-left text-sm text-[#9CA3AF] hover:bg-[#242430] hover:text-[#F1F1F3] transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ASSISTANT' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6366F1]/10">
                    <Bot className="h-4 w-4 text-[#6366F1]" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'USER'
                      ? 'bg-[#6366F1] text-white'
                      : 'bg-[#1A1A24] text-[#F1F1F3] border border-[#2D2D3A]'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                  {msg.role === 'ASSISTANT' && msg.content === '' && isStreaming && (
                    <div className="flex items-center gap-1 py-1">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6366F1]" style={{ animationDelay: '0ms' }} />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6366F1]" style={{ animationDelay: '150ms' }} />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6366F1]" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
                {msg.role === 'USER' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2D2D3A]">
                    <User className="h-4 w-4 text-[#9CA3AF]" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-[#2D2D3A] p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Athena anything..."
                rows={1}
                className="w-full resize-none rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-4 py-3 text-sm text-[#F1F1F3] placeholder-[#6B7280] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] max-h-32"
                disabled={isStreaming}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              className="rounded-lg bg-[#6366F1] px-4 py-3 text-white hover:bg-[#818CF8] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-[#6B7280]">
            Athena AI powered by Ollama - Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete,
  onStar,
}: {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
  onDelete: () => void
  onStar: () => void
}) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition ${
        isActive
          ? 'bg-[#6366F1]/10 text-[#F1F1F3]'
          : 'text-[#9CA3AF] hover:bg-[#242430] hover:text-[#F1F1F3]'
      }`}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 truncate text-xs">{conversation.title}</span>
      {(showActions || conversation.isStarred) && (
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onStar()
            }}
            className={`rounded p-1 transition ${
              conversation.isStarred ? 'text-yellow-400' : 'text-[#6B7280] hover:text-yellow-400'
            }`}
          >
            <Star className="h-3 w-3" fill={conversation.isStarred ? 'currentColor' : 'none'} />
          </button>
          {showActions && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="rounded p-1 text-[#6B7280] hover:text-red-400 transition"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
