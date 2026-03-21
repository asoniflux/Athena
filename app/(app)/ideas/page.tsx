import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getIdeas } from '@/app/actions/idea.actions'
import { IdeasView } from './ideas-view'

export default async function IdeasPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const result = await getIdeas()
  const ideas = result.success ? (result.data as any[]) : []

  return <IdeasView initialIdeas={ideas} />
}
