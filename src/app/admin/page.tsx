import { headers } from 'next/headers'
import type { Metadata } from 'next'
import AuthPageShell from '@/components/auth/AuthPageShell'
import HoneypotLoginForm from './HoneypotLoginForm'

// Decoy admin login — never linked from Header/Footer/sitemap.ts, so the
// only way anyone lands here is guessing a common admin path, which is
// exactly what a scanner does. Every visit is logged (see logHit below)
// and surfaced on the real staff panel's Honeypot tab
// (src/components/admin/AdminPanel.tsx).
//
// noindex/nofollow keeps it out of search results if some crawler finds
// it independently anyway; deliberately NOT added to robots.txt's
// Disallow list (there isn't one yet) — listing a path there is itself a
// common way scanners *discover* "interesting" paths, which would work
// against the whole point.
export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const API_BASE = 'https://api.lowlevelnotes.com'

// Logs the hit server-side, not via a client-mount beacon, so this fires
// for every visit including plain curl/scanner requests that never
// execute JS — the exact traffic this page exists to catch. This request
// reaches the Worker from Vercel's server rather than the visitor's own
// browser, so the visitor's real ip/user-agent are read here and
// forwarded explicitly in the body — worker/routes/security.js can't see
// them off its own `request` the way it does for direct browser calls.
// INTERNAL_API_KEY-gated on the Worker side (same secret src/lib/api.ts
// already sends) so the endpoint can't be spammed directly.
//
// The site sits behind Cloudflare in front of Vercel (same zone the
// staff panel's IP-block feature targets), so there are two proxy hops
// here, and `x-forwarded-for`'s first entry turned out to be Cloudflare's
// own edge IP (162.158.0.0/15) rather than the visitor's — confirmed live
// on the deployed honeypot. `cf-connecting-ip` is the header Cloudflare
// itself sets to the real client IP and strips from anything the client
// sent, which is exactly why the Worker trusts it everywhere else
// (worker/lib/security.js, routes/security.js) instead of
// `x-forwarded-for`; use it here first for the same reason.
async function logHit() {
  const h = await headers()
  const forwardedFor = h.get('x-forwarded-for')
  const ip = h.get('cf-connecting-ip') ?? (forwardedFor ? forwardedFor.split(',')[0].trim() : h.get('x-real-ip'))

  try {
    await fetch(`${API_BASE}/v1/honeypot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.INTERNAL_API_KEY!,
      },
      body: JSON.stringify({
        path: '/admin',
        ip,
        userAgent: h.get('user-agent'),
        referrer: h.get('referer'),
      }),
      cache: 'no-store',
    })
  } catch {
    // A logging failure should never take the decoy page itself down.
  }
}

export default async function AdminHoneypotPage() {
  await logHit()

  return (
    <AuthPageShell eyebrow="Restricted" heading="Admin Login">
      <HoneypotLoginForm />
    </AuthPageShell>
  )
}
