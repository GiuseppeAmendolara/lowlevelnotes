import { codeToHtml } from 'shiki'
import { shikiTheme } from '@/lib/shikiTheme'

// Same-origin render endpoint for exercise starter code — CodeBlock.tsx
// is an async Server Component and can't render inside the fully
// client-fetched lesson page (see api/render/markdown/route.ts for the
// full reasoning). Shares the exact shikiTheme, so output matches
// CodeBlock's rendering everywhere else on the site.
const MAX_BODY_BYTES = 500_000

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { code, lang } = body as { code?: unknown; lang?: unknown }

  if (typeof code !== 'string' || typeof lang !== 'string') {
    return Response.json({ error: 'code and lang must be strings' }, { status: 400 })
  }

  if (code.length > MAX_BODY_BYTES) {
    return Response.json({ error: 'Code too large' }, { status: 413 })
  }

  let html: string
  try {
    html = await codeToHtml(code, { lang, theme: shikiTheme })
  } catch {
    html = await codeToHtml(code, { lang: 'text', theme: shikiTheme })
  }

  return Response.json({ html })
}
