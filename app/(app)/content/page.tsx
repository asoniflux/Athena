import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getContentPieces } from '@/app/actions/content.actions'
import ContentView from './content-view'

export default async function ContentPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const result = await getContentPieces()
  const pieces = result.success ? (result.data as any[]) : []

  return <ContentView initialPieces={pieces} />
}
