import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getHabits, getMoodLogs } from '@/app/actions/habit.actions'
import { HabitsView } from './habits-view'

export default async function HabitsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const [habitsResult, moodResult] = await Promise.all([
    getHabits(),
    getMoodLogs(
      new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
    ),
  ])

  const habits = habitsResult.success ? (habitsResult.data as any[]) : []
  const moodLogs = moodResult.success ? (moodResult.data as any[]) : []
  const todayMood = moodLogs.length > 0 ? moodLogs[0] : null

  return <HabitsView initialHabits={habits} initialMoodLog={todayMood} />
}
