'use client'

import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import ActionButton from '@/components/ActionButton'
import { codeEditorTheme, languageExtensionFor } from '@/lib/codeEditorTheme'

// Purely illustrative -- editable, but "Run" never calls the backend.
// Mirrors ExerciseBody's real editor/Run/result-panel look (src/
// components/lesson/LessonContentViews.tsx) so a homepage visitor gets
// a feel for what course exercises actually look like, without putting
// an unauthenticated code-execution endpoint on the site's most
// trafficked, logged-out page -- real execution stays gated behind
// session + enrollment (see AGENTS.md's "End-Phase -- Exercises").
// The canned stats below are realistic magnitudes (compile ~400ms,
// run ~10ms for a similarly small C# program), not literally sourced
// from a live run.
const MOCK_STDOUT = 'Hello World!\n'
const MOCK_COMPILE = '412ms wall / 401ms cpu, 63.4 MB'
const MOCK_RUN = '9ms wall / 7ms cpu, 8.6 MB'
const RUN_DELAY_MS = 700

export default function HomeCodeDemo({ code: initialCode }: { code: string }) {
  const [code, setCode] = useState(() => initialCode.trim())
  const [running, setRunning] = useState(false)
  const [ranOnce, setRanOnce] = useState(false)

  function handleRun() {
    setRunning(true)
    setTimeout(() => {
      setRunning(false)
      setRanOnce(true)
    }, RUN_DELAY_MS)
  }

  return (
    <div>
      <div className="overflow-hidden border border-white/10 bg-[#0B0B0D]">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
          <span className="h-2.5 w-2.5 bg-[#3FB950]" aria-hidden="true" />
          <span className="font-mono text-xs text-[#90939A]">Program.cs</span>
        </div>

        <CodeMirror value={code} onChange={setCode} theme={codeEditorTheme} extensions={languageExtensionFor('csharp')} minHeight="220px" basicSetup={{ tabSize: 4 }} />
      </div>

      <div className="mt-3">
        <ActionButton onClick={handleRun} loading={running}>
          Run
        </ActionButton>
      </div>

      {/* Always mounted, at full final size, from first render -- reveals via
          opacity only so the page never reflows/jumps when Run finishes. */}
      <div
        aria-hidden={!ranOnce}
        className={`mt-4 border p-4 text-xs transition-opacity duration-300 ${
          ranOnce ? 'border-[#3FB950]/40 bg-[#3FB950]/5 opacity-100' : 'border-transparent opacity-0'
        }`}
      >
        <p className="font-semibold text-[#3FB950]">✓ Passed</p>
        <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-white/40">
          <span>Compile: {MOCK_COMPILE}</span>
          <span>Run: {MOCK_RUN}</span>
        </p>
        <pre className="mt-2 whitespace-pre-wrap font-mono text-white/70">{MOCK_STDOUT}</pre>
      </div>
    </div>
  )
}
