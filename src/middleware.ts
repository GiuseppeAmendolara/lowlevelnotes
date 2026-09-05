import { NextRequest, NextResponse } from 'next/server'

// Consolidates honeypot-hit logging for /admin (src/app/admin/page.tsx) --
// runs ahead of the page itself so it also catches a direct POST, the
// classic credential-stuffing pattern where a script submits an admin
// login form without ever loading the page as a browser would. page.tsx
// alone can never see that: Next.js only calls a page component for
// GET/HEAD, so an unrouted POST would otherwise 405 before any of our
// code runs. GET/HEAD still fall through to the real decoy page after
// logging (which no longer logs itself -- this replaces that); anything
// else gets a generic decoy response here instead of Next's default 405,
// which would otherwise look conspicuously unlike a real login endpoint.
const API_BASE = 'https://api.lowlevelnotes.com'
const MAX_BODY_LENGTH = 2000

export async function middleware(request: NextRequest) {
  // Same reasoning as the old page.tsx logHit(): the site sits behind
  // Cloudflare in front of Vercel, so cf-connecting-ip (which Cloudflare
  // sets to the real client IP and strips from anything the client sent)
  // is trustworthy here where x-forwarded-for's first entry is not --
  // confirmed live, it was landing on Cloudflare's own edge range
  // (162.158.0.0/15) instead of the visitor.
  const ip = request.headers.get('cf-connecting-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')

  // Only read a body for non-GET/HEAD -- those methods don't carry one,
  // and a GET/HEAD's ReadableStream can't be re-read after being
  // consumed here anyway (NextResponse.next() needs the original
  // request untouched for those).
  let body: string | null = null
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = (await request.text()).slice(0, MAX_BODY_LENGTH)
    } catch {
      body = null
    }
  }

  try {
    await fetch(`${API_BASE}/v1/honeypot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.INTERNAL_API_KEY!,
      },
      body: JSON.stringify({
        path: request.nextUrl.pathname + request.nextUrl.search,
        method: request.method,
        ip,
        userAgent: request.headers.get('user-agent'),
        referrer: request.headers.get('referer'),
        body,
      }),
      cache: 'no-store',
    })
  } catch {
    // A logging failure should never block the decoy response.
  }

  if (request.method === 'GET' || request.method === 'HEAD') {
    return NextResponse.next()
  }

  return new NextResponse('Invalid credentials.', {
    status: 401,
    headers: { 'Content-Type': 'text/plain' },
  })
}

export const config = {
  matcher: '/admin',
}
