"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
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

const STORAGE_KEY = "athena-sidebar-collapsed"

function useCollapsedState(): [boolean, (value: boolean) => void] {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setCollapsed(stored === "true")
    }
  }, [])

  const setAndPersist = useCallback((value: boolean) => {
    setCollapsed(value)
    localStorage.setItem(STORAGE_KEY, String(value))
  }, [])

  return [collapsed, setAndPersist]
}

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useCollapsedState()

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-[#1A1A24] border-r border-[#2D2D3A] transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-[#2D2D3A]">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#6366F1]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span
            className={cn(
              "text-lg font-semibold text-[#F1F1F3] whitespace-nowrap transition-opacity duration-300",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}
          >
            Athena AI
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {SIDEBAR_MODULES.map((module) => {
          const Icon = ICON_MAP[module.icon]
          const isActive = pathname === module.href || pathname.startsWith(module.href + "/")

          return (
            <Link
              key={module.key}
              href={module.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-[#6366F1]/15 text-[#6366F1]"
                  : "text-[#9CA3AF] hover:bg-[#2D2D3A] hover:text-[#F1F1F3]",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? module.label : undefined}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-[#6366F1]" : "text-[#6B7280]"
                  )}
                />
              )}
              <span
                className={cn(
                  "whitespace-nowrap transition-opacity duration-300",
                  collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                )}
              >
                {module.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[#2D2D3A] p-2 space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#9CA3AF] hover:bg-[#2D2D3A] hover:text-[#F1F1F3] transition-colors duration-150",
            pathname.startsWith("/settings") && "bg-[#6366F1]/15 text-[#6366F1]",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings
            className={cn(
              "h-5 w-5 shrink-0",
              pathname.startsWith("/settings") ? "text-[#6366F1]" : "text-[#6B7280]"
            )}
          />
          <span
            className={cn(
              "whitespace-nowrap transition-opacity duration-300",
              collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            )}
          >
            Settings
          </span>
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-[#9CA3AF] hover:bg-[#2D2D3A] hover:text-[#F1F1F3] transition-colors duration-150",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 shrink-0 text-[#6B7280]" />
          ) : (
            <ChevronLeft className="h-5 w-5 shrink-0 text-[#6B7280]" />
          )}
          <span
            className={cn(
              "whitespace-nowrap transition-opacity duration-300",
              collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            )}
          >
            Collapse
          </span>
        </button>
      </div>
    </aside>
  )
}
