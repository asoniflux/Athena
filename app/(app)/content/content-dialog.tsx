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
import { createContentPiece, updateContentPiece } from '@/app/actions/content.actions'

const PLATFORMS = [
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'BLOG', label: 'Blog' },
  { value: 'NEWSLETTER', label: 'Newsletter' },
  { value: 'TWITTER', label: 'Twitter' },
]

const STATUSES = [
  { value: 'IDEA', label: 'Idea' },
  { value: 'OUTLINE', label: 'Outline' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'EDIT', label: 'Editing' },
  { value: 'READY', label: 'Ready' },
  { value: 'PUBLISHED', label: 'Published' },
]

interface ContentPiece {
  id: string
  title: string
  platform: string
  status: string
  body?: unknown
  bodyText?: string | null
  tags: string[]
  publishDate?: string | null
}

interface ContentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  content?: ContentPiece | null
}

export function ContentDialog({ open, onOpenChange, content }: ContentDialogProps) {
  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('BLOG')
  const [status, setStatus] = useState('IDEA')
  const [body, setBody] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (content) {
      setTitle(content.title)
      setPlatform(content.platform)
      setStatus(content.status)
      setBody(content.bodyText || (typeof content.body === 'string' ? content.body : '') )
      setTagsInput(content.tags.join(', '))
      setPublishDate(
        content.publishDate
          ? new Date(content.publishDate).toISOString().slice(0, 16)
          : ''
      )
    } else {
      setTitle('')
      setPlatform('BLOG')
      setStatus('IDEA')
      setBody('')
      setTagsInput('')
      setPublishDate('')
    }
  }, [content, open])

  const handleSubmit = async () => {
    if (!title.trim()) return
    setSaving(true)

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      title,
      platform: platform as any,
      status: status as any,
      body: body || undefined,
      tags,
      publishDate: publishDate ? new Date(publishDate).toISOString() : undefined,
    }

    try {
      if (content) {
        await updateContentPiece(content.id, payload)
      } else {
        await createContentPiece(payload)
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
            {content ? 'Edit Content' : 'New Content'}
          </DialogTitle>
          <DialogDescription className="text-[#9CA3AF]">
            {content ? 'Update your content piece.' : 'Create a new content piece for your pipeline.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-[#9CA3AF]">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Content title"
              className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3] placeholder:text-[#6B7280]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Platform */}
            <div className="space-y-2">
              <Label className="text-[#9CA3AF]">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#2D2D3A] bg-[#1A1A24]">
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
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
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label className="text-[#9CA3AF]">Body</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your content here..."
              rows={8}
              className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3] placeholder:text-[#6B7280] resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-[#9CA3AF]">Tags (comma-separated)</Label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., tutorial, react, nextjs"
              className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3] placeholder:text-[#6B7280]"
            />
          </div>

          {/* Publish Date */}
          <div className="space-y-2">
            <Label className="text-[#9CA3AF]">Publish Date (optional)</Label>
            <Input
              type="datetime-local"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3]"
            />
          </div>
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
            {saving ? 'Saving...' : content ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
