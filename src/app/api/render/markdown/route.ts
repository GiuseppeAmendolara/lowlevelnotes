import { renderLessonMarkdown } from '@/lib/markdown'

// Same-origin only — the browser fetches raw lesson markdown from the
// gated Worker endpoint (session cookie required there), then posts the
// already-authenticated text here to run the existing server-side
// rendering pipeline (shiki/rehype-pretty-code) and get HTML back. This
// route itself checks no session — it never touches R2 or D1, it only
// renders text it's handed — but does cap body size, since it's
// technically reachable by anyone and real lesson content runs into the
// hundreds of KB.
const MAX_BODY_BYTES = 500_000

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { markdown, basePath } = body as { markdown?: unknown; basePath?: unknown }

  if (typeof markdown !== 'string' || typeof basePath !== 'string') {
    return Response.json({ error: 'markdown and basePath must be strings' }, { status: 400 })
  }

  if (markdown.length > MAX_BODY_BYTES) {
    return Response.json({ error: 'Markdown too large' }, { status: 413 })
  }

  const html = await renderLessonMarkdown(markdown, basePath)
  return Response.json({ html })
}
