import { Calendar, Plus, Sparkles } from 'lucide-react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getEvents } from '@/app/actions/calendar.actions'
import CalendarView from './calendar-view'

export default async function CalendarPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const result = await getEvents(currentMonth, currentYear)
  const events = result.success ? (result.data as Array<Record<string, unknown>>) : []

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
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
      </div>

      {/* AI Feature Banner - Compact */}
      <div className="mb-4 rounded-lg border border-[#6366F1]/20 bg-[#6366F1]/5 px-3 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#6366F1]" />
          <p className="text-xs text-[#9CA3AF]">
            <span className="font-medium text-[#6366F1]">AI Scheduling</span>{' '}
            &mdash; Smart time-blocking and conflict detection coming soon.
          </p>
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1">
        <CalendarView
          initialEvents={events as never[]}
          initialMonth={currentMonth}
          initialYear={currentYear}
        />
      </div>
    </div>
  )
}
