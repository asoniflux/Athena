'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createIdea, updateIdea } from '@/app/actions/idea.actions'

const STATUSES = [
  { value: 'RAW', label: 'Raw' },
  { value: 'EXPLORING', label: 'Exploring' },
  { value: 'VALIDATED', label: 'Validated' },
  { value: 'ARCHIVED', label: 'Archived' },
]

const CATEGORIES = [
  'Content', 'Product', 'Business', 'Marketing',
  'Technology', 'Personal', 'Creative', 'Other',
]

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
}

interface IdeaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idea?: Idea | null
}

export function IdeaDialog({ open, onOpenChange, idea }: IdeaDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('RAW')
  const [tagsInput, setTagsInput] = useState('')
  const [impact, setImpact] = useState(3)
  const [effort, setEffort] = useState(3)
  const [excitement, setExcitement] = useState(3)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (idea) {
      setTitle(idea.title)
      setDescription(idea.description || '')
      setCategory(idea.category || '')
      setStatus(idea.status)
      setTagsInput(idea.tags.join(', '))
      setImpact(idea.impactRating || 3)
      setEffort(idea.effortRating || 3)
      setExcitement(idea.excitementRating || 3)
    } else {
      setTitle('')
      setDescription('')
      setCategory('')
      setStatus('RAW')
      setTagsInput('')
      setImpact(3)
      setEffort(3)
      setExcitement(3)
    }
  }, [idea, open])

  const score = ((impact + effort + excitement) / 3).toFixed(1)

  const handleSubmit = async () => {
    if (!title.trim()) return
    setSaving(true)

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      if (idea) {
        await updateIdea(idea.id, {
          title,
          description,
          category: category || undefined,
          status,
          tags,
          impactRating: impact,
          effortRating: effort,
          excitementRating: excitement,
        })
      } else {
        await createIdea({
          title,
          description,
          category: category || undefined,
          tags,
        })
      }
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#2D2D3A] bg-[#1A1A24] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#F1F1F3]">
            {idea ? 'Edit Idea' : 'New Idea'}
          </DialogTitle>
          <DialogDescription className="text-[#9CA3AF]">
            {idea ? 'Update your idea details and ratings.' : 'Capture a new idea.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-[#9CA3AF]">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's the idea?"
              className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3] placeholder:text-[#6B7280]"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-[#9CA3AF]">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the idea in more detail..."
              rows={3}
              className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3] placeholder:text-[#6B7280] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label className="text-[#9CA3AF]">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="border-[#2D2D3A] bg-[#1A1A24]">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status (only on edit) */}
            {idea && (
              <div className="space-y-2">
                <Label className="text-[#9CA3AF]">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#2D2D3A] bg-[#1A1A24]">
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-[#9CA3AF]">Tags (comma-separated)</Label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., saas, mobile, ai"
              className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3] placeholder:text-[#6B7280]"
            />
          </div>

          {/* Ratings */}
          {idea && (
            <div className="space-y-3 rounded-lg border border-[#2D2D3A] bg-[#0F0F14] p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-[#F1F1F3]">Ratings</h4>
                <span className="text-sm font-semibold text-[#6366F1]">
                  Score: {score}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[#9CA3AF]">Impact</label>
                  <span className="text-xs text-[#10B981]">{impact}/5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={impact}
                  onChange={(e) => setImpact(Number(e.target.value))}
                  className="w-full accent-[#10B981] h-1.5"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[#9CA3AF]">Effort</label>
                  <span className="text-xs text-[#F59E0B]">{effort}/5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={effort}
                  onChange={(e) => setEffort(Number(e.target.value))}
                  className="w-full accent-[#F59E0B] h-1.5"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[#9CA3AF]">Excitement</label>
                  <span className="text-xs text-[#EC4899]">{excitement}/5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={excitement}
                  onChange={(e) => setExcitement(Number(e.target.value))}
                  className="w-full accent-[#EC4899] h-1.5"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#2D2D3A] text-[#9CA3AF] hover:bg-[#2D2D3A]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || saving}
            className="bg-[#6366F1] text-white hover:bg-[#818CF8]"
          >
            {saving ? 'Saving...' : idea ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
