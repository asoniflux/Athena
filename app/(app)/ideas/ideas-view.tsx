'use client'

import { useState } from 'react'
import { Plus, Lightbulb, Sparkles, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IdeaDialog } from './idea-dialog'
import { deleteIdea } from '@/app/actions/idea.actions'

interface Idea {
  id: string
  title: string
  description: string | null
  category: string | null
  status: string
  tags: string[]
  impactRating: number | null
  effortRating: number | null
  excitementRating: number | null
  createdAt: string
}

interface IdeasViewProps {
  initialIdeas: Idea[]
}

const STATUS_COLORS: Record<string, string> = {
  RAW: 'bg-[#6B7280]/10 text-[#9CA3AF] border-[#6B7280]/20',
  EXPLORING: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20',
  VALIDATED: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
  ARCHIVED: 'bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/20',
}

const STATUS_LABELS: Record<string, string> = {
  RAW: 'Raw',
  EXPLORING: 'Exploring',
  VALIDATED: 'Validated',
  ARCHIVED: 'Archived',
}

const FILTER_OPTIONS = ['ALL', 'RAW', 'EXPLORING', 'VALIDATED', 'ARCHIVED'] as const

export function IdeasView({ initialIdeas }: IdeasViewProps) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const filteredIdeas =
    statusFilter === 'ALL' ? ideas : ideas.filter((i) => i.status === statusFilter)

  const handleDelete = async (id: string) => {
    const result = await deleteIdea(id)
    if (result.success) {
      setIdeas((prev) => prev.filter((i) => i.id !== id))
    }
  }

  const handleOpenNew = () => {
    setSelectedIdea(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (idea: Idea) => {
    setSelectedIdea(idea)
    setDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F1F3]">Idea Lab</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            Capture, organize, and expand your ideas with AI
          </p>
        </div>
        <Button
          onClick={handleOpenNew}
          className="bg-[#6366F1] text-white hover:bg-[#818CF8]"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Idea
        </Button>
      </div>

      {/* AI Banner */}
      <div className="rounded-lg border border-[#6366F1]/20 bg-[#6366F1]/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#6366F1]" />
          <p className="text-sm text-[#9CA3AF]">
            <span className="font-medium text-[#6366F1]">AI Brainstorm</span>{' '}
            &mdash; AI-powered idea expansion, validation, and market research coming soon.
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              statusFilter === f
                ? 'bg-[#6366F1] text-white'
                : 'bg-[#1A1A24] text-[#9CA3AF] hover:bg-[#2D2D3A]'
            }`}
          >
            {f === 'ALL' ? 'All' : STATUS_LABELS[f]}
            {f === 'ALL' && (
              <span className="ml-1.5 text-xs opacity-70">{ideas.length}</span>
            )}
            {f !== 'ALL' && (
              <span className="ml-1.5 text-xs opacity-70">
                {ideas.filter((i) => i.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#2D2D3A] bg-[#1A1A24] py-16">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#F59E0B]/10">
            <Lightbulb className="h-7 w-7 text-[#F59E0B]" />
          </div>
          <h3 className="font-semibold text-[#F1F1F3]">
            {statusFilter === 'ALL' ? 'No ideas yet' : `No ${STATUS_LABELS[statusFilter]?.toLowerCase()} ideas`}
          </h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            Capture your first idea and let AI help expand it
          </p>
          <Button
            onClick={handleOpenNew}
            className="mt-4 bg-[#6366F1] text-white hover:bg-[#818CF8]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Idea
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIdeas.map((idea) => {
            const hasRatings =
              idea.impactRating !== null &&
              idea.effortRating !== null &&
              idea.excitementRating !== null
            const avgScore = hasRatings
              ? ((idea.impactRating! + idea.effortRating! + idea.excitementRating!) / 3).toFixed(1)
              : null

            return (
              <div
                key={idea.id}
                onClick={() => handleOpenEdit(idea)}
                className="group cursor-pointer rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-4 transition hover:border-[#3D3D4A] hover:bg-[#1E1E2A]"
              >
                {/* Top row: status + delete */}
                <div className="flex items-start justify-between mb-2">
                  <Badge className={`text-[10px] ${STATUS_COLORS[idea.status]}`}>
                    {STATUS_LABELS[idea.status]}
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(idea.id)
                    }}
                    className="rounded p-1 text-[#6B7280] opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Title */}
                <h3 className="font-medium text-[#F1F1F3] mb-1 line-clamp-1">
                  {idea.title}
                </h3>

                {/* Description snippet */}
                {idea.description && (
                  <p className="text-sm text-[#9CA3AF] line-clamp-2 mb-3">
                    {idea.description}
                  </p>
                )}

                {/* Tags */}
                {idea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {idea.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#2D2D3A] px-2 py-0.5 text-[10px] text-[#9CA3AF]"
                      >
                        {tag}
                      </span>
                    ))}
                    {idea.tags.length > 3 && (
                      <span className="text-[10px] text-[#6B7280]">
                        +{idea.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Ratings */}
                {hasRatings && (
                  <div className="flex items-center gap-3 pt-2 border-t border-[#2D2D3A]">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-[#10B981]" />
                      <span className="text-[10px] text-[#9CA3AF]">Impact {idea.impactRating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                      <span className="text-[10px] text-[#9CA3AF]">Effort {idea.effortRating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-[#EC4899]" />
                      <span className="text-[10px] text-[#9CA3AF]">Exc {idea.excitementRating}</span>
                    </div>
                    <span className="ml-auto text-xs font-semibold text-[#6366F1]">
                      {avgScore}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <IdeaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        idea={selectedIdea}
      />
    </div>
  )
}
