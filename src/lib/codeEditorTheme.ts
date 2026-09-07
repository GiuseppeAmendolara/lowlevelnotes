import { tags as t } from '@lezer/highlight'
import { createTheme } from '@uiw/codemirror-themes'
import { StreamLanguage } from '@codemirror/language'
import { csharp } from '@codemirror/legacy-modes/mode/clike'
import { gas } from '@codemirror/legacy-modes/mode/gas'
import type { Extension } from '@codemirror/state'

// Mirrors shikiTheme.ts's palette exactly (same site, same read-only
// code blocks elsewhere) so the editable exercise editor doesn't look
// like a visually distinct product bolted onto the page.
export const codeEditorTheme = createTheme({
  theme: 'dark',
  settings: {
    background: '#0B0B0D',
    foreground: '#FFFFFF',
    caret: '#FF7A33',
    selection: 'rgba(255, 255, 255, 0.15)',
    selectionMatch: 'rgba(255, 122, 51, 0.25)',
    lineHighlight: 'rgba(255, 255, 255, 0.03)',
    gutterBackground: '#0B0B0D',
    gutterForeground: 'rgba(255, 255, 255, 0.3)',
    gutterBorder: 'rgba(255, 255, 255, 0.1)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
    fontSize: '0.75rem',
  },
  styles: [
    { tag: [t.comment, t.lineComment, t.blockComment], color: '#6B7280', fontStyle: 'italic' },
    { tag: [t.keyword, t.controlKeyword, t.operatorKeyword, t.definitionKeyword, t.modifier, t.typeName], color: '#C678DD' },
    { tag: [t.string, t.special(t.string)], color: '#FF8A3D' },
    { tag: [t.number, t.bool, t.atom], color: '#3FB950' },
    { tag: [t.className, t.standard(t.typeName)], color: '#61AFEF' },
    { tag: [t.function(t.variableName), t.definition(t.variableName)], color: '#E5C07B' },
    { tag: [t.variableName, t.propertyName], color: '#ABB2BF' },
    { tag: [t.punctuation, t.bracket, t.operator], color: '#A1A1AA' },
  ],
})

// This app's `exercises.language` values are chosen for display, same
// spirit as worker/lib/piston.js's PISTON_LANGUAGE_ALIASES -- CodeMirror
// has no official lezer grammar for either C# or NASM, so this uses
// @codemirror/legacy-modes' ported CodeMirror-5 stream parsers (clike's
// csharp config, and gas for x86 assembly -- close enough to NASM for
// highlighting purposes; there's no dedicated NASM stream mode).
// Returns [] for an unrecognized language rather than throwing, so a
// future exercise language with no highlighting support here still
// gets a working, just plain-text, editor.
export function languageExtensionFor(language: string | null): Extension[] {
  switch (language) {
    case 'csharp':
      return [StreamLanguage.define(csharp)]
    case 'asm':
      return [StreamLanguage.define(gas)]
    default:
      return []
  }
}
