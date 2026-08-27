'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/components/SessionProvider'
import { getCourses, type Course } from '@/lib/authClient'

// Client-gated and client-fetched, matching /library — the Worker now
// requires a session for the course catalog too, and the Next.js server
// can't see the session cookie (host-only on api.lowlevelnotes.com), so
// server-rendering this page would either need to skip the gate or
// render something it'd have to hide client-side anyway.
export default function CoursesPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  const [courses, setCourses] = useState<Course[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login')
    }
  }, [sessionLoading, user, router])

  useEffect(() => {
    if (!user) return

    getCourses().then((result) => {
      if (result.ok) {
        setCourses(result.data.data)
      } else {
        setError(result.error)
      }
    })
  }, [user])

  if (sessionLoading || !user) {
    return (
      <main className="min-h-screen bg-[#171717]">
        <section className="mx-auto max-w-5xl px-6 pb-10 pt-20 sm:pt-28">
          <p className="text-sm text-[#A1A1AA]">Loading…</p>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-5xl px-6 pb-10 pt-20 sm:pt-28">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Learning system</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">Courses</h1>
        <p className="mt-4 max-w-lg leading-7 text-[#A1A1AA]">
          Track your progress, participate in quizzes and read real code.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        {error && <p className="text-sm text-[#F85149]">{error}</p>}
        {courses && courses.length === 0 && (
          <p className="text-sm text-[#A1A1AA]">No courses published yet.</p>
        )}
        {courses && courses.length > 0 && (
          <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group flex flex-col justify-between gap-4 bg-[#171717] p-6 transition-colors hover:bg-white/[0.035] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FF8A3D]"
              >
                <div>
                  {course.category && (
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#FF8A3D]">{course.category}</p>
                  )}
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">{course.title}</h2>
                  {course.description && (
                    <p className="mt-2 text-sm leading-6 text-[#A1A1AA]">{course.description}</p>
                  )}
                </div>
                <span className="text-xs uppercase tracking-[0.12em] text-white/40 transition-colors group-hover:text-white">
                  View course →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
