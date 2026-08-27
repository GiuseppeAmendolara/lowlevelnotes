import type { ThemeRegistration } from 'shiki'

// Shared by CodeBlock.tsx (standalone snippets) and the article markdown
// pipeline (src/lib/markdown.ts) so code renders identically everywhere.
export const shikiTheme: ThemeRegistration = {
  name: '0xLLN',
  type: 'dark',
  colors: {
    'editor.background': '#171717',
    'editor.foreground': '#FFFFFF',
  },
  tokenColors: [
    { scope: ['comment'], settings: { foreground: '#6B7280', fontStyle: 'italic' } },
    { scope: ['keyword', 'storage.type', 'storage.modifier'], settings: { foreground: '#C678DD' } },
    { scope: ['string'], settings: { foreground: '#FF8A3D' } },
    { scope: ['constant.numeric'], settings: { foreground: '#3FB950' } },
    { scope: ['entity.name.class', 'entity.name.type', 'support.class'], settings: { foreground: '#61AFEF' } },
    { scope: ['entity.name.function', 'support.function'], settings: { foreground: '#E5C07B' } },
    { scope: ['variable', 'variable.parameter'], settings: { foreground: '#ABB2BF' } },
    { scope: ['punctuation'], settings: { foreground: '#A1A1AA' } },
  ],
}
