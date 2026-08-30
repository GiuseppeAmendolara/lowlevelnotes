'use client'

import { useEffect, useState } from 'react'
import HomeCourseCard from '@/components/HomeCourseCard'
import HomeDisciplineCard from '@/components/HomeDisciplineCard'
import Eyebrow from '@/components/Eyebrow'
import type { FeaturedCourse } from '@/lib/api'

type Discipline = {
  id: string
  title: string
  description: string
  written: boolean
  stat: string
}

type Props = {
  courses: FeaturedCourse[]
  disciplines: Discipline[]
}

// Courses and Library used to be two separate full-height sections
// competing for the same scroll — one tabbed section makes the
// relationship (two ways into the same knowledge) clear and roughly
// halves the home page's length. Reads the URL hash on mount so the
// hero's "Explore courses"/"Browse the library" links still land on the
// right tab, not just the right scroll position — <a href="#library">
// has nothing else to scroll to now that the sections are merged, so a
// zero-height anchor next to the section itself keeps that link working.
export default function HomeExplore({ courses, disciplines }: Props) {
  const [tab, setTab] = useState<'courses' | 'library'>('courses')

  useEffect(() => {
    // Reading the URL hash is exactly the "synchronize with an external
    // system on mount" case useEffect exists for — window isn't
    // available during SSR, so this can't move into a lazy useState
    // initializer without a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.location.hash === '#library') setTab('library')
  }, [])

  return (
    <section id="courses" className="scroll-mt-20 border-y border-white/10 bg-[#17181B]">
      <span id="library" className="sr-only" aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Eyebrow>Explore</Eyebrow>

        <div className="mt-4 flex gap-0.5 border-b border-white/10" role="tablist" aria-label="Explore">
          {(['courses', 'library'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A33] ${
                tab === t ? 'border-[#FF7A33] text-white' : 'border-transparent text-[#90939A] hover:text-white'
              }`}
            >
              {t === 'courses' ? 'Courses' : 'Library'}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'courses' ? (
            courses.length === 0 ? (
              <p className="mt-10 text-sm text-[#90939A]">No courses published yet.</p>
            ) : (
              <div className="grid border-l border-t border-white/10 sm:grid-cols-3">
                {courses.map((course, i) => (
                  <HomeCourseCard key={course.slug} course={course} index={i} />
                ))}
              </div>
            )
          ) : disciplines.length === 0 ? (
            <p className="mt-10 text-sm text-[#90939A]">No resources catalogued yet.</p>
          ) : (
            <div className="grid border-l border-t border-white/10 sm:grid-cols-2">
              {disciplines.map((discipline, i) => (
                <HomeDisciplineCard key={discipline.id} discipline={discipline} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
