'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { PISTON_LANGUAGES, type PistonLanguage } from '@/lib/pistonLanguages'

const inputClass = "w-full border border-white/15 bg-[#17181B] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"

function matches(lang: PistonLanguage, query: string): boolean {
  const q = query.toLowerCase()
  return lang.label.toLowerCase().includes(q) || lang.value.toLowerCase().includes(q) || lang.aliases.some((a) => a.toLowerCase().includes(q))
}

// Search/autocomplete over every language Piston supports (see
// src/lib/pistonLanguages.ts) -- replaces a plain <select> that would
// otherwise have to list ~85 options at once. `onChange` only ever
// fires with a value from PISTON_LANGUAGES (selected by click or Enter
// on a highlighted option), never with raw typed text -- typing narrows
// the list, it doesn't set the value, so this can't submit a typo the
// way a free-text input could.
export default function LanguagePicker({
  id,
  value,
  onChange,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
}) {
  const selected = PISTON_LANGUAGES.find((l) => l.value === value) ?? null
  const [query, setQuery] = useState(selected?.label ?? '')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  // "Adjust state during render" (React's own recommended alternative to
  // a useEffect that just re-syncs state when a prop changes -- avoids
  // an extra render/commit cascade): re-derives the displayed text only
  // when `value` actually changes from outside (e.g. switching which
  // lesson is being edited), tracked via prevValue, without clobbering
  // the query the user is actively typing on every render.
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    setQuery(selected?.label ?? '')
  }

  // Same click-outside-to-close pattern as NotificationBell.tsx.
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery(selected?.label ?? '')
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open, selected])

  const results = (query.trim() ? PISTON_LANGUAGES.filter((l) => matches(l, query)) : PISTON_LANGUAGES).slice(0, 20)

  function select(lang: PistonLanguage) {
    onChange(lang.value)
    setQuery(lang.label)
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[highlight]) select(results[highlight])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery(selected?.label ?? '')
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          setHighlight(0)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search languages…"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        autoComplete="off"
        className={inputClass}
      />
      {open && (
        <ul id={listboxId} role="listbox" className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto border border-white/15 bg-[#17181B] shadow-xl">
          {results.length === 0 && <li className="px-3 py-2 text-sm text-white/40">No matches</li>}
          {results.map((lang, i) => (
            <li key={lang.value}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(lang)}
                className={`block w-full px-3 py-2 text-left text-sm ${i === highlight ? 'bg-white/10 text-white' : 'text-white/80'} hover:bg-white/10 hover:text-white`}
              >
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
