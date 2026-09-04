'use client'

import { reportSecurityEvent } from '@/lib/authClient'

// These are soft, spoofable signals — a determined visitor can trivially
// avoid all three (disable JS, use the API directly, etc). The point
// isn't to stop anyone; it's to give staff visibility into who's
// triggering them, same spirit as Guided Hacking's copy/scrape warnings.
// Real abuse detection (rate-limit hits, bot user agents, multi-account
// IPs) is logged server-side instead — see worker/lib/security.js.

const COPY_LENGTH_THRESHOLD = 40
const SELECTION_LENGTH_THRESHOLD = 500
const SELECTION_REPORT_COOLDOWN_MS = 30_000
const DEVTOOLS_SIZE_THRESHOLD_PX = 160
const DEVTOOLS_FLAGGED_KEY = 'llnDevtoolsFlagged'

// Lightweight device fingerprint — canvas + screen + timezone + language,
// hashed client-side before it ever leaves the browser (the server only
// ever sees the SHA-256 digest below, never these raw values). Used only
// to strengthen the multi-account-per-IP signal on login (worker/routes/
// auth.js) by also catching accounts sharing a device across *different*
// IPs — a VPN, or switching between home and mobile data. This is the
// same class of signal ad/fraud-detection vendors use everywhere, not
// anything resembling actual browser exploitation. Returns null (never
// throws) if any of this is unavailable — a session with no fingerprint
// just skips that half of the check server-side.
export async function computeDeviceFingerprint(): Promise<string | null> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) return null

  try {
    const parts: string[] = []

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('llnfp', 2, 2)
      parts.push(canvas.toDataURL())
    }

    parts.push(`${screen.width}x${screen.height}x${screen.colorDepth}`)
    parts.push(Intl.DateTimeFormat().resolvedOptions().timeZone)
    parts.push(navigator.language)
    parts.push(String(navigator.hardwareConcurrency ?? ''))

    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(parts.join('|')))
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return null
  }
}

// Attached to a lesson's rendered content container. Skips trivial
// copies (a single short code line) so this only flags copying real
// chunks of the written article — not everyday "grab this one command."
export function attachContentCopyDetection(el: HTMLElement): () => void {
  function handleCopy() {
    const text = window.getSelection()?.toString().trim() ?? ''
    if (text.length < COPY_LENGTH_THRESHOLD) return
    reportSecurityEvent('content_copy', text.slice(0, 200))
  }

  el.addEventListener('copy', handleCopy)
  return () => el.removeEventListener('copy', handleCopy)
}

// Softer than an actual copy — selecting a large block without
// necessarily copying it (e.g. copy is blocked by something else, or
// they're reading it out via some other means). Cooldown-gated so
// dragging a selection around doesn't fire repeatedly.
export function attachLargeSelectionDetection(el: HTMLElement): () => void {
  let lastReportedAt = 0

  function handleMouseUp() {
    const text = window.getSelection()?.toString().trim() ?? ''
    if (text.length < SELECTION_LENGTH_THRESHOLD) return
    const now = Date.now()
    if (now - lastReportedAt < SELECTION_REPORT_COOLDOWN_MS) return
    lastReportedAt = now
    reportSecurityEvent('text_select_large', `${text.length} chars selected`)
  }

  el.addEventListener('mouseup', handleMouseUp)
  return () => el.removeEventListener('mouseup', handleMouseUp)
}

// Lowest-confidence signal of the set — only catches a *docked* devtools
// panel (via the outer/inner window size gap it creates), misses an
// undocked devtools window entirely, and plenty of legitimate technical
// visitors keep devtools open constantly. Fires at most once per tab
// (sessionStorage-flagged), not once per resize, so leaving it open
// doesn't spam the log for the rest of the session.
export function initDevtoolsDetection(): () => void {
  function check() {
    try {
      if (sessionStorage.getItem(DEVTOOLS_FLAGGED_KEY)) return
    } catch {
      // Storage inaccessible (private mode, blocked) — just skip the
      // dedupe rather than let this throw and break navigation.
    }

    const widthGap = window.outerWidth - window.innerWidth
    const heightGap = window.outerHeight - window.innerHeight
    if (widthGap <= DEVTOOLS_SIZE_THRESHOLD_PX && heightGap <= DEVTOOLS_SIZE_THRESHOLD_PX) return

    try {
      sessionStorage.setItem(DEVTOOLS_FLAGGED_KEY, '1')
    } catch {
      // Ignore — worst case this fires again on the next resize.
    }
    reportSecurityEvent('devtools_opened')
  }

  check()
  window.addEventListener('resize', check)
  return () => window.removeEventListener('resize', check)
}
