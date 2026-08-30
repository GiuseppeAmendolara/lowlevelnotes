'use client'

import { useState } from 'react'
import Link from 'next/link'
import AuthTextField from '@/components/auth/AuthTextField'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import AuthMessage from '@/components/auth/AuthMessage'
import { resetPassword } from '@/lib/authClient'

export default function ResetPasswordForm({ token }: { token: string }) {
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const result = await resetPassword(token, newPassword)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <>
        <AuthMessage message="Password has been reset." tone="success" />
        <p className="mt-6 text-sm text-[#90939A]">
          <Link href="/login" className="text-white/70 underline underline-offset-2 transition-colors hover:text-white">
            Login
          </Link>
        </p>
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthTextField label="New password" type="password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" required />

      {error && <AuthMessage message={error} />}

      <AuthSubmitButton loading={submitting}>Reset password</AuthSubmitButton>
    </form>
  )
}
