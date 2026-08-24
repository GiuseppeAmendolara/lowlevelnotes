import { Tool } from '@/lib/api'

export default function ToolLinkRow({ tool }: { tool: Tool }) {
  const domain = new URL(tool.path).hostname
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

  return (
    <a
      href={tool.path}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={favicon}
        alt=""
        width={16}
        height={16}
        className="rounded-sm shrink-0"
      />

      <span className="font-mono text-sm text-white/80 group-hover:text-white transition-colors">
        {tool.name}
      </span>

      <span className="ml-auto font-mono text-xs text-white/0 group-hover:text-white/30 transition-colors">
        →
      </span>
    </a>
  )
}