'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import LibraryBrowser from '@/components/LibraryBrowser'
import { useSession } from '@/components/SessionProvider'
import { getLibrary, unwrapResult } from '@/lib/authClient'
import Eyebrow from '@/components/Eyebrow'
import { Skeleton, SkeletonRow } from '@/components/Skeleton'

// Client-gated and client-fetched, not server-rendered: the library is
// restricted to logged-in users, and the Worker now enforces that on the
// data itself (401 without a session) — fetching here, after confirming
// a session, means a logged-out visitor's browser never receives the
// data at all, not just a hidden-but-already-fetched page.
export default function LibraryPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  // Same key a staff resource-request approval invalidates on
  // approve/reject, so a newly-approved resource shows up here without
  // waiting out the default staleTime.
  const { data: library, error } = useQuery({
    queryKey: ['library'],
    queryFn: () => unwrapResult(getLibrary()),
    enabled: !!user,
  })

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login')
    }
  }, [sessionLoading, user, router])

  if (sessionLoading || !user) {
    return (
      <main className="min-h-screen bg-[#0B0B0D]">
        <section className="mx-auto max-w-6xl px-6 pb-10 pt-20 sm:pt-28">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-4 h-10 w-48" />
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0B0B0D]">
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-20 sm:pt-28">
        <Eyebrow>Curated resources</Eyebrow>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">Library</h1>
        <p className="mt-4 max-w-lg leading-7 text-[#90939A]">
          {library ? `${library.resources.length} links across the topics in the notes, credited to the people who actually wrote them.` : 'Loading the library…'}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        {error && <p className="text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error.message}</p>}
        {library ? (
          <LibraryBrowser resources={library.resources} people={library.people} />
        ) : (
          !error && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
              <Skeleton className="h-48" />
              <div className="border-l border-t border-white/10">
                <SkeletonRow count={5} />
              </div>
            </div>
          )
        )}
      </section>
    </main>
  )
}
