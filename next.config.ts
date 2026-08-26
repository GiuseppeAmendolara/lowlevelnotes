import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Allows the dev server's JS chunks/HMR to load when testing over the LAN
     (e.g. from a phone) instead of localhost — Next.js blocks this by
     default as a DNS-rebinding protection. Dev-only; irrelevant in
     production, where the app is served from the real domain. */
  allowedDevOrigins: ['192.168.1.144'],
};

export default nextConfig;
