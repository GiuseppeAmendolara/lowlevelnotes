'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/components/SessionProvider'
import { getCourse, getCourseLessons, type Course, type Lesson } from '@/lib/authClient'

const TYPE_LABEL: Record<Lesson['type'], string> = {
  article: 'Article',
  video: 'Video',
  exercise: 'Exercise',
  quiz: 'Quiz',
}

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

export default function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = use(params)
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[] | null>(null)
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null)

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login')
    }
  }, [sessionLoading, user, router])

  useEffect(() => {
    if (!user) return

    Promise.all([getCourse(slug), getCourseLessons(slug)]).then(([courseResult, lessonsResult]) => {
      if (!courseResult.ok) {
        setError({ message: courseResult.error, notFound: courseResult.status === 404 })
        return
      }
      if (!lessonsResult.ok) {
        setError({ message: lessonsResult.error, notFound: lessonsResult.status === 404 })
        return
      }
      setCourse(courseResult.data)
      setLessons(lessonsResult.data)
    })
  }, [user, slug])

  if (sessionLoading || !user) {
    return (
      <main className="min-h-screen bg-[#171717]">
        <section className="mx-auto max-w-4xl px-6 pb-10 pt-20 sm:pt-28">
          <p className="text-sm text-[#A1A1AA]">Loading…</p>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#171717]">
        <section className="mx-auto max-w-4xl px-6 pb-10 pt-20 sm:pt-28">
          <h1 className="text-2xl font-bold tracking-[-0.04em] text-white">
            {error.notFound ? 'Course not found' : 'Something went wrong'}
          </h1>
          <p className="mt-3 text-sm text-[#A1A1AA]">{error.message}</p>
          <Link href="/courses" className="mt-6 inline-block text-sm text-[#FF8A3D] underline underline-offset-2">
            ← Back to courses
          </Link>
        </section>
      </main>
    )
  }

  if (!course || !lessons) {
    return (
      <main className="min-h-screen bg-[#171717]">
        <section className="mx-auto max-w-4xl px-6 pb-10 pt-20 sm:pt-28">
          <p className="text-sm text-[#A1A1AA]">Loading…</p>
        </section>
      </main>
    )
  }

  const modules = groupByModule(lessons)

  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-4xl px-6 pb-10 pt-20 sm:pt-28">
        {course.category && (
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">{course.category}</p>
        )}
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">{course.title}</h1>
        {course.description && (
          <p className="mt-4 max-w-xl leading-7 text-[#A1A1AA]">{course.description}</p>
        )}
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="flex flex-col gap-10">
          {modules.map((module) => (
            <div key={module.slug}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">{module.title}</h2>
              <div className="mt-4 border-l border-t border-white/10">
                {module.lessons
                  .sort((a, b) => a.position - b.position)
                  .map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/courses/${slug}/${lesson.slug}`}
                      className="flex items-center justify-between gap-4 border-b border-r border-white/10 px-5 py-4 transition-colors hover:bg-white/[0.035] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FF8A3D]"
                    >
                      <span className="flex items-center gap-3">
                        <span className="h-1.5 w-1.5 shrink-0 bg-[#FF8A3D]" aria-hidden="true" />
                        <span className="text-sm text-white">{lesson.title}</span>
                      </span>
                      <span className="shrink-0 text-xs uppercase tracking-[0.1em] text-white/40">
                        {TYPE_LABEL[lesson.type]}
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
