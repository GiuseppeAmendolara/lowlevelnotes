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
import { login } from '@/lib/authClient'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: sessionLoading, refresh } = useSession()
  const turnstileRef = useRef<TurnstileHandle>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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

    const result = await login(email, password, turnstileToken)
    setSubmitting(false)

    turnstileRef.current?.reset()
    setTurnstileToken(null)

    if (!result.ok) {
      setError(result.error)
      return
    }

    await refresh()
    router.push('/account')
  }

  return (
    <AuthPageShell eyebrow="Welcome back" heading="Login">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthTextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
        <AuthTextField label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" required />

        <TurnstileWidget ref={turnstileRef} action="login" onToken={setTurnstileToken} />

        {error && <AuthMessage message={error} />}

        <AuthSubmitButton loading={submitting} disabled={!turnstileToken}>Login</AuthSubmitButton>
      </form>

      <p className="mt-6 text-sm text-[#A1A1AA]">
        No account?{' '}
        <Link href="/register" className="text-white/70 underline underline-offset-2 transition-colors hover:text-white">
          Register
        </Link>
      </p>
      <p className="mt-2 text-sm text-[#A1A1AA]">
        <Link href="/forgot-password" className="text-white/70 underline underline-offset-2 transition-colors hover:text-white">
          Forgot your password?
        </Link>
      </p>
    </AuthPageShell>
  )
}
