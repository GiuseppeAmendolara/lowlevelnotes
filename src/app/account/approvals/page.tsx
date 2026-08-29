'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthPageShell from '@/components/auth/AuthPageShell'
import { useSession } from '@/components/SessionProvider'
import { getStaffPendingCounts, type StaffPendingCounts } from '@/lib/authClient'

export default function ApprovalPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()
  const [counts, setCounts] = useState<StaffPendingCounts | null>(null)

  useEffect(() => {
    if (sessionLoading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (user.role !== 'staff') {
      router.replace('/')
    }
  }, [sessionLoading, user, router])

  useEffect(() => {
    if (user?.role !== 'staff') return

    getStaffPendingCounts().then((result) => {
      if (result.ok) setCounts(result.data)
    })
  }, [user])

  if (sessionLoading || !user || user.role !== 'staff') {
    return (
      <AuthPageShell eyebrow="Staff" heading="Approvals" backHref="/account/staff" backLabel="Staff">
        <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell eyebrow="Staff" heading="Approvals" backHref="/account/staff" backLabel="Staff">
      <p className="text-sm text-[#A1A1AA]">Review requests before they take effect.</p>

      <div className="mt-6 flex flex-col gap-2">
        <ApprovalLinkCard href="/account/approvals/role-requests" title="Role requests" count={counts?.roleRequests} description="Student requests to become a contributor or instructor." />
        <ApprovalLinkCard href="/account/approvals/resource-requests" title="Resource requests" count={counts?.resourceRequests} description="Links and files submitted for the library." />
        <ApprovalLinkCard href="/account/approvals/course-requests" title="Course requests" count={counts?.courseRequests} description="Open a course to review its full content before publishing, or remove one." />
      </div>
    </AuthPageShell>
  )
}

function ApprovalLinkCard({ href, title, count, description }: { href: string; title: string; count?: number; description: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 border border-white/10 bg-[#0D0D0D] px-4 py-3 text-sm text-white transition-colors transition-transform duration-150 hover:border-white/40 hover:bg-[#171717] hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8A3D]"
    >
      <span>
        <span className="block font-medium">
          {title}
          {Boolean(count) && <span className="ml-2 text-xs text-[#FF8A3D]">{count} pending</span>}
        </span>
        <span className="mt-0.5 block text-xs text-[#A1A1AA]">{description}</span>
      </span>
      <span aria-hidden="true" className="shrink-0 text-white/40">→</span>
    </Link>
  )
}
