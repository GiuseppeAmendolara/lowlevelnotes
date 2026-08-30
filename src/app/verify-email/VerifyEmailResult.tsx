'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AuthMessage from '@/components/auth/AuthMessage'
import { verifyEmail } from '@/lib/authClient'

// Client-side, not server-side: api.lowlevelnotes.com's WAF blocks
// generic scripted HTTP clients (Node's fetch, curl) on most paths —
// server-side rendering here would 403 both locally and once deployed
// (Vercel's Node runtime hits the same block). A real browser's fetch
// doesn't, matching how every other auth page already talks to the API.
export default function VerifyEmailResult({ token }: { token: string }) {
  const [state, setState] = useState<{ loading: boolean; ok: boolean; message: string }>({
    loading: true,
    ok: false,
    message: '',
  })

  useEffect(() => {
    let cancelled = false

    verifyEmail(token).then((result) => {
      if (cancelled) return
      setState({
        loading: false,
        ok: result.ok,
        message: result.ok ? result.data.message : result.error,
      })
    })

    return () => {
      cancelled = true
    }
  }, [token])

  if (state.loading) {
    return <p className="text-sm text-[#90939A]">Verifying…</p>
  }

  return (
    <>
      <AuthMessage message={state.message} tone={state.ok ? 'success' : 'error'} />
      <p className="mt-6 text-sm text-[#90939A]">
        <Link href="/login" className="text-white/70 underline underline-offset-2 transition-colors hover:text-white">
          Go to login
        </Link>
      </p>
    </>
  )
}
