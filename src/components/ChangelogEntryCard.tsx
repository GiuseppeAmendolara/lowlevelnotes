'use client'

import type { ChangelogEntry } from '@/lib/api'
import { useReveal, revealClass, revealState } from '@/lib/useReveal'

// useReveal applied directly to the <article> — shared-border grid
// (border-l/border-t on the parent, border-b/border-r per entry), so no
// wrapper div. Dense list, so color-only hover, no lift.
export default function ChangelogEntryCard({ entry, index, isLatest }: { entry: ChangelogEntry; index: number; isLatest: boolean }) {
  const { ref, visible } = useReveal<HTMLElement>()

  return (
    <article
      ref={ref}
      style={{ transitionDelay: `${Math.min(index, 6) * 40}ms` }}
      className={`border-b border-r border-white/10 bg-[#0D0D0D] p-6 hover:bg-[#151515] sm:p-8 ${revealClass} ${revealState(visible)}`}
    >
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {isLatest && (
          <span className="flex items-center gap-1.5 text-[#3FB950]">
            <span className="h-1.5 w-1.5 bg-[#3FB950]" aria-hidden="true" />
            Latest
          </span>
        )}
        <span className="text-[#FF8A3D]">v{entry.version.trim()}</span>
        <span className="text-white/20">·</span>
        <time className="text-white/40">{entry.releaseDate}</time>
      </div>
      <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">{entry.title.trim()}</h2>
      <p className="mt-2 max-w-2xl leading-6 text-[#A1A1AA]">{entry.description.trim()}</p>
    </article>
  )
}
