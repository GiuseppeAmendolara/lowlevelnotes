// Inline status message for form results — adapted from SvgBadge.tsx's
// fallback-block shape, the only existing error-state precedent in the
// app. tone defaults to error; 'success' swaps the marker/text color for
// confirmations (e.g. "check your email").

type Props = {
  message: string
  tone?: 'error' | 'success'
}

export default function AuthMessage({ message, tone = 'error' }: Props) {
  const textColor = tone === 'error' ? 'text-[#F85149]' : 'text-[#3FB950]'
  const dotColor = tone === 'error' ? 'bg-[#F85149]' : 'bg-[#3FB950]'

  return (
    <div className={`mt-4 flex items-center gap-2 border border-white/10 bg-[#0D0D0D] px-4 py-3 text-xs ${textColor}`}>
      <span className={`h-2 w-2 shrink-0 ${dotColor}`} aria-hidden="true" />
      {message}
    </div>
  )
}
