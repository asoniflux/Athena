"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import {
  Search,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BookOpen,
  FolderOpen,
  PenTool,
  Lightbulb,
  Target,
  MessageSquare,
  Video,
  Plus,
  FileText,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SIDEBAR_MODULES } from "@/lib/constants"

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BookOpen,
  FolderOpen,
  PenTool,
  Lightbulb,
  Target,
  MessageSquare,
  Video,
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")

  // Cmd+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  const handleSelect = useCallback(
    (href: string) => {
      onOpenChange(false)
      setSearch("")
      router.push(href)
    },
    [router, onOpenChange]
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          onOpenChange(false)
          setSearch("")
        }}
      />

      {/* Palette */}
      <div className="relative flex items-start justify-center pt-[20vh]">
        <Command
          className="w-full max-w-lg rounded-xl bg-[#1A1A24] border border-[#2D2D3A] shadow-2xl shadow-black/40 overflow-hidden"
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Escape") {
              onOpenChange(false)
              setSearch("")
            }
          }}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b border-[#2D2D3A]">
            <Search className="h-4 w-4 shrink-0 text-[#6B7280]" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              className="flex-1 h-12 bg-transparent text-sm text-[#F1F1F3] placeholder:text-[#6B7280] outline-none"
            />
            <kbd className="rounded border border-[#2D2D3A] bg-[#242430] px-1.5 py-0.5 text-xs text-[#6B7280]">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-[#6B7280]">
              No results found.
            </Command.Empty>

            {/* Navigation group */}
            <Command.Group
              heading="Navigation"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#6B7280] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            >
              {SIDEBAR_MODULES.map((module) => {
                const Icon = ICON_MAP[module.icon]
                return (
                  <Command.Item
                    key={module.key}
                    value={module.label}
                    onSelect={() => handleSelect(module.href)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#9CA3AF] rounded-lg cursor-pointer data-[selected=true]:bg-[#242430] data-[selected=true]:text-[#F1F1F3] transition-colors"
                  >
                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                    <span>{module.label}</span>
                    <span className="ml-auto text-xs text-[#6B7280]">
                      {module.shortcut}
                    </span>
                  </Command.Item>
                )
              })}
            </Command.Group>

            {/* Quick Actions group */}
            <Command.Group
              heading="Quick Actions"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#6B7280] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            >
              <Command.Item
                value="New Task"
                onSelect={() => handleSelect("/tasks?new=true")}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#9CA3AF] rounded-lg cursor-pointer data-[selected=true]:bg-[#242430] data-[selected=true]:text-[#F1F1F3] transition-colors"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span>New Task</span>
              </Command.Item>
              <Command.Item
                value="New Note"
                onSelect={() => handleSelect("/knowledge?new=true")}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#9CA3AF] rounded-lg cursor-pointer data-[selected=true]:bg-[#242430] data-[selected=true]:text-[#F1F1F3] transition-colors"
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span>New Note</span>
              </Command.Item>
              <Command.Item
                value="New Idea"
                onSelect={() => handleSelect("/ideas?new=true")}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#9CA3AF] rounded-lg cursor-pointer data-[selected=true]:bg-[#242430] data-[selected=true]:text-[#F1F1F3] transition-colors"
              >
                <Lightbulb className="h-4 w-4 shrink-0" />
                <span>New Idea</span>
              </Command.Item>
            </Command.Group>

            {/* Recent group */}
            <Command.Group
              heading="Recent"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#6B7280] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            >
              <Command.Item
                value="Recent Dashboard"
                onSelect={() => handleSelect("/dashboard")}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#9CA3AF] rounded-lg cursor-pointer data-[selected=true]:bg-[#242430] data-[selected=true]:text-[#F1F1F3] transition-colors"
              >
                <Zap className="h-4 w-4 shrink-0" />
                <span>Dashboard</span>
                <span className="ml-auto text-xs text-[#6B7280]">Visited recently</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
