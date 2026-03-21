'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PenTool, Plus, Trash2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ContentDialog } from './content-dialog'
import { updateContentPiece, deleteContentPiece } from '@/app/actions/content.actions'

type ContentPiece = {
  id: string
  title: string
  platform: string
  status: string
  body?: unknown
  bodyText?: string | null
  tags: string[]
  publishDate?: string | null
  createdAt: string
}

const COLUMNS = [
  { status: 'IDEA', label: 'Ideas', color: 'bg-[#F59E0B]' },
  { status: 'DRAFT', label: 'Drafting', color: 'bg-[#3B82F6]' },
  { status: 'EDIT', label: 'Editing', color: 'bg-[#8B5CF6]' },
  { status: 'READY', label: 'Scheduled', color: 'bg-[#6366F1]' },
  { status: 'PUBLISHED', label: 'Published', color: 'bg-[#10B981]' },
]

const PLATFORM_COLORS: Record<string, string> = {
  LINKEDIN: 'bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20',
  INSTAGRAM: 'bg-[#E4405F]/10 text-[#E4405F] border-[#E4405F]/20',
  YOUTUBE: 'bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/20',
  BLOG: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
  NEWSLETTER: 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20',
  TWITTER: 'bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/20',
}

const PLATFORM_LABELS: Record<string, string> = {
  LINKEDIN: 'LinkedIn',
  INSTAGRAM: 'Instagram',
  YOUTUBE: 'YouTube',
  BLOG: 'Blog',
  NEWSLETTER: 'Newsletter',
  TWITTER: 'Twitter',
}

const STATUS_LABELS: Record<string, string> = {
  IDEA: 'Idea',
  OUTLINE: 'Outline',
  DRAFT: 'Draft',
  EDIT: 'Editing',
  READY: 'Ready',
  PUBLISHED: 'Published',
}

const ALL_STATUSES = ['IDEA', 'OUTLINE', 'DRAFT', 'EDIT', 'READY', 'PUBLISHED']

export default function ContentView({ initialPieces }: { initialPieces: ContentPiece[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState<ContentPiece | null>(null)

  const handleOpenNew = () => {
    setSelectedContent(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (piece: ContentPiece) => {
    setSelectedContent(piece)
    setDialogOpen(true)
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    startTransition(async () => {
      await updateContentPiece(id, { status: newStatus })
      router.refresh()
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteContentPiece(id)
      router.refresh()
    })
  }

  // Group content by column status. OUTLINE goes into DRAFT column
  const getColumnContent = (columnStatus: string) => {
    if (columnStatus === 'DRAFT') {
      return initialPieces.filter((c) => c.status === 'DRAFT' || c.status === 'OUTLINE')
    }
    return initialPieces.filter((c) => c.status === columnStatus)
  }

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]/10">
            <PenTool className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F1F1F3]">Content Studio</h1>
            <p className="text-sm text-[#9CA3AF]">
              Plan, create, and publish content across platforms
            </p>
          </div>
        </div>
        <Button
          onClick={handleOpenNew}
          className="bg-[#6366F1] text-white hover:bg-[#818CF8]"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Content
        </Button>
      </div>

      {/* AI Feature Banner */}
      <div className="mb-6 rounded-lg border border-[#6366F1]/20 bg-[#6366F1]/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#6366F1]" />
          <p className="text-sm text-[#9CA3AF]">
            <span className="font-medium text-[#6366F1]">AI Content Writer</span>{' '}
            &mdash; AI-powered drafting, repurposing, and SEO optimization coming soon.
          </p>
        </div>
      </div>

      {/* Content Pipeline - Kanban */}
      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => {
          const columnItems = getColumnContent(column.status)

          return (
            <div
              key={column.status}
              className="flex w-64 flex-shrink-0 flex-col rounded-xl border border-[#2D2D3A] bg-[#1A1A24]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-[#2D2D3A] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${column.color}`} />
                  <h3 className="text-sm font-semibold text-[#F1F1F3]">
                    {column.label}
                  </h3>
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#2D2D3A] px-1.5 text-xs text-[#6B7280]">
                    {columnItems.length}
                  </span>
                </div>
                <button
                  onClick={handleOpenNew}
                  className="rounded p-1 text-[#6B7280] transition-colors hover:bg-[#2D2D3A] hover:text-[#F1F1F3]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Column Body */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {columnItems.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#2D2D3A] p-4 text-center">
                    <p className="text-xs text-[#6B7280]">No content in this stage</p>
                  </div>
                ) : (
                  columnItems.map((piece) => (
                    <div
                      key={piece.id}
                      onClick={() => handleOpenEdit(piece)}
                      className="group cursor-pointer rounded-lg border border-[#2D2D3A] bg-[#0F0F14] p-3 transition hover:border-[#6366F1]/30"
                    >
                      {/* Title */}
                      <h4 className="text-sm font-medium text-[#F1F1F3] mb-2 line-clamp-2">
                        {piece.title}
                      </h4>

                      {/* Platform badge */}
                      <Badge className={`text-[10px] mb-2 ${PLATFORM_COLORS[piece.platform] || 'bg-[#2D2D3A] text-[#9CA3AF]'}`}>
                        {PLATFORM_LABELS[piece.platform] || piece.platform}
                      </Badge>

                      {/* Tags */}
                      {piece.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {piece.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[#6366F1]/10 px-1.5 py-0.5 text-[10px] text-[#6366F1]"
                            >
                              {tag}
                            </span>
                          ))}
                          {piece.tags.length > 2 && (
                            <span className="text-[10px] text-[#6B7280]">
                              +{piece.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Publish date */}
                      {piece.publishDate && (
                        <p className="text-[10px] text-[#6B7280] mb-2">
                          {new Date(piece.publishDate).toLocaleDateString()}
                        </p>
                      )}

                      {/* Status change + delete */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#2D2D3A]">
                        <select
                          value={piece.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(piece.id, e.target.value)}
                          className="rounded bg-[#2D2D3A] px-1.5 py-0.5 text-[10px] text-[#9CA3AF] outline-none cursor-pointer"
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {STATUS_LABELS[st]}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(piece.id)
                          }}
                          className="rounded p-1 text-[#6B7280] opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 transition"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      <ContentDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) router.refresh()
        }}
        content={selectedContent}
      />
    </div>
  )
}
