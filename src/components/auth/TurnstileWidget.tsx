'use client'

// Renders a Cloudflare Turnstile challenge and reports the resulting
// token up to the parent form. Explicit-render API (not the implicit
// `cf-turnstile` div) so the parent can hold the token in state and know
// exactly when it's ready to submit. Tokens are single-use — after any
// submit attempt, the parent should call `reset()` via the ref to fetch
// a fresh one before allowing another try.

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Script from 'next/script'

// Public by design — identifies which widget to render, safe to ship in
// client code. The private secret key lives only in the Worker, never here.
const TURNSTILE_SITE_KEY = '0x4AAAAAAEdKEFa7n07s2OQ1'

// How long to wait for the widget to actually render before offering a
// retry — covers a genuine script load failure (blocked, offline, slow
// connection).
const RENDER_TIMEOUT_MS = 10000

// How often to poll for `window.turnstile` while waiting. This site
// mounts the widget on three different pages (login, register,
// forgot-password); `next/script`'s `onLoad` fires once per literal
// `<script>` tag, and does not reliably refire for a second page's
// `<Script>` instance after a previous page already loaded the same
// src — the actual cause of the widget silently never appearing on
// some pages. Polling checks the real global directly instead of
// depending on that callback, so it works whether this is the first
// page to load the script or the third.
const POLL_INTERVAL_MS = 250

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

export type TurnstileHandle = {
  reset: () => void
}

type Props = {
  action: string
  onToken: (token: string | null) => void
  className?: string
}

const TurnstileWidget = forwardRef<TurnstileHandle, Props>(function TurnstileWidget(
  { action, onToken, className },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [rendered, setRendered] = useState(false)
  const [stalled, setStalled] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current)
      }
    },
  }))

  function handleRetry() {
    setRendered(false)
    setStalled(false)
    widgetIdRef.current = null
    setRetryKey((k) => k + 1)
    // The script global may already exist even if this instance never
    // saw its own `onLoad` fire (see POLL_INTERVAL_MS above) — check
    // immediately rather than waiting for the next poll tick.
    if (window.turnstile) setScriptLoaded(true)
  }

  // Poll for the real global instead of depending solely on <Script>'s
  // onLoad, which doesn't reliably refire across pages (see above).
  useEffect(() => {
    if (window.turnstile) {
      setScriptLoaded(true)
      return
    }
    const interval = setInterval(() => {
      if (window.turnstile) {
        setScriptLoaded(true)
        clearInterval(interval)
      }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [retryKey])

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile || rendered) return

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        action,
        size: 'flexible',
        callback: (token: string) => onToken(token),
        'expired-callback': () => onToken(null),
        'error-callback': () => onToken(null),
      })
      setRendered(true)
    } catch {
      // render() throws if e.g. the container already holds a widget —
      // surface it as a stall rather than leaving an uncaught rejection
      // and a silently-blank container for the full timeout.
      setStalled(true)
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded, retryKey])

  // No recovery previously existed if the script never finished loading
  // or never rendered — the widget just stayed blank forever and the
  // only fix was a full page refresh (sometimes more than one). This
  // gives an in-page retry instead.
  useEffect(() => {
    if (rendered) return
    const timeout = setTimeout(() => setStalled(true), RENDER_TIMEOUT_MS)
    return () => clearTimeout(timeout)
  }, [rendered, retryKey])

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => setStalled(true)}
      />
      {/* min-h reserves the challenge's rendered height (the "flexible"
          size's normal, non-interactive height) before the widget script
          has even loaded, so it doesn't pop the form taller once it does. */}
      <div ref={containerRef} className={`min-h-[65px] ${className ?? ''}`} />
      {stalled && !rendered && (
        <p className="mt-2 text-xs text-[#F85149]">
          Verification didn&apos;t load.{' '}
          <button
            type="button"
            onClick={handleRetry}
            className="underline underline-offset-2 transition-colors hover:text-white"
          >
            Retry
          </button>
        </p>
      )}
    </>
  )
})

export default TurnstileWidget
