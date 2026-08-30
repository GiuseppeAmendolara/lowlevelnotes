'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from '@/components/SessionProvider'
import { getStaffPendingCounts, type StaffPendingCounts } from '@/lib/authClient'

type NavItem = { href: string; label: string; badge?: number | null }

// The persistent sidebar + content grid shared across every /account/*
// route (via account/layout.tsx) — and, separately, by the public profile
// page when you're viewing your own: profile editing was folded into
// /u/[id] rather than kept as its own /account/profile page, but it should
// still read as part of the dashboard rather than a page that drops you
// out of it, so it renders inside this same shell instead of a plain
// standalone <main>.
export default function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading } = useSession()
  const [pendingCounts, setPendingCounts] = useState<StaffPendingCounts | null>(null)

  useEffect(() => {
    if (user?.role !== 'staff') return

    getStaffPendingCounts().then((result) => {
      if (result.ok) setPendingCounts(result.data)
    })
  }, [user])

  const pendingTotal = pendingCounts
    ? pendingCounts.roleRequests + pendingCounts.resourceRequests + pendingCounts.courseRequests
    : 0

  const items: NavItem[] = user
    ? [
        { href: '/account', label: 'Overview' },
        { href: `/u/${user.id}`, label: 'Profile' },
        { href: '/account/security', label: 'Security' },
        { href: '/account/courses', label: 'Courses' },
        { href: '/account/contribute', label: 'Contribute' },
        ...(user.role === 'instructor' || user.role === 'staff' ? [{ href: '/account/build', label: 'Build' }] : []),
        ...(user.role === 'staff' ? [{ href: '/account/staff', label: 'Staff' }] : []),
        ...(user.role === 'staff'
          ? [{ href: '/account/approvals', label: 'Approvals', badge: pendingTotal > 0 ? pendingTotal : null }]
          : []),
      ]
    : []

  return (
    <main className="min-h-screen bg-[#0B0B0D]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pb-24 pt-20 sm:pt-28 md:grid-cols-[200px_1fr]">
        <nav aria-label="Account navigation" className="md:sticky md:top-24 md:self-start">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-white/40">Dashboard</p>
          {loading || !user ? (
            <div className="h-32 animate-pulse motion-reduce:animate-none" />
          ) : (
            <div className="flex flex-row flex-wrap gap-1 md:flex-col md:flex-nowrap">
              {items.map((item) => {
                const active = item.href === '/account' ? pathname === item.href : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 border-l-2 px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A33] ${
                      active ? 'border-[#FF7A33] bg-white/5 text-white' : 'border-transparent text-[#90939A] hover:text-white'
                    }`}
                  >
                    {item.label}
                    {Boolean(item.badge) && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center bg-[#FF7A33] px-1 text-[10px] font-bold text-[#0D0D0D]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  )
}
