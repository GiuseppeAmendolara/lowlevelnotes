import { tags as t } from '@lezer/highlight'
import { createTheme } from '@uiw/codemirror-themes'
import { StreamLanguage, type StreamParser } from '@codemirror/language'
import { csharp, cpp, c, java, kotlin, scala, dart } from '@codemirror/legacy-modes/mode/clike'
import { gas } from '@codemirror/legacy-modes/mode/gas'
import { go } from '@codemirror/legacy-modes/mode/go'
import { rust } from '@codemirror/legacy-modes/mode/rust'
import { python } from '@codemirror/legacy-modes/mode/python'
import { javascript, typescript } from '@codemirror/legacy-modes/mode/javascript'
import { coffeeScript } from '@codemirror/legacy-modes/mode/coffeescript'
import { ruby } from '@codemirror/legacy-modes/mode/ruby'
import { swift } from '@codemirror/legacy-modes/mode/swift'
import { haskell } from '@codemirror/legacy-modes/mode/haskell'
import { perl } from '@codemirror/legacy-modes/mode/perl'
import { lua } from '@codemirror/legacy-modes/mode/lua'
import { r } from '@codemirror/legacy-modes/mode/r'
import { octave } from '@codemirror/legacy-modes/mode/octave'
import { sqlite } from '@codemirror/legacy-modes/mode/sql'
import { powerShell } from '@codemirror/legacy-modes/mode/powershell'
import { pascal } from '@codemirror/legacy-modes/mode/pascal'
import { fortran } from '@codemirror/legacy-modes/mode/fortran'
import { vb } from '@codemirror/legacy-modes/mode/vb'
import { cobol } from '@codemirror/legacy-modes/mode/cobol'
import { crystal } from '@codemirror/legacy-modes/mode/crystal'
import { groovy } from '@codemirror/legacy-modes/mode/groovy'
import { erlang } from '@codemirror/legacy-modes/mode/erlang'
import { verilog } from '@codemirror/legacy-modes/mode/verilog'
import { clojure } from '@codemirror/legacy-modes/mode/clojure'
import { oCaml, fSharp } from '@codemirror/legacy-modes/mode/mllike'
import { commonLisp } from '@codemirror/legacy-modes/mode/commonlisp'
import { forth } from '@codemirror/legacy-modes/mode/forth'
import { smalltalk } from '@codemirror/legacy-modes/mode/smalltalk'
import { julia } from '@codemirror/legacy-modes/mode/julia'
import { shell } from '@codemirror/legacy-modes/mode/shell'
import { d } from '@codemirror/legacy-modes/mode/d'
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

// This app's exercise `language` values (src/lib/pistonLanguages.ts)
// are chosen for display, same spirit as worker/lib/piston.js's
// PISTON_LANGUAGE_ALIASES -- CodeMirror has no official lezer grammar
// for most of these, so this uses @codemirror/legacy-modes' ported
// CodeMirror-5 stream parsers. Not every listed language has one
// available (the esoteric/golfing entries, PHP, Prolog, AWK, Nim, Zig,
// V, and a few others genuinely have no CM5-era mode to port) -- those
// fall through to [] below, which still gives a working, just
// plain-text, editor rather than throwing.
const LANGUAGE_PARSERS: Record<string, StreamParser<unknown>> = {
  python,
  python2: python,
  javascript,
  typescript,
  coffeescript: coffeeScript,
  c,
  'c++': cpp,
  csharp,
  'csharp.net': csharp,
  'fsharp.net': fSharp,
  fsi: fSharp,
  basic: vb,
  'basic.net': vb,
  java,
  kotlin,
  scala,
  groovy,
  go,
  rust,
  swift,
  d,
  dart,
  ruby,
  perl,
  lua,
  haskell,
  erlang,
  clojure,
  ocaml: oCaml,
  lisp: commonLisp,
  julia,
  rscript: r,
  octave,
  sqlite3: sqlite,
  bash: shell,
  dash: shell,
  powershell: powerShell,
  asm: gas,
  asm64: gas,
  iverilog: verilog,
  cobol,
  fortran,
  pascal,
  forth,
  smalltalk,
  crystal,
}

export function languageExtensionFor(language: string | null): Extension[] {
  if (!language) return []
  const parser = LANGUAGE_PARSERS[language]
  return parser ? [StreamLanguage.define(parser)] : []
}
