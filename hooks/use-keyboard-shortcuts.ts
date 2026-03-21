'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SIDEBAR_MODULES } from '@/lib/constants'

interface KeyboardShortcutsOptions {
  onCommandPalette?: () => void
  onNewTask?: () => void
  onNewNote?: () => void
  onQuickCapture?: () => void
  onToggleSidebar?: () => void
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      // Escape — close modals (handled by individual components)
      if (e.key === 'Escape') return

      // Cmd+K — Command palette
      if (isMod && e.key === 'k') {
        e.preventDefault()
        options.onCommandPalette?.()
        return
      }

      // Cmd+N — New task
      if (isMod && !e.shiftKey && e.key === 'n') {
        e.preventDefault()
        options.onNewTask?.()
        return
      }

      // Cmd+Shift+N — New note
      if (isMod && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        options.onNewNote?.()
        return
      }

      // Cmd+J — Quick capture
      if (isMod && e.key === 'j') {
        e.preventDefault()
        options.onQuickCapture?.()
        return
      }

      // Cmd+/ — Toggle sidebar
      if (isMod && e.key === '/') {
        e.preventDefault()
        options.onToggleSidebar?.()
        return
      }

      // Number keys 1-0 for module navigation (only when not in input)
      if (!isInput && !isMod && !e.altKey) {
        const module = SIDEBAR_MODULES.find((m) => m.shortcut === e.key)
        if (module) {
          e.preventDefault()
          router.push(module.href)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [options, router])
}
