'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/components/SessionProvider'
import {
  resendVerification,
  roleLabel,
  getAssetSrc,
  getMyStatistics,
  getMyProgress,
  type MyStatistics,
  type MyEnrollment,
} from '@/lib/authClient'
import Eyebrow from '@/components/Eyebrow'

export default function AccountPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [stats, setStats] = useState<MyStatistics | null>(null)
  const [continuing, setContinuing] = useState<MyEnrollment | null>(null)

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login')
    }
  }, [sessionLoading, user, router])

  async function handleResendVerification() {
    setResendState('sending')
    const result = await resendVerification()
    setResendState(result.ok ? 'sent' : 'idle')
  }

  useEffect(() => {
    if (!user) return

    getMyStatistics().then((result) => {
      if (result.ok) setStats(result.data)
    })
    getMyProgress().then((result) => {
      if (!result.ok) return
      // "Continue learning" surfaces whatever's in progress, not completed —
      // the most recently touched active enrollment, falling back to the
      // first one if none carry a completedAt/enrolledAt ordering worth
      // relying on client-side.
      const active = result.data.enrollments.find((e) => e.status !== 'completed') ?? result.data.enrollments[0] ?? null
      setContinuing(active)
    })
  }, [user])

  if (sessionLoading || !user) {
    return <p className="pt-1 text-sm text-[#90939A] animate-pulse motion-reduce:animate-none">Loading…</p>
  }

  return (
    <div>
      <Eyebrow>Overview</Eyebrow>

      <div className="mt-5 flex items-center gap-5">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- cross-subdomain, session-cookie-gated asset; next/image can't proxy this
          <img
            src={getAssetSrc(user.avatarUrl)}
            alt=""
            className="h-16 w-16 shrink-0 rounded-full border border-white/10 object-cover sm:h-20 sm:w-20"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#17181B] text-xl font-bold text-white/40 sm:h-20 sm:w-20 sm:text-2xl">
            {user.displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">Welcome back, {user.displayName.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-[#90939A]">{user.email}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#FF7A33]">{roleLabel(user.role)}</p>
        </div>
      </div>

      {!user.emailVerified && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-[#17181B] px-4 py-3 text-xs text-[#90939A] animate-fade-in-up motion-reduce:animate-none">
          <span>Your email isn&apos;t verified.</span>
          {resendState === 'sent' ? (
            <span className="text-[#3FB950]">Sent — check your email.</span>
          ) : (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendState === 'sending'}
              className="text-white/70 underline underline-offset-2 transition-colors hover:text-white disabled:opacity-50"
            >
              {resendState === 'sending' ? 'Sending…' : 'Resend verification email'}
            </button>
          )}
        </div>
      )}

      {stats && (
        <div className="mt-10 grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-4">
          <StatTile label="Enrolled" value={stats.coursesEnrolled} />
          <StatTile label="Completed" value={stats.coursesCompleted} />
          <StatTile label="Lessons done" value={stats.lessonsCompleted} />
          <StatTile label="Avg. quiz score" value={stats.averageQuizScorePercent === null ? '—' : `${stats.averageQuizScorePercent}%`} />
        </div>
      )}

      {continuing && (
        <div className="mt-8">
          <Eyebrow className="mb-3">Continue learning</Eyebrow>
          <Link
            href={`/courses/${continuing.courseSlug}`}
            className="block max-w-md border border-white/10 bg-[#17181B] p-5 transition-colors hover:bg-[#151515]"
          >
            <h2 className="text-lg font-semibold text-white">{continuing.courseTitle}</h2>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 max-w-40 bg-white/10">
                <div
                  className="h-full bg-[#FF7A33]"
                  style={{ width: `${continuing.totalLessons > 0 ? Math.round((continuing.completedLessons / continuing.totalLessons) * 100) : 0}%` }}
                />
              </div>
              <span className="text-xs text-[#90939A]">{continuing.completedLessons}/{continuing.totalLessons}</span>
            </div>
            <p className="mt-3 text-xs text-white/40">Resume →</p>
          </Link>
        </div>
      )}
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-[#17181B] p-4">
      <p className="text-2xl font-bold tabular-nums tracking-[-0.03em] text-white">{value}</p>
      <p className="mt-1 text-xs text-[#90939A]">{label}</p>
    </div>
  )
}
