'use client'

import { useEffect, useRef, useState } from 'react'

// Scroll-triggered entrance: fade + small rise once the element crosses
// into the viewport, then stays revealed (no re-hide on scroll back out —
// that would just be distracting on a re-visit). Applied directly to
// existing elements, never a wrapper <div> — several grids on this site
// rely on a shared-border technique (border-l/border-t on the parent,
// border-b/border-r per item) that an extra wrapper would double up or
// break. See the "Motion" section of AGENTS.md's design-system contract.
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

// Class string for the element `useReveal` is attached to. Stagger via an
// inline `style={{ transitionDelay: ... }}` at the call site (Tailwind
// can't express a dynamic per-index delay through class names) — cap the
// index passed in at 6 so a long grid doesn't feel sluggish to reveal.
export const revealClass =
  'transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0'

export function revealState(visible: boolean) {
  return visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
}
