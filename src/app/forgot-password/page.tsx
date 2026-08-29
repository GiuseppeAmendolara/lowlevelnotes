'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import AuthPageShell from '@/components/auth/AuthPageShell'
import AuthTextField from '@/components/auth/AuthTextField'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import AuthMessage from '@/components/auth/AuthMessage'
import TurnstileWidget, { type TurnstileHandle } from '@/components/auth/TurnstileWidget'
import { forgotPassword } from '@/lib/authClient'

export default function ForgotPasswordPage() {
  const turnstileRef = useRef<TurnstileHandle>(null)

  const [email, setEmail] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!turnstileToken) return
    setError(null)
    setSubmitting(true)

    const result = await forgotPassword(email, turnstileToken)
    setSubmitting(false)

    turnstileRef.current?.reset()
    setTurnstileToken(null)

    // The API returns the identical message whether or not the account
    // exists, by design (see Phase 3) — the frontend must not undermine
    // that by branching on it. A 429 is shown separately since it's a
    // rate-limit signal, not an account-existence signal. A 403 here is a
    // failed Turnstile check, not an enumeration signal either.
    if (!result.ok && result.status === 429) {
      setRateLimited(true)
      return
    }
    if (!result.ok && result.status === 403) {
      setError(result.error)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <AuthPageShell eyebrow="Password recovery" heading="Check your email" maxWidth="max-w-md">
        <AuthMessage message="If that email is registered, a password reset link has been sent." tone="success" />
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell
      eyebrow="Password recovery"
      heading="Forgot your password?"
      subtext="Enter your email and we'll send you a link to reset it."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthTextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />

        <TurnstileWidget ref={turnstileRef} action="forgot_password" onToken={setTurnstileToken} />

        {rateLimited && <AuthMessage message="Too many requests. Try again later." />}
        {error && <AuthMessage message={error} />}

        <AuthSubmitButton loading={submitting} disabled={!turnstileToken}>Send reset link</AuthSubmitButton>
      </form>

      <p className="mt-6 text-sm text-[#A1A1AA]">
        <Link href="/login" className="text-white/70 underline underline-offset-2 transition-colors hover:text-white">
          Back to login
        </Link>
      </p>
    </AuthPageShell>
  )
}
