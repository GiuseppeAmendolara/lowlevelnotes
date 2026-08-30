import { codeToHtml } from 'shiki'
import { shikiTheme } from '@/lib/shikiTheme'

type CodeBlockProps = {
  code: string
  lang: string
  filename?: string
}

export default async function CodeBlock({ code, lang, filename }: CodeBlockProps) {
  const html = await codeToHtml(code, { lang, theme: shikiTheme })

  return (
    <div className="border border-white/10 bg-[#0B0B0D]">
      {filename && (
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
          <span className="h-2.5 w-2.5 bg-[#3FB950]" aria-hidden="true" />
          <span className="font-mono text-xs text-[#90939A]">{filename}</span>
        </div>
      )}
      <div
        className="overflow-x-auto p-5 text-xs leading-6 [&_pre]:!bg-transparent [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
