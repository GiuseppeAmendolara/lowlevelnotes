'use client'

import { useEffect, useState } from 'react'

// Scroll-spy for the year dividers on /changelog — an IntersectionObserver
// per year marker (same primitive src/lib/useReveal.ts already uses
// elsewhere on the site, just tracking "which one is current" instead of
// "has this one become visible yet"). Only ever reacts to entries
// crossing INTO the thin band near the top of the viewport, never out —
// the marker that most recently crossed it stays active until the next
// one does, which is what makes this read as "current section" rather
// than flickering between whatever's on/off screen.
export default function ChangelogJumpNav({ years }: { years: number[] }) {
  const [activeYear, setActiveYear] = useState<number | null>(years[0] ?? null)

  useEffect(() => {
    const elements = years
      .map((year) => document.getElementById(`y${year}`))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveYear(Number(entry.target.id.slice(1)))
        }
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 }
    )

    elements.forEach((el) => observer.observe(el))

    // The oldest year's marker can sit close enough to the bottom of the
    // page that the document runs out of room to scroll before it ever
    // reaches the observer's trigger band above — the classic
    // last-section-never-activates scrollspy gap. Once the page is
    // scrolled essentially to its end, force that last year active
    // directly rather than relying on the observer for it.
    const lastYear = years[years.length - 1]
    function handleScroll() {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (atBottom) setActiveYear(lastYear)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <nav aria-label="Jump to year" className="order-2 sm:sticky sm:top-24 sm:order-1 sm:self-start">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">Jump to</p>
      <div className="flex flex-row flex-wrap gap-x-4 gap-y-1 sm:flex-col sm:flex-nowrap">
        {years.map((year) => (
          <a
            key={year}
            href={`#y${year}`}
            className={`border-l-2 py-0.5 pl-2.5 text-xs transition-colors ${
              activeYear === year ? 'border-[#FF7A33] text-[#FF7A33]' : 'border-transparent text-white/40 hover:text-white'
            }`}
          >
            {year}
          </a>
        ))}
      </div>
    </nav>
  )
}
