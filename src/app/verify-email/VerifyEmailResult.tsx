'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import AuthMessage from '@/components/auth/AuthMessage'
import { verifyEmail, unwrapResult } from '@/lib/authClient'

// Client-side, not server-side: api.lowlevelnotes.com's WAF blocks
// generic scripted HTTP clients (Node's fetch, curl) on most paths —
// server-side rendering here would 403 both locally and once deployed
// (Vercel's Node runtime hits the same block). A real browser's fetch
// doesn't, matching how every other auth page already talks to the API.
export default function VerifyEmailResult({ token }: { token: string }) {
  // Modeled as a query (fires once on mount, keyed by token) rather than
  // a manual useEffect — gets React Query's own unmounted-component
  // safety for free instead of a hand-rolled `cancelled` flag. retry is
  // explicitly off: an invalid/already-used token isn't a transient
  // failure, so the default retry-with-backoff would just delay the
  // error message for no benefit.
  const query = useQuery({
    queryKey: ['verifyEmail', token],
    queryFn: () => unwrapResult(verifyEmail(token)),
    retry: false,
  })

  if (query.isPending) {
    return <p className="text-sm text-[#90939A]">Verifying…</p>
  }

  const message = query.isSuccess ? query.data.message : query.error?.message ?? ''

  return (
    <>
      <AuthMessage message={message} tone={query.isSuccess ? 'success' : 'error'} />
      <p className="mt-6 text-sm text-[#90939A]">
        <Link href="/login" className="text-white/70 underline underline-offset-2 transition-colors hover:text-white">
          Go to login
        </Link>
      </p>
    </>
  )
}
