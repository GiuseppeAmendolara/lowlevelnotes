import { getChangelog } from '@/lib/api'

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
            <article key={entry.version} className="border-b border-r border-white/10 bg-[#0D0D0D] p-6 transition-colors hover:bg-[#151515] sm:p-8">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {i === 0 && (
                  <span className="flex items-center gap-1.5 text-[#3FB950]">
                    <span className="h-1.5 w-1.5 bg-[#3FB950]" aria-hidden="true" />
                    Latest
                  </span>
                )}
                <span className="text-[#FF8A3D]">v{entry.version.trim()}</span>
                <span className="text-white/20">·</span>
                <time className="text-white/40">{entry.releaseDate}</time>
              </div>
              <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">{entry.title.trim()}</h2>
              <p className="mt-2 max-w-2xl leading-6 text-[#A1A1AA]">{entry.description.trim()}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
