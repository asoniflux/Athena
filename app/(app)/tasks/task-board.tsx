'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar, MoreHorizontal, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TASK_STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/constants'
import { updateTask, deleteTask } from '@/app/actions/task.actions'
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

interface TaskBoardProps {
  tasks: TaskWithProject[]
}

const STATUSES: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']

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

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDueDateColor(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'text-red-400'
  if (diffDays <= 1) return 'text-amber-400'
  return 'text-[#6B7280]'
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskData | null>(null)
  const [addToStatus, setAddToStatus] = useState<TaskStatus>('BACKLOG')

  const tasksByStatus = STATUSES.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status)
      return acc
    },
    {} as Record<TaskStatus, TaskWithProject[]>
  )

  const handleAddTask = (status: TaskStatus) => {
    setEditingTask(null)
    setAddToStatus(status)
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
    setAddToStatus(task.status)
    setDialogOpen(true)
  }

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    startTransition(async () => {
      await updateTask(taskId, { status: newStatus })
      router.refresh()
    })
  }

  const handleDelete = (taskId: string) => {
    startTransition(async () => {
      await deleteTask(taskId)
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => {
          const columnTasks = tasksByStatus[status]
          const config = TASK_STATUS_CONFIG[status]

          return (
            <div
              key={status}
              className="flex w-72 flex-shrink-0 flex-col rounded-xl border border-[#2D2D3A] bg-[#1A1A24]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-[#2D2D3A] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                  <h3 className="text-sm font-semibold text-[#F1F1F3]">
                    {config.label}
                  </h3>
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#2D2D3A] px-1.5 text-xs text-[#6B7280]">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => handleAddTask(status)}
                  className="rounded p-1 text-[#6B7280] transition-colors hover:bg-[#2D2D3A] hover:text-[#F1F1F3]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Column Body */}
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
                {columnTasks.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center p-4">
                    <div className="w-full rounded-lg border border-dashed border-[#2D2D3A] p-4 text-center">
                      <p className="text-xs text-[#6B7280]">
                        Click + to add a task
                      </p>
                    </div>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group cursor-pointer rounded-lg border border-[#2D2D3A] bg-[#0F0F14] p-3 transition-colors hover:border-[#6366F1]/30"
                      onClick={() => handleEditTask(task)}
                    >
                      {/* Card Header: title + menu */}
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-[#F1F1F3] line-clamp-2">
                          {task.title}
                        </h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-[#2D2D3A] group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5 text-[#6B7280]" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="border-[#2D2D3A] bg-[#1A1A24]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Move to status sub-menu */}
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="text-[#F1F1F3]">
                                Move to
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="border-[#2D2D3A] bg-[#1A1A24]">
                                {STATUSES.filter((s) => s !== task.status).map((s) => (
                                  <DropdownMenuItem
                                    key={s}
                                    className="text-[#F1F1F3]"
                                    onClick={() => handleStatusChange(task.id, s)}
                                  >
                                    <div className={`mr-2 h-2 w-2 rounded-full ${STATUS_DOT_COLORS[s]}`} />
                                    {TASK_STATUS_CONFIG[s].label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator className="bg-[#2D2D3A]" />
                            <DropdownMenuItem
                              className="text-red-400 focus:text-red-400"
                              onClick={() => handleDelete(task.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Priority badge */}
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[task.priority]}`}
                        >
                          {PRIORITY_CONFIG[task.priority].label}
                        </span>
                        {task.project && (
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              backgroundColor: `${task.project.color}15`,
                              color: task.project.color,
                              border: `1px solid ${task.project.color}30`,
                            }}
                          >
                            {task.project.name}
                          </span>
                        )}
                      </div>

                      {/* Due date & tags */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {task.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-[#2D2D3A] px-1.5 py-0.5 text-[10px] text-[#9CA3AF]"
                            >
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 2 && (
                            <span className="rounded bg-[#2D2D3A] px-1.5 py-0.5 text-[10px] text-[#6B7280]">
                              +{task.tags.length - 2}
                            </span>
                          )}
                        </div>
                        {task.dueDate && (
                          <div className={`flex items-center gap-1 ${getDueDateColor(task.dueDate)}`}>
                            <Calendar className="h-3 w-3" />
                            <span className="text-[10px]">
                              {formatDueDate(task.dueDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        defaultStatus={addToStatus}
      />
    </>
  )
}
