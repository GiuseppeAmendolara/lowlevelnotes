'use client'

// Same filled-orange visual treatment and loading/disabled state as
// AuthSubmitButton (src/components/auth/AuthSubmitButton.tsx), but for
// onClick-driven actions outside a form — AuthSubmitButton is
// purpose-built for the single-form auth pages (type="submit", w-full).
// Used for course enrollment and lesson mark-complete.

type Props = {
  onClick: () => void
  loading: boolean
  disabled?: boolean
  children: React.ReactNode
}

export default function ActionButton({ onClick, loading, disabled, children }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="inline-flex items-center justify-center gap-2 bg-[#FF7A33] px-5 py-3 text-sm font-semibold text-[#0D0D0D] transition-colors transition-transform duration-150 hover:bg-[#FF9459] active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A33] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? '…' : children}
    </button>
  )
}
