'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Target, Flame, Trash2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { HabitDialog } from './habit-dialog'
import {
  toggleHabitLog,
  getHabitLogs,
  getStreakData,
  logMood,
  deleteHabit,
} from '@/app/actions/habit.actions'

interface HabitLog {
  id: string
  habitId: string
  date: string
  completed: boolean
}

interface Habit {
  id: string
  name: string
  icon: string | null
  color: string | null
  category: string
  frequency: string
  targetDays: number[]
  targetValue: number | null
  unit: string | null
  completedToday: boolean
  logs: HabitLog[]
}

interface MoodLogData {
  id: string
  mood: number
  energy: number
  focus: number
  journal: string | null
}

interface HabitsViewProps {
  initialHabits: Habit[]
  initialMoodLog: MoodLogData | null
}

export function HabitsView({ initialHabits, initialMoodLog }: HabitsViewProps) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(
    initialHabits.length > 0 ? initialHabits[0].id : null
  )
  const [calendarLogs, setCalendarLogs] = useState<Record<string, boolean>>({})
  const [streakData, setStreakData] = useState({ currentStreak: 0, bestStreak: 0 })

  // Mood state
  const [mood, setMood] = useState(initialMoodLog?.mood || 3)
  const [energy, setEnergy] = useState(initialMoodLog?.energy || 3)
  const [focus, setFocus] = useState(initialMoodLog?.focus || 3)
  const [journal, setJournal] = useState(initialMoodLog?.journal || '')
  const [moodSaving, setMoodSaving] = useState(false)
  const [moodSaved, setMoodSaved] = useState(false)

  const loadCalendarData = useCallback(async (habitId: string) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 29)

    const [logsResult, streakResult] = await Promise.all([
      getHabitLogs(habitId, start.toISOString(), end.toISOString()),
      getStreakData(habitId),
    ])

    if (logsResult.success) {
      const logMap: Record<string, boolean> = {}
      ;(logsResult.data as HabitLog[]).forEach((log) => {
        const d = new Date(log.date)
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
        logMap[key] = log.completed
      })
      setCalendarLogs(logMap)
    }

    if (streakResult.success) {
      setStreakData(streakResult.data as { currentStreak: number; bestStreak: number })
    }
  }, [])

  useEffect(() => {
    if (selectedHabitId) {
      loadCalendarData(selectedHabitId)
    }
  }, [selectedHabitId, loadCalendarData])

  const handleToggle = async (habitId: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const result = await toggleHabitLog(habitId, today.toISOString())
    if (result.success) {
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId ? { ...h, completedToday: !h.completedToday } : h
        )
      )
      if (habitId === selectedHabitId) {
        loadCalendarData(habitId)
      }
    }
  }

  const handleDelete = async (habitId: string) => {
    const result = await deleteHabit(habitId)
    if (result.success) {
      setHabits((prev) => prev.filter((h) => h.id !== habitId))
      if (selectedHabitId === habitId) {
        setSelectedHabitId(habits.length > 1 ? habits.find((h) => h.id !== habitId)?.id || null : null)
      }
    }
  }

  const handleMoodSave = async () => {
    setMoodSaving(true)
    const result = await logMood({ mood, energy, focus, journal: journal || undefined })
    setMoodSaving(false)
    if (result.success) {
      setMoodSaved(true)
      setTimeout(() => setMoodSaved(false), 2000)
    }
  }

  // Generate last 30 days for calendar
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    d.setHours(0, 0, 0, 0)
    return d
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const moodLabels = ['', 'Very Low', 'Low', 'Medium', 'High', 'Very High']

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F1F3]">Habit Tracker</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            Build consistency with daily habits and mood tracking
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#6366F1] text-white hover:bg-[#818CF8]"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Habit
        </Button>
      </div>

      {/* AI Banner */}
      <div className="rounded-lg border border-[#6366F1]/20 bg-[#6366F1]/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#6366F1]" />
          <p className="text-sm text-[#9CA3AF]">
            <span className="font-medium text-[#6366F1]">AI Habit Coach</span>{' '}
            &mdash; Personalized habit suggestions and streak analysis coming soon.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Habits */}
        <div className="lg:col-span-2 rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-6">
          <h3 className="mb-4 font-semibold text-[#F1F1F3]">Today&apos;s Habits</h3>

          {habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Target className="mb-2 h-8 w-8 text-[#6B7280]" />
              <p className="text-sm text-[#6B7280]">No habits created yet</p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="mt-3 bg-[#6366F1] text-white hover:bg-[#818CF8]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Habit
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition cursor-pointer ${
                    selectedHabitId === habit.id
                      ? 'border-[#6366F1]/50 bg-[#6366F1]/5'
                      : 'border-[#2D2D3A] bg-[#0F0F14] hover:border-[#3D3D4A]'
                  }`}
                  onClick={() => setSelectedHabitId(habit.id)}
                >
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggle(habit.id)
                    }}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                      habit.completedToday
                        ? 'border-transparent'
                        : 'border-[#3D3D4A] hover:border-[#6366F1]'
                    }`}
                    style={{
                      backgroundColor: habit.completedToday ? (habit.color || '#6366F1') : 'transparent',
                    }}
                  >
                    {habit.completedToday && (
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Icon */}
                  <span className="text-lg">{habit.icon || '🎯'}</span>

                  {/* Name and category */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${habit.completedToday ? 'text-[#9CA3AF] line-through' : 'text-[#F1F1F3]'}`}>
                      {habit.name}
                    </p>
                    <p className="text-xs text-[#6B7280]">{habit.category.toLowerCase()}</p>
                  </div>

                  {/* Streak badge */}
                  {selectedHabitId === habit.id && streakData.currentStreak > 0 && (
                    <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20">
                      <Flame className="mr-1 h-3 w-3" />
                      {streakData.currentStreak}
                    </Badge>
                  )}

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(habit.id)
                    }}
                    className="rounded p-1 text-[#6B7280] opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Progress summary */}
          {habits.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#2D2D3A]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9CA3AF]">Today&apos;s progress</span>
                <span className="text-[#F1F1F3] font-medium">
                  {habits.filter((h) => h.completedToday).length} / {habits.length}
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[#0F0F14] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#6366F1] transition-all duration-500"
                  style={{
                    width: `${(habits.filter((h) => h.completedToday).length / habits.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right column: Streak calendar + Mood */}
        <div className="space-y-4">
          {/* Streak Calendar */}
          <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#F1F1F3]">Streak Calendar</h3>
              {selectedHabitId && streakData.currentStreak > 0 && (
                <div className="flex items-center gap-1 text-xs text-[#F59E0B]">
                  <Flame className="h-3 w-3" />
                  Best: {streakData.bestStreak}
                </div>
              )}
            </div>

            {selectedHabitId ? (
              <>
                <p className="mb-3 text-xs text-[#6B7280]">
                  Last 30 days for selected habit
                </p>
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarDays.map((day) => {
                    const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`
                    const isFuture = day.getTime() > today.getTime()
                    const isCompleted = calendarLogs[key]
                    const isToday = day.getTime() === today.getTime()

                    return (
                      <div
                        key={key}
                        title={day.toLocaleDateString()}
                        className={`h-5 w-5 rounded-sm transition ${
                          isFuture
                            ? 'bg-[#1A1A24] border border-[#2D2D3A]'
                            : isCompleted
                            ? 'bg-[#10B981]'
                            : 'bg-[#242430]'
                        } ${isToday ? 'ring-1 ring-[#6366F1]' : ''}`}
                      />
                    )
                  })}
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-[#6B7280]">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-sm bg-[#10B981]" />
                    Done
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-sm bg-[#242430]" />
                    Missed
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-[#6B7280]">
                Select a habit to view its streak calendar
              </p>
            )}
          </div>

          {/* Mood Logger */}
          <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-6">
            <h3 className="mb-4 font-semibold text-[#F1F1F3]">Mood Log</h3>

            <div className="space-y-4">
              {/* Mood slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[#9CA3AF]">Mood</label>
                  <span className="text-xs text-[#6366F1]">{moodLabels[mood]}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={mood}
                  onChange={(e) => setMood(Number(e.target.value))}
                  className="w-full accent-[#6366F1] h-1.5"
                />
              </div>

              {/* Energy slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[#9CA3AF]">Energy</label>
                  <span className="text-xs text-[#10B981]">{moodLabels[energy]}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={energy}
                  onChange={(e) => setEnergy(Number(e.target.value))}
                  className="w-full accent-[#10B981] h-1.5"
                />
              </div>

              {/* Focus slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[#9CA3AF]">Focus</label>
                  <span className="text-xs text-[#F59E0B]">{moodLabels[focus]}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={focus}
                  onChange={(e) => setFocus(Number(e.target.value))}
                  className="w-full accent-[#F59E0B] h-1.5"
                />
              </div>

              {/* Journal */}
              <div>
                <label className="text-xs text-[#9CA3AF] mb-1 block">Journal (optional)</label>
                <Textarea
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                  placeholder="How are you feeling today?"
                  rows={2}
                  className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3] placeholder:text-[#6B7280] text-sm resize-none"
                />
              </div>

              <Button
                onClick={handleMoodSave}
                disabled={moodSaving}
                className="w-full bg-[#6366F1] text-white hover:bg-[#818CF8]"
                size="sm"
              >
                {moodSaving ? 'Saving...' : moodSaved ? 'Saved!' : 'Save Mood'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <HabitDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
        }}
      />
    </div>
  )
}
