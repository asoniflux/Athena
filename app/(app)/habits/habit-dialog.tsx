'use client'

import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createHabit, updateHabit } from '@/app/actions/habit.actions'

const CATEGORIES = [
  { value: 'HEALTH', label: 'Health' },
  { value: 'PRODUCTIVITY', label: 'Productivity' },
  { value: 'LEARNING', label: 'Learning' },
  { value: 'MINDFULNESS', label: 'Mindfulness' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'SOCIAL', label: 'Social' },
  { value: 'CREATIVE', label: 'Creative' },
]

const FREQUENCIES = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'SPECIFIC_DAYS', label: 'Specific Days' },
  { value: 'X_PER_WEEK', label: 'X per Week' },
]

const PRESET_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#3B82F6', '#06B6D4',
]

const PRESET_ICONS = ['🏃', '📚', '💪', '🧘', '💧', '✍️', '🎯', '💤', '🥗', '🎵', '💻', '🌅']

interface HabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit?: {
    id: string
    name: string
    icon: string | null
    color: string | null
    category: string
    frequency: string
    targetDays: number[]
    targetValue: number | null
    unit: string | null
  } | null
}

export function HabitDialog({ open, onOpenChange, habit }: HabitDialogProps) {
  const [name, setName] = useState(habit?.name || '')
  const [icon, setIcon] = useState(habit?.icon || '🎯')
  const [color, setColor] = useState(habit?.color || '#6366F1')
  const [category, setCategory] = useState(habit?.category || 'PRODUCTIVITY')
  const [frequency, setFrequency] = useState(habit?.frequency || 'DAILY')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSaving(true)

    try {
      if (habit) {
        await updateHabit(habit.id, { name, icon, color, category, frequency })
      } else {
        await createHabit({ name, icon, color, category, frequency })
      }
      onOpenChange(false)
      setName('')
      setIcon('🎯')
      setColor('#6366F1')
      setCategory('PRODUCTIVITY')
      setFrequency('DAILY')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#2D2D3A] bg-[#1A1A24]">
        <DialogHeader>
          <DialogTitle className="text-[#F1F1F3]">
            {habit ? 'Edit Habit' : 'New Habit'}
          </DialogTitle>
          <DialogDescription className="text-[#9CA3AF]">
            {habit ? 'Update your habit details.' : 'Create a new habit to track daily.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-[#9CA3AF]">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Run"
              className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3] placeholder:text-[#6B7280]"
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label className="text-[#9CA3AF]">Icon</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition ${
                    icon === emoji
                      ? 'bg-[#6366F1]/20 ring-2 ring-[#6366F1]'
                      : 'bg-[#0F0F14] hover:bg-[#2D2D3A]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-[#9CA3AF]">Color</Label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full transition ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1A1A24]' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-[#9CA3AF]">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#2D2D3A] bg-[#1A1A24]">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label className="text-[#9CA3AF]">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#2D2D3A] bg-[#1A1A24]">
                {FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            disabled={!name.trim() || saving}
            className="bg-[#6366F1] text-white hover:bg-[#818CF8]"
          >
            {saving ? 'Saving...' : habit ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
