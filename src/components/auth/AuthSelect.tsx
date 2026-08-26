// Same label treatment as AuthTextField, wrapping the select styling
// already established in LibraryBrowser.tsx's filter bar.

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  required?: boolean
}

export default function AuthSelect({ label, value, onChange, options, required }: Props) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#A1A1AA]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-2 w-full border border-white/15 bg-[#0D0D0D] px-4 py-2.5 text-sm text-white focus:border-white/40 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}
