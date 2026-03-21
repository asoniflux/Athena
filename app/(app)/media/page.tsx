import { Video, Plus, Clapperboard } from 'lucide-react'

export default function MediaPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F1F3]">Media Planner</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">Plan and manage your video productions</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#818CF8] transition">
          <Plus className="h-4 w-4" />
          New Production
        </button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-[#2D2D3A] bg-[#1A1A24] py-16">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#6366F1]/10">
          <Clapperboard className="h-7 w-7 text-[#6366F1]" />
        </div>
        <h3 className="font-semibold text-[#F1F1F3]">No productions yet</h3>
        <p className="mt-1 text-sm text-[#6B7280]">Create your first production with AI-generated shot lists and scripts</p>
        <button className="mt-4 flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#818CF8] transition">
          <Plus className="h-4 w-4" />
          Create Production
        </button>
      </div>
    </div>
  )
}
