'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/components/SessionProvider'
import { useToast } from '@/components/ToastProvider'
import { Skeleton, SkeletonStatTile } from '@/components/Skeleton'
import {
  getMyProgress,
  getMyStatistics,
  unenrollCourse,
  unwrapResult,
  type MyEnrollment,
} from '@/lib/authClient'
import Eyebrow from '@/components/Eyebrow'

export default function AccountCoursesPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  const progressQuery = useQuery({
    queryKey: ['progress'],
    queryFn: () => unwrapResult(getMyProgress()),
    enabled: !!user,
    staleTime: 0,
  })
  const { data: stats } = useQuery({
    queryKey: ['myStatistics'],
    queryFn: () => unwrapResult(getMyStatistics()),
    enabled: !!user,
  })
  const enrollments = progressQuery.data?.enrollments ?? null
  const error = progressQuery.error?.message ?? null

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login')
    }
  }, [sessionLoading, user, router])

  if (sessionLoading || !user) {
    return (
      <div>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-9 w-56" />
      </div>
    )
  }

  return (
    <div>
      <Eyebrow>Learning</Eyebrow>
      <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-white">Enrolled courses</h1>

      {error && <p className="mt-4 text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>}

      <div className="mt-8 grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-5">
        {stats ? (
          <>
            <StatTile label="Courses enrolled" value={stats.coursesEnrolled} />
            <StatTile label="Courses completed" value={stats.coursesCompleted} />
            <StatTile label="Lessons completed" value={stats.lessonsCompleted} />
            <StatTile label="Quiz attempts" value={stats.quizAttempts} />
            <StatTile
              label="Avg. quiz score"
              value={stats.averageQuizScorePercent === null ? '—' : `${stats.averageQuizScorePercent}%`}
            />
          </>
        ) : (
          Array.from({ length: 5 }).map((_, i) => <SkeletonStatTile key={i} />)
        )}
      </div>

      <div className="mt-10 flex flex-col gap-3">
        {!enrollments && !error && (
          <>
            <Skeleton className="h-24 border border-white/10" />
            <Skeleton className="h-24 border border-white/10" />
          </>
        )}
        {enrollments && enrollments.length === 0 && (
          <p className="text-sm text-[#90939A]">
            You&apos;re not enrolled in any courses yet.{' '}
            <Link href="/courses" className="text-[#FF7A33] underline underline-offset-2">
              Browse courses
            </Link>
            .
          </p>
        )}
        {enrollments?.map((enrollment) => (
          <EnrollmentCard key={enrollment.courseSlug} enrollment={enrollment} />
        ))}
      </div>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-[#17181B] p-4">
      <p className="text-2xl font-bold tracking-[-0.03em] text-white">{value}</p>
      <p className="mt-1 text-xs text-[#90939A]">{label}</p>
    </div>
  )
}

function EnrollmentCard({ enrollment }: { enrollment: MyEnrollment }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const unenrollMutation = useMutation({
    mutationFn: () => unwrapResult(unenrollCourse(enrollment.courseSlug)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] })
      toast.success(`Unenrolled from ${enrollment.courseTitle}.`)
    },
    onError: (error) => toast.error(error.message),
  })

  function handleUnenroll() {
    if (!window.confirm('Unenroll from this course? Your progress is kept — re-enrolling picks up where you left off.')) {
      return
    }
    unenrollMutation.mutate()
  }

  return (
    <div className="border border-white/10 bg-[#17181B] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className={enrollment.status === 'completed' ? 'text-sm text-[#3FB950]' : 'text-sm text-[#FF7A33]'}>
            {enrollment.status === 'completed' ? 'Completed' : 'Enrolled'}
          </span>
          <h2 className="mt-1 text-lg font-semibold text-white">{enrollment.courseTitle}</h2>
          <p className="mt-1 text-sm text-[#90939A]">
            {enrollment.completedLessons}/{enrollment.totalLessons} lessons complete
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/courses/${enrollment.courseSlug}`}
            className="text-sm font-medium text-white transition-colors hover:text-[#FF7A33]"
          >
            Continue →
          </Link>
          <button
            type="button"
            onClick={handleUnenroll}
            disabled={unenrollMutation.isPending}
            className="text-sm text-white/50 underline underline-offset-2 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {unenrollMutation.isPending ? 'Unenrolling…' : 'Unenroll'}
          </button>
        </div>
      </div>
    </div>
  )
}
