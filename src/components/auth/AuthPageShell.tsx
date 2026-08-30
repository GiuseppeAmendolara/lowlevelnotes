// Reproduces the eyebrow-label / h1 / subtext header pattern already used
// identically (but never extracted into a component) on /changelog and
// /library — plus a narrower centered content slot, since these pages
// hold a single form rather than a list.

import Link from 'next/link'
import Eyebrow from '@/components/Eyebrow'

type Props = {
  eyebrow: string
  heading: string
  subtext?: string
  backHref?: string
  backLabel?: string
  // Defaults to the original single-field-form width; the login/register/
  // password-recovery pages pass a wider value since their forms (email +
  // password, sometimes two password fields) felt cramped at max-w-sm —
  // every other AuthPageShell caller (account settings, approvals, staff)
  // keeps the default, unaffected.
  maxWidth?: string
  children: React.ReactNode
}

export default function AuthPageShell({ eyebrow, heading, subtext, backHref, backLabel = 'Account', maxWidth = 'max-w-sm', children }: Props) {
  return (
    <main className="min-h-screen bg-[#0B0B0D]">
      <section className={`mx-auto ${maxWidth} px-6 pb-24 pt-20 sm:pt-28`}>
        {backHref && (
          <Link href={backHref} className="mb-4 inline-block text-xs uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white">
            ← {backLabel}
          </Link>
        )}
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white">{heading}</h1>
        {subtext && <p className="mt-4 leading-7 text-[#90939A]">{subtext}</p>}

        <div className="mt-10">{children}</div>
      </section>
    </main>
  )
}
