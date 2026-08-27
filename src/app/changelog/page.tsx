import { getChangelog } from '@/lib/api'
import ChangelogEntryCard from '@/components/ChangelogEntryCard'

export const dynamic = 'force-dynamic'

export default async function ChangelogPage() {
  const entries = await getChangelog()

  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-4xl px-6 pb-10 pt-20 sm:pt-28">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Version history</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">Changelog</h1>
        <p className="mt-4 max-w-xl leading-7 text-[#A1A1AA]">Every release, in order—from the first notes to whatever&apos;s shipping today.</p>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="border-l border-t border-white/10">
          {entries.map((entry, i) => (
            <ChangelogEntryCard key={entry.version} entry={entry} index={i} isLatest={i === 0} />
          ))}
        </div>
      </section>
    </main>
  )
}
