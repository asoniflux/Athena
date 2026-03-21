"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  MessageSquare,
  MoreHorizontal,
  X,
  BookOpen,
  FolderOpen,
  PenTool,
  Lightbulb,
  Target,
  Video,
  Settings,
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

const PRIMARY_TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { key: "tasks", label: "Tasks", icon: CheckSquare, href: "/tasks" },
  { key: "calendar", label: "Calendar", icon: Calendar, href: "/calendar" },
  { key: "chat", label: "Chat", icon: MessageSquare, href: "/chat" },
]

export function MobileNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  // Modules not in the primary tabs
  const moreModules = SIDEBAR_MODULES.filter(
    (m) => !PRIMARY_TABS.some((t) => t.key === m.key)
  )

  return (
    <>
      {/* More menu overlay */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-16 left-0 right-0 bg-[#1A1A24] border-t border-[#2D2D3A] rounded-t-2xl p-4 space-y-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[#F1F1F3]">More</span>
              <button
                onClick={() => setMoreOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-[#2D2D3A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {moreModules.map((module) => {
                const Icon = ICON_MAP[module.icon]
                return (
                  <Link
                    key={module.key}
                    href={module.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs transition-colors",
                      isActive(module.href)
                        ? "bg-[#6366F1]/15 text-[#6366F1]"
                        : "text-[#9CA3AF] hover:bg-[#2D2D3A]"
                    )}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    <span>{module.label}</span>
                  </Link>
                )
              })}
              <Link
                href="/settings"
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs transition-colors",
                  isActive("/settings")
                    ? "bg-[#6366F1]/15 text-[#6366F1]"
                    : "text-[#9CA3AF] hover:bg-[#2D2D3A]"
                )}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[#1A1A24] border-t border-[#2D2D3A]">
        <div className="flex items-center justify-around h-16">
          {PRIMARY_TABS.map((tab) => {
            const active = isActive(tab.href)
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-1 min-w-[56px] py-1 text-xs transition-colors",
                  active ? "text-[#6366F1]" : "text-[#6B7280]"
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
                {active && (
                  <div className="absolute top-0 h-0.5 w-8 bg-[#6366F1] rounded-b" />
                )}
              </Link>
            )
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[56px] py-1 text-xs transition-colors",
              moreOpen ? "text-[#6366F1]" : "text-[#6B7280]"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  )
}
