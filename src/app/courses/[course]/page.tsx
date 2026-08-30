'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/components/SessionProvider'
import ActionButton from '@/components/ActionButton'
import CourseTreeRail from '@/components/CourseTreeRail'
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
      <main className="min-h-screen bg-[#0B0B0D]">
        <section className="mx-auto max-w-4xl px-6 pb-10 pt-20 sm:pt-28">
          <p className="text-sm text-[#90939A] animate-pulse motion-reduce:animate-none">Loading…</p>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0B0B0D]">
        <section className="mx-auto max-w-4xl px-6 pb-10 pt-20 sm:pt-28">
          <h1 className="text-2xl font-bold tracking-[-0.04em] text-white">
            {error.notFound ? 'Course not found' : 'Something went wrong'}
          </h1>
          <p className="mt-3 text-sm text-[#90939A]">{error.message}</p>
          <Link href="/courses" className="mt-6 inline-block text-sm text-[#FF7A33] underline underline-offset-2">
            ← Back to courses
          </Link>
        </section>
      </main>
    )
  }

  if (!course || !lessons) {
    return (
      <main className="min-h-screen bg-[#0B0B0D]">
        <section className="mx-auto max-w-4xl px-6 pb-10 pt-20 sm:pt-28">
          <p className="text-sm text-[#90939A] animate-pulse motion-reduce:animate-none">Loading…</p>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0B0B0D]">
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-20 sm:pt-28">
        <Link href="/courses" className="text-xs uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white">
          ← Courses
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-[1fr_280px]">
          <div>
            <div className="flex items-center gap-4">
              {course.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- cross-subdomain, session-cookie-gated asset; next/image can't proxy this
                <img src={getAssetSrc(course.iconUrl)} alt="" className="h-12 w-12 shrink-0 border border-white/10 object-cover" />
              ) : (
                <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 bg-[#FF7A33]" />
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {course.category && (
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF7A33]"><span className="text-[#C95E1A]">#</span>{course.category}</p>
                )}
                {course.difficulty && (
                  <p className="text-xs uppercase tracking-[0.14em] text-white/40">{DIFFICULTY_LABEL[course.difficulty]}</p>
                )}
              </div>
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">{course.title}</h1>
            {course.description && (
              <p className="mt-4 max-w-xl leading-7 text-[#90939A]">{course.description}</p>
            )}
            {authorByline(course.authors) && (
              <p className="mt-2 text-sm text-white/40">{authorByline(course.authors)}</p>
            )}

            <div className="mt-6">
              {enrollment ? (
                <>
                  {enrollment.totalLessons > 0 && (
                    <div className="mb-3 flex max-w-xs items-center gap-3">
                      <div className="h-1.5 flex-1 bg-white/10">
                        <div
                          className={`h-full ${enrollment.status === 'completed' ? 'bg-[#3FB950]' : 'bg-[#FF7A33]'}`}
                          style={{ width: `${Math.round((enrollment.completedLessons / enrollment.totalLessons) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/40">{enrollment.completedLessons}/{enrollment.totalLessons}</span>
                    </div>
                  )}
                  <p className="flex flex-wrap items-center gap-3 text-sm text-[#90939A]">
                    <span>
                      <span className={enrollment.status === 'completed' ? 'text-[#3FB950]' : 'text-[#FF7A33]'}>
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
          </div>

          <div className="md:sticky md:top-24 md:self-start">
            <CourseTreeRail courseSlug={slug} lessons={lessons} completedLessonIds={completedLessonIds} />
          </div>
        </div>
      </section>
    </main>
  )
}
