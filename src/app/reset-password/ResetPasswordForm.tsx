'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import AuthTextField from '@/components/auth/AuthTextField'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import AuthMessage from '@/components/auth/AuthMessage'
import { resetPassword, unwrapResult } from '@/lib/authClient'

export default function ResetPasswordForm({ token }: { token: string }) {
  const [newPassword, setNewPassword] = useState('')
  const resetMutation = useMutation({ mutationFn: () => unwrapResult(resetPassword(token, newPassword)) })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    resetMutation.mutate()
  }

  if (resetMutation.isSuccess) {
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

      {resetMutation.error && <AuthMessage message={resetMutation.error.message} />}

      <AuthSubmitButton loading={resetMutation.isPending}>Reset password</AuthSubmitButton>
    </form>
  )
}
