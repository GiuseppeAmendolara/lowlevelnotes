'use client'

import Link from 'next/link'
import type { Lesson } from '@/lib/authClient'
import Eyebrow from '@/components/Eyebrow'

// Shared between the course detail page and the lesson viewer — the same
// module/lesson tree stays visible in both places, so picking up where
// you left off never means navigating back to the course page first.
function groupByModule(lessons: Lesson[]) {
  const modules = new Map<string, { title: string; position: number; lessons: Lesson[] }>()

  for (const lesson of lessons) {
    const existing = modules.get(lesson.moduleSlug)
    if (existing) {
      existing.lessons.push(lesson)
    } else {
      modules.set(lesson.moduleSlug, { title: lesson.moduleTitle, position: lesson.modulePosition, lessons: [lesson] })
    }
  }

  return [...modules.entries()]
    .map(([slug, module]) => ({ slug, ...module }))
    .sort((a, b) => a.position - b.position)
}

export default function CourseTreeRail({
  courseSlug,
  lessons,
  completedLessonIds,
  currentLessonSlug,
}: {
  courseSlug: string
  lessons: Lesson[]
  completedLessonIds: Set<number>
  currentLessonSlug?: string
}) {
  const modules = groupByModule(lessons)

  return (
    <nav aria-label="Course contents" className="border border-white/10 bg-[#17181B]">
      <Eyebrow className="border-b border-white/10 px-4 py-3">Contents</Eyebrow>
      {modules.map((mod) => (
        <div key={mod.slug} className="border-b border-white/10 py-2 last:border-b-0">
          <p className="px-4 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40">{mod.title}</p>
          {mod.lessons
            .sort((a, b) => a.position - b.position)
            .map((lesson) => {
              const isCurrent = lesson.slug === currentLessonSlug
              const isDone = completedLessonIds.has(lesson.id)
              return (
                <Link
                  key={lesson.id}
                  href={`/courses/${courseSlug}/${lesson.slug}`}
                  className={`flex items-center gap-2 border-l-2 px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FF7A33] ${
                    isCurrent ? 'border-[#FF7A33] bg-white/5 text-white' : 'border-transparent text-[#90939A] hover:text-white'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${isDone ? 'bg-[#3FB950]' : isCurrent ? 'bg-[#FF7A33]' : 'bg-white/20'}`}
                  />
                  <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                </Link>
              )
            })}
        </div>
      ))}
    </nav>
  )
}
