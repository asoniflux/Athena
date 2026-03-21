'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EVENT_CATEGORY_COLORS } from '@/lib/constants'
import { createEvent, updateEvent, deleteEvent } from '@/app/actions/calendar.actions'
import { Trash2, Loader2 } from 'lucide-react'

type EventCategory = keyof typeof EVENT_CATEGORY_COLORS

interface CalendarEvent {
  id: string
  title: string
  startTime: string | Date
  endTime: string | Date
  allDay: boolean
  category: EventCategory
  color: string | null
  location: string | null
  description: string | null
  notes: { text?: string } | null
}

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: CalendarEvent | null
  defaultDate?: Date
  onSaved: () => void
}

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'MEETING', label: 'Meeting' },
  { value: 'DEEP_WORK', label: 'Deep Work' },
  { value: 'PERSONAL', label: 'Personal' },
  { value: 'CONTENT', label: 'Content' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'SOCIAL', label: 'Social' },
]

function formatDateForInput(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function formatTimeForInput(date: Date): string {
  return date.toTimeString().slice(0, 5)
}

export default function EventDialog({
  open,
  onOpenChange,
  event,
  defaultDate,
  onSaved,
}: EventDialogProps) {
  const isEdit = !!event

  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('10:00')
  const [allDay, setAllDay] = useState(false)
  const [category, setCategory] = useState<EventCategory>('MEETING')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (event) {
      const start = new Date(event.startTime)
      const end = new Date(event.endTime)
      setTitle(event.title)
      setStartDate(formatDateForInput(start))
      setStartTime(formatTimeForInput(start))
      setEndDate(formatDateForInput(end))
      setEndTime(formatTimeForInput(end))
      setAllDay(event.allDay)
      setCategory(event.category)
      setLocation(event.location || '')
      setNotes(
        typeof event.notes === 'object' && event.notes?.text
          ? event.notes.text
          : ''
      )
    } else {
      const d = defaultDate || new Date()
      setTitle('')
      setStartDate(formatDateForInput(d))
      setStartTime('09:00')
      setEndDate(formatDateForInput(d))
      setEndTime('10:00')
      setAllDay(false)
      setCategory('MEETING')
      setLocation('')
      setNotes('')
    }
    setError('')
  }, [event, defaultDate, open])

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    const startDateTime = allDay
      ? new Date(`${startDate}T00:00:00`)
      : new Date(`${startDate}T${startTime}:00`)
    const endDateTime = allDay
      ? new Date(`${endDate}T23:59:59`)
      : new Date(`${endDate}T${endTime}:00`)

    if (endDateTime <= startDateTime) {
      setError('End time must be after start time')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      title: title.trim(),
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      allDay,
      category,
      color: EVENT_CATEGORY_COLORS[category],
      location: location.trim() || null,
      notes: notes.trim() || null,
      description: null,
    }

    const result = isEdit
      ? await updateEvent(event!.id, payload)
      : await createEvent(payload)

    setSaving(false)

    if (result.success) {
      onSaved()
      onOpenChange(false)
    } else {
      setError(result.error)
    }
  }

  async function handleDelete() {
    if (!event) return
    setDeleting(true)
    const result = await deleteEvent(event.id)
    setDeleting(false)
    if (result.success) {
      onSaved()
      onOpenChange(false)
    } else {
      setError(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-[#2D2D3A] bg-[#1A1A24]">
        <DialogHeader>
          <DialogTitle className="text-[#F1F1F3]">
            {isEdit ? 'Edit Event' : 'New Event'}
          </DialogTitle>
          <DialogDescription className="text-[#9CA3AF]">
            {isEdit ? 'Update event details.' : 'Create a new calendar event.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-[#9CA3AF]">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3] placeholder:text-[#6B7280]"
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-[#9CA3AF]">All day</Label>
            <Switch checked={allDay} onCheckedChange={setAllDay} />
          </div>

          {/* Start Date/Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[#9CA3AF]">Start date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3]"
              />
            </div>
            {!allDay && (
              <div className="space-y-1.5">
                <Label className="text-[#9CA3AF]">Start time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3]"
                />
              </div>
            )}
          </div>

          {/* End Date/Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[#9CA3AF]">End date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3]"
              />
            </div>
            {!allDay && (
              <div className="space-y-1.5">
                <Label className="text-[#9CA3AF]">End time</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3]"
                />
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-[#9CA3AF]">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as EventCategory)}
            >
              <SelectTrigger className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#2D2D3A] bg-[#1A1A24]">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: EVENT_CATEGORY_COLORS[cat.value] }}
                      />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label className="text-[#9CA3AF]">Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Optional location"
              className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3] placeholder:text-[#6B7280]"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-[#9CA3AF]">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              rows={3}
              className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3] placeholder:text-[#6B7280]"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          {isEdit ? (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-[#2D2D3A] px-4 py-2 text-sm text-[#9CA3AF] transition-colors hover:bg-[#2D2D3A]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5558E3] disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
