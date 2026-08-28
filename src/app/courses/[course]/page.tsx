'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/components/SessionProvider'
import ActionButton from '@/components/ActionButton'
import LessonListItem from '@/components/LessonListItem'
import {
  getCourse,
  getCourseLessons,
  getMyProgress,
  enrollCourse,
  unenrollCourse,
  getAssetSrc,
  type Course,
  type CourseDifficulty,
  type Lesson,
  type MyEnrollment,
  type MyLessonProgress,
} from '@/lib/authClient'

const DIFFICULTY_LABEL: Record<CourseDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

function authorByline(authors: Course['authors']): string | null {
  if (authors.length === 0) return null
  if (authors.length === 1) return `by ${authors[0].displayName}`
  if (authors.length === 2) return `by ${authors[0].displayName} and ${authors[1].displayName}`
  return `by ${authors[0].displayName} and ${authors.length - 1} others`
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
  const [enrollment, setEnrollment] = useState<MyEnrollment | null>(null)
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<number>>(new Set())
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [unenrolling, setUnenrolling] = useState(false)
  const [unenrollError, setUnenrollError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login')
    }
  }, [sessionLoading, user, router])

  useEffect(() => {
    if (!user) return

    Promise.all([getCourse(slug), getCourseLessons(slug), getMyProgress()]).then(
      ([courseResult, lessonsResult, progressResult]) => {
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

        if (progressResult.ok) {
          const found = progressResult.data.enrollments.find((e) => e.courseSlug === slug)
          setEnrollment(found ?? null)
          setCompletedLessonIds(
            new Set(
              progressResult.data.lessonProgress
                .filter((p) => p.courseSlug === slug && p.status === 'completed')
                .map((p) => p.lessonId)
            )
          )
        }
      }
    )
  }, [user, slug])

  async function handleEnroll() {
    setEnrolling(true)
    setEnrollError(null)
    const result = await enrollCourse(slug)
    setEnrolling(false)

    if (!result.ok) {
      setEnrollError(result.error)
      return
    }

    setEnrollment({
      id: 0,
      courseId: course?.id ?? 0,
      courseSlug: slug,
      courseTitle: course?.title ?? '',
      status: 'active',
      enrolledAt: new Date().toISOString(),
      completedAt: null,
      totalLessons: lessons?.length ?? 0,
      completedLessons: 0,
    })
  }

  async function handleUnenroll() {
    if (!window.confirm('Unenroll from this course? Your progress is kept — re-enrolling picks up where you left off.')) {
      return
    }

    setUnenrolling(true)
    setUnenrollError(null)
    const result = await unenrollCourse(slug)
    setUnenrolling(false)

    if (!result.ok) {
      setUnenrollError(result.error)
      return
    }

    setEnrollment(null)
  }

  if (sessionLoading || !user) {
    return (
      <main className="min-h-screen bg-[#171717]">
        <section className="mx-auto max-w-4xl px-6 pb-10 pt-20 sm:pt-28">
          <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
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
          <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
        </section>
      </main>
    )
  }

  const modules = groupByModule(lessons)

  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-4xl px-6 pb-10 pt-20 sm:pt-28">
        <Link href="/courses" className="text-xs uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white">
          ← Courses
        </Link>
        <div className="mt-4 flex items-center gap-4">
          {course.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- cross-subdomain, session-cookie-gated asset; next/image can't proxy this
            <img src={getAssetSrc(course.iconUrl)} alt="" className="h-12 w-12 shrink-0 border border-white/10 object-cover" />
          ) : (
            <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 bg-[#FF8A3D]" />
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {course.category && (
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">{course.category}</p>
            )}
            {course.difficulty && (
              <p className="text-xs uppercase tracking-[0.14em] text-white/40">{DIFFICULTY_LABEL[course.difficulty]}</p>
            )}
          </div>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">{course.title}</h1>
        {course.description && (
          <p className="mt-4 max-w-xl leading-7 text-[#A1A1AA]">{course.description}</p>
        )}
        {authorByline(course.authors) && (
          <p className="mt-2 text-sm text-white/40">{authorByline(course.authors)}</p>
        )}

        <div className="mt-6">
          {enrollment ? (
            <>
              <p className="flex flex-wrap items-center gap-3 text-sm text-[#A1A1AA]">
                <span>
                  <span className={enrollment.status === 'completed' ? 'text-[#3FB950]' : 'text-[#FF8A3D]'}>
                    {enrollment.status === 'completed' ? 'Completed' : 'Enrolled'}
                  </span>
                  {' — '}
                  {enrollment.completedLessons}/{enrollment.totalLessons} lessons complete
                </span>
                <button
                  type="button"
                  onClick={handleUnenroll}
                  disabled={unenrolling}
                  className="text-white/50 underline underline-offset-2 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {unenrolling ? 'Unenrolling…' : 'Unenroll'}
                </button>
              </p>
              {unenrollError && <p className="mt-2 text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{unenrollError}</p>}
            </>
          ) : (
            <>
              <ActionButton onClick={handleEnroll} loading={enrolling}>
                Enroll
              </ActionButton>
              {enrollError && <p className="mt-2 text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{enrollError}</p>}
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="flex flex-col gap-10">
          {modules.map((module) => (
            <div key={module.slug}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">{module.title}</h2>
              <div className="mt-4 border-l border-t border-white/10">
                {module.lessons
                  .sort((a, b) => a.position - b.position)
                  .map((lesson, i) => (
                    <LessonListItem
                      key={lesson.id}
                      lesson={lesson}
                      courseSlug={slug}
                      completed={completedLessonIds.has(lesson.id)}
                      index={i}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
