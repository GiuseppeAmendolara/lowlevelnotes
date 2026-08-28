'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthPageShell from '@/components/auth/AuthPageShell'
import { useSession } from '@/components/SessionProvider'
import RoleRequestsPanel from '@/components/admin/RoleRequestsPanel'

export default function RoleRequestsPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  useEffect(() => {
    if (sessionLoading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (user.role !== 'administrator') {
      router.replace('/')
    }
  }, [sessionLoading, user, router])

  if (sessionLoading || !user || user.role !== 'administrator') {
    return (
      <AuthPageShell eyebrow="Staff" heading="Role requests" backHref="/account/approvals" backLabel="Approvals">
        <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
      </AuthPageShell>
    )
  }

  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-5xl px-6 pb-10 pt-20 sm:pt-28">
        <Link href="/account/approvals" className="text-xs uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white">
          ← Approvals
        </Link>
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Staff</p>
        <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">Role requests</h1>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <RoleRequestsPanel />
      </section>
    </main>
  )
}
