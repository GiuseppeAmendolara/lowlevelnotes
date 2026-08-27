'use client'

import Link from 'next/link'
import type { Course } from '@/lib/authClient'
import { useReveal, revealClass, revealState } from '@/lib/useReveal'

// useReveal applied directly to the <Link> — it's a direct child of a
// `gap-px` grid (the hairline grid-lines come from the gap showing the
// container's background through), so a wrapper div would throw off the
// grid item sizing the same way it'd double borders in the shared-border
// grids elsewhere on the site.
export default function CourseCatalogCard({ course, index }: { course: Course; index: number }) {
  const { ref, visible } = useReveal<HTMLAnchorElement>()

  return (
    <Link
      ref={ref}
      href={`/courses/${course.slug}`}
      style={{ transitionDelay: `${Math.min(index, 6) * 40}ms` }}
      className={`group flex flex-col justify-between gap-4 bg-[#171717] p-6 hover:bg-white/[0.035] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FF8A3D] ${revealClass} ${revealState(visible)}`}
    >
      <div>
        {course.category && (
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#FF8A3D]">{course.category}</p>
        )}
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">{course.title}</h2>
        {course.description && (
          <p className="mt-2 text-sm leading-6 text-[#A1A1AA]">{course.description}</p>
        )}
      </div>
      <span className="text-xs uppercase tracking-[0.12em] text-white/40 transition-colors group-hover:text-white">
        View course →
      </span>
    </Link>
  )
}
