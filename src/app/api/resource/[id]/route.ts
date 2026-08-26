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
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
