'use client'

import { useEffect, useState } from 'react'
import SolutionReveal from '@/components/SolutionReveal'
import { getLessonContent } from '@/lib/authClient'

// content_path's directory, e.g. "drafts/Data/postgresql.md" -> "drafts/Data"
// — used to resolve relative image references in the markdown. Avoids
// importing Node's path module into a client bundle for one split/join.
export function dirnameOf(contentPath: string): string {
  const parts = contentPath.split('/')
  parts.pop()
  return parts.join('/')
}

function embedUrl(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl)
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
      const id = url.hostname.includes('youtu.be') ? url.pathname.slice(1) : url.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (url.hostname.includes('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
    return null
  } catch {
    return null
  }
}

export function ArticleBody({ contentPath }: { contentPath: string | null }) {
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!contentPath) return

    let cancelled = false
    ;(async () => {
      const contentResult = await getLessonContent(contentPath)
      if (!contentResult.ok) {
        if (!cancelled) setError(contentResult.error)
        return
      }

      const res = await fetch('/api/render/markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: contentResult.data, basePath: dirnameOf(contentPath) }),
      })

      if (!res.ok) {
        if (!cancelled) setError('Could not render this lesson.')
        return
      }

      const { html } = await res.json()
      if (!cancelled) setHtml(html)
    })()

    return () => {
      cancelled = true
    }
  }, [contentPath])

  if (!contentPath) {
    return <p className="text-sm text-[#A1A1AA]">This lesson has no content yet.</p>
  }

  if (error) {
    return <p className="text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>
  }

  if (!html) {
    return <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
  }

  return (
    <div
      className="prose-lesson animate-fade-in-up motion-reduce:animate-none [&_a]:text-[#FF8A3D] [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:text-[#A1A1AA] [&_code]:bg-white/[0.06] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_h1]:mt-10 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-[-0.04em] [&_h1]:text-white [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-[-0.03em] [&_h2]:text-white [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_hr]:border-white/10 [&_img]:max-w-full [&_li]:leading-7 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-4 [&_p]:leading-7 [&_p]:text-[#A1A1AA] [&_pre]:my-4 [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-white/10 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-white/10 [&_th]:bg-white/[0.03] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-white [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function VideoBody({ videoUrl }: { videoUrl: string | null }) {
  if (!videoUrl) {
    return <p className="text-sm text-[#A1A1AA]">This lesson&apos;s video isn&apos;t available yet.</p>
  }

  const embed = embedUrl(videoUrl)

  return (
    <div className="aspect-video w-full border border-white/10 bg-[#0D0D0D]">
      {embed ? (
        <iframe src={embed} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      ) : (
        <video src={videoUrl} controls className="h-full w-full" />
      )}
    </div>
  )
}

export function RenderedCode({ code, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/render/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, lang }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setHtml(data.html)
      })

    return () => {
      cancelled = true
    }
  }, [code, lang])

  if (!html) {
    return <div className="border border-white/10 bg-[#171717] p-5 text-xs text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</div>
  }

  return (
    <div className="border border-white/10 bg-[#171717]">
      <div
        className="overflow-x-auto p-5 text-xs leading-6 [&_pre]:!bg-transparent [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export function ExerciseBody({ exercise }: { exercise: { prompt: string; language: string | null; starterCode: string | null; solutionNotes: string | null } }) {
  return (
    <div>
      <p className="text-sm leading-7 text-[#A1A1AA]">{exercise.prompt}</p>
      {exercise.starterCode && (
        <div className="mt-6">
          <RenderedCode code={exercise.starterCode} lang={exercise.language ?? 'text'} />
        </div>
      )}
      {exercise.solutionNotes && <SolutionReveal notes={exercise.solutionNotes} />}
    </div>
  )
}
