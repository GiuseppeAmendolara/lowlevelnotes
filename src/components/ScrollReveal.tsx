'use client'

import { useReveal, revealClass, revealState } from '@/lib/useReveal'

type Props = {
  children: React.ReactNode
  index?: number
  className?: string
}

// Generic scroll-triggered fade+rise wrapper for standalone blocks that
// aren't part of a shared-border grid (see useReveal.ts) — those grids
// apply the hook directly to each existing element instead, since an
// extra wrapper here would double up their borders.
export default function ScrollReveal({ children, index = 0, className = '' }: Props) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${Math.min(index, 6) * 40}ms` }}
      className={`${revealClass} ${revealState(visible)} ${className}`}
    >
      {children}
    </div>
  )
}
