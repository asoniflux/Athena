import { List, Sparkles, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { getTasks } from '@/app/actions/task.actions'
import { TaskList } from '../task-list'

export default async function TaskListPage() {
  const result = await getTasks()
  const tasks = result.success ? (result.data as Array<Record<string, unknown>>) : []

  return (
    <div className="flex h-full flex-col space-y-4 p-6">
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
        <Link
          href="/tasks"
          className="flex items-center gap-2 rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-3 py-2 text-sm text-[#9CA3AF] transition-colors hover:border-[#6366F1]/50 hover:text-[#F1F1F3]"
        >
          <CheckSquare className="h-4 w-4" />
          Board View
        </Link>
      </div>

      {/* AI Feature Banner */}
      <div className="rounded-lg border border-[#6366F1]/20 bg-[#6366F1]/5 px-3 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#6366F1]" />
          <p className="text-xs text-[#9CA3AF]">
            <span className="font-medium text-[#6366F1]">AI Sorting</span>{' '}
            &mdash; Intelligent task prioritization and deadline suggestions coming soon.
          </p>
        </div>
      </div>

      {/* Task List */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <TaskList tasks={tasks as any} />
    </div>
  )
}
