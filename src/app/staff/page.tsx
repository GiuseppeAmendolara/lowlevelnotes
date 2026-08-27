'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthPageShell from '@/components/auth/AuthPageShell'
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
    if (user.role !== 'administrator') {
      router.replace('/')
    }
  }, [sessionLoading, user, router])

  if (sessionLoading || !user || user.role !== 'administrator') {
    return (
      <AuthPageShell eyebrow="Admin" heading="Admin" backHref="/account">
        <p className="text-sm text-[#A1A1AA]">Loading…</p>
      </AuthPageShell>
    )
  }

  return <AdminPanel />
}
