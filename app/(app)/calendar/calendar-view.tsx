'use client'

import { useState, useCallback } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Clock,
  X,
} from 'lucide-react'
import { EVENT_CATEGORY_COLORS } from '@/lib/constants'
import { getEvents, getEventsForDate } from '@/app/actions/calendar.actions'
import EventDialog from './event-dialog'

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

interface CalendarViewProps {
  initialEvents: CalendarEvent[]
  initialMonth: number
  initialYear: number
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

const CATEGORY_LABELS: Record<EventCategory, string> = {
  MEETING: 'Meeting',
  DEEP_WORK: 'Deep Work',
  PERSONAL: 'Personal',
  CONTENT: 'Content',
  ADMIN: 'Admin',
  HEALTH: 'Health',
  SOCIAL: 'Social',
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfMonth(month: number, year: number): number {
  // Returns 0=Mon ... 6=Sun
  const day = new Date(year, month - 1, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function CalendarView({
  initialEvents,
  initialMonth,
  initialYear,
}: CalendarViewProps) {
  const [month, setMonth] = useState(initialMonth)
  const [year, setYear] = useState(initialYear)
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [loadingDayEvents, setLoadingDayEvents] = useState(false)

  const today = new Date()
  const daysInMonth = getDaysInMonth(month, year)
  const firstDay = getFirstDayOfMonth(month, year)
  const prevMonthDays = getDaysInMonth(month === 1 ? 12 : month - 1, month === 1 ? year - 1 : year)

  // Build calendar grid
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
  const calendarDays: { day: number; currentMonth: boolean; date: Date }[] = []

  for (let i = 0; i < totalCells; i++) {
    if (i < firstDay) {
      const d = prevMonthDays - firstDay + i + 1
      const prevMonth = month === 1 ? 12 : month - 1
      const prevYear = month === 1 ? year - 1 : year
      calendarDays.push({ day: d, currentMonth: false, date: new Date(prevYear, prevMonth - 1, d) })
    } else if (i >= firstDay + daysInMonth) {
      const d = i - firstDay - daysInMonth + 1
      const nextMonth = month === 12 ? 1 : month + 1
      const nextYear = month === 12 ? year + 1 : year
      calendarDays.push({ day: d, currentMonth: false, date: new Date(nextYear, nextMonth - 1, d) })
    } else {
      const d = i - firstDay + 1
      calendarDays.push({ day: d, currentMonth: true, date: new Date(year, month - 1, d) })
    }
  }

  const weeks: typeof calendarDays[] = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  // Get events for a specific day
  function getEventsOnDay(date: Date): CalendarEvent[] {
    return events.filter((e) => {
      const start = new Date(e.startTime)
      return isSameDay(start, date)
    })
  }

  const refreshEvents = useCallback(async () => {
    const result = await getEvents(month, year)
    if (result.success) {
      setEvents(result.data as CalendarEvent[])
    }
    // Also refresh selected date events if any
    if (selectedDate) {
      const dayResult = await getEventsForDate(selectedDate.toISOString())
      if (dayResult.success) {
        setSelectedDateEvents(dayResult.data as CalendarEvent[])
      }
    }
  }, [month, year, selectedDate])

  async function navigateMonth(delta: number) {
    let newMonth = month + delta
    let newYear = year
    if (newMonth < 1) {
      newMonth = 12
      newYear--
    } else if (newMonth > 12) {
      newMonth = 1
      newYear++
    }
    setMonth(newMonth)
    setYear(newYear)
    setSelectedDate(null)
    setSelectedDateEvents([])

    const result = await getEvents(newMonth, newYear)
    if (result.success) {
      setEvents(result.data as CalendarEvent[])
    }
  }

  async function goToToday() {
    const now = new Date()
    const m = now.getMonth() + 1
    const y = now.getFullYear()
    setMonth(m)
    setYear(y)
    setSelectedDate(null)
    setSelectedDateEvents([])

    const result = await getEvents(m, y)
    if (result.success) {
      setEvents(result.data as CalendarEvent[])
    }
  }

  async function handleDayClick(date: Date) {
    setSelectedDate(date)
    setLoadingDayEvents(true)
    const result = await getEventsForDate(date.toISOString())
    setLoadingDayEvents(false)
    if (result.success) {
      setSelectedDateEvents(result.data as CalendarEvent[])
    }
  }

  function handleAddEvent() {
    setEditingEvent(null)
    setDialogOpen(true)
  }

  function handleEditEvent(event: CalendarEvent) {
    setEditingEvent(event)
    setDialogOpen(true)
  }

  return (
    <div className="flex h-full gap-0">
      {/* Main Calendar Area */}
      <div className="flex flex-1 flex-col">
        {/* Month Navigation */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-[#F1F1F3]">
              {MONTH_NAMES[month - 1]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateMonth(-1)}
                className="rounded-lg p-1.5 text-[#9CA3AF] transition-colors hover:bg-[#2D2D3A] hover:text-[#F1F1F3]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="rounded-lg p-1.5 text-[#9CA3AF] transition-colors hover:bg-[#2D2D3A] hover:text-[#F1F1F3]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <button
            onClick={goToToday}
            className="rounded-lg border border-[#2D2D3A] px-3 py-1.5 text-sm text-[#9CA3AF] transition-colors hover:border-[#6366F1]/50"
          >
            Today
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 rounded-xl border border-[#2D2D3A] bg-[#1A1A24] overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-[#2D2D3A]">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-[#6B7280]"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Rows */}
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="grid grid-cols-7 border-b border-[#2D2D3A] last:border-b-0"
            >
              {week.map((cell, dayIndex) => {
                const isToday = isSameDay(cell.date, today)
                const isSelected = selectedDate && isSameDay(cell.date, selectedDate)
                const dayEvents = getEventsOnDay(cell.date)

                return (
                  <button
                    key={dayIndex}
                    onClick={() => handleDayClick(cell.date)}
                    className={`min-h-[80px] border-r border-[#2D2D3A] p-2 text-left last:border-r-0 transition-colors hover:bg-[#2D2D3A]/30 ${
                      isSelected ? 'bg-[#6366F1]/10' : ''
                    }`}
                  >
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        isToday
                          ? 'bg-[#6366F1] font-semibold text-white'
                          : cell.currentMonth
                          ? 'text-[#9CA3AF]'
                          : 'text-[#6B7280]/40'
                      }`}
                    >
                      {cell.day}
                    </span>
                    {/* Event dots/bars */}
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          className="truncate rounded px-1 py-0.5 text-[10px] leading-tight text-white"
                          style={{
                            backgroundColor:
                              ev.color ||
                              EVENT_CATEGORY_COLORS[ev.category] ||
                              '#6366F1',
                            opacity: 0.85,
                          }}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="px-1 text-[10px] text-[#9CA3AF]">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Side Panel - Day Events */}
      {selectedDate && (
        <div className="ml-4 w-80 flex-shrink-0 rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-[#F1F1F3]">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </h3>
            <button
              onClick={() => {
                setSelectedDate(null)
                setSelectedDateEvents([])
              }}
              className="rounded-lg p-1 text-[#9CA3AF] transition-colors hover:bg-[#2D2D3A]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleAddEvent}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#2D2D3A] py-2 text-sm text-[#9CA3AF] transition-colors hover:border-[#6366F1]/50 hover:text-[#6366F1]"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </button>

          {loadingDayEvents ? (
            <div className="py-8 text-center text-sm text-[#6B7280]">Loading...</div>
          ) : selectedDateEvents.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#6B7280]">
              No events for this day
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDateEvents.map((event) => {
                const start = new Date(event.startTime)
                const end = new Date(event.endTime)
                const catColor =
                  event.color || EVENT_CATEGORY_COLORS[event.category] || '#6366F1'

                return (
                  <button
                    key={event.id}
                    onClick={() => handleEditEvent(event)}
                    className="w-full rounded-lg border border-[#2D2D3A] p-3 text-left transition-colors hover:bg-[#2D2D3A]/50"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: catColor }}
                      />
                      <span className="font-medium text-[#F1F1F3] text-sm truncate">
                        {event.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                      <Clock className="h-3 w-3" />
                      {event.allDay
                        ? 'All day'
                        : `${formatTime(start)} - ${formatTime(end)}`}
                    </div>
                    {event.location && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                    <div className="mt-1.5">
                      <span
                        className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                        style={{ backgroundColor: catColor, opacity: 0.85 }}
                      >
                        {CATEGORY_LABELS[event.category]}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Event Dialog */}
      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editingEvent}
        defaultDate={selectedDate || undefined}
        onSaved={refreshEvents}
      />
    </div>
  )
}
