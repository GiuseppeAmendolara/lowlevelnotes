// The site's existing filled-orange primary button (see page.tsx's CTA),
// extended with a loading/disabled state — the first submit/loading
// state anywhere in the app, so this is where that convention gets set.

type Props = {
  loading: boolean
  disabled?: boolean
  children: React.ReactNode
}

export default function AuthSubmitButton({ loading, disabled, children }: Props) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="inline-flex w-full items-center justify-center gap-3 bg-[#FF7A33] px-5 py-3.5 text-sm font-semibold text-[#0D0D0D] transition-colors transition-transform duration-150 hover:bg-[#FF9459] active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A33] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? '…' : children}
    </button>
  )
}
