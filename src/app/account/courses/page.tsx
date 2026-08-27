'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/components/SessionProvider'
import {
  getMyProgress,
  getMyStatistics,
  unenrollCourse,
  type MyEnrollment,
  type MyStatistics,
} from '@/lib/authClient'

export default function AccountCoursesPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  const [enrollments, setEnrollments] = useState<MyEnrollment[] | null>(null)
  const [stats, setStats] = useState<MyStatistics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login')
    }
  }, [sessionLoading, user, router])

  useEffect(() => {
    if (!user) return

    Promise.all([getMyProgress(), getMyStatistics()]).then(([progressResult, statsResult]) => {
      if (!progressResult.ok) {
        setError(progressResult.error)
        return
      }
      setEnrollments(progressResult.data.enrollments)
      if (statsResult.ok) setStats(statsResult.data)
    })
  }, [user])

  function handleUnenrolled(courseSlug: string) {
    setEnrollments((prev) => (prev ? prev.filter((e) => e.courseSlug !== courseSlug) : prev))
  }

  if (sessionLoading || !user) {
    return (
      <main className="min-h-screen bg-[#171717]">
        <section className="mx-auto max-w-4xl px-6 pb-10 pt-20 sm:pt-28">
          <p className="text-sm text-[#A1A1AA]">Loading…</p>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-4xl px-6 pb-10 pt-20 sm:pt-28">
        <Link href="/account" className="text-xs uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white">
          ← Account
        </Link>
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Learning</p>
        <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">Enrolled courses</h1>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        {error && <p className="text-sm text-[#F85149]">{error}</p>}

        {stats && (
          <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-5">
            <StatTile label="Courses enrolled" value={stats.coursesEnrolled} />
            <StatTile label="Courses completed" value={stats.coursesCompleted} />
            <StatTile label="Lessons completed" value={stats.lessonsCompleted} />
            <StatTile label="Quiz attempts" value={stats.quizAttempts} />
            <StatTile
              label="Avg. quiz score"
              value={stats.averageQuizScorePercent === null ? '—' : `${stats.averageQuizScorePercent}%`}
            />
          </div>
        )}

        <div className="mt-10 flex flex-col gap-3">
          {enrollments && enrollments.length === 0 && (
            <p className="text-sm text-[#A1A1AA]">
              You&apos;re not enrolled in any courses yet.{' '}
              <Link href="/courses" className="text-[#FF8A3D] underline underline-offset-2">
                Browse courses
              </Link>
              .
            </p>
          )}
          {enrollments?.map((enrollment) => (
            <EnrollmentCard key={enrollment.courseSlug} enrollment={enrollment} onUnenrolled={handleUnenrolled} />
          ))}
        </div>
      </section>
    </main>
  )
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-[#171717] p-4">
      <p className="text-2xl font-bold tracking-[-0.03em] text-white">{value}</p>
      <p className="mt-1 text-xs text-[#A1A1AA]">{label}</p>
    </div>
  )
}

function EnrollmentCard({
  enrollment,
  onUnenrolled,
}: {
  enrollment: MyEnrollment
  onUnenrolled: (courseSlug: string) => void
}) {
  const [unenrolling, setUnenrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUnenroll() {
    if (!window.confirm('Unenroll from this course? Your progress is kept — re-enrolling picks up where you left off.')) {
      return
    }

    setUnenrolling(true)
    setError(null)
    const result = await unenrollCourse(enrollment.courseSlug)
    setUnenrolling(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    onUnenrolled(enrollment.courseSlug)
  }

  return (
    <div className="border border-white/10 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className={enrollment.status === 'completed' ? 'text-sm text-[#3FB950]' : 'text-sm text-[#FF8A3D]'}>
            {enrollment.status === 'completed' ? 'Completed' : 'Enrolled'}
          </span>
          <h2 className="mt-1 text-lg font-semibold text-white">{enrollment.courseTitle}</h2>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            {enrollment.completedLessons}/{enrollment.totalLessons} lessons complete
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/courses/${enrollment.courseSlug}`}
            className="text-sm font-medium text-white transition-colors hover:text-[#FF8A3D]"
          >
            Continue →
          </Link>
          <button
            type="button"
            onClick={handleUnenroll}
            disabled={unenrolling}
            className="text-sm text-white/50 underline underline-offset-2 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {unenrolling ? 'Unenrolling…' : 'Unenroll'}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-[#F85149]">{error}</p>}
    </div>
  )
}
