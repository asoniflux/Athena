import { BookOpen, Sparkles } from 'lucide-react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPages } from '@/app/actions/page.actions'
import KnowledgeView from './knowledge-view'

export default async function KnowledgePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const result = await getPages()
  const pages = result.success ? (result.data as Array<Record<string, unknown>>) : []

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]/10">
            <BookOpen className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F1F1F3]">Knowledge Base</h1>
            <p className="text-sm text-[#9CA3AF]">
              Your personal wiki and notes organized in a page tree
            </p>
          </div>
        </div>
      </div>

      {/* AI Feature Banner - Compact */}
      <div className="mb-4 rounded-lg border border-[#6366F1]/20 bg-[#6366F1]/5 px-3 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#6366F1]" />
          <p className="text-xs text-[#9CA3AF]">
            <span className="font-medium text-[#6366F1]">AI Knowledge Assistant</span>{' '}
            &mdash; Semantic search, auto-linking, and AI-generated summaries coming soon.
          </p>
        </div>
      </div>

      {/* Knowledge View */}
      <div className="flex-1 min-h-0">
        <KnowledgeView initialPages={pages as never[]} />
      </div>
    </div>
  )
}
