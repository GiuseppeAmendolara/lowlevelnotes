'use client'

import { useMemo, useState, type ComponentType, type CSSProperties } from 'react'
import type { Resource, Person } from '@/lib/api'
import { useReveal, revealClass, revealState } from '@/lib/useReveal'
import Eyebrow from '@/components/Eyebrow'
import { FileIcon, GlobeIcon, PlayIcon, GitBranchIcon, ToolsIcon } from '@/components/icons'
import { openResource } from '@/lib/authClient'

// One in-house glyph per resource type, replacing a plain color swatch —
// same treatment as the GitHub/Discord marks in the footer.
const typeIcons: Record<Resource['type'], ComponentType<{ className?: string; style?: CSSProperties }>> = {
  pdf: FileIcon,
  website: GlobeIcon,
  videos: PlayIcon,
  git: GitBranchIcon,
  tool: ToolsIcon,
}

const typeLabels: Record<Resource['type'], string> = {
  pdf: 'PDF',
  website: 'Website',
  videos: 'Videos',
  git: 'Git',
  tool: 'Tool',
}

// A distinct color per resource type — lets a scan of the list sort by
// type at a glance instead of reading five identical uppercase labels.
// Deliberately not cyan for anything (see Eyebrow.tsx): pdf reaches for
// the darker accent-deep cut instead of an unrelated hue.
const typeColors: Record<Resource['type'], string> = {
  pdf: '#C95E1A',
  website: '#FF7A33',
  git: '#3FB950',
  tool: '#D29922',
  videos: '#B993FF',
}

// Normalized item shape the filters/list work over — a thin pass
// through Resource now that tools were merged in as type='tool'
// (worker/migrations/0011), rather than a merge of two different DB
// shapes.
type Item = {
  id: string
  title: string
  description: string
  path: string
  type: Resource['type']
  category: string
  authorId: number | null
  views: number | null
}

// Local files (D1 paths like "./assets/pdfs/cpp.pdf") used to resolve to
// a Next.js /public/ path — fully public with no possible auth check.
// They now live in R2 behind a gated Worker endpoint instead, so a local
// path resolves there rather than to this site's own /assets/*.
function resolveHref(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  return `https://api.lowlevelnotes.com/v1/library/assets/${path.replace(/^\.\/assets\//, '')}`
}

function trackView(item: Item) {
  // Two separate signals: the anonymous public view counter (works for a
  // logged-out click too, via the internal-key-gated Next.js route), and
  // this user's own non-repeatable leaderboard XP (session-cookie auth,
  // straight to the Worker, silently a no-op if this resource was
  // already opened before or the visitor isn't signed in).
  fetch(`/api/resource/${item.id}`, { method: 'POST' }).catch(() => {})
  openResource(Number(item.id)).catch(() => {})
}

function matchesQuery(item: Item, query: string) {
  if (!query) return true
  const title = item.title.trim().toLowerCase()
  const description = item.description.trim().toLowerCase()
  return title.includes(query) || description.includes(query)
}

type Props = {
  resources: Resource[]
  people: Person[]
}

export default function LibraryBrowser({ resources, people }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState('')
  const [authorId, setAuthorId] = useState('')

  const query = search.trim().toLowerCase()

  const items = useMemo<Item[]>(
    () =>
      resources.map((r) => ({
        id: String(r.id),
        title: r.title,
        description: r.description ?? '',
        path: r.path,
        type: r.type,
        category: r.category,
        authorId: r.authorId,
        views: r.views,
      })),
    [resources]
  )

  const peopleById = useMemo(() => {
    const map = new Map<number, Person>()
    for (const person of people) map.set(person.id, person)
    return map
  }, [people])

  // Each dropdown's options are computed from items matching every OTHER
  // active filter (but not itself) — a "faceted search" pattern, so you can
  // never select a combination that silently returns zero results.
  const availableForCategory = useMemo(
    () => items.filter((i) => matchesQuery(i, query) && (!type || i.type === type) && (!authorId || String(i.authorId) === authorId)),
    [items, query, type, authorId]
  )
  const availableForType = useMemo(
    () => items.filter((i) => matchesQuery(i, query) && (!category || i.category === category) && (!authorId || String(i.authorId) === authorId)),
    [items, query, category, authorId]
  )
  const availableForAuthor = useMemo(
    () => items.filter((i) => matchesQuery(i, query) && (!category || i.category === category) && (!type || i.type === type)),
    [items, query, category, type]
  )

  // Counts alongside each facet value — not just which values are still
  // reachable, but how large each one is, so the rail shows real weight
  // instead of an unordered, unscoped list of names.
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of availableForCategory) counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [availableForCategory])
  const typeCounts = useMemo(() => {
    const counts = new Map<Resource['type'], number>()
    for (const item of availableForType) counts.set(item.type, (counts.get(item.type) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [availableForType])
  const authors = useMemo(() => {
    const ids = Array.from(new Set(availableForAuthor.map((i) => i.authorId).filter((id): id is number => id !== null)))
    return ids
      .map((id) => peopleById.get(id))
      .filter((p): p is Person => Boolean(p))
      .sort((a, b) => a.name.trim().localeCompare(b.name.trim()))
  }, [availableForAuthor, peopleById])

  // When one filter changes, clear any other filter it makes unreachable —
  // done here, directly in response to the change, rather than reactively
  // in an effect (which would cause an extra cascading render).
  function handleSearchChange(value: string) {
    setSearch(value)
    const q = value.trim().toLowerCase()
    const reachable = items.filter((i) => matchesQuery(i, q))
    if (category && !reachable.some((i) => i.category === category)) setCategory('')
    if (type && !reachable.some((i) => i.type === type)) setType('')
    if (authorId && !reachable.some((i) => String(i.authorId) === authorId)) setAuthorId('')
  }

  function handleCategoryChange(value: string) {
    setCategory(value)
    const reachable = items.filter((i) => matchesQuery(i, query) && (!value || i.category === value))
    if (type && !reachable.some((i) => i.type === type)) setType('')
    if (authorId && !reachable.some((i) => String(i.authorId) === authorId)) setAuthorId('')
  }

  function handleTypeChange(value: string) {
    setType(value)
    const reachable = items.filter((i) => matchesQuery(i, query) && (!value || i.type === value))
    if (category && !reachable.some((i) => i.category === category)) setCategory('')
    if (authorId && !reachable.some((i) => String(i.authorId) === authorId)) setAuthorId('')
  }

  function handleAuthorChange(value: string) {
    setAuthorId(value)
    const reachable = items.filter((i) => matchesQuery(i, query) && (!value || String(i.authorId) === value))
    if (category && !reachable.some((i) => i.category === category)) setCategory('')
    if (type && !reachable.some((i) => i.type === type)) setType('')
  }

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          matchesQuery(item, query) &&
          (!category || item.category === category) &&
          (!type || item.type === type) &&
          (!authorId || String(item.authorId) === authorId)
      ),
    [items, query, category, type, authorId]
  )

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
      <aside className="md:sticky md:top-24 md:self-start">
        <div className="border border-white/10 bg-[#17181B]">
          <Eyebrow className="border-b border-white/10 px-4 py-3">Category</Eyebrow>
          <FacetRow label="All categories" count={items.length} active={category === ''} onClick={() => handleCategoryChange('')} />
          {categoryCounts.map(([c, count]) => (
            <FacetRow key={c} label={c} count={count} active={category === c} onClick={() => handleCategoryChange(c)} />
          ))}
        </div>

        <div className="mt-6 border border-white/10 bg-[#17181B]">
          <Eyebrow className="border-b border-white/10 px-4 py-3">Type</Eyebrow>
          <FacetRow label="All types" count={items.length} active={type === ''} onClick={() => handleTypeChange('')} />
          {typeCounts.map(([t, count]) => (
            <FacetRow key={t} label={typeLabels[t]} icon={typeIcons[t]} color={typeColors[t]} count={count} active={type === t} onClick={() => handleTypeChange(t)} />
          ))}
        </div>

        {authors.length > 0 && (
          <div className="mt-6">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF7A33]">Author</span>
              <select
                value={authorId}
                onChange={(e) => handleAuthorChange(e.target.value)}
                className="mt-2 w-full border border-white/15 bg-[#17181B] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
              >
                <option value="">All authors</option>
                {authors.map((person) => (
                  <option key={person.id} value={person.id}>{person.name.trim()}</option>
                ))}
              </select>
            </label>
          </div>
        )}
      </aside>

      <div className="min-w-0">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search the library..."
          className="w-full border border-white/15 bg-[#17181B] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
        />

        <p className="mt-6 text-xs uppercase tracking-[0.14em] text-[#90939A]">
          {filtered.length} of {items.length} entries
        </p>

        <div className="mt-4 border-l border-t border-white/10">
          {filtered.map((item, i) => (
            <LibraryItemRow
              key={item.id}
              item={item}
              author={item.authorId !== null ? peopleById.get(item.authorId) : undefined}
              index={i}
            />
          ))}

          {filtered.length === 0 && (
            <div className="border-b border-r border-white/10 bg-[#17181B] p-6 text-sm text-[#90939A]">
              No entries match those filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// A single facet row — replaces a <select><option> pair with something
// that shows both current state and relative size at a glance, the way a
// dropdown never can without opening it.
function FacetRow({
  label,
  count,
  active,
  onClick,
  color,
  icon: Icon,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  color?: string
  icon?: ComponentType<{ className?: string; style?: CSSProperties }>
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 border-l-2 px-4 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FF7A33] ${
        active ? 'border-[#FF7A33] bg-white/5 text-white' : 'border-transparent text-[#90939A] hover:text-white'
      }`}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" style={color ? { color } : undefined} />}
      {/* Wraps instead of truncating — a category name getting cut to
          "Malware & Offensi…" is worse than the row just growing a
          second line. break-words is the fallback for a single word
          wider than the 220px sidebar column, not the common case. */}
      <span className="min-w-0 flex-1 break-words">{label}</span>
      <span className="shrink-0 text-xs text-white/40">{count}</span>
    </button>
  )
}

// useReveal is applied directly to the <article> — this list uses the
// same shared-border grid technique as the homepage cards (border-l/
// border-t on the parent, border-b/border-r per row), so a wrapper here
// would double up borders. Dense list, so no hover-lift — stays
// color-only, matching every other row-style list on the site.
function LibraryItemRow({ item, author, index }: { item: Item; author: Person | undefined; index: number }) {
  const { ref, visible } = useReveal<HTMLElement>()

  return (
    <article
      ref={ref}
      style={{ transitionDelay: `${Math.min(index, 6) * 40}ms` }}
      className={`border-b border-r border-white/10 bg-[#17181B] p-6 hover:bg-[#151515] ${revealClass} ${revealState(visible)}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#FF7A33]">{item.category}</span>
        <span className="text-white/20">·</span>
        <span
          className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]"
          style={{ color: typeColors[item.type], background: `${typeColors[item.type]}1a` }}
        >
          {typeLabels[item.type]}
        </span>
      </div>

      <a
        href={resolveHref(item.path)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackView(item)}
        className="mt-3 inline-block text-lg font-semibold text-white transition-colors hover:text-[#FF7A33]"
      >
        {item.title.trim()}
      </a>

      {item.description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#90939A]">{item.description.trim()}</p>
      )}

      {(author || item.views !== null) && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/40">
          {author && (
            author.profile ? (
              <a href={author.profile} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {author.name.trim()}
              </a>
            ) : (
              <span>{author.name.trim()}</span>
            )
          )}
          {author && item.views !== null && <span>&middot;</span>}
          {item.views !== null && <span>{item.views} views</span>}
        </div>
      )}
    </article>
  )
}
