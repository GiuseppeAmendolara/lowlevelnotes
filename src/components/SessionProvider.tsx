'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getSession, type AuthUser } from '@/lib/authClient'

type SessionContextValue = {
  user: AuthUser | null
  loading: boolean
  refresh: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

// The session cookie is HttpOnly and scoped to api.lowlevelnotes.com, so
// the Next.js server can never see it — auth state can only be known
// client-side, via this one shared fetch, rather than every page
// re-checking independently.
export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const result = await getSession()
    setUser(result.ok ? result.data : null)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <SessionContext.Provider value={{ user, loading, refresh }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
