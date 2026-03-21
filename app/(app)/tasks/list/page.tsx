import { List, Plus, Search, Filter, Sparkles } from 'lucide-react'

export default function TaskListPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]/10">
            <List className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F1F1F3]">Task List</h1>
            <p className="text-sm text-[#9CA3AF]">
              View all your tasks in a sortable, filterable list
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5558E3]">
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-3 py-2">
          <Search className="h-4 w-4 text-[#6B7280]" />
          <span className="text-sm text-[#6B7280]">Search tasks...</span>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-3 py-2 text-sm text-[#9CA3AF] transition-colors hover:border-[#6366F1]/50">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Table Header */}
      <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24]">
        <div className="grid grid-cols-[1fr_120px_120px_120px_100px] gap-4 border-b border-[#2D2D3A] px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">Task</span>
          <span className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">Status</span>
          <span className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">Priority</span>
          <span className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">Due Date</span>
          <span className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">Assignee</span>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <List className="mb-3 h-10 w-10 text-[#6B7280]" />
          <h3 className="mb-1 text-sm font-medium text-[#F1F1F3]">No tasks yet</h3>
          <p className="mb-4 max-w-sm text-sm text-[#6B7280]">
            Create your first task to start organizing your work. Tasks can be assigned priorities, due dates, and labels.
          </p>
          <button className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5558E3]">
            <Plus className="h-4 w-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* AI Feature Banner */}
      <div className="rounded-lg border border-[#6366F1]/20 bg-[#6366F1]/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#6366F1]" />
          <p className="text-sm text-[#9CA3AF]">
            <span className="font-medium text-[#6366F1]">AI Sorting</span>{' '}
            &mdash; Intelligent task prioritization and deadline suggestions coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}
