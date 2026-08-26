import { codeToHtml } from 'shiki'
import type { ThemeRegistration } from 'shiki'

const theme: ThemeRegistration = {
  name: '0xLLN',
  type: 'dark',
  colors: {
    'editor.background': '#171717',
    'editor.foreground': '#FFFFFF',
  },
  tokenColors: [
    { scope: ['comment'], settings: { foreground: '#6B7280', fontStyle: 'italic' } },
    { scope: ['keyword', 'storage.type', 'storage.modifier'], settings: { foreground: '#FFFFFF', fontStyle: 'bold' } },
    { scope: ['string'], settings: { foreground: '#FF8A3D' } },
    { scope: ['constant.numeric'], settings: { foreground: '#3FB950' } },
    { scope: ['entity.name.class', 'entity.name.type', 'support.class', 'entity.name.function', 'support.function'], settings: { foreground: '#FFFFFF' } },
    { scope: ['variable', 'variable.parameter'], settings: { foreground: '#A1A1AA' } },
    { scope: ['punctuation'], settings: { foreground: '#A1A1AA' } },
  ],
}

type CodeBlockProps = {
  code: string
  lang: string
  filename?: string
}

export default async function CodeBlock({ code, lang, filename }: CodeBlockProps) {
  const html = await codeToHtml(code, { lang, theme })

  return (
    <div className="border border-white/10 bg-[#171717]">
      {filename && (
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
          <span className="h-2.5 w-2.5 bg-[#3FB950]" aria-hidden="true" />
          <span className="font-mono text-xs text-[#A1A1AA]">{filename}</span>
        </div>
      )}
      <div
        className="overflow-x-auto p-5 text-xs leading-6 [&_pre]:!bg-transparent [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
