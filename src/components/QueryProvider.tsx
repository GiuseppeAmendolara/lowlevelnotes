'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// One QueryClient per browser session, created lazily so it survives
// re-renders but never leaks across users on the server (this app has no
// server-rendered data fetching through this client, but useState's lazy
// initializer is the standard-safe pattern regardless).
//
// staleTime is 60s instead of the default 0 — most of what this site
// fetches (course catalogs, lesson lists, profiles) doesn't change
// second-to-second, so this cuts down on refetch-on-every-remount chatter
// while still refreshing automatically once a query is a minute old.
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
