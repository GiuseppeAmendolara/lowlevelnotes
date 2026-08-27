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
const REFRESH_RETRIES = 2
const REFRESH_RETRY_DELAY_MS = 700

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // A 401 is the only response that actually means "not logged in" —
  // anything else (a transient rate limit, a 5xx, a network hiccup, a
  // malformed response) used to be treated identically, which meant any
  // brief hiccup on this one endpoint silently logged the user out even
  // though their real session was still fine. Retry non-401 failures a
  // couple times before giving up, and never clear an existing user on
  // a failure that isn't a confirmed 401.
  const refresh = useCallback(async () => {
    for (let attempt = 0; attempt <= REFRESH_RETRIES; attempt++) {
      const result = await getSession()

      if (result.ok) {
        setUser(result.data)
        setLoading(false)
        return
      }

      if (result.status === 401) {
        setUser(null)
        setLoading(false)
        return
      }

      if (attempt < REFRESH_RETRIES) {
        await delay(REFRESH_RETRY_DELAY_MS)
      }
    }

    // Exhausted retries on a non-401 failure — leave `user` as it was
    // rather than forcing a logout over a problem that had nothing to do
    // with whether the session is actually valid.
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
