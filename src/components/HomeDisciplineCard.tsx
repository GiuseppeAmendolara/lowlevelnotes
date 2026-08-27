'use client'

import Link from 'next/link'
import { useReveal, revealClass, revealState } from '@/lib/useReveal'

type Discipline = {
  id: string
  title: string
  description: string
  written: boolean
  stat: string
}

// See HomeCourseCard.tsx — same reasoning for applying useReveal directly
// to the <Link> instead of a wrapper.
export default function HomeDisciplineCard({ discipline, index }: { discipline: Discipline; index: number }) {
  const { ref, visible } = useReveal<HTMLAnchorElement>()

  return (
    <Link
      ref={ref}
      href="/library"
      style={{ transitionDelay: `${Math.min(index, 6) * 40}ms` }}
      className={`block min-h-56 border-b border-r border-white/10 bg-[#0D0D0D] p-6 hover:bg-[#151515] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 sm:p-8 ${revealClass} ${revealState(visible)}`}
    >
      <span className="text-xs text-[#FF8A3D]">[{discipline.id}]</span>
      <h3 className="mt-10 text-2xl font-semibold tracking-[-0.04em] text-white">{discipline.title}</h3>
      <p className="mt-3 max-w-sm text-sm leading-6 text-[#A1A1AA]">{discipline.description}</p>
      <div className="mt-7 flex items-center gap-2 text-sm">
        <span className={`h-2 w-2 ${discipline.written ? 'bg-[#3FB950]' : 'bg-white/20'}`} aria-hidden="true" />
        <span className={discipline.written ? 'text-white/70' : 'text-white/40'}>{discipline.stat}</span>
      </div>
    </Link>
  )
}
