import { MessageSquare, Plus, Sparkles } from 'lucide-react'

export default function ChatPage() {
  return (
    <div className="flex h-full">
      {/* Conversation Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r border-[#2D2D3A] bg-[#1A1A24]">
        <div className="p-4">
          <button className="flex w-full items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#818CF8] transition">
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          <p className="px-2 py-4 text-xs text-[#6B7280]">No conversations yet</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Empty State */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6366F1]/10">
            <Sparkles className="h-8 w-8 text-[#6366F1]" />
          </div>
          <h2 className="text-xl font-semibold text-[#F1F1F3]">Athena AI Chat</h2>
          <p className="mt-1 text-sm text-[#9CA3AF]">Ask anything about your tasks, files, or knowledge base</p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {[
              'Summarize my tasks for this week',
              'What are my top priorities?',
              'Find notes about project planning',
              'Help me brainstorm ideas',
            ].map((suggestion) => (
              <button
                key={suggestion}
                className="rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-4 py-3 text-left text-sm text-[#9CA3AF] hover:bg-[#242430] transition"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-[#2D2D3A] p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ask Athena anything..."
                className="w-full rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-4 py-3 text-sm text-[#F1F1F3] placeholder-[#6B7280] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                disabled
              />
            </div>
            <button
              className="rounded-lg bg-[#6366F1] px-4 py-3 text-white hover:bg-[#818CF8] transition disabled:opacity-50"
              disabled
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-[#6B7280]">Connect Ollama to start chatting with AI</p>
        </div>
      </div>
    </div>
  )
}
