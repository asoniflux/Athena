import { BookOpen, Plus, Search, ChevronRight, FileText, Sparkles } from 'lucide-react'

export default function KnowledgePage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]/10">
            <BookOpen className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F1F1F3]">Knowledge Base</h1>
            <p className="text-sm text-[#9CA3AF]">
              Your personal wiki and notes organized in a page tree
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5558E3]">
          <Plus className="h-4 w-4" />
          New Page
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-3 py-2">
        <Search className="h-4 w-4 text-[#6B7280]" />
        <span className="text-sm text-[#6B7280]">Search knowledge base...</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Page Tree Sidebar */}
        <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-4">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[#6B7280]">
            Pages
          </h3>

          {/* Empty Page Tree */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[#6B7280]">
              <ChevronRight className="h-3 w-3" />
              <FileText className="h-4 w-4" />
              <span className="text-sm italic">No pages yet</span>
            </div>
          </div>

          <div className="mt-4 border-t border-[#2D2D3A] pt-4">
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#2D2D3A] py-2 text-sm text-[#6B7280] transition-colors hover:border-[#6366F1]/50 hover:text-[#9CA3AF]">
              <Plus className="h-4 w-4" />
              Add Page
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-[#6B7280]" />
            <h3 className="mb-2 text-lg font-medium text-[#F1F1F3]">
              Start Your Knowledge Base
            </h3>
            <p className="mb-6 max-w-md text-sm text-[#6B7280]">
              Create pages to organize your notes, research, and documentation.
              Pages support rich text, code blocks, and nested sub-pages.
            </p>
            <button className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5558E3]">
              <Plus className="h-4 w-4" />
              Create Your First Page
            </button>
          </div>
        </div>
      </div>

      {/* AI Feature Banner */}
      <div className="rounded-lg border border-[#6366F1]/20 bg-[#6366F1]/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#6366F1]" />
          <p className="text-sm text-[#9CA3AF]">
            <span className="font-medium text-[#6366F1]">AI Knowledge Assistant</span>{' '}
            &mdash; Semantic search, auto-linking, and AI-generated summaries coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}
