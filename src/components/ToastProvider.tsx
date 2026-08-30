'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

type ToastTone = 'success' | 'error' | 'info'
type ToastItem = { id: number; message: string; tone: ToastTone }

type ToastContextValue = {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TONE_ACCENT: Record<ToastTone, string> = {
  success: 'border-l-[#3FB950]',
  error: 'border-l-[#F85149]',
  info: 'border-l-[#FF7A33]',
}

const AUTO_DISMISS_MS = 4500

// A fixed-position stack, not inline DOM — this exists specifically so
// save/update confirmations and staff activity pings never occupy layout
// space of their own (see the "avoid layout shifts" rule this replaces
// inline status messages under). Bottom-right, stacking upward, capped
// implicitly by how fast old ones auto-dismiss.
export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((tone: ToastTone, message: string) => {
    const id = nextId.current++
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
  }, [dismiss])

  // Memoized so consumers that depend on `toast` identity (e.g. an effect
  // polling for staff notifications) don't re-run on every unrelated
  // render — only when a toast is actually pushed and `toasts` changes.
  const value: ToastContextValue = useMemo(
    () => ({
      success: (message: string) => push('success', message),
      error: (message: string) => push('error', message),
      info: (message: string) => push('info', message),
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-end gap-2 p-4 sm:p-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 border border-l-2 border-white/10 bg-[#17181B] px-4 py-3 text-sm text-white shadow-lg animate-fade-in-up motion-reduce:animate-none ${TONE_ACCENT[t.tone]}`}
          >
            <p className="min-w-0 flex-1 leading-5">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 text-white/40 transition-colors hover:text-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
