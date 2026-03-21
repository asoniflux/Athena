'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Plus,
  Trash2,
  BookOpen,
  Loader2,
  Tag,
  X,
} from 'lucide-react'
import {
  getPages,
  getPageById,
  updatePage,
  deletePage,
} from '@/app/actions/page.actions'
import PageDialog from './page-dialog'

interface PageTreeItem {
  id: string
  parentId: string | null
  title: string
  icon: string | null
  tags: string[]
  isFavorite: boolean
  position: number
  createdAt: string
  updatedAt: string
  children: { id: string }[]
}

interface PageDetail {
  id: string
  parentId: string | null
  title: string
  icon: string | null
  content: unknown
  contentText: string | null
  tags: string[]
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  children: { id: string; title: string; icon: string | null; parentId: string | null }[]
}

interface KnowledgeViewProps {
  initialPages: PageTreeItem[]
}

function buildTree(pages: PageTreeItem[]): PageTreeItem[] {
  return pages.filter((p) => !p.parentId)
}

function getChildren(pages: PageTreeItem[], parentId: string): PageTreeItem[] {
  return pages.filter((p) => p.parentId === parentId)
}

export default function KnowledgeView({ initialPages }: KnowledgeViewProps) {
  const [pages, setPages] = useState<PageTreeItem[]>(initialPages)
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [selectedPage, setSelectedPage] = useState<PageDetail | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogParentId, setDialogParentId] = useState<string | null>(null)
  const [loadingPage, setLoadingPage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Editable state
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const refreshPages = useCallback(async () => {
    const result = await getPages()
    if (result.success) {
      setPages(result.data as PageTreeItem[])
    }
  }, [])

  async function selectPage(id: string) {
    setSelectedPageId(id)
    setLoadingPage(true)
    const result = await getPageById(id)
    setLoadingPage(false)
    if (result.success) {
      const page = result.data as PageDetail
      setSelectedPage(page)
      setEditTitle(page.title)
      setEditContent(page.contentText || (typeof page.content === 'string' ? page.content : '') || '')
      setEditTags(page.tags || [])
    }
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Debounced auto-save for content
  function handleContentChange(value: string) {
    setEditContent(value)
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = setTimeout(() => {
      autoSave(value)
    }, 2000)
  }

  async function autoSave(content: string) {
    if (!selectedPage) return
    setSaving(true)
    await updatePage(selectedPage.id, {
      content: content,
    })
    setSaving(false)
  }

  async function handleTitleBlur() {
    if (!selectedPage || editTitle === selectedPage.title) return
    if (!editTitle.trim()) {
      setEditTitle(selectedPage.title)
      return
    }
    setSaving(true)
    await updatePage(selectedPage.id, { title: editTitle.trim() })
    setSaving(false)
    refreshPages()
  }

  async function handleContentBlur() {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    if (!selectedPage) return
    setSaving(true)
    await updatePage(selectedPage.id, { content: editContent })
    setSaving(false)
  }

  async function handleAddTag() {
    if (!newTag.trim() || !selectedPage) return
    const updated = [...editTags, newTag.trim()]
    setEditTags(updated)
    setNewTag('')
    await updatePage(selectedPage.id, { tags: updated })
    refreshPages()
  }

  async function handleRemoveTag(tag: string) {
    if (!selectedPage) return
    const updated = editTags.filter((t) => t !== tag)
    setEditTags(updated)
    await updatePage(selectedPage.id, { tags: updated })
    refreshPages()
  }

  async function handleDeletePage() {
    if (!selectedPage) return
    setDeleting(true)
    const result = await deletePage(selectedPage.id)
    setDeleting(false)
    if (result.success) {
      setSelectedPage(null)
      setSelectedPageId(null)
      refreshPages()
    }
  }

  function handleNewPage() {
    setDialogParentId(null)
    setDialogOpen(true)
  }

  function handleNewSubPage(parentId: string) {
    setDialogParentId(parentId)
    setDialogOpen(true)
  }

  function handlePageCreated() {
    refreshPages()
  }

  // Tree Node component
  function TreeNode({ page, depth = 0 }: { page: PageTreeItem; depth?: number }) {
    const children = getChildren(pages, page.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedIds.has(page.id)
    const isSelected = selectedPageId === page.id

    return (
      <div>
        <div
          className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors cursor-pointer ${
            isSelected
              ? 'bg-[#6366F1]/10 text-[#F1F1F3]'
              : 'text-[#9CA3AF] hover:bg-[#2D2D3A]/50 hover:text-[#F1F1F3]'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {/* Expand/Collapse */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (hasChildren) toggleExpand(page.id)
            }}
            className="flex h-4 w-4 items-center justify-center flex-shrink-0"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )
            ) : (
              <span className="h-3 w-3" />
            )}
          </button>

          {/* Icon + Title */}
          <button
            onClick={() => selectPage(page.id)}
            className="flex flex-1 items-center gap-2 min-w-0"
          >
            {page.icon ? (
              <span className="text-sm flex-shrink-0">{page.icon}</span>
            ) : (
              <FileText className="h-4 w-4 flex-shrink-0 opacity-50" />
            )}
            <span className="text-sm truncate">{page.title}</span>
          </button>

          {/* Add sub-page button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNewSubPage(page.id)
            }}
            className="flex h-5 w-5 items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#2D2D3A]"
            title="Add sub-page"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {children.map((child) => (
              <TreeNode key={child.id} page={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const rootPages = buildTree(pages)

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[280px_1fr]">
      {/* LEFT: Page Tree Sidebar */}
      <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-4 flex flex-col overflow-hidden">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[#6B7280]">
          Pages
        </h3>

        {/* Page Tree */}
        <div className="flex-1 overflow-y-auto space-y-0.5">
          {rootPages.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[#6B7280]">
              <FileText className="h-4 w-4" />
              <span className="text-sm italic">No pages yet</span>
            </div>
          ) : (
            rootPages.map((page) => <TreeNode key={page.id} page={page} />)
          )}
        </div>

        {/* Add Page Button */}
        <div className="mt-4 border-t border-[#2D2D3A] pt-4">
          <button
            onClick={handleNewPage}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#2D2D3A] py-2 text-sm text-[#6B7280] transition-colors hover:border-[#6366F1]/50 hover:text-[#9CA3AF]"
          >
            <Plus className="h-4 w-4" />
            Add Page
          </button>
        </div>
      </div>

      {/* RIGHT: Page Content Area */}
      <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-6 flex flex-col overflow-hidden">
        {loadingPage ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#6366F1]" />
          </div>
        ) : selectedPage ? (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Page Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {selectedPage.icon && (
                    <span className="text-2xl">{selectedPage.icon}</span>
                  )}
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    className="w-full bg-transparent text-xl font-bold text-[#F1F1F3] outline-none focus:ring-1 focus:ring-[#6366F1]/50 rounded px-1 -ml-1"
                    placeholder="Untitled"
                  />
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-[#6B7280]">
                  {saving ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span>
                      Last updated{' '}
                      {new Date(selectedPage.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleDeletePage}
                disabled={deleting}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            </div>

            {/* Tags */}
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <Tag className="h-3.5 w-3.5 text-[#6B7280]" />
              {editTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-[#2D2D3A] px-2 py-0.5 text-xs text-[#9CA3AF]"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-[#6B7280] hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTag()
                  }}
                  placeholder="Add tag..."
                  className="w-20 bg-transparent text-xs text-[#9CA3AF] placeholder:text-[#6B7280] outline-none"
                />
              </div>
            </div>

            {/* Content Editor */}
            <textarea
              value={editContent}
              onChange={(e) => handleContentChange(e.target.value)}
              onBlur={handleContentBlur}
              placeholder="Start writing..."
              className="flex-1 w-full resize-none rounded-lg border border-[#2D2D3A] bg-[#0F0F14] p-4 font-mono text-sm text-[#F1F1F3] placeholder:text-[#6B7280] outline-none focus:border-[#6366F1]/50"
              style={{ minHeight: '300px' }}
            />
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <BookOpen className="mb-4 h-12 w-12 text-[#6B7280]" />
            <h3 className="mb-2 text-lg font-medium text-[#F1F1F3]">
              {pages.length === 0
                ? 'Start Your Knowledge Base'
                : 'Select a Page'}
            </h3>
            <p className="mb-6 max-w-md text-sm text-[#6B7280]">
              {pages.length === 0
                ? 'Create pages to organize your notes, research, and documentation. Pages support nested sub-pages for structured organization.'
                : 'Click on a page in the sidebar to view and edit its content.'}
            </p>
            {pages.length === 0 && (
              <button
                onClick={handleNewPage}
                className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5558E3]"
              >
                <Plus className="h-4 w-4" />
                Create Your First Page
              </button>
            )}
          </div>
        )}
      </div>

      {/* New Page Dialog */}
      <PageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pages={pages.map((p) => ({
          id: p.id,
          parentId: p.parentId,
          title: p.title,
          icon: p.icon,
        }))}
        defaultParentId={dialogParentId}
        onCreated={handlePageCreated}
      />
    </div>
  )
}
