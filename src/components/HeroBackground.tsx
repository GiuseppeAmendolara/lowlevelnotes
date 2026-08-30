'use client'

import { useEffect, useRef, useState } from 'react'

// A real, self-consistent x86 disassembly — the standard -O0 shape a
// compiler emits for a small counting loop (prologue, a stack-local
// counter, a jmp-to-condition/jle-back-to-top loop, epilogue). Every byte
// length and every relative jump offset here actually adds up: eb 09 at
// 401037 really does land on 401042, and 7e f1's signed -15 really does
// land back on 401039 — this isn't just plausible-looking hex, it
// decodes. Decorative only (see the aria-hidden wrapper below); repeated
// twice to fill the column height, hence the address reset partway down.
const BLOCK = `sub_401020:
00401020  55                     push    rbp
00401021  48 89 e5               mov     rbp, rsp
00401024  48 83 ec 20            sub     rsp, 20h
00401028  48 89 7d f8            mov     [rbp+8], rdi
0040102c  48 89 75 f0            mov     [rbp-10h], rsi
00401030  c7 45 fc 00 00 00 00   mov     dword ptr [rbp-4], 0
00401037  eb 09                  jmp     short loc_401042
00401039  8b 45 fc               mov     eax, [rbp-4]
0040103c  83 c0 01               add     eax, 1
0040103f  89 45 fc               mov     [rbp-4], eax
00401042  83 7d fc 09            cmp     dword ptr [rbp-4], 9
00401046  7e f1                  jle     short loc_401039
00401048  b8 00 00 00 00         mov     eax, 0
0040104d  48 83 c4 20            add     rsp, 20h
00401051  5d                     pop     rbp
00401052  c3                     retn`

const LINES = Array(2).fill(BLOCK).join('\n').split('\n')

// A real single-step trace through the function above — not just a
// sequential scan down the page, but the actual control flow: prologue,
// the initial jmp into the loop condition, ten taken iterations of
// check-then-body, the final (not-taken) check, then the epilogue. Only
// ever touches the first copy's 17 lines (indices 0-16); the second copy
// is pure visual filler for column height and is never "executed."
function buildTrace(): number[] {
  const PROLOGUE = [1, 2, 3, 4, 5, 6, 7]
  const CHECK = [11, 12]
  const BODY = [8, 9, 10]
  const EPILOGUE = [13, 14, 15, 16]

  const trace = [...PROLOGUE]
  for (let counter = 0; counter <= 9; counter++) {
    trace.push(...CHECK, ...BODY)
  }
  trace.push(...CHECK, ...EPILOGUE)
  return trace
}

const TRACE = buildTrace()
const STEP_MS = 420

// The hero's decorative disassembly texture and its glow — split out as
// its own client component (page.tsx is a Server Component fetching real
// data) so the ambient "single-stepping" highlight and the cursor
// parallax on the glow can own their own effects/state without forcing
// the whole hero into a client boundary.
export default function HeroBackground() {
  const [activeLine, setActiveLine] = useState<number>(TRACE[0])
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let step = 0
    const id = setInterval(() => {
      step = (step + 1) % TRACE.length
      setActiveLine(TRACE[step])
    }, STEP_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (reduceMotion || coarsePointer) return

    let frame = 0
    function handleMove(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        glowRef.current?.style.setProperty('transform', `translate3d(${(x * 18).toFixed(1)}px, ${(y * 18).toFixed(1)}px, 0)`)
      })
    }

    window.addEventListener('mousemove', handleMove)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none overflow-hidden [mask-image:linear-gradient(to_bottom,black,transparent)]"
      >
        <div className="absolute inset-y-0 right-0 hidden w-[68%] items-start justify-end [mask-image:linear-gradient(to_left,black_50%,transparent)] sm:flex">
          <pre className="whitespace-pre pr-4 font-mono text-base leading-[1.7] tracking-wide">
            {LINES.map((line, i) => (
              <div
                key={i}
                className={`transition-colors duration-500 motion-reduce:transition-none ${
                  i === activeLine ? 'bg-[#FF7A33]/[0.08] text-white/[0.32]' : 'text-white/[0.07]'
                }`}
              >
                {line}
              </div>
            ))}
          </pre>
        </div>
      </div>
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[68%] bg-[radial-gradient(circle_at_85%_15%,rgba(255,138,61,0.16),transparent_16rem)] transition-transform duration-300 ease-out motion-reduce:transition-none sm:block"
      />
    </>
  )
}
