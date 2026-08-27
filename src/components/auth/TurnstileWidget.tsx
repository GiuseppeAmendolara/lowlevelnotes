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
// retry — covers both a genuine script load failure (blocked, offline)
// and the more common case: `next/script`'s `onLoad` not firing on a
// client-side navigation to a second page that renders this same
// `<Script src>` after a previous page already loaded it, which
// previously left the widget silently blank with no recovery short of a
// full page refresh.
const RENDER_TIMEOUT_MS = 8000

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
    setScriptLoaded(false)
    setRendered(false)
    setStalled(false)
    widgetIdRef.current = null
    setRetryKey((k) => k + 1)
  }

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile) return

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      action,
      size: 'flexible',
      callback: (token: string) => onToken(token),
      'expired-callback': () => onToken(null),
      'error-callback': () => onToken(null),
    })
    setRendered(true)

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
        key={retryKey}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => setStalled(true)}
      />
      <div ref={containerRef} className={className} />
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
