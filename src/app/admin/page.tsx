import type { Metadata } from 'next'
import AuthPageShell from '@/components/auth/AuthPageShell'
import HoneypotLoginForm from './HoneypotLoginForm'

// Decoy admin login — never linked from Header/Footer/sitemap.ts, so the
// only way anyone lands here is guessing a common admin path, which is
// exactly what a scanner does. Every visit (GET here, plus a direct POST
// — see src/middleware.ts) is logged and surfaced on the real staff
// panel's Honeypot tab (src/components/admin/AdminPanel.tsx). Logging
// itself lives in middleware.ts, not here, so it also catches a script
// POSTing credentials directly without ever loading this page.
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

export default function AdminHoneypotPage() {
  return (
    <AuthPageShell eyebrow="Restricted" heading="Admin Login">
      <HoneypotLoginForm />
    </AuthPageShell>
  )
}
