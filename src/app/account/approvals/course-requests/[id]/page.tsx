'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
    return <p className="pt-1 text-sm text-[#90939A] animate-pulse motion-reduce:animate-none">Loading…</p>
  }

  return <CourseReviewPanel id={Number(id)} />
}
