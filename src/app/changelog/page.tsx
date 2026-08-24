import { getChangelog } from '@/lib/api'

export default async function ChangelogPage() {
  const entries = await getChangelog()

  return (
    <main className="min-h-screen bg-black">
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-10">
        <h1 className="font-mono text-4xl font-bold text-white tracking-tight">
          changelog
        </h1>

        <p className="font-mono text-white/50 mt-2 text-sm">
          Updates and changes to LowLevelNotes.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="space-y-8">
          {entries.map((entry) => (
            <article
              key={entry.version}
              className="border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-xs text-white/40 border border-white/10 px-2 py-1">
                  {entry.version}
                </span>

                <time className="font-mono text-xs text-white/40">
                  {entry.releaseDate}
                </time>
              </div>

              <h2 className="font-mono font-semibold text-lg text-white">
                {entry.title}
              </h2>

              <p className="font-mono text-sm text-white/50 mt-2 leading-relaxed">
                {entry.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}