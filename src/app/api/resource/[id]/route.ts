import { incrementResourceViews } from '@/lib/api'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const resourceId = Number(id)

  if (!Number.isInteger(resourceId)) {
    return new Response('Invalid resource id', { status: 400 })
  }

  try {
    await incrementResourceViews(resourceId)
    return new Response(null, { status: 204 })
  } catch (error) {
    // Was a silent catch — any failure here (including a real network
    // drop, not just a genuinely missing resource) showed up as an
    // identical bare 404 with nothing in the logs to tell them apart.
    console.error(`[api/resource] increment failed for id ${resourceId}:`, error)
    return new Response('Not found', { status: 404 })
  }
}
