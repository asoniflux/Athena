'use client'

import { useState, useEffect } from 'react'
import {
  Video,
  Plus,
  Clapperboard,
  Trash2,
  Edit3,
  BarChart3,
  Film,
  CheckCircle2,
} from 'lucide-react'
import {
  getProductions,
  createProduction,
  updateProduction,
  deleteProduction,
} from '@/app/actions/media.actions'
import ProductionDialog from './production-dialog'

interface Production {
  id: string
  title: string
  description: string | null
  platform: string | null
  status: string
  createdAt: string
  _count: { shots: number }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  CONCEPT: { label: 'Concept', color: 'text-[#9CA3AF]', bg: 'bg-[#9CA3AF]/10' },
  SCRIPT: { label: 'Script', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  PRE_PRODUCTION: { label: 'Pre-Prod', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  SHOOT: { label: 'Shoot', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  EDIT: { label: 'Edit', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  PUBLISHED: { label: 'Published', color: 'text-green-400', bg: 'bg-green-400/10' },
}

const PLATFORM_LABELS: Record<string, string> = {
  YOUTUBE: 'YouTube',
  INSTAGRAM: 'Instagram',
  LINKEDIN: 'LinkedIn',
  TWITTER: 'Twitter',
  BLOG: 'Blog',
  NEWSLETTER: 'Newsletter',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function MediaView() {
  const [productions, setProductions] = useState<Production[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduction, setEditingProduction] = useState<Production | null>(null)

  useEffect(() => {
    loadProductions()
  }, [])

  async function loadProductions() {
    const result = await getProductions()
    if (result.success) {
      setProductions(result.data as Production[])
    }
  }

  async function handleSave(data: { id?: string; title: string; description?: string | null; platform?: string | null; status: string }) {
    if (data.id) {
      await updateProduction(data.id, {
        title: data.title,
        description: data.description || undefined,
        platform: data.platform || null,
        status: data.status,
      })
    } else {
      await createProduction({
        title: data.title,
        description: data.description || undefined,
        platform: data.platform || undefined,
        status: data.status,
      })
    }
    setEditingProduction(null)
    await loadProductions()
  }

  async function handleDelete(id: string) {
    await deleteProduction(id)
    await loadProductions()
  }

  function handleEdit(production: Production) {
    setEditingProduction(production)
    setDialogOpen(true)
  }

  function handleNewProduction() {
    setEditingProduction(null)
    setDialogOpen(true)
  }

  // Stats
  const total = productions.length
  const inProduction = productions.filter((p) =>
    ['SCRIPT', 'PRE_PRODUCTION', 'SHOOT', 'EDIT'].includes(p.status)
  ).length
  const published = productions.filter((p) => p.status === 'PUBLISHED').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F1F3]">Media Planner</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">Plan and manage your video productions</p>
        </div>
        <button
          onClick={handleNewProduction}
          className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#818CF8] transition"
        >
          <Plus className="h-4 w-4" />
          New Production
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6366F1]/10">
              <BarChart3 className="h-4 w-4 text-[#6366F1]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#F1F1F3]">{total}</p>
              <p className="text-xs text-[#9CA3AF]">Total Productions</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10">
              <Film className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#F1F1F3]">{inProduction}</p>
              <p className="text-xs text-[#9CA3AF]">In Production</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-400/10">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#F1F1F3]">{published}</p>
              <p className="text-xs text-[#9CA3AF]">Published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Productions Table or Empty State */}
      {productions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#2D2D3A] bg-[#1A1A24] py-16">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#6366F1]/10">
            <Clapperboard className="h-7 w-7 text-[#6366F1]" />
          </div>
          <h3 className="font-semibold text-[#F1F1F3]">No productions yet</h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            Create your first production to get started
          </p>
          <button
            onClick={handleNewProduction}
            className="mt-4 flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#818CF8] transition"
          >
            <Plus className="h-4 w-4" />
            Create Production
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2D2D3A] text-left text-xs text-[#6B7280]">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Platform</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Shots</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productions.map((production) => {
                const statusConfig = STATUS_CONFIG[production.status] || STATUS_CONFIG.CONCEPT
                return (
                  <tr
                    key={production.id}
                    onClick={() => handleEdit(production)}
                    className="cursor-pointer border-b border-[#2D2D3A]/50 hover:bg-[#242430] transition"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-[#F1F1F3]">{production.title}</p>
                        {production.description && (
                          <p className="mt-0.5 text-xs text-[#6B7280] truncate max-w-[300px]">
                            {production.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#9CA3AF]">
                      {production.platform ? PLATFORM_LABELS[production.platform] || production.platform : '--'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.color} ${statusConfig.bg}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#9CA3AF]">{production._count.shots}</td>
                    <td className="px-4 py-3 text-[#9CA3AF]">{formatDate(production.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(production)}
                          className="rounded p-1.5 text-[#6B7280] hover:text-[#6366F1] hover:bg-[#2D2D3A] transition"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(production.id)}
                          className="rounded p-1.5 text-[#6B7280] hover:text-red-400 hover:bg-[#2D2D3A] transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog */}
      <ProductionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        production={editingProduction}
        onSave={handleSave}
      />
    </div>
  )
}
