'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Skeleton } from '@/components/Skeleton'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/components/SessionProvider'
import { getStaffPendingCounts, unwrapResult } from '@/lib/authClient'
import Eyebrow from '@/components/Eyebrow'

export default function ApprovalPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()
  // Same key as AccountShell's sidebar badge — shares that cache instead
  // of firing a second, redundant request for the same counts.
  const { data: counts } = useQuery({
    queryKey: ['staffPendingCounts'],
    queryFn: () => unwrapResult(getStaffPendingCounts()),
    enabled: user?.role === 'staff',
  })

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

  if (sessionLoading || !user || user.role !== 'staff') {
    return (
      <div>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-9 w-56" />
      </div>
    )
  }

  return (
    <div className="max-w-md">
      <Eyebrow>Staff</Eyebrow>
      <h1 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-white">Approvals</h1>
      <p className="mt-3 text-sm text-[#90939A]">Review requests before they take effect.</p>

      <div className="mt-6 flex flex-col gap-2">
        <ApprovalLinkCard href="/account/approvals/role-requests" title="Role requests" count={counts?.roleRequests} description="Student requests to become a contributor or instructor." />
        <ApprovalLinkCard href="/account/approvals/resource-requests" title="Resource requests" count={counts?.resourceRequests} description="Links and files submitted for the library." />
        <ApprovalLinkCard href="/account/approvals/course-requests" title="Course requests" count={counts?.courseRequests} description="Open a course to review its full content before publishing, or remove one." />
      </div>
    </div>
  )
}

function ApprovalLinkCard({ href, title, count, description }: { href: string; title: string; count?: number; description: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 border border-white/10 bg-[#17181B] px-4 py-3 text-sm text-white transition-colors transition-transform duration-150 hover:border-white/40 hover:bg-[#0B0B0D] hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A33]"
    >
      <span>
        <span className="block font-medium">
          {title}
          {Boolean(count) && <span className="ml-2 text-xs text-[#FF7A33]">{count} pending</span>}
        </span>
        <span className="mt-0.5 block text-xs text-[#90939A]">{description}</span>
      </span>
      <span aria-hidden="true" className="shrink-0 text-white/40">→</span>
    </Link>
  )
}
