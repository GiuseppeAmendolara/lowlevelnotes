import { getStatsSvg } from '@/lib/api'

export async function GET() {
  try {
    const svg = await getStatsSvg()
    return new Response(svg, {
      headers: { 'content-type': 'image/svg+xml' },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
