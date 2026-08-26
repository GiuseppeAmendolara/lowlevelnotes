import SvgBadge from '@/components/SvgBadge'

export default function TransparencyPage() {
  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-20 sm:pt-28">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Nothing hidden</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">Transparency</h1>
        <p className="mt-4 max-w-lg leading-7 text-[#A1A1AA]">Everything below comes straight from the same database this site runs on: API health, uptime history, and the real numbers behind the library. No rounding up, no separate marketing copy, the same badges linked from the GitHub profile.</p>

        <div className="mt-10 flex max-w-[440px] flex-col gap-3">
          <SvgBadge src="https://api.lowlevelnotes.com/status.svg" alt="0xLLN API status" unavailableLabel="Status unavailable" />
          <SvgBadge src="https://api.lowlevelnotes.com/history.svg" alt="0xLLN API uptime history" unavailableLabel="History unavailable" />
          <SvgBadge src="https://api.lowlevelnotes.com/stats.svg" alt="0xLLN library stats" unavailableLabel="Stats unavailable" />
        </div>
      </section>
    </main>
  )
}
