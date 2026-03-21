import { Target, Plus, TrendingUp } from 'lucide-react'

export default function HabitsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F1F3]">Habit Tracker</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">Build consistency with daily habits and mood tracking</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#818CF8] transition">
          <Plus className="h-4 w-4" />
          New Habit
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Habits List */}
        <div className="lg:col-span-2 rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-6">
          <h3 className="mb-4 font-semibold text-[#F1F1F3]">Today&apos;s Habits</h3>
          <div className="flex flex-col items-center justify-center py-12">
            <Target className="mb-2 h-8 w-8 text-[#6B7280]" />
            <p className="text-sm text-[#6B7280]">No habits created yet</p>
            <button className="mt-3 flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#818CF8] transition">
              <Plus className="h-4 w-4" />
              Create First Habit
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-6">
            <h3 className="mb-2 font-semibold text-[#F1F1F3]">Streak Calendar</h3>
            <p className="text-sm text-[#6B7280]">Complete habits to build your streak</p>
            <div className="mt-4 grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-4 w-4 rounded-sm bg-[#242430]" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-[#10B981]" />
              <h3 className="font-semibold text-[#F1F1F3]">Mood Log</h3>
            </div>
            <p className="text-sm text-[#6B7280]">Track your daily mood, energy, and focus</p>
          </div>
        </div>
      </div>
    </div>
  )
}
