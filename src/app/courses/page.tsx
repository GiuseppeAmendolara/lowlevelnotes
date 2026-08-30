'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/components/SessionProvider'
import { getCourses, unwrapResult } from '@/lib/authClient'
import CourseCatalogCard from '@/components/CourseCatalogCard'
import Eyebrow from '@/components/Eyebrow'
import { Skeleton } from '@/components/Skeleton'

// Client-gated and client-fetched, matching /library — the Worker now
// requires a session for the course catalog too, and the Next.js server
// can't see the session cookie (host-only on api.lowlevelnotes.com), so
// server-rendering this page would either need to skip the gate or
// render something it'd have to hide client-side anyway.
export default function CoursesPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  // Cached under the 'courses' key — navigating away and back (e.g. via
  // /account) reuses this instead of refetching, then quietly revalidates
  // once it's past QueryProvider's 60s staleTime.
  const { data: courses, error: coursesError } = useQuery({
    queryKey: ['courses'],
    queryFn: () => unwrapResult(getCourses()).then((d) => d.data),
    enabled: !!user,
  })
  const error = coursesError instanceof Error ? coursesError.message : null
  const [category, setCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    if (!courses) return []
    const counts = new Map<string, number>()
    for (const c of courses) {
      if (!c.category) continue
      counts.set(c.category, (counts.get(c.category) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [courses])

  const filtered = useMemo(() => {
    if (!courses) return null
    return category ? courses.filter((c) => c.category === category) : courses
  }, [courses, category])

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
          <Skeleton className="mt-4 h-10 w-56" />
          <Skeleton className="mt-4 h-4 w-72 max-w-full" />
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0B0B0D]">
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-20 sm:pt-28">
        <Eyebrow>Learning system</Eyebrow>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">Courses</h1>
        <p className="mt-4 max-w-lg leading-7 text-[#90939A]">
          Track your progress, participate in quizzes and read real code.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        {error && <p className="text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>}

        {categories.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={`border px-3 py-1.5 text-xs transition-colors ${
                category === null ? 'border-[#FF7A33] text-[#FF7A33]' : 'border-white/15 text-[#90939A] hover:border-white/40'
              }`}
            >
              All <span className="text-white/40">{courses?.length}</span>
            </button>
            {categories.map(([cat, count]) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`border px-3 py-1.5 text-xs transition-colors ${
                  category === cat ? 'border-[#FF7A33] text-[#FF7A33]' : 'border-white/15 text-[#90939A] hover:border-white/40'
                }`}
              >
                {cat} <span className="text-white/40">{count}</span>
              </button>
            ))}
          </div>
        )}

        {courses === undefined && !error && (
          <div className="grid grid-cols-1 gap-px border border-white/10 bg-transparent sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 bg-[#17181B]" />
            ))}
          </div>
        )}
        {courses && courses.length === 0 && (
          <p className="text-sm text-[#90939A]">No courses published yet.</p>
        )}
        {filtered && filtered.length > 0 && (
          /* Transparent, not the usual bg-white/10 hairline fill (see
             below), plus grid-cols-2 only once there are 2+ cards —
             with exactly one, the border wrapping a still-two-track
             grid visibly stuck out past the card into the empty second
             cell. At one item the border now hugs just that card. */
          <div className={`grid grid-cols-1 gap-px border border-white/10 bg-transparent ${filtered.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {filtered.map((course, i) => (
              <CourseCatalogCard key={course.id} course={course} index={i} />
            ))}
          </div>
        )}
        {filtered && filtered.length === 0 && courses && courses.length > 0 && (
          <p className="text-sm text-[#90939A]">No courses in this category.</p>
        )}
      </section>
    </main>
  )
}
