'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/SessionProvider'
import CourseRequestsPanel from '@/components/admin/CourseRequestsPanel'
import Eyebrow from '@/components/Eyebrow'

export default function CourseRequestsPage() {
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

  return (
    <div>
      <Eyebrow>Staff</Eyebrow>
      <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-white">Course requests</h1>

      <div className="mt-8">
        <CourseRequestsPanel />
      </div>
    </div>
  )
}
