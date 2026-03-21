import { CheckSquare, Sparkles, List } from 'lucide-react'
import Link from 'next/link'
import { getTasks } from '@/app/actions/task.actions'
import { TaskBoard } from './task-board'

export default async function TasksPage() {
  const result = await getTasks()
  const tasks = result.success ? (result.data as Array<Record<string, unknown>>) : []

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
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
        <Link
          href="/tasks/list"
          className="flex items-center gap-2 rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-3 py-2 text-sm text-[#9CA3AF] transition-colors hover:border-[#6366F1]/50 hover:text-[#F1F1F3]"
        >
          <List className="h-4 w-4" />
          List View
        </Link>
      </div>

      {/* AI Feature Banner */}
      <div className="mb-4 rounded-lg border border-[#6366F1]/20 bg-[#6366F1]/5 px-3 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#6366F1]" />
          <p className="text-xs text-[#9CA3AF]">
            <span className="font-medium text-[#6366F1]">AI Task Assistant</span>{' '}
            &mdash; Auto-prioritization and smart scheduling coming soon.
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <TaskBoard tasks={tasks as any} />
    </div>
  )
}
