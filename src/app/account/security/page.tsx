'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthTextField from '@/components/auth/AuthTextField'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import AuthMessage from '@/components/auth/AuthMessage'
import { useSession } from '@/components/SessionProvider'
import { changePassword, deleteMyAccount, logout } from '@/lib/authClient'
import Eyebrow from '@/components/Eyebrow'

export default function AccountSecurityPage() {
  const router = useRouter()
  const { user, loading: sessionLoading, refresh } = useSession()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
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

  if (sessionLoading || !user) {
    return <p className="pt-1 text-sm text-[#90939A] animate-pulse motion-reduce:animate-none">Loading…</p>
  }

  return (
    <div>
      <Eyebrow>Security</Eyebrow>
      <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-white">Account security</h1>

      <div className="mt-8 max-w-md border border-white/10 bg-[#17181B]">
        <PasswordSection
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

// Collapsed by default — password change is a rare action and shouldn't
// be expanded by default even on its own dedicated page.
function PasswordSection({
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
          <span className="block text-sm font-medium text-white">Change password</span>
          <span className="mt-1 block text-xs text-white/40">Update the password used to sign in</span>
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

// Collapsed by default, same reasoning as PasswordSection — plus its own
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
