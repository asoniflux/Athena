import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import {
  Sparkles,
  CheckSquare,
  Calendar,
  Target,
  Activity,
  ArrowRight,
  Clock,
  Flame,
} from 'lucide-react'
import Link from 'next/link'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const userId = session.user.id

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Fetch all dashboard data in parallel
  const [
    tasksToday,
    tasksDue,
    eventsToday,
    habits,
    habitLogsToday,
    recentActivity,
    totalTasks,
    completedTasks,
  ] = await Promise.all([
    // Tasks with status TODO or IN_PROGRESS
    prisma.task.findMany({
      where: {
        userId,
        deletedAt: null,
        status: { in: ['TODO', 'IN_PROGRESS'] },
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      take: 5,
    }),
    // Tasks due today
    prisma.task.findMany({
      where: {
        userId,
        deletedAt: null,
        status: { not: 'DONE' },
        dueDate: { gte: today, lt: tomorrow },
      },
    }),
    // Events today
    prisma.calendarEvent.findMany({
      where: {
        userId,
        deletedAt: null,
        startTime: { gte: today, lt: tomorrow },
      },
      orderBy: { startTime: 'asc' },
      take: 5,
    }),
    // Active habits
    prisma.habit.findMany({
      where: { userId, isActive: true },
    }),
    // Today's habit logs
    prisma.habitLog.findMany({
      where: {
        habit: { userId },
        date: today,
        completed: true,
      },
    }),
    // Recent activity
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    // Total tasks (not done, not deleted)
    prisma.task.count({
      where: { userId, deletedAt: null, status: { not: 'DONE' } },
    }),
    // Completed tasks this week
    prisma.task.count({
      where: {
        userId,
        deletedAt: null,
        status: 'DONE',
        updatedAt: { gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ])

  const habitsCompleted = habitLogsToday.length
  const habitsTotal = habits.length

  const priorityColors: Record<string, string> = {
    P1: 'text-red-400 bg-red-500/10',
    P2: 'text-amber-400 bg-amber-500/10',
    P3: 'text-blue-400 bg-blue-500/10',
    P4: 'text-gray-400 bg-gray-500/10',
  }

  const categoryColors: Record<string, string> = {
    MEETING: '#6366F1',
    DEEP_WORK: '#3B82F6',
    PERSONAL: '#10B981',
    CONTENT: '#F59E0B',
    ADMIN: '#9CA3AF',
    HEALTH: '#EF4444',
    SOCIAL: '#EC4899',
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F1F1F3]">
          {getGreeting()}, {session.user.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          {totalTasks > 0
            ? `You have ${totalTasks} active task${totalTasks !== 1 ? 's' : ''}. ${completedTasks > 0 ? `${completedTasks} completed this week.` : ''}`
            : "Here's your command center for today."}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickStatCard
          icon={<CheckSquare className="h-5 w-5" />}
          label="Active Tasks"
          value={String(totalTasks)}
          sub={tasksDue.length > 0 ? `${tasksDue.length} due today` : undefined}
          color="text-[#3B82F6]"
          bgColor="bg-[#3B82F6]/10"
        />
        <QuickStatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Events Today"
          value={String(eventsToday.length)}
          sub={eventsToday.length > 0 ? `Next: ${eventsToday[0].title}` : undefined}
          color="text-[#6366F1]"
          bgColor="bg-[#6366F1]/10"
        />
        <QuickStatCard
          icon={<Target className="h-5 w-5" />}
          label="Habits Done"
          value={`${habitsCompleted}/${habitsTotal}`}
          sub={habitsTotal > 0 ? `${Math.round((habitsCompleted / habitsTotal) * 100)}% complete` : undefined}
          color="text-[#10B981]"
          bgColor="bg-[#10B981]/10"
        />
        <QuickStatCard
          icon={<Flame className="h-5 w-5" />}
          label="Completed This Week"
          value={String(completedTasks)}
          sub="tasks finished"
          color="text-[#F59E0B]"
          bgColor="bg-[#F59E0B]/10"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Tasks */}
        <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-[#F1F1F3]">Priority Tasks</h3>
            <Link href="/tasks" className="flex items-center gap-1 text-xs text-[#6366F1] hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {tasksToday.length > 0 ? (
            <div className="space-y-2">
              {tasksToday.map((task) => (
                <Link
                  key={task.id}
                  href="/tasks"
                  className="flex items-center gap-3 rounded-lg border border-[#2D2D3A] bg-[#0F0F14] p-3 transition hover:border-[#6366F1]/30"
                >
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${priorityColors[task.priority] || ''}`}>
                    {task.priority}
                  </span>
                  <span className="flex-1 truncate text-sm text-[#F1F1F3]">{task.title}</span>
                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                      <Clock className="h-3 w-3" />
                      {new Date(task.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckSquare className="mb-2 h-8 w-8 text-[#6B7280]" />
              <p className="text-sm text-[#6B7280]">No active tasks. Create one from the Tasks page!</p>
            </div>
          )}
        </div>

        {/* Today's Events */}
        <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-[#F1F1F3]">Today&apos;s Schedule</h3>
            <Link href="/calendar" className="flex items-center gap-1 text-xs text-[#6366F1] hover:underline">
              Calendar <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {eventsToday.length > 0 ? (
            <div className="space-y-2">
              {eventsToday.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-lg border border-[#2D2D3A] bg-[#0F0F14] p-3"
                >
                  <div
                    className="h-8 w-1 rounded-full"
                    style={{ backgroundColor: categoryColors[event.category] || '#6366F1' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-[#F1F1F3]">{event.title}</p>
                    <p className="text-xs text-[#6B7280]">
                      {event.allDay
                        ? 'All day'
                        : `${new Date(event.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="mb-2 h-8 w-8 text-[#6B7280]" />
              <p className="text-sm text-[#6B7280]">No events today. Enjoy your free time!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-6">
        <h3 className="mb-4 font-semibold text-[#F1F1F3]">Recent Activity</h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((log) => (
              <div key={log.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6366F1]/10">
                  <Activity className="h-4 w-4 text-[#6366F1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-[#F1F1F3]">
                    <span className="capitalize">{log.action}</span>{' '}
                    <span className="text-[#9CA3AF]">{log.entityType.toLowerCase()}</span>
                    {log.entityTitle && (
                      <span className="text-[#9CA3AF]"> &quot;{log.entityTitle}&quot;</span>
                    )}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {formatRelative(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Activity className="mb-2 h-8 w-8 text-[#6B7280]" />
            <p className="text-sm text-[#6B7280]">No activity yet. Start using Athena!</p>
          </div>
        )}
      </div>

      {/* AI Briefing Card */}
      <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]/10">
            <Sparkles className="h-4 w-4 text-[#6366F1]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#F1F1F3]">AI Daily Briefing</p>
            <p className="text-xs text-[#6B7280]">Connect Ollama to receive personalized daily summaries</p>
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
  sub,
  color,
  bgColor,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
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
          {sub && <p className="text-[10px] text-[#6B7280]">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

function formatRelative(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}
