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

async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    next: { revalidate: 60 },
    headers: {
      'x-internal-key': process.env.INTERNAL_API_KEY!,
    },
  })
  if (!res.ok) throw new Error(`API ${endpoint} failed: ${res.status}`)
  return res.json()
}

export const getResources = () => apiFetch<Resource[]>('/resources')
export const getPeople = () => apiFetch<Person[]>('/people')
export const getTools = () => apiFetch<Tool[]>('/tools')
export const getChangelog = () => apiFetch<ChangelogEntry[]>('/changelog')

export async function incrementResourceViews(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/resource/${id}`, {
    method: 'POST',
    headers: {
      'x-internal-key': process.env.INTERNAL_API_KEY!,
    },
  })
  if (!res.ok) throw new Error(`API /resource/${id} failed: ${res.status}`)
}
