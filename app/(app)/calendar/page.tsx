import { Calendar, ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react'

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export default function CalendarPage() {
  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]/10">
            <Calendar className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F1F1F3]">Calendar</h1>
            <p className="text-sm text-[#9CA3AF]">
              Schedule events and manage your time
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5558E3]">
          <Plus className="h-4 w-4" />
          New Event
        </button>
      </div>

      {/* AI Feature Banner */}
      <div className="mb-6 rounded-lg border border-[#6366F1]/20 bg-[#6366F1]/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#6366F1]" />
          <p className="text-sm text-[#9CA3AF]">
            <span className="font-medium text-[#6366F1]">AI Scheduling</span>{' '}
            &mdash; Smart time-blocking and conflict detection coming soon.
          </p>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[#F1F1F3]">March 2026</h2>
          <div className="flex items-center gap-1">
            <button className="rounded-lg p-1.5 text-[#9CA3AF] transition-colors hover:bg-[#2D2D3A] hover:text-[#F1F1F3]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="rounded-lg p-1.5 text-[#9CA3AF] transition-colors hover:bg-[#2D2D3A] hover:text-[#F1F1F3]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <button className="rounded-lg border border-[#2D2D3A] px-3 py-1.5 text-sm text-[#9CA3AF] transition-colors hover:border-[#6366F1]/50">
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 rounded-xl border border-[#2D2D3A] bg-[#1A1A24] overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-[#2D2D3A]">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-[#6B7280]"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Rows - 5 weeks */}
        {Array.from({ length: 5 }).map((_, weekIndex) => (
          <div
            key={weekIndex}
            className="grid grid-cols-7 border-b border-[#2D2D3A] last:border-b-0"
          >
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const dayNum = weekIndex * 7 + dayIndex - 1
              const isCurrentMonth = dayNum >= 0 && dayNum < 31
              const displayDay = isCurrentMonth ? dayNum + 1 : ''
              const isToday = dayNum === 20

              return (
                <div
                  key={dayIndex}
                  className="min-h-[80px] border-r border-[#2D2D3A] p-2 last:border-r-0"
                >
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isToday
                        ? 'bg-[#6366F1] font-semibold text-white'
                        : isCurrentMonth
                        ? 'text-[#9CA3AF]'
                        : 'text-[#6B7280]/40'
                    }`}
                  >
                    {displayDay}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
