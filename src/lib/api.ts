const API_BASE = 'https://api.lowlevelnotes.com'

export type ResourceType = 'pdf' | 'website' | 'videos' | 'git'

export type Resource = {
  id: number
  title: string
  description: string
  path: string
  type: ResourceType
  category: string
  authorId: number
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

export type Tool = {
  id: number
  name: string
  path: string
  category: string
}

export type ChangelogEntry = {
  version: string
  releaseDate: string
  title: string
  description: string
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

async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await fetchWithRetry(`${API_BASE}${endpoint}`, {
    next: { revalidate: 60 },
    headers: {
      'x-internal-key': process.env.INTERNAL_API_KEY!,
    },
  })
  if (!res.ok) throw new Error(`API ${endpoint} failed: ${res.status}`)
  return res.json()
}

export const getChangelog = () => apiFetch<ChangelogEntry[]>('/changelog')

export async function incrementResourceViews(id: number): Promise<void> {
  const res = await fetchWithRetry(`${API_BASE}/resource/${id}`, {
    method: 'POST',
    headers: {
      'x-internal-key': process.env.INTERNAL_API_KEY!,
    },
  })
  if (!res.ok) throw new Error(`API /resource/${id} failed: ${res.status}`)
}
