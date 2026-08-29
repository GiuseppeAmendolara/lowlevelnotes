import SvgBadge from '@/components/SvgBadge'

export default function TransparencyPage() {
  return (
    <main className="overflow-hidden bg-[#171717]">
      <section className="border-b border-white/10 bg-[#0D0D0D]">
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-20 sm:pb-20 sm:pt-28">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Nothing hidden</p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">Transparency</h1>
          <p className="mt-4 max-w-lg leading-7 text-[#A1A1AA]">
            Everything below comes straight from the database this site runs on. No rounding up or fake marketing strategies.
          </p>
        </div>
      </section>

      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_at_top,black,transparent_85%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,138,61,0.14),transparent_27rem)]" />

        <div className="relative mx-auto max-w-3xl px-6 pb-24 pt-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="animate-fade-in-up motion-reduce:animate-none sm:col-span-2">
              <SvgBadge src="https://api.lowlevelnotes.com/status.svg" alt="0xLLN API status" unavailableLabel="Status unavailable" />
            </div>
            <div style={{ animationDelay: '60ms' }} className="animate-fade-in-up motion-reduce:animate-none sm:col-span-2">
              <SvgBadge src="https://api.lowlevelnotes.com/history.svg" alt="0xLLN API uptime history" unavailableLabel="History unavailable" />
            </div>
            <div style={{ animationDelay: '120ms' }} className="animate-fade-in-up motion-reduce:animate-none">
              <SvgBadge src="https://api.lowlevelnotes.com/stats.svg" alt="0xLLN library stats" unavailableLabel="Stats unavailable" />
            </div>
            <div style={{ animationDelay: '180ms' }} className="animate-fade-in-up motion-reduce:animate-none">
              <SvgBadge src="https://api.lowlevelnotes.com/courses.svg" alt="0xLLN course catalog stats" unavailableLabel="Course stats unavailable" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
