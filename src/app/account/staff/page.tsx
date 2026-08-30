'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/SessionProvider'
import AdminPanel from '@/components/admin/AdminPanel'

export default function AdminPage() {
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

  return <AdminPanel />
}
