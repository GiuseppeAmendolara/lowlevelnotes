import Eyebrow from '@/components/Eyebrow'

export const inputClass = "border border-white/15 bg-[#17181B] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
// Same as inputClass, but for controls sitting on a bg-[#17181B] row
// (e.g. the per-user role select) rather than the page background —
// lighter-on-darker, same relationship CodeBlock uses against its
// darker section, so the control doesn't blend into its own row.
export const rowInputClass = "border border-white/15 bg-[#0B0B0D] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
export const buttonClass = "border border-[#FF7A33]/50 px-3 py-1.5 text-xs font-medium text-[#FF7A33] transition-colors transition-transform duration-150 hover:border-[#FF7A33] hover:bg-[#FF7A33]/10 active:scale-[0.98] motion-reduce:transition-none disabled:opacity-50 disabled:active:scale-100"
export const blockButtonClass = "border border-[#FF7A33]/50 px-5 py-3.5 text-xs font-medium text-[#FF7A33] transition-colors transition-transform duration-150 hover:border-[#FF7A33] hover:bg-[#FF7A33]/10 active:scale-[0.98] motion-reduce:transition-none disabled:opacity-50 disabled:active:scale-100"

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return <Eyebrow as="h2">{children}</Eyebrow>
}

// Generic status-tab filter — reused for both the pending/approved/rejected
// requests panels and the pending/published/draft course-requests panel,
// which don't share a status union, hence the type parameter instead of a
// hardcoded RequestStatus.
export function StatusFilter<S extends string>({ status, options, onChange }: { status: S; options: readonly S[]; onChange: (s: S) => void }) {
  return (
    <div className="mt-4 flex gap-2">
      {options.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors ${
            status === s ? 'border-[#FF7A33] text-[#FF7A33]' : 'border-white/15 text-[#90939A] hover:border-white/40'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}
