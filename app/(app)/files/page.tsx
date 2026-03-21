import { FolderOpen, Upload, Plus, Search, Grid, List, Sparkles } from 'lucide-react'

export default function FilesPage() {
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
          <button className="flex items-center gap-2 rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-3 py-2 text-sm text-[#9CA3AF] transition-colors hover:border-[#6366F1]/50">
            <Plus className="h-4 w-4" />
            New Folder
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5558E3]">
            <Upload className="h-4 w-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-3 py-2 max-w-md">
          <Search className="h-4 w-4 text-[#6B7280]" />
          <span className="text-sm text-[#6B7280]">Search files...</span>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#2D2D3A] bg-[#1A1A24] p-1">
          <button className="rounded p-1.5 bg-[#2D2D3A] text-[#F1F1F3]">
            <Grid className="h-4 w-4" />
          </button>
          <button className="rounded p-1.5 text-[#6B7280]">
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="rounded-xl border-2 border-dashed border-[#2D2D3A] bg-[#1A1A24] p-12 transition-colors hover:border-[#6366F1]/40">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6366F1]/10">
            <Upload className="h-8 w-8 text-[#6366F1]" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-[#F1F1F3]">
            Drop files here to upload
          </h3>
          <p className="mb-4 max-w-sm text-sm text-[#6B7280]">
            Drag and drop your files here, or click the upload button above.
            Supports documents, images, videos, and more.
          </p>
          <button className="flex items-center gap-2 rounded-lg border border-[#2D2D3A] px-4 py-2 text-sm text-[#9CA3AF] transition-colors hover:border-[#6366F1]/50 hover:text-[#F1F1F3]">
            Browse Files
          </button>
        </div>
      </div>

      {/* Empty File List */}
      <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FolderOpen className="mb-3 h-10 w-10 text-[#6B7280]" />
          <p className="text-sm text-[#6B7280]">No files uploaded yet</p>
        </div>
      </div>

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
