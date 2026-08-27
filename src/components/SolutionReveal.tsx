'use client'

import { useState } from 'react'

export default function SolutionReveal({ notes }: { notes: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-6 border border-white/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.035] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FF8A3D]"
      >
        {open ? 'Hide hint' : 'Reveal hint'}
        <span aria-hidden="true" className="text-white/40">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <p className="border-t border-white/10 px-5 py-4 text-sm leading-6 text-[#A1A1AA]">{notes}</p>
      )}
    </div>
  )
}
