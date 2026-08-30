'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/components/SessionProvider'
import { useToast } from '@/components/ToastProvider'
import ActionButton from '@/components/ActionButton'
import CourseTreeRail from '@/components/CourseTreeRail'
import { CourseIcon } from '@/components/CourseIcon'
import { Skeleton } from '@/components/Skeleton'
import {
  getCourse,
  getCourseLessons,
  getMyProgress,
  enrollCourse,
  unenrollCourse,
  unwrapResult,
  ApiError,
  type Course,
  type CourseDifficulty,
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
  const queryClient = useQueryClient()
  const toast = useToast()

  const courseQuery = useQuery({
    queryKey: ['course', slug],
    queryFn: () => unwrapResult(getCourse(slug)),
    enabled: !!user,
  })
  const lessonsQuery = useQuery({
    queryKey: ['course', slug, 'lessons'],
    queryFn: () => unwrapResult(getCourseLessons(slug)),
    enabled: !!user,
  })
  // A global key, not scoped by slug — enrolling/completing a lesson can
  // happen from the lesson page too, which invalidates this same key so
  // this page never shows progress that's stale from an action taken
  // elsewhere. staleTime: 0 overrides QueryProvider's default 60s for
  // this one query specifically, since progress changes from user
  // actions rather than content edits, and should always revalidate on
  // mount rather than trust a minute-old cache.
  const progressQuery = useQuery({
    queryKey: ['progress'],
    queryFn: () => unwrapResult(getMyProgress()),
    enabled: !!user,
    staleTime: 0,
  })

  const enrollMutation = useMutation({
    mutationFn: () => unwrapResult(enrollCourse(slug)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] })
      toast.success('Enrolled.')
    },
    onError: (error) => toast.error(error.message),
  })
  const unenrollMutation = useMutation({
    mutationFn: () => unwrapResult(unenrollCourse(slug)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] })
      toast.success('Unenrolled.')
    },
    onError: (error) => toast.error(error.message),
  })

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login')
    }
  }, [sessionLoading, user, router])

  function handleUnenroll() {
    if (!window.confirm('Unenroll from this course? Your progress is kept — re-enrolling picks up where you left off.')) {
      return
    }
    unenrollMutation.mutate()
  }

  if (sessionLoading || !user) {
    return (
      <main className="min-h-screen bg-[#0B0B0D]">
        <section className="mx-auto max-w-6xl px-6 pb-10 pt-20 sm:pt-28">
          <CourseDetailSkeleton />
        </section>
      </main>
    )
  }

  const notFoundError = [courseQuery.error, lessonsQuery.error].find((e) => e instanceof ApiError && e.status === 404)
  const otherError = courseQuery.error ?? lessonsQuery.error

  if (otherError) {
    return (
      <main className="min-h-screen bg-[#0B0B0D]">
        <section className="mx-auto max-w-6xl px-6 pb-10 pt-20 sm:pt-28">
          <h1 className="text-2xl font-bold tracking-[-0.04em] text-white">
            {notFoundError ? 'Course not found' : 'Something went wrong'}
          </h1>
          <p className="mt-3 text-sm text-[#90939A]">{otherError.message}</p>
          <Link href="/courses" className="mt-6 inline-block text-sm text-[#FF7A33] underline underline-offset-2">
            ← Back to courses
          </Link>
        </section>
      </main>
    )
  }

  const course = courseQuery.data
  const lessons = lessonsQuery.data

  if (!course || !lessons) {
    return (
      <main className="min-h-screen bg-[#0B0B0D]">
        <section className="mx-auto max-w-6xl px-6 pb-10 pt-20 sm:pt-28">
          <CourseDetailSkeleton />
        </section>
      </main>
    )
  }

  const enrollment = progressQuery.data?.enrollments.find((e) => e.courseSlug === slug) ?? null
  const completedLessonIds = new Set(
    (progressQuery.data?.lessonProgress ?? [])
      .filter((p) => p.courseSlug === slug && p.status === 'completed')
      .map((p) => p.lessonId)
  )

  return (
    <main className="min-h-screen bg-[#0B0B0D]">
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pt-28">
        <Link href="/courses" className="text-xs uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white">
          ← Courses
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-[1fr_280px]">
          <div>
            <div className="flex items-center gap-4">
              <CourseIcon title={course.title} iconUrl={course.iconUrl} iconGlyph={course.iconGlyph} size="lg" />
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
                      disabled={unenrollMutation.isPending}
                      className="text-white/50 underline underline-offset-2 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {unenrollMutation.isPending ? 'Unenrolling…' : 'Unenroll'}
                    </button>
                  </p>
                </>
              ) : (
                <ActionButton onClick={() => enrollMutation.mutate()} loading={enrollMutation.isPending}>
                  Enroll
                </ActionButton>
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

function CourseDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_280px]">
      <div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 border border-white/10" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="mt-4 h-10 w-72 max-w-full" />
        <Skeleton className="mt-4 h-4 w-96 max-w-full" />
        <Skeleton className="mt-6 h-9 w-28" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}
