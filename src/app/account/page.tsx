'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthTextField from '@/components/auth/AuthTextField'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import AuthMessage from '@/components/auth/AuthMessage'
import { useSession } from '@/components/SessionProvider'
import { changePassword, deleteMyAccount, logout, resendVerification, getStaffPendingCounts, roleLabel, getAssetSrc, type StaffPendingCounts } from '@/lib/authClient'
import { useReveal, revealClass, revealState } from '@/lib/useReveal'

type AccountLink = { href: string; title: string; description: string; badge?: number | null }
type AccountSection = { heading: string | null; links: AccountLink[] }

export default function AccountPage() {
  const router = useRouter()
  const { user, loading: sessionLoading, refresh } = useSession()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [pendingCounts, setPendingCounts] = useState<StaffPendingCounts | null>(null)
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
    if (user?.role !== 'staff') return

    getStaffPendingCounts().then((result) => {
      if (result.ok) setPendingCounts(result.data)
    })
  }, [user])

  if (sessionLoading || !user) {
    return (
      <main className="min-h-screen bg-[#171717]">
        <section className="mx-auto max-w-5xl px-6 pb-10 pt-20 sm:pt-28">
          <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
        </section>
      </main>
    )
  }

  const pendingTotal = pendingCounts
    ? pendingCounts.roleRequests + pendingCounts.resourceRequests + pendingCounts.courseRequests
    : 0

  // Unnamed default section first (every account has these two, so a
  // label would just be noise), then one section per role tier —
  // Contributor/Instructor/Staff — each only rendered if the current
  // role actually has links in it. A student sees just the default
  // section plus a single "request access" link in Contributor; staff
  // sees all four.
  const sections: AccountSection[] = [
    {
      heading: null,
      links: [
        { href: '/account/profile', title: 'Your profile', description: 'Set a picture and bio, and see how others view your profile.' },
        { href: '/account/courses', title: 'Enrolled courses', description: 'Manage your enrollments and view your progress.' },
      ],
    },
    {
      heading: 'Contributor',
      links: [
        ...(user.role === 'student'
          ? [{ href: '/contribute', title: 'Request contributor access', description: 'Apply to submit resources to the library.' }]
          : []),
        ...(user.role === 'contributor' || user.role === 'instructor' || user.role === 'staff'
          ? [{ href: '/contribute', title: 'Contribute', description: 'Submit a resource for review.' }]
          : []),
      ],
    },
    {
      heading: 'Instructor',
      links: [
        ...(user.role === 'instructor' || user.role === 'staff'
          ? [{ href: '/courses/builder', title: 'Build a course', description: 'Create and edit your own courses, submit them for review.' }]
          : []),
      ],
    },
    {
      heading: 'Staff',
      links: [
        ...(user.role === 'staff'
          ? [
              { href: '/account/staff', title: 'Staff', description: 'Manage users, blocked IPs, and the activity log.' },
              {
                href: '/account/approvals',
                title: 'Approvals',
                description: 'Review role, resource, and course requests.',
                badge: pendingTotal > 0 ? pendingTotal : null,
              },
            ]
          : []),
      ],
    },
  ].filter((section) => section.links.length > 0)

  // A running index across every section's cards, computed once up front
  // rather than mutated during render, so the staggered reveal cascades
  // smoothly down the whole page instead of restarting per section.
  let nextIndex = 0
  const sectionsWithIndices = sections.map((section) => ({
    ...section,
    links: section.links.map((link) => ({ link, index: nextIndex++ })),
  }))

  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-5xl px-6 pb-10 pt-20 sm:pt-28">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Account</p>

        <div className="mt-5 flex items-center gap-5">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- cross-subdomain, session-cookie-gated asset; next/image can't proxy this
            <img
              src={getAssetSrc(user.avatarUrl)}
              alt=""
              className="h-16 w-16 shrink-0 rounded-full border border-white/10 object-cover sm:h-20 sm:w-20"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0D0D0D] text-xl font-bold text-white/40 sm:h-20 sm:w-20 sm:text-2xl">
              {user.displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">{user.displayName}</h1>
            <p className="mt-1 text-sm text-[#A1A1AA]">{user.email}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#FF8A3D]">{roleLabel(user.role)}</p>
          </div>
        </div>

        {!user.emailVerified && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-[#0D0D0D] px-4 py-3 text-xs text-[#A1A1AA] animate-fade-in-up motion-reduce:animate-none">
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
      </section>

      <section className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pb-16">
        {sectionsWithIndices.map((section) => (
          <div key={section.heading ?? 'default'}>
            {section.heading && (
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">{section.heading}</p>
            )}
            <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
              {section.links.map(({ link, index }) => (
                <AccountLinkCard key={`${link.href}-${link.title}`} index={index} {...link} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="max-w-md border border-white/10 bg-[#0D0D0D]">
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

        <div className="mt-10 max-w-md border border-[#F85149]/30 bg-[#0D0D0D]">
          <DangerZone onDeleted={handleAccountDeleted} />
        </div>
      </section>
    </main>
  )
}

function AccountLinkCard({ href, title, description, badge, index }: AccountLink & { index: number }) {
  const { ref, visible } = useReveal<HTMLAnchorElement>()

  return (
    <Link
      ref={ref}
      href={href}
      style={{ transitionDelay: `${Math.min(index, 6) * 40}ms` }}
      className={`group flex items-start justify-between gap-3 bg-[#0D0D0D] px-6 py-5 text-white hover:bg-[#151515] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FF8A3D] ${revealClass} ${revealState(visible)}`}
    >
      <span className="flex items-start gap-3">
        <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 bg-[#FF8A3D]" />
        <span>
          <span className="flex items-center gap-2">
            <span className="font-medium">{title}</span>
            {badge ? (
              <span className="flex h-5 min-w-5 items-center justify-center bg-[#FF8A3D] px-1 text-[10px] font-bold text-[#0D0D0D]">
                {badge}
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block text-xs text-[#A1A1AA]">{description}</span>
        </span>
      </span>
      <span aria-hidden="true" className="shrink-0 text-white/40 transition-colors group-hover:text-white">→</span>
    </Link>
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
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[#151515] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FF8A3D]"
      >
        <span>
          <span className="block text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Security</span>
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
          <span className="block text-xs font-medium uppercase tracking-[0.18em] text-[#F85149]">Danger zone</span>
          <span className="mt-1 block text-sm text-white">Delete account</span>
        </span>
        <span aria-hidden="true" className={`text-xl leading-none text-white/40 transition-transform duration-150 motion-reduce:transition-none ${open ? 'rotate-45' : ''}`}>+</span>
      </button>

      {open && (
        <form onSubmit={handleDelete} className="flex flex-col gap-4 border-t border-white/10 px-5 py-5 animate-fade-in-up motion-reduce:animate-none">
          <p className="text-xs leading-5 text-[#A1A1AA]">
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
