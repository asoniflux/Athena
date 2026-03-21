export default function AppLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="space-y-4 w-full max-w-2xl px-4">
        {/* Header skeleton */}
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[#1A1A24]" />
        {/* Card skeletons */}
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-[#1A1A24]" />
          ))}
        </div>
        {/* List skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-[#1A1A24]" />
          ))}
        </div>
      </div>
    </div>
  )
}
