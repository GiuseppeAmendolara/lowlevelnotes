'use client'

import AccountShell from '@/components/AccountShell'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>
}
