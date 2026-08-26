'use client'

import { useState } from 'react'
import Link from 'next/link'
import AuthPageShell from '@/components/auth/AuthPageShell'
import AuthTextField from '@/components/auth/AuthTextField'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import AuthMessage from '@/components/auth/AuthMessage'
import { forgotPassword } from '@/lib/authClient'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const result = await forgotPassword(email)
    setSubmitting(false)

    // The API returns the identical message whether or not the account
    // exists, by design (see Phase 3) — the frontend must not undermine
    // that by branching on it. A 429 is shown separately since it's a
    // rate-limit signal, not an account-existence signal.
    if (!result.ok && result.status === 429) {
      setRateLimited(true)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <AuthPageShell eyebrow="Password recovery" heading="Check your email">
        <AuthMessage message="If that email is registered, a password reset link has been sent." tone="success" />
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell
      eyebrow="Password recovery"
      heading="Forgot your password?"
      subtext="Enter your email and we'll send you a link to reset it."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthTextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />

        {rateLimited && <AuthMessage message="Too many requests. Try again later." />}

        <AuthSubmitButton loading={submitting}>Send reset link</AuthSubmitButton>
      </form>

      <p className="mt-6 text-sm text-[#A1A1AA]">
        <Link href="/login" className="text-white/70 underline underline-offset-2 transition-colors hover:text-white">
          Back to login
        </Link>
      </p>
    </AuthPageShell>
  )
}
