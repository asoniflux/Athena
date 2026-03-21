'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  Calendar,
  List,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TASK_STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/constants'
import { deleteTask } from '@/app/actions/task.actions'
import { TaskDialog, type TaskData } from './task-dialog'
import type { TaskStatus, Priority } from '@prisma/client'

interface TaskWithProject {
  id: string
  title: string
  description: unknown
  status: TaskStatus
  priority: Priority
  dueDate: string | null
  tags: string[]
  position: number
  projectId: string | null
  project: { id: string; name: string; color: string } | null
  createdAt: string
}

interface TaskListProps {
  tasks: TaskWithProject[]
}

const PRIORITY_COLORS: Record<Priority, string> = {
  P1: 'border-red-500/30 bg-red-500/10 text-red-400',
  P2: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  P3: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  P4: 'border-gray-500/30 bg-gray-500/10 text-gray-400',
}

const STATUS_DOT_COLORS: Record<TaskStatus, string> = {
  BACKLOG: 'bg-gray-500',
  TODO: 'bg-slate-400',
  IN_PROGRESS: 'bg-blue-500',
  REVIEW: 'bg-amber-500',
  DONE: 'bg-emerald-500',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getDueDateColor(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'text-red-400'
  if (diffDays <= 1) return 'text-amber-400'
  return 'text-[#9CA3AF]'
}

export function TaskList({ tasks }: TaskListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskData | null>(null)

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (search && !task.title.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (statusFilter !== 'ALL' && task.status !== statusFilter) {
        return false
      }
      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
        return false
      }
      return true
    })
  }, [tasks, search, statusFilter, priorityFilter])

  const handleNewTask = () => {
    setEditingTask(null)
    setDialogOpen(true)
  }

  const handleEditTask = (task: TaskWithProject) => {
    setEditingTask({
      id: task.id,
      title: task.title,
      description: task.description as string | null | Record<string, unknown>,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: task.tags,
      projectId: task.projectId,
    })
    setDialogOpen(true)
  }

  const handleDelete = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation()
    startTransition(async () => {
      await deleteTask(taskId)
      router.refresh()
    })
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-[#2D2D3A] bg-[#1A1A24] pl-9 text-[#F1F1F3] placeholder:text-[#6B7280]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] border-[#2D2D3A] bg-[#1A1A24] text-[#F1F1F3]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="border-[#2D2D3A] bg-[#1A1A24]">
            <SelectItem value="ALL" className="text-[#F1F1F3]">
              All Status
            </SelectItem>
            {(Object.keys(TASK_STATUS_CONFIG) as TaskStatus[]).map((key) => (
              <SelectItem key={key} value={key} className="text-[#F1F1F3]">
                {TASK_STATUS_CONFIG[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px] border-[#2D2D3A] bg-[#1A1A24] text-[#F1F1F3]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="border-[#2D2D3A] bg-[#1A1A24]">
            <SelectItem value="ALL" className="text-[#F1F1F3]">
              All Priority
            </SelectItem>
            {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((key) => (
              <SelectItem key={key} value={key} className="text-[#F1F1F3]">
                {PRIORITY_CONFIG[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          onClick={handleNewTask}
          className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5558E3]"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24]">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_130px_110px_130px_60px] gap-4 border-b border-[#2D2D3A] px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
            Task
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
            Status
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
            Priority
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
            Due Date
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
            Actions
          </span>
        </div>

        {/* Table Body */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <List className="mb-3 h-10 w-10 text-[#6B7280]" />
            <h3 className="mb-1 text-sm font-medium text-[#F1F1F3]">
              {tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
            </h3>
            <p className="mb-4 max-w-sm text-sm text-[#6B7280]">
              {tasks.length === 0
                ? 'Create your first task to start organizing your work.'
                : 'Try adjusting your search or filters.'}
            </p>
            {tasks.length === 0 && (
              <button
                onClick={handleNewTask}
                className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5558E3]"
              >
                <Plus className="h-4 w-4" />
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#2D2D3A]">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleEditTask(task)}
                className="grid cursor-pointer grid-cols-[1fr_130px_110px_130px_60px] items-center gap-4 px-4 py-3 transition-colors hover:bg-[#2D2D3A]/30"
              >
                {/* Title + tags */}
                <div className="flex flex-col gap-1 overflow-hidden">
                  <span className="truncate text-sm font-medium text-[#F1F1F3]">
                    {task.title}
                  </span>
                  {task.tags.length > 0 && (
                    <div className="flex gap-1">
                      {task.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-[#2D2D3A] px-1.5 py-0.5 text-[10px] text-[#9CA3AF]"
                        >
                          {tag}
                        </span>
                      ))}
                      {task.tags.length > 3 && (
                        <span className="text-[10px] text-[#6B7280]">
                          +{task.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS[task.status]}`}
                  />
                  <span className="text-sm text-[#9CA3AF]">
                    {TASK_STATUS_CONFIG[task.status].label}
                  </span>
                </div>

                {/* Priority */}
                <span
                  className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_COLORS[task.priority]}`}
                >
                  {PRIORITY_CONFIG[task.priority].label}
                </span>

                {/* Due Date */}
                <div>
                  {task.dueDate ? (
                    <div className={`flex items-center gap-1.5 ${getDueDateColor(task.dueDate)}`}>
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-sm">{formatDate(task.dueDate)}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-[#6B7280]">&mdash;</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="rounded p-1 text-[#6B7280] transition-colors hover:bg-[#2D2D3A] hover:text-[#F1F1F3]"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="border-[#2D2D3A] bg-[#1A1A24]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem
                        className="text-[#F1F1F3]"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditTask(task)
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-400 focus:text-red-400"
                        onClick={(e) => handleDelete(e as unknown as React.MouseEvent, task.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
      />
    </>
  )
}
