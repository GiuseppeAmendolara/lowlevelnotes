'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthPageShell from '@/components/auth/AuthPageShell'
import { useSession } from '@/components/SessionProvider'

export default function ApprovalPage() {
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
      <AuthPageShell eyebrow="Admin" heading="Approvals" backHref="/staff" backLabel="Staff">
        <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell eyebrow="Admin" heading="Approvals" backHref="/staff" backLabel="Staff">
      <p className="text-sm text-[#A1A1AA]">Review requests before they take effect.</p>

      <div className="mt-6 flex flex-col gap-2">
        <ApprovalLinkCard href="/approval/role-requests" title="Role requests" description="Student requests to become a contributor or instructor." />
        <ApprovalLinkCard href="/approval/resource-requests" title="Resource requests" description="Links and files submitted for the library." />
        <ApprovalLinkCard href="/approval/course-requests" title="Course requests" description="Open a course to review its full content before publishing, or remove one." />
      </div>
    </AuthPageShell>
  )
}

function ApprovalLinkCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 border border-white/10 bg-[#0D0D0D] px-4 py-3 text-sm text-white transition-colors transition-transform duration-150 hover:border-white/40 hover:bg-[#171717] hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8A3D]"
    >
      <span>
        <span className="block font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-[#A1A1AA]">{description}</span>
      </span>
      <span aria-hidden="true" className="shrink-0 text-white/40">→</span>
    </Link>
  )
}
