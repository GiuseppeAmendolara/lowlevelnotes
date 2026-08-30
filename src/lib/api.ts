const API_BASE = 'https://api.lowlevelnotes.com'

// 'tool' merged in from the now-dropped tools table — see
// worker/migrations/0011_merge_tools_into_resources.sql.
export type ResourceType = 'pdf' | 'website' | 'videos' | 'git' | 'tool'

export type Resource = {
  id: number
  title: string
  description: string
  path: string
  type: ResourceType
  category: string
  authorId: number | null
  views: number
}

export type Person = {
  id: number
  name: string
  role: string
  avatar: string
  profile: string
  external: boolean
}

export type ChangelogEntry = {
  version: string
  releaseDate: string
  title: string
  description: string
}

export type FeaturedCourse = {
  slug: string
  title: string
  description: string
  category: string
}

export type LibraryCategoryStat = {
  category: string
  count: number
}

export type SiteStatsSummary = {
  resources: number
  authors: number
  courses: number
  lessons: number
}

// Vercel's outbound connection to the Worker occasionally throws
// `TypeError: fetch failed` / `SocketError: other side closed` with zero
// bytes read — a stale-connection-reuse failure, not an application
// error. `apiFetch`'s cached calls mostly dodge it (a cache hit never
// opens a new connection at all), but an always-fresh, never-cached call
// like the view-increment below hits it on effectively every real
// request. One retry on a fresh connection clears it.
async function fetchWithRetry(url: string, init: RequestInit, attempts = 2): Promise<Response> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url, init)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

// No `next: { revalidate }` — this fetch's only caller (getChangelog,
// below) backs a `force-dynamic` page that already re-renders on every
// request, so a fetch-level cache on top buys nothing except staleness:
// a 60s revalidate window here left a real published entry invisible on
// the live page for almost a full day, since Vercel's Data Cache for a
// `next.revalidate` fetch doesn't reliably refresh itself just because
// the window elapsed — it needs an actual request to trigger
// revalidation, and even then can keep serving the stale value if that
// background refetch doesn't land. `cache: 'no-store'` matches what the
// route is already doing and removes the failure mode entirely.
async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await fetchWithRetry(`${API_BASE}${endpoint}`, {
    cache: 'no-store',
    headers: {
      'x-internal-key': process.env.INTERNAL_API_KEY!,
    },
  })
  if (!res.ok) throw new Error(`API ${endpoint} failed: ${res.status}`)
  return res.json()
}

export const getChangelog = () => apiFetch<ChangelogEntry[]>('/changelog')
export const getFeaturedCourses = () => apiFetch<FeaturedCourse[]>('/v1/courses/featured')
export const getLibraryCategoryStats = () => apiFetch<LibraryCategoryStat[]>('/v1/library/category-stats')
export const getSiteStatsSummary = () => apiFetch<SiteStatsSummary>('/v1/stats/summary')

export async function incrementResourceViews(id: number): Promise<void> {
  const res = await fetchWithRetry(`${API_BASE}/resource/${id}`, {
    method: 'POST',
    headers: {
      'x-internal-key': process.env.INTERNAL_API_KEY!,
    },
  })
  if (!res.ok) throw new Error(`API /resource/${id} failed: ${res.status}`)
}
