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
}

const TurnstileWidget = forwardRef<TurnstileHandle, Props>(function TurnstileWidget(
  { action, onToken },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current)
      }
    },
  }))

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile) return

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      action,
      callback: (token: string) => onToken(token),
      'expired-callback': () => onToken(null),
      'error-callback': () => onToken(null),
    })

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded])

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} />
    </>
  )
})

export default TurnstileWidget
