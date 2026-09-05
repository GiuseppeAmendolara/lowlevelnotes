'use client'

import { useState } from 'react'
import AuthTextField from '@/components/auth/AuthTextField'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import AuthMessage from '@/components/auth/AuthMessage'

// Deliberately never sends what's typed here anywhere — the visit itself
// is already logged server-side by the page (see page.tsx), so this form
// exists only to keep whoever's probing here occupied a little longer.
// Storing submitted credentials would risk keeping a real password
// someone reused out of habit, for zero investigative value over the
// visit log alone.
export default function HoneypotLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [failed, setFailed] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFailed(false)
    window.setTimeout(() => {
      setSubmitting(false)
      setFailed(true)
      setPassword('')
    }, 600)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthTextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="username" required />
      <AuthTextField label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" required />

      {failed && <AuthMessage message="Invalid credentials." />}

      <AuthSubmitButton loading={submitting}>Login</AuthSubmitButton>
    </form>
  )
}
