'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createPage } from '@/app/actions/page.actions'
import { Loader2 } from 'lucide-react'

interface PageTreeItem {
  id: string
  parentId: string | null
  title: string
  icon: string | null
}

interface PageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pages: PageTreeItem[]
  defaultParentId?: string | null
  onCreated: () => void
}

const EMOJI_OPTIONS = [
  '', '📄', '📝', '📁', '📚', '💡', '🎯', '🔧', '📊', '🗂️',
  '✅', '🚀', '💻', '📋', '🔬', '📖', '🎨', '⚡', '🌟', '🏗️',
]

export default function PageDialog({
  open,
  onOpenChange,
  pages,
  defaultParentId,
  onCreated,
}: PageDialogProps) {
  const [title, setTitle] = useState('')
  const [parentId, setParentId] = useState<string>('')
  const [icon, setIcon] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setTitle('')
    setParentId(defaultParentId || '')
    setIcon('')
    setError('')
  }, [open, defaultParentId])

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setSaving(true)
    setError('')

    const result = await createPage({
      title: title.trim(),
      parentId: parentId || null,
      icon: icon || null,
      tags: [],
      isTemplate: false,
    })

    setSaving(false)

    if (result.success) {
      onCreated()
      onOpenChange(false)
    } else {
      setError(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-[#2D2D3A] bg-[#1A1A24]">
        <DialogHeader>
          <DialogTitle className="text-[#F1F1F3]">New Page</DialogTitle>
          <DialogDescription className="text-[#9CA3AF]">
            Create a new knowledge base page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-[#9CA3AF]">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Page title"
              className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3] placeholder:text-[#6B7280]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit()
              }}
              autoFocus
            />
          </div>

          {/* Parent Page */}
          <div className="space-y-1.5">
            <Label className="text-[#9CA3AF]">Parent page (optional)</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3]">
                <SelectValue placeholder="No parent (root page)" />
              </SelectTrigger>
              <SelectContent className="border-[#2D2D3A] bg-[#1A1A24]">
                <SelectItem value="none">No parent (root page)</SelectItem>
                {pages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    <span>
                      {page.icon ? `${page.icon} ` : ''}
                      {page.title}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <Label className="text-[#9CA3AF]">Icon (optional)</Label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji || 'none'}
                  onClick={() => setIcon(emoji)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${
                    icon === emoji
                      ? 'bg-[#6366F1] text-white'
                      : 'bg-[#0F0F14] text-[#9CA3AF] hover:bg-[#2D2D3A]'
                  }`}
                >
                  {emoji || '—'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-[#2D2D3A] px-4 py-2 text-sm text-[#9CA3AF] transition-colors hover:bg-[#2D2D3A]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5558E3] disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Create
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
