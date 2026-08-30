import { getAssetSrc } from '@/lib/authClient'

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  lg: 'h-12 w-12 text-base',
} as const

// Priority: an uploaded icon image, then a course's own iconGlyph (a short,
// author-chosen token like "C#" or "/24" — set through the instructor
// course builder, stored in courses.icon_glyph, not hardcoded here), then
// a plain first-letter badge derived from the title. Nothing in this
// component is tied to a specific course slug, so a brand-new course
// looks finished immediately, with no frontend change required.
export function CourseIcon({
  title,
  iconUrl,
  iconGlyph,
  size = 'sm',
}: {
  title: string
  iconUrl?: string | null
  iconGlyph?: string | null
  size?: keyof typeof SIZE_CLASSES
}) {
  const dims = SIZE_CLASSES[size]

  if (iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- cross-subdomain, session-cookie-gated asset; next/image can't proxy this
      <img src={getAssetSrc(iconUrl)} alt="" className={`${dims} shrink-0 border border-white/10 object-cover`} />
    )
  }

  const badgeClass = `flex ${dims} shrink-0 items-center justify-center border border-white/10 bg-[#0B0B0D] font-semibold text-[#FF7A33]`

  if (iconGlyph) {
    return (
      <span aria-hidden="true" className={badgeClass}>
        {iconGlyph}
      </span>
    )
  }

  return (
    <span aria-hidden="true" className={badgeClass}>
      {title.trim().slice(0, 1).toUpperCase()}
    </span>
  )
}
