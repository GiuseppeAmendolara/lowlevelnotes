// Reproduces the eyebrow-label / h1 / subtext header pattern already used
// identically (but never extracted into a component) on /changelog,
// /transparency, and /library — plus a narrower centered content slot,
// since these pages hold a single form rather than a list.

import Link from 'next/link'

type Props = {
  eyebrow: string
  heading: string
  subtext?: string
  backHref?: string
  children: React.ReactNode
}

export default function AuthPageShell({ eyebrow, heading, subtext, backHref, children }: Props) {
  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-sm px-6 pb-24 pt-20 sm:pt-28">
        {backHref && (
          <Link href={backHref} className="mb-4 inline-block text-xs uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white">
            ← Account
          </Link>
        )}
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white">{heading}</h1>
        {subtext && <p className="mt-4 leading-7 text-[#A1A1AA]">{subtext}</p>}

        <div className="mt-10">{children}</div>
      </section>
    </main>
  )
}
