'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LibraryBrowser from '@/components/LibraryBrowser'
import { useSession } from '@/components/SessionProvider'
import { getLibrary } from '@/lib/authClient'
import type { Resource, Person } from '@/lib/api'

// Client-gated and client-fetched, not server-rendered: the library is
// restricted to logged-in users, and the Worker now enforces that on the
// data itself (401 without a session) — fetching here, after confirming
// a session, means a logged-out visitor's browser never receives the
// data at all, not just a hidden-but-already-fetched page.
export default function LibraryPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  const [library, setLibrary] = useState<{ resources: Resource[]; people: Person[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login')
    }
  }, [sessionLoading, user, router])

  useEffect(() => {
    if (!user) return

    getLibrary().then((result) => {
      if (result.ok) {
        setLibrary(result.data)
      } else {
        setError(result.error)
      }
    })
  }, [user])

  if (sessionLoading || !user) {
    return (
      <main className="min-h-screen bg-[#171717]">
        <section className="mx-auto max-w-5xl px-6 pb-10 pt-20 sm:pt-28">
          <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-5xl px-6 pb-10 pt-20 sm:pt-28">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Curated resources</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">Library</h1>
        <p className="mt-4 max-w-lg leading-7 text-[#A1A1AA]">
          {library ? `${library.resources.length} links across the topics in the notes, credited to the people who actually wrote them.` : 'Loading the library…'}
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        {error && <p className="text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>}
        {library && <LibraryBrowser resources={library.resources} people={library.people} />}
      </section>
    </main>
  )
}
