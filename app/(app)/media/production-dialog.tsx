'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface ProductionData {
  id?: string
  title: string
  description?: string | null
  platform?: string | null
  status: string
}

interface ProductionFormData {
  id?: string
  title: string
  description: string
  platform: string
  status: string
}

const PLATFORMS = [
  { value: '', label: 'Select platform' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'TWITTER', label: 'Twitter' },
  { value: 'BLOG', label: 'Blog' },
  { value: 'NEWSLETTER', label: 'Newsletter' },
]

const STATUSES = [
  { value: 'CONCEPT', label: 'Concept' },
  { value: 'SCRIPT', label: 'Script' },
  { value: 'PRE_PRODUCTION', label: 'Pre-Production' },
  { value: 'SHOOT', label: 'Shoot' },
  { value: 'EDIT', label: 'Edit' },
  { value: 'PUBLISHED', label: 'Published' },
]

export default function ProductionDialog({
  open,
  onOpenChange,
  production,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  production?: ProductionData | null
  onSave: (data: ProductionData) => Promise<void>
}) {
  const [form, setForm] = useState<ProductionFormData>({
    title: '',
    description: '',
    platform: '',
    status: 'CONCEPT',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (production) {
      setForm({
        id: production.id,
        title: production.title,
        description: production.description || '',
        platform: production.platform || '',
        status: production.status,
      })
    } else {
      setForm({ title: '', description: '', platform: '', status: 'CONCEPT' })
    }
  }, [production, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return

    setSaving(true)
    try {
      await onSave(form)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1A1A24] border-[#2D2D3A]">
        <DialogHeader>
          <DialogTitle className="text-[#F1F1F3]">
            {production ? 'Edit Production' : 'New Production'}
          </DialogTitle>
          <DialogDescription className="text-[#9CA3AF]">
            {production ? 'Update your production details.' : 'Create a new media production.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#F1F1F3]">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Production title..."
              className="w-full rounded-lg border border-[#2D2D3A] bg-[#0F0F14] px-3 py-2 text-sm text-[#F1F1F3] placeholder-[#6B7280] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#F1F1F3]">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your production..."
              rows={3}
              className="w-full rounded-lg border border-[#2D2D3A] bg-[#0F0F14] px-3 py-2 text-sm text-[#F1F1F3] placeholder-[#6B7280] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] resize-none"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#F1F1F3]">Platform</label>
            <select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className="w-full rounded-lg border border-[#2D2D3A] bg-[#0F0F14] px-3 py-2 text-sm text-[#F1F1F3] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#F1F1F3]">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border border-[#2D2D3A] bg-[#0F0F14] px-3 py-2 text-sm text-[#F1F1F3] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-[#2D2D3A] px-4 py-2 text-sm text-[#9CA3AF] hover:bg-[#2D2D3A] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.title.trim() || saving}
              className="rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#818CF8] transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : production ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
