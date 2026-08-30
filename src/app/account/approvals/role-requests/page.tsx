'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/SessionProvider'
import RoleRequestsPanel from '@/components/admin/RoleRequestsPanel'
import { Skeleton } from '@/components/Skeleton'
import Eyebrow from '@/components/Eyebrow'

export default function RoleRequestsPage() {
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
      <div>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-9 w-56" />
      </div>
    )
  }

  return (
    <div>
      <Eyebrow>Staff</Eyebrow>
      <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-white">Role requests</h1>

      <div className="mt-8">
        <RoleRequestsPanel />
      </div>
    </div>
  )
}
