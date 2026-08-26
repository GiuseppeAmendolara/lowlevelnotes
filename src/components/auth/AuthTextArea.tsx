// Same label/input treatment as AuthTextField, for the one case that
// needs multiple lines (role-request messages, resource descriptions).

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  rows?: number
}

export default function AuthTextArea({ label, value, onChange, required, rows = 4 }: Props) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#A1A1AA]">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        rows={rows}
        className="mt-2 w-full resize-y border border-white/15 bg-[#0D0D0D] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
      />
    </label>
  )
}
