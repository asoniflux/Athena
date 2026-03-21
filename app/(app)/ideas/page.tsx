import { Lightbulb, Plus, Sparkles } from 'lucide-react'

export default function IdeasPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F1F3]">Idea Lab</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">Capture, organize, and expand your ideas with AI</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#818CF8] transition">
          <Plus className="h-4 w-4" />
          New Idea
        </button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-[#2D2D3A] bg-[#1A1A24] py-16">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#F59E0B]/10">
          <Lightbulb className="h-7 w-7 text-[#F59E0B]" />
        </div>
        <h3 className="font-semibold text-[#F1F1F3]">No ideas yet</h3>
        <p className="mt-1 text-sm text-[#6B7280]">Capture your first idea and let AI help expand it</p>
        <div className="mt-4 flex gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#818CF8] transition">
            <Plus className="h-4 w-4" />
            Add Idea
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-[#2D2D3A] bg-[#242430] px-4 py-2 text-sm font-medium text-[#9CA3AF] hover:bg-[#2D2D3A] transition">
            <Sparkles className="h-4 w-4" />
            AI Brainstorm
          </button>
        </div>
      </div>
    </div>
  )
}
