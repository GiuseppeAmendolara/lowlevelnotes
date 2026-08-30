// Label + input, reusing LibraryBrowser.tsx's exact input class string so
// this is the first form in the app, not the first visual language for one.

type Props = {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  required?: boolean
  placeholder?: string
}

export default function AuthTextField({ label, type = 'text', value, onChange, autoComplete, required, placeholder }: Props) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#90939A]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full border border-white/15 bg-[#17181B] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
      />
    </label>
  )
}
