'use client'

import Link from 'next/link'
import type { Course, CourseDifficulty } from '@/lib/authClient'
import { getAssetSrc } from '@/lib/authClient'
import { useReveal, revealClass, revealState } from '@/lib/useReveal'

const DIFFICULTY_LABEL: Record<CourseDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

// Difficulty as a color, not just a text label — skimmable at a glance
// across a whole grid, the way a status light is.
const DIFFICULTY_COLOR: Record<CourseDifficulty, string> = {
  beginner: '#3FB950',
  intermediate: '#D29922',
  advanced: '#F85149',
}

function authorByline(authors: Course['authors']): string | null {
  if (authors.length === 0) return null
  if (authors.length === 1) return `by ${authors[0].displayName}`
  if (authors.length === 2) return `by ${authors[0].displayName} and ${authors[1].displayName}`
  return `by ${authors[0].displayName} and ${authors.length - 1} others`
}

// useReveal applied directly to the <Link> — it's a direct child of a
// `gap-px` grid (the hairline grid-lines come from the gap showing the
// container's background through), so a wrapper div would throw off the
// grid item sizing the same way it'd double borders in the shared-border
// grids elsewhere on the site.
export default function CourseCatalogCard({ course, index }: { course: Course; index: number }) {
  const { ref, visible } = useReveal<HTMLAnchorElement>()
  const byline = authorByline(course.authors)

  return (
    <Link
      ref={ref}
      href={`/courses/${course.slug}`}
      style={{ transitionDelay: `${Math.min(index, 6) * 40}ms` }}
      className={`group flex flex-col justify-between gap-4 bg-[#17181B] p-6 hover:bg-[#151515] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FF7A33] ${revealClass} ${revealState(visible)}`}
    >
      <div>
        <div className="flex items-center gap-3">
          {course.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- cross-subdomain, session-cookie-gated asset; next/image can't proxy this
            <img src={getAssetSrc(course.iconUrl)} alt="" className="h-8 w-8 shrink-0 border border-white/10 object-cover" />
          ) : (
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: course.difficulty ? DIFFICULTY_COLOR[course.difficulty] : '#FF7A33' }}
            />
          )}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {course.category && (
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#FF7A33]"><span className="text-[#C95E1A]">#</span>{course.category}</p>
            )}
            {course.difficulty && (
              <p className="text-xs uppercase tracking-[0.1em] text-white/40">{DIFFICULTY_LABEL[course.difficulty]}</p>
            )}
          </div>
        </div>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">{course.title}</h2>
        {course.description && (
          <p className="mt-2 text-sm leading-6 text-[#90939A]">{course.description}</p>
        )}
        {byline && <p className="mt-2 text-xs text-white/40">{byline}</p>}
      </div>
      <span className="text-xs uppercase tracking-[0.12em] text-white/40 transition-colors group-hover:text-white">
        View course →
      </span>
    </Link>
  )
}
