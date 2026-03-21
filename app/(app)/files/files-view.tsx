'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  FolderOpen,
  Upload,
  Plus,
  Search,
  Grid,
  List,
  Sparkles,
  Star,
  Trash2,
  Download,
  File as FileIcon,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  Archive,
  ChevronRight,
  Home,
  Loader2,
  X,
} from 'lucide-react'
import {
  getFiles,
  createFolder,
  deleteFile,
  starFile,
} from '@/app/actions/file.actions'

interface FileItem {
  id: string
  originalName: string
  mimeType: string
  size: number
  isStarred: boolean
  createdAt: string
  storagePath: string
}

interface FolderItem {
  id: string
  name: string
  parentId: string | null
  color: string | null
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage
  if (mimeType.startsWith('video/')) return FileVideo
  if (mimeType.startsWith('audio/')) return FileAudio
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('tar') || mimeType.includes('rar')) return Archive
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return FileText
  return FileIcon
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function FilesView() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'My Files' },
  ])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const newFolderInputRef = useRef<HTMLInputElement>(null)

  const loadFiles = useCallback(async () => {
    const result = await getFiles(currentFolderId)
    if (result.success) {
      const data = result.data as { files: FileItem[]; folders: FolderItem[] }
      setFiles(data.files)
      setFolders(data.folders)
    }
  }, [currentFolderId])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  useEffect(() => {
    if (showNewFolderInput && newFolderInputRef.current) {
      newFolderInputRef.current.focus()
    }
  }, [showNewFolderInput])

  function navigateToFolder(folderId: string, folderName: string) {
    setCurrentFolderId(folderId)
    setBreadcrumbs((prev) => [...prev, { id: folderId, name: folderName }])
  }

  function navigateToBreadcrumb(index: number) {
    const crumb = breadcrumbs[index]
    setCurrentFolderId(crumb.id)
    setBreadcrumbs(breadcrumbs.slice(0, index + 1))
  }

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return

    setIsUploading(true)
    try {
      for (const file of Array.from(fileList)) {
        const formData = new FormData()
        formData.append('file', file)
        if (currentFolderId) {
          formData.append('folderId', currentFolderId)
        }

        await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        })
      }
      await loadFiles()
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return
    const result = await createFolder(newFolderName.trim(), currentFolderId)
    if (result.success) {
      setNewFolderName('')
      setShowNewFolderInput(false)
      await loadFiles()
    }
  }

  async function handleDeleteFile(id: string) {
    const result = await deleteFile(id)
    if (result.success) {
      await loadFiles()
    }
  }

  async function handleStarFile(id: string) {
    await starFile(id)
    await loadFiles()
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    handleUpload(e.dataTransfer.files)
  }

  const filteredFiles = files.filter((f) =>
    f.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]/10">
            <FolderOpen className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F1F1F3]">File Manager</h1>
            <p className="text-sm text-[#9CA3AF]">
              Upload, organize, and manage your files
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewFolderInput(true)}
            className="flex items-center gap-2 rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-3 py-2 text-sm text-[#9CA3AF] transition-colors hover:border-[#6366F1]/50"
          >
            <Plus className="h-4 w-4" />
            New Folder
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5558E3]"
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
        <div className="flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-[#6B7280]" />}
              <button
                onClick={() => navigateToBreadcrumb(index)}
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-[#2D2D3A] ${
                  index === breadcrumbs.length - 1 ? 'text-[#F1F1F3]' : 'text-[#9CA3AF]'
                }`}
              >
                {index === 0 && <Home className="h-3.5 w-3.5" />}
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-3 py-2 max-w-md">
          <Search className="h-4 w-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#F1F1F3] placeholder-[#6B7280] outline-none"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#2D2D3A] bg-[#1A1A24] p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded p-1.5 transition ${viewMode === 'grid' ? 'bg-[#2D2D3A] text-[#F1F1F3]' : 'text-[#6B7280]'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded p-1.5 transition ${viewMode === 'list' ? 'bg-[#2D2D3A] text-[#F1F1F3]' : 'text-[#6B7280]'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* New Folder Input */}
      {showNewFolderInput && (
        <div className="flex items-center gap-2 rounded-lg border border-[#6366F1]/30 bg-[#1A1A24] px-4 py-3">
          <FolderOpen className="h-4 w-4 text-[#6366F1]" />
          <input
            ref={newFolderInputRef}
            type="text"
            placeholder="Folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder()
              if (e.key === 'Escape') {
                setShowNewFolderInput(false)
                setNewFolderName('')
              }
            }}
            className="flex-1 bg-transparent text-sm text-[#F1F1F3] placeholder-[#6B7280] outline-none"
          />
          <button
            onClick={handleCreateFolder}
            className="rounded-lg bg-[#6366F1] px-3 py-1 text-xs font-medium text-white hover:bg-[#818CF8] transition"
          >
            Create
          </button>
          <button
            onClick={() => {
              setShowNewFolderInput(false)
              setNewFolderName('')
            }}
            className="rounded p-1 text-[#6B7280] hover:text-[#F1F1F3] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? 'border-[#6366F1] bg-[#6366F1]/5'
            : 'border-[#2D2D3A] bg-[#1A1A24] hover:border-[#6366F1]/40'
        }`}
      >
        <div className="flex flex-col items-center justify-center text-center">
          {isUploading ? (
            <>
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#6366F1]" />
              <p className="text-sm text-[#9CA3AF]">Uploading files...</p>
            </>
          ) : (
            <>
              <Upload className={`mb-3 h-8 w-8 ${isDragging ? 'text-[#6366F1]' : 'text-[#6B7280]'}`} />
              <p className="mb-1 text-sm font-medium text-[#F1F1F3]">
                {isDragging ? 'Drop files here' : 'Drag and drop files here'}
              </p>
              <p className="text-xs text-[#6B7280]">or click the Upload button above</p>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {filteredFolders.length === 0 && filteredFiles.length === 0 ? (
        <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FolderOpen className="mb-3 h-10 w-10 text-[#6B7280]" />
            <p className="text-sm text-[#6B7280]">
              {searchQuery ? 'No matching files or folders' : 'No files or folders yet'}
            </p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {/* Folders */}
          {filteredFolders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => navigateToFolder(folder.id, folder.name)}
              className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-4 transition hover:border-[#6366F1]/30 hover:bg-[#242430]"
            >
              <FolderOpen className="h-10 w-10 text-[#6366F1]" />
              <p className="w-full truncate text-center text-xs font-medium text-[#F1F1F3]">
                {folder.name}
              </p>
            </div>
          ))}
          {/* Files */}
          {filteredFiles.map((file) => {
            const Icon = getFileIcon(file.mimeType)
            return (
              <div
                key={file.id}
                className="group relative flex flex-col items-center gap-2 rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-4 transition hover:border-[#6366F1]/30 hover:bg-[#242430]"
              >
                {/* Actions */}
                <div className="absolute right-1.5 top-1.5 flex opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleStarFile(file.id)}
                    className={`rounded p-1 transition ${
                      file.isStarred ? 'text-yellow-400' : 'text-[#6B7280] hover:text-yellow-400'
                    }`}
                  >
                    <Star className="h-3 w-3" fill={file.isStarred ? 'currentColor' : 'none'} />
                  </button>
                  <a
                    href={`/api/files/${file.id}`}
                    className="rounded p-1 text-[#6B7280] hover:text-[#6366F1] transition"
                  >
                    <Download className="h-3 w-3" />
                  </a>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="rounded p-1 text-[#6B7280] hover:text-red-400 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <Icon className="h-10 w-10 text-[#9CA3AF]" />
                <p className="w-full truncate text-center text-xs font-medium text-[#F1F1F3]">
                  {file.originalName}
                </p>
                <p className="text-[10px] text-[#6B7280]">{formatFileSize(file.size)}</p>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2D2D3A] text-left text-xs text-[#6B7280]">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFolders.map((folder) => (
                <tr
                  key={folder.id}
                  onClick={() => navigateToFolder(folder.id, folder.name)}
                  className="cursor-pointer border-b border-[#2D2D3A]/50 hover:bg-[#242430] transition"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-[#6366F1]" />
                      <span className="text-[#F1F1F3]">{folder.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">--</td>
                  <td className="px-4 py-3 text-[#6B7280]">Folder</td>
                  <td className="px-4 py-3 text-[#6B7280]">--</td>
                  <td className="px-4 py-3">--</td>
                </tr>
              ))}
              {filteredFiles.map((file) => {
                const Icon = getFileIcon(file.mimeType)
                return (
                  <tr
                    key={file.id}
                    className="group border-b border-[#2D2D3A]/50 hover:bg-[#242430] transition"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-[#9CA3AF]" />
                        <span className="text-[#F1F1F3] truncate max-w-[200px]">{file.originalName}</span>
                        {file.isStarred && <Star className="h-3 w-3 text-yellow-400" fill="currentColor" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#9CA3AF]">{formatFileSize(file.size)}</td>
                    <td className="px-4 py-3 text-[#9CA3AF]">{file.mimeType.split('/')[1] || file.mimeType}</td>
                    <td className="px-4 py-3 text-[#9CA3AF]">{formatDate(file.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleStarFile(file.id)}
                          className={`rounded p-1 transition ${
                            file.isStarred ? 'text-yellow-400' : 'text-[#6B7280] hover:text-yellow-400'
                          }`}
                        >
                          <Star className="h-3.5 w-3.5" fill={file.isStarred ? 'currentColor' : 'none'} />
                        </button>
                        <a
                          href={`/api/files/${file.id}`}
                          className="rounded p-1 text-[#6B7280] hover:text-[#6366F1] transition"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="rounded p-1 text-[#6B7280] hover:text-red-400 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Feature Banner */}
      <div className="rounded-lg border border-[#6366F1]/20 bg-[#6366F1]/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#6366F1]" />
          <p className="text-sm text-[#9CA3AF]">
            <span className="font-medium text-[#6366F1]">AI File Assistant</span>{' '}
            &mdash; Auto-tagging, smart search, and document summarization coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}
