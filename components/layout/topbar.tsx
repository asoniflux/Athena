"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Menu,
  Search,
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface TopbarProps {
  onCommandPaletteOpen: () => void
  onMobileMenuOpen?: () => void
}

export function Topbar({ onCommandPaletteOpen, onMobileMenuOpen }: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="flex items-center h-16 px-4 md:px-6 bg-[#1A1A24] border-b border-[#2D2D3A] gap-4">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuOpen}
        className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg text-[#9CA3AF] hover:bg-[#2D2D3A] hover:text-[#F1F1F3] transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search bar */}
      <button
        onClick={onCommandPaletteOpen}
        className="flex items-center flex-1 max-w-md h-10 px-3 gap-2 rounded-lg bg-[#242430] border border-[#2D2D3A] text-[#6B7280] hover:border-[#6366F1]/50 transition-colors cursor-pointer"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="text-sm flex-1 text-left">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-[#2D2D3A] bg-[#1A1A24] px-1.5 py-0.5 text-xs text-[#6B7280]">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User avatar dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#2D2D3A] transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="text-xs">U</AvatarFallback>
          </Avatar>
          <ChevronDown
            className={cn(
              "hidden sm:block h-4 w-4 text-[#6B7280] transition-transform duration-200",
              dropdownOpen && "rotate-180"
            )}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[#242430] border border-[#2D2D3A] shadow-lg shadow-black/20 py-1 z-50">
            {/* User info */}
            <div className="px-4 py-3 border-b border-[#2D2D3A]">
              <p className="text-sm font-medium text-[#F1F1F3]">User</p>
              <p className="text-xs text-[#6B7280] truncate">user@athena.ai</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#9CA3AF] hover:bg-[#2D2D3A] hover:text-[#F1F1F3] transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>

              <Link
                href="/settings/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#9CA3AF] hover:bg-[#2D2D3A] hover:text-[#F1F1F3] transition-colors"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>

              <button
                onClick={() => {
                  // Theme toggle placeholder
                  setDropdownOpen(false)
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[#9CA3AF] hover:bg-[#2D2D3A] hover:text-[#F1F1F3] transition-colors"
              >
                <Moon className="h-4 w-4" />
                Toggle Theme
              </button>
            </div>

            <div className="border-t border-[#2D2D3A] py-1">
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  router.push("/api/auth/signout")
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-[#2D2D3A] transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
