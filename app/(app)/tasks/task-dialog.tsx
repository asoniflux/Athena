'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TASK_STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/constants'
import { createTask, updateTask } from '@/app/actions/task.actions'
import { Loader2 } from 'lucide-react'
import type { TaskStatus, Priority } from '@prisma/client'

export interface TaskData {
  id: string
  title: string
  description: string | null | Record<string, unknown>
  status: TaskStatus
  priority: Priority
  dueDate: Date | string | null
  tags: string[]
  projectId?: string | null
}

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: TaskData | null
  defaultStatus?: TaskStatus
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultStatus = 'BACKLOG',
}: TaskDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!task

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>(defaultStatus)
  const [priority, setPriority] = useState<Priority>('P3')
  const [dueDate, setDueDate] = useState('')
  const [tags, setTags] = useState('')

  // Reset form when dialog opens or task changes
  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? '')
      setDescription(
        typeof task?.description === 'string'
          ? task.description
          : task?.description
            ? JSON.stringify(task.description)
            : ''
      )
      setStatus(task?.status ?? defaultStatus)
      setPriority(task?.priority ?? 'P3')
      setDueDate(
        task?.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : ''
      )
      setTags(task?.tags?.join(', ') ?? '')
      setError(null)
    }
  }, [open, task, defaultStatus])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError(null)
    }
    onOpenChange(newOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const formData = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateTask(task!.id, formData)
        : await createTask(formData)

      if (result.success) {
        onOpenChange(false)
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-[#2D2D3A] bg-[#1A1A24] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#F1F1F3]">
            {isEditing ? 'Edit Task' : 'Create Task'}
          </DialogTitle>
          <DialogDescription className="text-[#9CA3AF]">
            {isEditing
              ? 'Update the task details below.'
              : 'Fill in the details for your new task.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[#F1F1F3]">
              Title
            </Label>
            <Input
              id="title"
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3] placeholder:text-[#6B7280]"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#F1F1F3]">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Task description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3] placeholder:text-[#6B7280]"
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#F1F1F3]">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#2D2D3A] bg-[#1A1A24]">
                  {(Object.keys(TASK_STATUS_CONFIG) as TaskStatus[]).map((key) => (
                    <SelectItem key={key} value={key} className="text-[#F1F1F3]">
                      {TASK_STATUS_CONFIG[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#F1F1F3]">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#2D2D3A] bg-[#1A1A24]">
                  {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((key) => (
                    <SelectItem key={key} value={key} className="text-[#F1F1F3]">
                      {PRIORITY_CONFIG[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-[#F1F1F3]">
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-[#F1F1F3]">
              Tags
            </Label>
            <Input
              id="tags"
              placeholder="Comma-separated tags..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3] placeholder:text-[#6B7280]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#2D2D3A] text-[#9CA3AF] hover:bg-[#2D2D3A] hover:text-[#F1F1F3]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !title.trim()}
              className="bg-[#6366F1] text-white hover:bg-[#5558E3]"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
