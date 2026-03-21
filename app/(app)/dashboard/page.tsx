import { auth } from '@/lib/auth'
import { Sparkles, CheckSquare, Calendar, Target, Activity } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F1F1F3]">
          Good morning, {session?.user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Here&apos;s your command center for today.
        </p>
      </div>

      {/* AI Briefing Card */}
      <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6366F1]/10">
            <Sparkles className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#F1F1F3]">AI Morning Briefing</h2>
            <p className="text-xs text-[#6B7280]">AI-powered daily summary</p>
          </div>
        </div>
        <p className="text-sm text-[#9CA3AF]">
          Connect to Ollama to receive your personalized daily briefing. It will summarize your tasks, calendar, habits, and content deadlines.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickStatCard
          icon={<CheckSquare className="h-5 w-5" />}
          label="Tasks Today"
          value="0"
          color="text-[#3B82F6]"
          bgColor="bg-[#3B82F6]/10"
        />
        <QuickStatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Events Today"
          value="0"
          color="text-[#6366F1]"
          bgColor="bg-[#6366F1]/10"
        />
        <QuickStatCard
          icon={<Target className="h-5 w-5" />}
          label="Habits Done"
          value="0/0"
          color="text-[#10B981]"
          bgColor="bg-[#10B981]/10"
        />
        <QuickStatCard
          icon={<Activity className="h-5 w-5" />}
          label="Streak"
          value="0 days"
          color="text-[#F59E0B]"
          bgColor="bg-[#F59E0B]/10"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Tasks */}
        <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-6">
          <h3 className="mb-4 font-semibold text-[#F1F1F3]">Today&apos;s Priority Tasks</h3>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckSquare className="mb-2 h-8 w-8 text-[#6B7280]" />
            <p className="text-sm text-[#6B7280]">No tasks yet. Create your first task!</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-6">
          <h3 className="mb-4 font-semibold text-[#F1F1F3]">Recent Activity</h3>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="mb-2 h-8 w-8 text-[#6B7280]" />
            <p className="text-sm text-[#6B7280]">No activity yet. Start using Athena!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickStatCard({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  bgColor: string
}) {
  return (
    <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bgColor} ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-[#6B7280]">{label}</p>
          <p className="text-lg font-semibold text-[#F1F1F3]">{value}</p>
        </div>
      </div>
    </div>
  )
}
