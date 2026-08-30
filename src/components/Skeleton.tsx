// Loading placeholders sized like the content they stand in for, so
// nothing reflows once the real data arrives — replaces plain "Loading…"
// text everywhere it used to sit in a fixed-size slot. Base block plus a
// couple of composed shapes for patterns repeated across the site (the
// bordered list row, the stat tile) rather than a bespoke skeleton per
// page.

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] motion-reduce:animate-none ${className}`} />
}

// Matches the "border-b border-r border-white/10 bg-[#17181B] p-4" row
// shape used across course lists, request queues, and admin tables.
export function SkeletonRow({ count = 3, lines = 2 }: { count?: number; lines?: 1 | 2 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b border-r border-white/10 bg-[#17181B] p-4">
          <Skeleton className="h-4 w-1/3" />
          {lines === 2 && <Skeleton className="mt-3 h-3 w-2/3" />}
        </div>
      ))}
    </>
  )
}

// Matches the "bg-[#17181B] p-4" stat-tile shape used on the account
// overview, enrolled-courses, and staff pages.
export function SkeletonStatTile() {
  return (
    <div className="bg-[#17181B] p-4">
      <Skeleton className="h-7 w-12" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  )
}

// The eyebrow/heading/subtext block every page opens with, for the outer
// "session hasn't resolved yet" gate shared across nearly every page —
// that state is usually brief, so one generic shape covers it rather
// than a bespoke skeleton per page for a state barely seen.
export function SkeletonPageHeader() {
  return (
    <div>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-9 w-64" />
      <Skeleton className="mt-4 h-4 w-80 max-w-full" />
    </div>
  )
}
