// Every language Piston's public API (GET /api/v2/piston/runtimes) lists,
// deduplicated by canonical name -- three names are genuinely listed
// twice under different runtimes (two matl versions; deno vs default
// typescript/javascript); the deno-flavored and duplicate-version
// entries are dropped rather than kept as confusing near-duplicates,
// since the distinction isn't pedagogically relevant here. `value` is
// always either Piston's own canonical `language` name or one of its
// own listed `aliases` -- both resolve natively server-side
// (worker/lib/piston.js's executeCode), so no translation table is
// needed for any of these, the same way NASM's "asm" alias already
// demonstrated. Search matches against `label`, `value`, and every
// string in `aliases` -- a search box makes even the esoteric/golfing
// entries harmless to list (nothing shows until you type), unlike a
// plain <select> that would have to show all of them at once.
export type PistonLanguage = {
  value: string
  label: string
  aliases: string[]
}

export const PISTON_LANGUAGES: PistonLanguage[] = [
  { value: 'python', label: 'Python', aliases: ['py', 'py3', 'python3'] },
  { value: 'python2', label: 'Python 2', aliases: ['py2'] },
  { value: 'javascript', label: 'JavaScript', aliases: ['js', 'node-js'] },
  { value: 'typescript', label: 'TypeScript', aliases: ['ts', 'tsc'] },
  { value: 'coffeescript', label: 'CoffeeScript', aliases: ['coffee'] },
  { value: 'c', label: 'C', aliases: ['gcc'] },
  { value: 'c++', label: 'C++', aliases: ['cpp', 'g++'] },
  { value: 'csharp', label: 'C#', aliases: ['mono', 'c#', 'cs'] },
  { value: 'csharp.net', label: 'C# (.NET)', aliases: ['c#.net', 'cs.net'] },
  { value: 'fsharp.net', label: 'F#', aliases: ['fsharp', 'fs', 'f#'] },
  { value: 'fsi', label: 'F# Interactive', aliases: ['fsx', 'fsharp-interactive'] },
  { value: 'basic', label: 'Visual Basic', aliases: ['vb', 'visual-basic'] },
  { value: 'basic.net', label: 'Visual Basic (.NET)', aliases: ['vb.net'] },
  { value: 'java', label: 'Java', aliases: [] },
  { value: 'kotlin', label: 'Kotlin', aliases: ['kt'] },
  { value: 'scala', label: 'Scala', aliases: ['sc'] },
  { value: 'groovy', label: 'Groovy', aliases: ['gvy'] },
  { value: 'go', label: 'Go', aliases: ['golang'] },
  { value: 'rust', label: 'Rust', aliases: ['rs'] },
  { value: 'swift', label: 'Swift', aliases: [] },
  { value: 'd', label: 'D', aliases: ['gdc'] },
  { value: 'dart', label: 'Dart', aliases: [] },
  { value: 'nim', label: 'Nim', aliases: [] },
  { value: 'zig', label: 'Zig', aliases: [] },
  { value: 'vlang', label: 'V', aliases: ['v'] },
  { value: 'crystal', label: 'Crystal', aliases: ['cr'] },
  { value: 'ruby', label: 'Ruby', aliases: ['ruby3', 'rb'] },
  { value: 'php', label: 'PHP', aliases: [] },
  { value: 'perl', label: 'Perl', aliases: ['pl'] },
  { value: 'raku', label: 'Raku', aliases: ['rakudo', 'perl6'] },
  { value: 'lua', label: 'Lua', aliases: [] },
  { value: 'haskell', label: 'Haskell', aliases: ['hs'] },
  { value: 'ponylang', label: 'Pony', aliases: ['pony', 'ponyc'] },
  { value: 'elixir', label: 'Elixir', aliases: ['exs'] },
  { value: 'erlang', label: 'Erlang', aliases: ['erl', 'escript'] },
  { value: 'clojure', label: 'Clojure', aliases: ['clj'] },
  { value: 'ocaml', label: 'OCaml', aliases: ['ml'] },
  { value: 'lisp', label: 'Common Lisp', aliases: ['cl', 'sbcl', 'commonlisp'] },
  { value: 'racket', label: 'Racket', aliases: ['rkt'] },
  { value: 'julia', label: 'Julia', aliases: ['jl'] },
  { value: 'rscript', label: 'R', aliases: ['r'] },
  { value: 'octave', label: 'Octave / MATLAB', aliases: ['matlab', 'm'] },
  { value: 'sqlite3', label: 'SQL (SQLite)', aliases: ['sqlite', 'sql'] },
  { value: 'bash', label: 'Bash', aliases: ['sh'] },
  { value: 'dash', label: 'Dash', aliases: [] },
  { value: 'powershell', label: 'PowerShell', aliases: ['ps', 'pwsh'] },
  { value: 'asm', label: 'Assembly (NASM)', aliases: ['nasm', 'nasm32'] },
  { value: 'asm64', label: 'Assembly (NASM, 64-bit)', aliases: ['nasm64'] },
  { value: 'llvm_ir', label: 'LLVM IR', aliases: ['llvm', 'llvm-ir'] },
  { value: 'iverilog', label: 'Verilog', aliases: ['verilog', 'vvp'] },
  { value: 'cobol', label: 'COBOL', aliases: ['cob'] },
  { value: 'fortran', label: 'Fortran', aliases: ['f90'] },
  { value: 'pascal', label: 'Pascal', aliases: ['freepascal', 'pas'] },
  { value: 'freebasic', label: 'FreeBASIC', aliases: ['bas', 'fbc', 'qbasic'] },
  { value: 'forth', label: 'Forth', aliases: ['gforth'] },
  { value: 'smalltalk', label: 'Smalltalk', aliases: ['st'] },
  { value: 'prolog', label: 'Prolog', aliases: ['plg'] },
  { value: 'awk', label: 'AWK', aliases: ['gawk'] },
  { value: 'emacs', label: 'Emacs Lisp', aliases: ['el', 'elisp'] },
  { value: 'file', label: 'Executable', aliases: ['executable', 'elf', 'binary'] },
  { value: 'emojicode', label: 'Emojicode', aliases: ['emojic'] },
  { value: 'dragon', label: 'Dragon', aliases: [] },
  { value: 'pure', label: 'Pure', aliases: [] },
  { value: 'forte', label: 'Forte', aliases: ['forter'] },
  // Code-golf / esoteric languages Piston supports -- unlikely to be
  // assigned as a real exercise, but a search box costs nothing to
  // list them in (see the file comment above), unlike a plain dropdown.
  { value: 'matl', label: 'MATL', aliases: [] },
  { value: 'befunge93', label: 'Befunge93', aliases: ['b93'] },
  { value: 'bqn', label: 'BQN', aliases: [] },
  { value: 'brachylog', label: 'Brachylog', aliases: [] },
  { value: 'brainfuck', label: 'Brainfuck', aliases: ['bf'] },
  { value: 'cjam', label: 'CJam', aliases: [] },
  { value: 'cow', label: 'COW', aliases: [] },
  { value: 'golfscript', label: 'GolfScript', aliases: [] },
  { value: 'husk', label: 'Husk', aliases: [] },
  { value: 'japt', label: 'Japt', aliases: [] },
  { value: 'jelly', label: 'Jelly', aliases: [] },
  { value: 'lolcode', label: 'LOLCODE', aliases: ['lol', 'lci'] },
  { value: 'osabie', label: '05AB1E', aliases: ['osabie'] },
  { value: 'paradoc', label: 'Paradoc', aliases: [] },
  { value: 'pyth', label: 'Pyth', aliases: [] },
  { value: 'retina', label: 'Retina', aliases: ['ret'] },
  { value: 'rockstar', label: 'Rockstar', aliases: ['rock', 'rocky'] },
  { value: 'samarium', label: 'Samarium', aliases: ['sm'] },
  { value: 'vyxal', label: 'Vyxal', aliases: [] },
  { value: 'yeethon', label: 'Yeethon', aliases: ['yeethon3'] },
]
