import { FileQuestion } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F0F14] px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#6366F1]/10">
          <FileQuestion className="h-7 w-7 text-[#6366F1]" />
        </div>
        <h2 className="text-lg font-semibold text-[#F1F1F3]">Page not found</h2>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#818CF8]"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
