'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthTextField from '@/components/auth/AuthTextField'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import AuthMessage from '@/components/auth/AuthMessage'
import { useSession } from '@/components/SessionProvider'
import {
  changePassword,
  deleteMyAccount,
  logout,
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
  const { user, loading: sessionLoading, refresh } = useSession()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [stats, setStats] = useState<MyStatistics | null>(null)
  const [continuing, setContinuing] = useState<MyEnrollment | null>(null)
  // Suppresses the redirect-to-/login guard below during a deliberate
  // logout — otherwise refresh()'s setUser(null) and this effect's own
  // router.replace('/login') race the logout handler's router.push('/'),
  // and whichever navigation settles last silently wins.
  const loggingOutRef = useRef(false)

  useEffect(() => {
    if (!sessionLoading && !user && !loggingOutRef.current) {
      router.replace('/login')
    }
  }, [sessionLoading, user, router])

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)

    const result = await changePassword(currentPassword, newPassword)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setSuccess('Password changed.')
  }

  async function handleLogout() {
    loggingOutRef.current = true
    await logout()
    await refresh()
    router.push('/')
  }

  // deleteMyAccount already clears the session cookie server-side on
  // success, so this only needs to sync client state and navigate away —
  // same loggingOutRef guard as handleLogout, for the same reason (avoid
  // racing the redirect-to-/login effect above).
  async function handleAccountDeleted() {
    loggingOutRef.current = true
    await refresh()
    router.push('/')
  }

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

      <div className="mt-10 max-w-md border border-white/10 bg-[#17181B]">
        <SecuritySection
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          error={error}
          success={success}
          submitting={submitting}
          onSubmit={handleChangePassword}
        />
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-10 text-xs uppercase tracking-[0.12em] text-white/40 underline underline-offset-2 transition-colors hover:text-[#F85149] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Log out
      </button>

      <div className="mt-10 max-w-md border border-[#F85149]/30 bg-[#17181B]">
        <DangerZone onDeleted={handleAccountDeleted} />
      </div>
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

// Collapsed by default — password change is a rare action and shouldn't
// compete with the navigation grid above for default visual weight; the
// header itself always shows so it's discoverable, not hidden.
function SecuritySection({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  error,
  success,
  submitting,
  onSubmit,
}: {
  currentPassword: string
  setCurrentPassword: (value: string) => void
  newPassword: string
  setNewPassword: (value: string) => void
  error: string | null
  success: string | null
  submitting: boolean
  onSubmit: (e: React.FormEvent) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[#151515] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FF7A33]"
      >
        <span>
          <span className="block text-xs font-medium uppercase tracking-[0.18em] text-[#FF7A33]"><span className="text-[#C95E1A]">{'// '}</span>Security</span>
          <span className="mt-1 block text-sm text-white">Change password</span>
        </span>
        <span aria-hidden="true" className={`text-xl leading-none text-white/40 transition-transform duration-150 motion-reduce:transition-none ${open ? 'rotate-45' : ''}`}>+</span>
      </button>

      {open && (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 border-t border-white/10 px-5 py-5 animate-fade-in-up motion-reduce:animate-none">
          <AuthTextField label="Current password" type="password" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" required />
          <AuthTextField label="New password" type="password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" required />

          {error && <AuthMessage message={error} />}
          {success && <AuthMessage message={success} tone="success" />}

          <AuthSubmitButton loading={submitting}>Change password</AuthSubmitButton>
        </form>
      )}
    </>
  )
}

// Collapsed by default, same reasoning as SecuritySection — plus its own
// red accent throughout (header, border, submit button) instead of the
// site's orange, so this reads as a distinct, more severe category of
// action rather than just another settings panel. Requires re-entering
// the current password (self-contained state, not lifted to the parent —
// nothing else on the page needs it) so a session left open on a shared
// device can't delete the account with a single stray click.
function DangerZone({ onDeleted }: { onDeleted: () => void }) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const result = await deleteMyAccount(password)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    onDeleted()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[#151515] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#F85149]"
      >
        <span>
          <span className="block text-xs font-medium uppercase tracking-[0.18em] text-[#F85149]">{'// '}Danger zone</span>
          <span className="mt-1 block text-sm text-white">Delete account</span>
        </span>
        <span aria-hidden="true" className={`text-xl leading-none text-white/40 transition-transform duration-150 motion-reduce:transition-none ${open ? 'rotate-45' : ''}`}>+</span>
      </button>

      {open && (
        <form onSubmit={handleDelete} className="flex flex-col gap-4 border-t border-white/10 px-5 py-5 animate-fade-in-up motion-reduce:animate-none">
          <p className="text-xs leading-5 text-[#90939A]">
            This permanently deletes your account, enrollments, progress, and submissions. This can&apos;t be undone.
          </p>
          <AuthTextField label="Confirm your password" type="password" value={password} onChange={setPassword} autoComplete="current-password" required />

          {error && <AuthMessage message={error} />}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-3 border border-[#F85149]/40 bg-[#F85149]/10 px-5 py-3.5 text-sm font-semibold text-[#F85149] transition-colors transition-transform duration-150 hover:bg-[#F85149]/20 active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F85149] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? '…' : 'Permanently delete my account'}
          </button>
        </form>
      )}
    </>
  )
}
