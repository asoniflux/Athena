import { CheckSquare, Plus, Sparkles } from 'lucide-react'

const columns = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'] as const

export default function TasksPage() {
  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]/10">
            <CheckSquare className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F1F1F3]">Task Manager</h1>
            <p className="text-sm text-[#9CA3AF]">
              Organize and track your tasks across projects
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5558E3]">
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* AI Feature Banner */}
      <div className="mb-6 rounded-lg border border-[#6366F1]/20 bg-[#6366F1]/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#6366F1]" />
          <p className="text-sm text-[#9CA3AF]">
            <span className="font-medium text-[#6366F1]">AI Task Assistant</span>{' '}
            &mdash; Auto-prioritization, smart scheduling, and task breakdown coming soon.
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column}
            className="flex w-72 flex-shrink-0 flex-col rounded-xl border border-[#2D2D3A] bg-[#1A1A24]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-[#2D2D3A] px-4 py-3">
              <div className="flex items-center gap-2">
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
              {/* Placeholder Card */}
              <div className="w-full rounded-lg border border-dashed border-[#2D2D3A] p-4 text-center">
                <p className="text-xs text-[#6B7280]">
                  Drag tasks here or click + to add
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
