import { PenTool, Plus, Sparkles } from 'lucide-react'

const columns = ['Ideas', 'Drafting', 'Editing', 'Scheduled', 'Published'] as const

const columnColors: Record<string, string> = {
  Ideas: 'bg-[#F59E0B]',
  Drafting: 'bg-[#3B82F6]',
  Editing: 'bg-[#8B5CF6]',
  Scheduled: 'bg-[#6366F1]',
  Published: 'bg-[#10B981]',
}

export default function ContentPage() {
  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]/10">
            <PenTool className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F1F1F3]">Content Studio</h1>
            <p className="text-sm text-[#9CA3AF]">
              Plan, create, and publish content across platforms
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5558E3]">
          <Plus className="h-4 w-4" />
          New Content
        </button>
      </div>

      {/* AI Feature Banner */}
      <div className="mb-6 rounded-lg border border-[#6366F1]/20 bg-[#6366F1]/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#6366F1]" />
          <p className="text-sm text-[#9CA3AF]">
            <span className="font-medium text-[#6366F1]">AI Content Writer</span>{' '}
            &mdash; AI-powered drafting, repurposing, and SEO optimization coming soon.
          </p>
        </div>
      </div>

      {/* Content Pipeline */}
      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column}
            className="flex w-64 flex-shrink-0 flex-col rounded-xl border border-[#2D2D3A] bg-[#1A1A24]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-[#2D2D3A] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${columnColors[column]}`} />
                <h3 className="text-sm font-semibold text-[#F1F1F3]">{column}</h3>
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#2D2D3A] px-1.5 text-xs text-[#6B7280]">
                  0
                </span>
              </div>
              <button className="rounded p-1 text-[#6B7280] transition-colors hover:bg-[#2D2D3A] hover:text-[#F1F1F3]">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Column Body */}
            <div className="flex flex-1 flex-col items-center justify-center p-4">
              <div className="w-full rounded-lg border border-dashed border-[#2D2D3A] p-4 text-center">
                <p className="text-xs text-[#6B7280]">
                  No content in this stage
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
