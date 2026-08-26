'use client'

// Client-safe wrappers for /v1/auth/* — deliberately separate from
// src/lib/api.ts (server-only, uses the INTERNAL_API_KEY secret). Auth
// calls run in the browser and rely on the session cookie instead, which
// is HttpOnly and host-only on api.lowlevelnotes.com — the browser must
// therefore talk to that domain directly (credentials: 'include'), not
// through a same-origin Next.js proxy, or the cookie would end up scoped
// to the wrong host.

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

export function getSession() {
  return authFetch<AuthUser>('/v1/auth/session')
}

export function login(email: string, password: string) {
  return authFetch<{ token: string; expiresAt: string; user: AuthUser }>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register(email: string, password: string, displayName: string) {
  return authFetch<{ message: string; email: string; verificationLink?: string; note?: string }>(
    '/v1/auth/register',
    { method: 'POST', body: JSON.stringify({ email, password, displayName }) }
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

export function forgotPassword(email: string) {
  return authFetch<{ message: string }>('/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
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
