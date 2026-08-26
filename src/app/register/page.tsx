'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AuthPageShell from '@/components/auth/AuthPageShell'
import AuthTextField from '@/components/auth/AuthTextField'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import AuthMessage from '@/components/auth/AuthMessage'
import { useSession } from '@/components/SessionProvider'
import { register } from '@/lib/authClient'

export default function RegisterPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
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
    setError(null)
    setSubmitting(true)

    const result = await register(email, password, displayName)
    setSubmitting(false)

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
      <AuthPageShell eyebrow="Almost there" heading="Check your email.">
        <AuthMessage message="Check your email to verify your account, then log in." tone="success" />
        <p className="mt-6 text-sm text-[#A1A1AA]">
          <Link href="/login" className="text-white/70 underline underline-offset-2 transition-colors hover:text-white">
            Go to login
          </Link>
        </p>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell eyebrow="Create an account" heading="Register.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthTextField label="Display name" value={displayName} onChange={setDisplayName} autoComplete="name" required />
        <AuthTextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
        <AuthTextField label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" required />

        {error && <AuthMessage message={error} />}

        <AuthSubmitButton loading={submitting}>Register</AuthSubmitButton>
      </form>

      <p className="mt-6 text-sm text-[#A1A1AA]">
        Already have an account?{' '}
        <Link href="/login" className="text-white/70 underline underline-offset-2 transition-colors hover:text-white">
          Log in
        </Link>
      </p>
    </AuthPageShell>
  )
}
