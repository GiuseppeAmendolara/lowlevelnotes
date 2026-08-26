'use client'

// Client-safe wrappers for everything that runs on the session cookie —
// /v1/auth/* plus the now-gated library data — deliberately separate
// from src/lib/api.ts (server-only, uses the INTERNAL_API_KEY secret).
// These calls run in the browser and rely on the session cookie instead,
// which is HttpOnly and host-only on api.lowlevelnotes.com — the browser
// must therefore talk to that domain directly (credentials: 'include'),
// not through a same-origin Next.js proxy, or the cookie would end up
// scoped to the wrong host.

import type { Resource, Person, Tool } from '@/lib/api'

const AUTH_API_BASE = 'https://api.lowlevelnotes.com'

export type AuthUser = {
  id: number
  email: string
  displayName: string
  role: string
  emailVerified: boolean
}

type Result<T> = { ok: true; data: T } | { ok: false; error: string; status: number }

async function authFetch<T>(path: string, init?: RequestInit): Promise<Result<T>> {
  let res: Response
  try {
    res = await fetch(`${AUTH_API_BASE}${path}`, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    return { ok: false, error: 'Could not reach the server. Check your connection.', status: 0 }
  }

  if (res.status === 204) {
    return { ok: true, data: undefined as T }
  }

  let body: unknown
  try {
    body = await res.json()
  } catch {
    return { ok: false, error: 'Unexpected response from the server.', status: res.status }
  }

  if (!res.ok) {
    const error = (body as { error?: string })?.error ?? 'Something went wrong.'
    return { ok: false, error, status: res.status }
  }

  return { ok: true, data: body as T }
}

// Separate from authFetch because a multipart body needs the browser to
// set its own Content-Type (with the boundary) — sending a fixed
// 'application/json' header, or JSON.stringify-ing a FormData object,
// would silently break the upload rather than fail loudly.
async function authFetchForm<T>(path: string, form: FormData, method = 'POST'): Promise<Result<T>> {
  let res: Response
  try {
    res = await fetch(`${AUTH_API_BASE}${path}`, { method, credentials: 'include', body: form })
  } catch {
    return { ok: false, error: 'Could not reach the server. Check your connection.', status: 0 }
  }

  let body: unknown
  try {
    body = await res.json()
  } catch {
    return { ok: false, error: 'Unexpected response from the server.', status: res.status }
  }

  if (!res.ok) {
    const error = (body as { error?: string })?.error ?? 'Something went wrong.'
    return { ok: false, error, status: res.status }
  }

  return { ok: true, data: body as T }
}

export function getSession() {
  return authFetch<AuthUser>('/v1/auth/session')
}

export function login(email: string, password: string, turnstileToken: string) {
  return authFetch<{ token: string; expiresAt: string; user: AuthUser }>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, turnstileToken }),
  })
}

export function register(email: string, password: string, displayName: string, turnstileToken: string) {
  return authFetch<{ message: string; email: string; verificationLink?: string; note?: string }>(
    '/v1/auth/register',
    { method: 'POST', body: JSON.stringify({ email, password, displayName, turnstileToken }) }
  )
}

export function logout() {
  return authFetch<void>('/v1/auth/logout', { method: 'POST' })
}

export function changePassword(currentPassword: string, newPassword: string) {
  return authFetch<{ message: string }>('/v1/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export function forgotPassword(email: string, turnstileToken: string) {
  return authFetch<{ message: string }>('/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email, turnstileToken }),
  })
}

export function resetPassword(token: string, newPassword: string) {
  return authFetch<{ message: string }>('/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  })
}

export function verifyEmail(token: string) {
  return authFetch<{ message: string }>(`/v1/auth/verify-email?token=${encodeURIComponent(token)}`)
}

export function resendVerification() {
  return authFetch<{ message: string; verificationLink?: string; note?: string }>(
    '/v1/auth/resend-verification',
    { method: 'POST' }
  )
}

// Library data now requires a session — gated server-side (not just a
// frontend redirect), so a logged-out request genuinely gets a 401 with
// no data, not just a hidden-but-fetched response.
export async function getLibrary() {
  const [resources, people, tools] = await Promise.all([
    authFetch<Resource[]>('/resources'),
    authFetch<Person[]>('/people'),
    authFetch<Tool[]>('/tools'),
  ])

  if (!resources.ok) return resources
  if (!people.ok) return people
  if (!tools.ok) return tools

  return {
    ok: true as const,
    data: { resources: resources.data, people: people.data, tools: tools.data },
  }
}

/* ==================== Phase 4: authorization roles ==================== */

export type Role = 'student' | 'contributor' | 'instructor' | 'administrator'
export type RequestStatus = 'pending' | 'approved' | 'rejected'

export type RoleRequest = {
  id: number
  userId: number
  requestedRole: Role
  message: string | null
  status: RequestStatus
  reviewedBy: number | null
  reviewedAt: string | null
  rejectionReason: string | null
  createdAt: string
}

export type StaffRoleRequest = RoleRequest & {
  requesterEmail: string
  requesterDisplayName: string
}

export type ResourceRequest = {
  id: number
  userId: number
  title: string
  description: string | null
  type: 'pdf' | 'website' | 'videos' | 'git'
  category: string | null
  url: string | null
  hasFile: boolean
  status: RequestStatus
  reviewedBy: number | null
  reviewedAt: string | null
  rejectionReason: string | null
  resourceId: number | null
  createdAt: string
}

export type StaffResourceRequest = ResourceRequest & {
  requesterEmail: string
  requesterRole: Role
}

export type StaffUser = {
  id: number
  email: string
  displayName: string
  role: Role
  emailVerified: boolean
  bannedAt: string | null
  banReason: string | null
  createdAt: string
}

export type BlockedIp = {
  id: string
  ip: string
  note: string
  createdOn: string
}

// -------- Role requests --------

export function submitRoleRequest(requestedRole: 'contributor' | 'instructor', message: string) {
  return authFetch<{ message: string }>('/v1/role-requests', {
    method: 'POST',
    body: JSON.stringify({ requestedRole, message }),
  })
}

export function getMyRoleRequests() {
  return authFetch<RoleRequest[]>('/v1/role-requests/me')
}

export function getStaffRoleRequests(status?: RequestStatus) {
  return authFetch<StaffRoleRequest[]>(`/v1/staff/role-requests${status ? `?status=${status}` : ''}`)
}

export function reviewRoleRequest(id: number, action: 'approve' | 'reject', reason?: string) {
  return authFetch<{ message: string }>(`/v1/staff/role-requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ action, reason }),
  })
}

// -------- Resource requests --------

export function submitResourceRequest(fields: {
  title: string
  description: string
  type: 'pdf' | 'website' | 'videos' | 'git'
  category: string
  url?: string
  file?: File
}) {
  const form = new FormData()
  form.set('title', fields.title)
  form.set('description', fields.description)
  form.set('type', fields.type)
  form.set('category', fields.category)
  if (fields.url) form.set('url', fields.url)
  if (fields.file) form.set('file', fields.file)

  return authFetchForm<{ message: string; id: number }>('/v1/resource-requests', form)
}

export function getMyResourceRequests() {
  return authFetch<ResourceRequest[]>('/v1/resource-requests/me')
}

export function getResourceRequestFileUrl(id: number) {
  return `${AUTH_API_BASE}/v1/resource-requests/${id}/file`
}

export function getStaffResourceRequests(status?: RequestStatus) {
  return authFetch<StaffResourceRequest[]>(`/v1/staff/resource-requests${status ? `?status=${status}` : ''}`)
}

export function reviewResourceRequest(id: number, action: 'approve' | 'reject', reason?: string) {
  return authFetch<{ message: string; resourceId?: number }>(`/v1/staff/resource-requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ action, reason }),
  })
}

// -------- Staff: users --------

export function getStaffUsers() {
  return authFetch<StaffUser[]>('/v1/staff/users')
}

export function createStaffUser(email: string, displayName: string, role: Role) {
  return authFetch<{ message: string; id: number; setPasswordLink?: string; note?: string }>('/v1/staff/users', {
    method: 'POST',
    body: JSON.stringify({ email, displayName, role }),
  })
}

export function updateStaffUserRole(id: number, role: Role) {
  return authFetch<{ message: string }>(`/v1/staff/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  })
}

export function banStaffUser(id: number, reason: string) {
  return authFetch<{ message: string }>(`/v1/staff/users/${id}/ban`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  })
}

export function unbanStaffUser(id: number) {
  return authFetch<{ message: string }>(`/v1/staff/users/${id}/unban`, { method: 'PUT' })
}

export function deleteStaffUser(id: number) {
  return authFetch<{ message: string }>(`/v1/staff/users/${id}`, { method: 'DELETE' })
}

export function getStaffUserIps(id: number) {
  return authFetch<{ ips: string[] }>(`/v1/staff/users/${id}/ips`)
}

// -------- Staff: blocked IPs --------

export function getStaffBlockedIps() {
  return authFetch<BlockedIp[]>('/v1/staff/blocked-ips')
}

export function blockIp(ip: string, note?: string, userId?: number) {
  return authFetch<{ message: string; id: string }>('/v1/staff/blocked-ips', {
    method: 'POST',
    body: JSON.stringify({ ip, note, userId }),
  })
}

export function unblockIp(id: string) {
  return authFetch<{ message: string }>(`/v1/staff/blocked-ips/${id}`, { method: 'DELETE' })
}
