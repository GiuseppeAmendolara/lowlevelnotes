'use client'

import Link from 'next/link'
import { useReveal, revealClass, revealState } from '@/lib/useReveal'

type Course = {
  slug: string
  category: string
  title: string
  description: string
}

// useReveal is applied directly to this <Link> rather than a wrapper —
// the grid it lives in uses a shared-border technique (border-l/border-t
// on the parent, border-b/border-r on each card) that an extra wrapper
// div would double up.
export default function HomeCourseCard({ course, index }: { course: Course; index: number }) {
  const { ref, visible } = useReveal<HTMLAnchorElement>()

  return (
    <Link
      ref={ref}
      href={`/courses/${course.slug}`}
      style={{ transitionDelay: `${Math.min(index, 6) * 40}ms` }}
      className={`group block min-h-48 border-b border-r border-white/10 bg-[#0B0B0D] p-6 hover:bg-[#1f1f1f] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 sm:p-8 ${revealClass} ${revealState(visible)}`}
    >
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#FF7A33]"><span className="text-[#C95E1A]">#</span>{course.category}</span>
      <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-white">{course.title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#90939A]">{course.description}</p>
    </Link>
  )
}
