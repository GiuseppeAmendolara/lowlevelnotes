'use client'

import Link from 'next/link'
import type { Lesson } from '@/lib/authClient'
import { useReveal, revealClass, revealState } from '@/lib/useReveal'

const TYPE_LABEL: Record<Lesson['type'], string> = {
  article: 'Article',
  video: 'Video',
  exercise: 'Exercise',
  quiz: 'Quiz',
}

// useReveal applied directly to the <Link> — same shared-border grid
// technique as the library rows, so no wrapper div.
export default function LessonListItem({
  lesson,
  courseSlug,
  completed,
  index,
}: {
  lesson: Lesson
  courseSlug: string
  completed: boolean
  index: number
}) {
  const { ref, visible } = useReveal<HTMLAnchorElement>()

  return (
    <Link
      ref={ref}
      href={`/courses/${courseSlug}/${lesson.slug}`}
      style={{ transitionDelay: `${Math.min(index, 6) * 40}ms` }}
      className={`flex items-center justify-between gap-4 border-b border-r border-white/10 px-5 py-4 hover:bg-white/[0.035] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FF8A3D] ${revealClass} ${revealState(visible)}`}
    >
      <span className="flex items-center gap-3">
        <span className={`h-1.5 w-1.5 shrink-0 ${completed ? 'bg-[#3FB950]' : 'bg-[#FF8A3D]'}`} aria-hidden="true" />
        <span className="text-sm text-white">{lesson.title}</span>
      </span>
      <span className="shrink-0 text-xs uppercase tracking-[0.1em] text-white/40">{TYPE_LABEL[lesson.type]}</span>
    </Link>
  )
}
