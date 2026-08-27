'use client'

import { useMemo, useState } from 'react'
import type { Resource, Person } from '@/lib/api'

const typeLabels: Record<Resource['type'], string> = {
  pdf: 'PDF',
  website: 'Website',
  videos: 'Videos',
  git: 'Git',
  tool: 'Tool',
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
  fetch(`/api/resource/${item.id}`, { method: 'POST' }).catch(() => {})
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

  const categories = useMemo(
    () => Array.from(new Set(availableForCategory.map((i) => i.category))).sort(),
    [availableForCategory]
  )
  const types = useMemo(
    () => Array.from(new Set(availableForType.map((i) => i.type))).sort(),
    [availableForType]
  )
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
    <div>
      <div className="flex flex-col gap-3 border-b border-white/10 pb-8 sm:flex-row sm:flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search the library..."
          className="min-w-0 flex-1 border border-white/15 bg-[#0D0D0D] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="border border-white/15 bg-[#0D0D0D] px-3 py-2.5 text-sm text-white focus:border-white/40 focus:outline-none"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="border border-white/15 bg-[#0D0D0D] px-3 py-2.5 text-sm text-white focus:border-white/40 focus:outline-none"
        >
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>{typeLabels[t]}</option>
          ))}
        </select>
        <select
          value={authorId}
          onChange={(e) => handleAuthorChange(e.target.value)}
          className="border border-white/15 bg-[#0D0D0D] px-3 py-2.5 text-sm text-white focus:border-white/40 focus:outline-none"
        >
          <option value="">All authors</option>
          {authors.map((person) => (
            <option key={person.id} value={person.id}>{person.name.trim()}</option>
          ))}
        </select>
      </div>

      <p className="mt-6 text-xs uppercase tracking-[0.14em] text-[#A1A1AA]">
        {filtered.length} of {items.length} entries
      </p>

      <div className="mt-4 border-l border-t border-white/10">
        {filtered.map((item) => {
          const author = item.authorId !== null ? peopleById.get(item.authorId) : undefined
          return (
            <article key={item.id} className="border-b border-r border-white/10 p-6 transition-colors hover:bg-white/[0.035]">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="text-[#FF8A3D]">{item.category}</span>
                <span className="text-white/20">·</span>
                <span className="uppercase tracking-[0.1em] text-[#A1A1AA]">{typeLabels[item.type]}</span>
              </div>

              <a
                href={resolveHref(item.path)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackView(item)}
                className="mt-3 inline-block text-lg font-semibold text-white transition-colors hover:text-[#FF8A3D]"
              >
                {item.title.trim()}
              </a>

              {item.description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A1A1AA]">{item.description.trim()}</p>
              )}

              {(author || item.views !== null) && (
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/40">
                  {author && (
                    author.profile ? (
                      <a
                        href={author.profile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                      >
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
        })}

        {filtered.length === 0 && (
          <div className="border-b border-r border-white/10 p-6 text-sm text-[#A1A1AA]">
            No entries match those filters.
          </div>
        )}
      </div>
    </div>
  )
}
