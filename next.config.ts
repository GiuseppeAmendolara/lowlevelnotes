import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Allows the dev server's JS chunks/HMR to load when testing over the LAN
     (e.g. from a phone) instead of localhost — Next.js blocks this by
     default as a DNS-rebinding protection. Dev-only; irrelevant in
     production, where the app is served from the real domain. */
  allowedDevOrigins: ['192.168.1.144'],

  // Baseline defensive headers found missing in a security review — none
  // of these touch script/style/resource-loading policy (no CSP beyond
  // frame-ancestors), so nothing about how the site actually works
  // should change; this is purely closing gaps a browser would otherwise
  // leave open. A full resource-loading CSP is a separate, larger effort
  // that needs real browser testing before shipping (Turnstile's iframe,
  // external fonts, etc. all need explicit allowances) — deliberately not
  // attempted here.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
};

export default nextConfig;
