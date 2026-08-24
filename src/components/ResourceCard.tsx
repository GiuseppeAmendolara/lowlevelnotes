'use client'

import { Resource, Person } from '@/lib/api'

const API_BASE = 'https://api.lowlevelnotes.com'

const typeLabel: Record<Resource['type'], string> = {
  pdf: 'PDF',
  website: 'SITE',
  videos: 'VIDEO',
  git: 'REPO',
}

export default function ResourceCard({ resource, author }: { resource: Resource; author?: Person }) {
  if (!author) return null

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    fetch(`${API_BASE}/resource/${resource.id}/view`, { method: 'POST' }).catch(() => {})
    window.open(resource.path, '_blank', 'noopener,noreferrer')
  }

  return (
     <a href={resource.path}
      onClick={handleClick}
      className="group border border-white/10 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.04] transition-all p-5 flex flex-col justify-between min-h-[170px] cursor-pointer"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-mono font-semibold text-white text-base leading-snug">
            {resource.title}
          </h3>
          <span className="font-mono text-[10px] text-white/40 border border-white/10 px-1.5 py-0.5 shrink-0">
            {typeLabel[resource.type]}
          </span>
        </div>
        <p className="font-mono text-sm text-white/50 mt-2 leading-relaxed line-clamp-3">
          {resource.description}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={author.avatar} alt="" width={24} height={24} className="rounded-full shrink-0 object-cover w-6 h-6" />
          <p className="font-mono text-xs text-white truncate">{author.name}</p>
        </div>
        <span className="font-mono text-xs text-white/40 shrink-0">{resource.views} views</span>
      </div>
    </a>
  )
}