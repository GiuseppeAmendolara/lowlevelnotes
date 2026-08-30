'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AuthPageShell from '@/components/auth/AuthPageShell'
import AuthTextField from '@/components/auth/AuthTextField'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import AuthMessage from '@/components/auth/AuthMessage'
import TurnstileWidget, { type TurnstileHandle } from '@/components/auth/TurnstileWidget'
import { useSession } from '@/components/SessionProvider'
import { register } from '@/lib/authClient'

export default function RegisterPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()
  const turnstileRef = useRef<TurnstileHandle>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!sessionLoading && user) {
      router.replace('/account')
    }
  }, [sessionLoading, user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!turnstileToken) return
    setError(null)
    setSubmitting(true)

    const result = await register(email, password, displayName, turnstileToken)
    setSubmitting(false)

    // Tokens are single-use regardless of outcome — fetch a fresh one
    // before the next attempt.
    turnstileRef.current?.reset()
    setTurnstileToken(null)

    if (!result.ok) {
      setError(result.error)
      return
    }

    // Registration never auto-logs in — the account still needs email
    // verification, so this stays on the same page with a confirmation
    // rather than redirecting somewhere a fresh account can't use yet.
    setDone(true)
  }

  if (done) {
    return (
      <AuthPageShell eyebrow="Almost there" heading="Check your email" maxWidth="max-w-md">
        <AuthMessage message="Check your email to verify your account, then login." tone="success" />
        <p className="mt-6 text-sm text-[#90939A]">
          <Link href="/login" className="text-white/70 underline underline-offset-2 transition-colors hover:text-white">
            Go to login
          </Link>
        </p>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell eyebrow="Create an account" heading="Register" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthTextField label="Display name" value={displayName} onChange={setDisplayName} autoComplete="name" required />
        <AuthTextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
        <AuthTextField label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" required />

        <TurnstileWidget ref={turnstileRef} action="register" onToken={setTurnstileToken} />

        {error && <AuthMessage message={error} />}

        <AuthSubmitButton loading={submitting} disabled={!turnstileToken}>Register</AuthSubmitButton>
      </form>

      <p className="mt-6 text-sm text-[#90939A]">
        Already have an account?{' '}
        <Link href="/login" className="text-white/70 underline underline-offset-2 transition-colors hover:text-white">
          Login
        </Link>
      </p>
    </AuthPageShell>
  )
}
