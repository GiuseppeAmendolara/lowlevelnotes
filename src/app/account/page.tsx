'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthPageShell from '@/components/auth/AuthPageShell'
import AuthTextField from '@/components/auth/AuthTextField'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import AuthMessage from '@/components/auth/AuthMessage'
import { useSession } from '@/components/SessionProvider'
import { changePassword, logout, resendVerification } from '@/lib/authClient'

export default function AccountPage() {
  const router = useRouter()
  const { user, loading: sessionLoading, refresh } = useSession()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')
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

  async function handleResendVerification() {
    setResendState('sending')
    const result = await resendVerification()
    setResendState(result.ok ? 'sent' : 'idle')
  }

  if (sessionLoading || !user) {
    return (
      <AuthPageShell eyebrow="Account" heading="Account.">
        <p className="text-sm text-[#A1A1AA]">Loading…</p>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell eyebrow="Account" heading={user.displayName}>
      <p className="text-sm text-[#A1A1AA]">{user.email}</p>

      {!user.emailVerified && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-[#0D0D0D] px-4 py-3 text-xs text-[#A1A1AA]">
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

      <h2 className="mt-10 text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Change password</h2>
      <form onSubmit={handleChangePassword} className="mt-4 flex flex-col gap-4">
        <AuthTextField label="Current password" type="password" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" required />
        <AuthTextField label="New password" type="password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" required />

        {error && <AuthMessage message={error} />}
        {success && <AuthMessage message={success} tone="success" />}

        <AuthSubmitButton loading={submitting}>Change password</AuthSubmitButton>
      </form>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-10 inline-flex w-full items-center justify-center gap-3 border border-white/15 px-5 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Log out
      </button>
    </AuthPageShell>
  )
}
