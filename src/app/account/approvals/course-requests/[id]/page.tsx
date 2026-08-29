'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthPageShell from '@/components/auth/AuthPageShell'
import { useSession } from '@/components/SessionProvider'
import CourseReviewPanel from '@/components/admin/CourseReviewPanel'

export default function CourseReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

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
      <AuthPageShell eyebrow="Staff" heading="Course request" backHref="/account/approvals/course-requests" backLabel="Course requests">
        <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
      </AuthPageShell>
    )
  }

  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <CourseReviewPanel id={Number(id)} />
      </section>
    </main>
  )
}
