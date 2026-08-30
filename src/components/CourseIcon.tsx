import { getAssetSrc } from '@/lib/authClient'

// In-house glyph marks, keyed by course slug — monospace tokens rather
// than illustrated logos, since the whole site's type system is already
// JetBrains Mono. Keeps every course visually consistent and sidesteps
// trademark restrictions on the real C#/C++/PostgreSQL marks. A course
// with no entry here (and no instructor-uploaded iconUrl) falls back to
// the plain accent dot.
const COURSE_GLYPHS: Record<string, string> = {
  'c-programming': 'C#',
  'c-style-c': 'C++',
  'programming-foundations': '{}',
  postgresql: '=#',
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  lg: 'h-12 w-12 text-base',
} as const

export function CourseIcon({
  slug,
  iconUrl,
  size = 'sm',
}: {
  slug: string
  iconUrl?: string | null
  size?: keyof typeof SIZE_CLASSES
}) {
  const dims = SIZE_CLASSES[size]

  if (iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- cross-subdomain, session-cookie-gated asset; next/image can't proxy this
      <img src={getAssetSrc(iconUrl)} alt="" className={`${dims} shrink-0 border border-white/10 object-cover`} />
    )
  }

  const glyph = COURSE_GLYPHS[slug]
  if (glyph) {
    return (
      <span
        aria-hidden="true"
        className={`flex ${dims} shrink-0 items-center justify-center border border-white/10 bg-[#0B0B0D] font-semibold text-[#FF7A33]`}
      >
        {glyph}
      </span>
    )
  }

  return <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#FF7A33]" />
}
