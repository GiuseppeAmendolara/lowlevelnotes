'use client'

import type { ChangelogEntry } from '@/lib/api'
import { useReveal, revealClass, revealState } from '@/lib/useReveal'

// One node on the changelog's git-log timeline — the vertical rail line
// itself is drawn once by the parent (ChangelogPage), not per-entry, so
// this only needs to position its own dot against that shared line.
export default function ChangelogEntryCard({
  entry,
  index,
  isLatest,
  isLast,
}: {
  entry: ChangelogEntry
  index: number
  isLatest: boolean
  isLast: boolean
}) {
  const { ref, visible } = useReveal<HTMLElement>()
  const anchorId = `v${entry.version.trim()}`

  // Explicit prop rather than a `last:` Tailwind variant — each entry gets
  // its own small wrapper div (for the optional year marker) in the parent
  // map, so the <article> is always the last child of ITS wrapper and a
  // `last:` selector would fire on every entry, not just the real last one.
  return (
    <article
      ref={ref}
      id={anchorId}
      style={{ transitionDelay: `${Math.min(index, 6) * 40}ms` }}
      className={`relative scroll-mt-24 pl-8 ${isLast ? 'pb-0' : 'pb-10'} ${revealClass} ${revealState(visible)}`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1.5 h-[11px] w-[11px] border-2 ${
          isLatest ? 'border-[#FF7A33] bg-[#FF7A33] shadow-[0_0_0_3px_rgba(255,122,51,0.15)]' : 'border-white/30 bg-[#0B0B0D]'
        }`}
      />

      <div className="flex flex-wrap items-center gap-2.5">
        {isLatest && (
          <span className="bg-[#FF7A33] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0B0B0D]">
            Latest
          </span>
        )}
        <span
          className={`border px-2 py-0.5 text-[13px] font-bold tracking-[-0.02em] ${
            isLatest ? 'border-[#FF7A33]/40 bg-[#17181B] text-[#FF7A33]' : 'border-white/10 bg-[#17181B] text-white'
          }`}
        >
          v{entry.version.trim()}
        </span>
        <time className="text-xs text-white/40">{entry.releaseDate}</time>
      </div>
      <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">{entry.title.trim()}</h2>
      <p className="mt-2 max-w-xl leading-6 text-[#90939A]">{entry.description.trim()}</p>
    </article>
  )
}
